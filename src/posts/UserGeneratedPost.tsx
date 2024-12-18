import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { GuessPage } from '../pages/GuessPage.js';
import type { UserGenPostData } from '../shared.js';
import { Service } from '../../server/Service.js';
import { MenuHomePage } from '../pages/MenuHomePage.js';
import { WinPage } from '../pages/WinPage.js';
import { LeaderboardPage } from '../pages/LeaderboardPage.js';
import { formatCreatedAtDate } from '../utils.js';
import { getPuzzleByDate } from '../../server/serverUtils.js';
import { HowToPage } from '../pages/HowToPage.js';
import { Preview } from '../components/Preview.js';

interface UserGeneratedPostProps {
  postData: UserGenPostData;
  username: string | null;
}

// User-generated post for puzzles created by users
export const UserGeneratedPost = (props: UserGeneratedPostProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const [page, setPage] = useState('puzzle');

  const {
    loading,
    error,
    data: puzzleData,
  } = useAsync(async () => {
    // Ensure we have a valid postId
    if (!props.postData?.postId) return null;

    // Fetch the puzzle data
    const postDataFromService = await service.postService.getUserGeneratedPost(
      props.postData.postId
    );
    return postDataFromService;
  });

  const savePuzzleSolved = async () => {
    setPage('win');
    if (props.username) {
      const puzzleId = props.postData.postId;
      await service.userService.addUserGeneratedSolvedPuzzle(props.username, puzzleId);
      const allSolved = await service.userService.getUserGeneratedSolvedPuzzleList(props.username);

      // update leaderboard
      await service.leaderboardService.updateUserGenSolvedLeaderboard(props.username);
    }
  };

  const saveDailySolved = async () => {
    setPage('win');
    if (props.username) {
      const createdAtDate = new Date(props.postData.createdAt);
      const createdAtString = formatCreatedAtDate(createdAtDate);
      await service.userService.addDailySolvedPuzzle(props.username, createdAtString);
      // update streak (based on current time and puzzle date, not when post was created)
      await service.userService.updateUserDailySolvedStats(props.username, targetDate);
      await service.leaderboardService.updateAllDailyLeaderboards(props.username);
    }
  };

  // see if this user gen puzzle has been solved by the user or not
  const targetDate = formatCreatedAtDate(new Date());
  const [isPuzzleSolved] = useState(async () => {
    if (props.username) {
      const puzzleList = await service.userService.getUserGeneratedSolvedPuzzleList(props.username);
      const shortName = props.postData.postId.slice(3);
      return puzzleList.includes(props.postData.postId) || puzzleList.includes(shortName);
    }
    return false;
  });

  const todaysPuzzle = getPuzzleByDate(new Date());
  // is today's puzzle already solved?
  const [isDailySolved] = useState(async () => {
    if (props.username) {
      const puzzleList = await service.userService.getDailySolvedPuzzles(props.username);
      return puzzleList.includes(targetDate);
    }
    return false;
  });

  const pages: Record<string, JSX.Element> = {
    puzzle: !puzzleData ? (
      <Preview />
    ) : Array.isArray(puzzleData.puzzle) ? (
      <zstack height="100%" width="100%">
        <vstack height="100%" width="100%" alignment="center middle">
          <GuessPage wordList={puzzleData.puzzle} solvedSetter={savePuzzleSolved} />
        </vstack>
        <vstack alignment="bottom start" width="100%" height="100%" padding="small">
          <text color="black">{isPuzzleSolved ? 'Solved!' : ''}</text>
        </vstack>
        {puzzleData.creator && (
          <vstack alignment="bottom end" width="100%" height="100%" padding="small">
            <text color="black">Created by u/{puzzleData.creator}</text>
          </vstack>
        )}
      </zstack>
    ) : (
      <text color="black">Error: Could not load puzzle data.</text>
    ),
    daily: (
      <zstack height="100%" width="100%">
        <vstack height="100%" width="100%" alignment="center middle">
          <GuessPage wordList={todaysPuzzle || []} solvedSetter={saveDailySolved} />
        </vstack>
        <vstack alignment="bottom start" width="100%" height="100%">
          <text color="black">{isDailySolved ? 'Solved!' : ''}</text>
        </vstack>
      </zstack>
    ),
    win: <WinPage onNext={() => setPage('menu')} />,
    menu: <MenuHomePage username={props.username} postData={props.postData} pageSetter={setPage} />,
    leaderboard: <LeaderboardPage username={props.username} />,
    howto: <HowToPage />,
  };

  return (
    <vstack key={page} height="100%" width="100%">
      <zstack height="100%" width="100%">
        {page !== 'menu' && (
          <>
            <hstack alignment="top end" width="100%" padding="small">
              <button onPress={() => setPage('menu')}>Menu</button>
            </hstack>
            <hstack alignment="top end" width="100%" padding="small">
              <button onPress={() => setPage('menu')}>Menu</button>
            </hstack>
          </>
        )}
        <hstack alignment="middle center" height="100%" width="100%">
          {pages[page]}
        </hstack>
      </zstack>
    </vstack>
  );
};
