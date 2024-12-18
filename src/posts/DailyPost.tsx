import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { GuessPage } from '../pages/GuessPage.js';
import type { PostData } from '../shared.js';
import { getPuzzleByDate } from '../../server/serverUtils.js';
import { Service } from '../../server/Service.js';
import { formatCreatedAtDate } from '../utils.js';
import { MenuHomePage } from '../pages/MenuHomePage.js';
import { WinPage } from '../pages/WinPage.js';
import { HowToPage } from '../pages/HowToPage.js';
import { LeaderboardPage } from '../pages/LeaderboardPage.js';

interface DailyPostProps {
  postData: PostData;
  username: string | null;
}

// posted every day, puzzle should default to the puzzle for the date the post was created
export const DailyPost = (props: DailyPostProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const [page, setPage] = useState('daily');
  const wordList = useAsync(async () => {
    const createdAtDate = new Date(props.postData.createdAt);
    const puzzle = getPuzzleByDate(createdAtDate);
    return puzzle;
  });

  const targetDate = formatCreatedAtDate(new Date(props.postData.createdAt));

  const [isDailySolved] = useState(async () => {
    if (props.username) {
      const puzzleList = await service.userService.getDailySolvedPuzzles(props.username);
      const isDailyInSolvedList = puzzleList.includes(targetDate) ? true : false;
      return isDailyInSolvedList;
    } else {
      return false;
    }
  });

  const [currStreak] = useState(async () => {
    if (props.username) {
      const streak = await service.userService.getUserStreak(props.username);
      return streak;
    } else {
      return 0;
    }
  });

  // day solved should be one that is solved for the day the post was created
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

  const pages: Record<string, JSX.Element> = {
    daily: !wordList ? (
      <text color="black">Loading...</text>
    ) : Array.isArray(wordList.data) ? (
      <zstack height="100%" width="100%">
        <vstack height="100%" width="100%" alignment="center middle">
          <GuessPage wordList={wordList.data || []} solvedSetter={saveDailySolved} />
        </vstack>
        <vstack alignment="bottom start" width="100%" height="100%" padding="small">
          <text color="black">{isDailySolved ? 'Solved!' : ''}</text>
        </vstack>
      </zstack>
    ) : (
      <text color="black">Error: Could not load puzzle data.</text>
    ),
    leaderboard: <LeaderboardPage username={props.username} />,
    win: <WinPage onNext={() => setPage('menu')} />,
    menu: <MenuHomePage username={props.username} postData={props.postData} pageSetter={setPage} />,
    howto: <HowToPage />,
  };

  return (
    <vstack key={page} height="100%" width="100%">
      <zstack height="100%" width="100%">
        {page !== 'menu' && (
          <hstack alignment="top end" width="100%" padding="small">
            <button onPress={() => setPage('menu')}>Menu</button>
          </hstack>
        )}
        <hstack alignment="middle center" height="100%" width="100%">
          {pages[page]}
        </hstack>
      </zstack>
    </vstack>
  );
};
