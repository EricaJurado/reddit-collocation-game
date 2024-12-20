import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { GuessPage } from '../pages/GuessPage.js';
import type { PostData } from '../shared.js';
import { getPuzzleByDate } from '../../server/serverUtils.js';
import { Service } from '../../server/Service.js';
import { formatCreatedAtDate } from '../utils.js';
import { MenuHomePage } from '../pages/MenuHomePage.js';
import { WinPage } from '../pages/WinPage.js';
import { LeaderboardPage } from '../pages/LeaderboardPage.js';
import { HowToPage } from '../pages/HowToPage.js';

interface PinnedPostProps {
  postData: PostData;
  username: string | null;
}

// pinned post should start by showing menu/home page
// menu should have options for today's puzzle, my stats, leaderboard, how to play
export const PinnedPost = (props: PinnedPostProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const [page, setPage] = useState('menu');

  const today = new Date();
  const todaysDate = formatCreatedAtDate(today);

  const [isDailySolved] = useState(async () => {
    if (props.username) {
      const puzzleList = await service.userService.getDailySolvedPuzzles(props.username);
      const isDailyInSolvedList = puzzleList.includes(todaysDate) ? true : false;
      return isDailyInSolvedList;
    } else {
      return false;
    }
  });

  const wordList = useAsync(async () => {
    const puzzle = getPuzzleByDate(today);
    return puzzle;
  });

  const saveDailySolved = async () => {
    setPage('win');
    if (props.username) {
      // if this daily wasn't previously solved, add it to the list
      service.userService.addDailySolvedPuzzle(props.username, todaysDate);

      // update streak (based on current time and puzzle date, not when post was created)
      const solvedDailies = await service.userService.getDailySolvedPuzzles(props.username);

      if (solvedDailies.includes(todaysDate)) {
        await service.leaderboardService.updateAllDailyLeaderboards(props.username);
        return;
      }
      await service.userService.updateUserDailySolvedStats(props.username, todaysDate);
    }
  };

  const pages: Record<string, JSX.Element> = {
    menu: <MenuHomePage username={props.username} postData={props.postData} pageSetter={setPage} />,
    win: <WinPage onNext={() => setPage('menu')} />,
    daily: (
      <zstack height="100%" width="100%">
        <vstack height="100%" width="100%" alignment="center middle">
          <GuessPage wordList={wordList.data || []} solvedSetter={saveDailySolved} />
        </vstack>
        <vstack alignment="bottom start" width="100%" height="100%" padding="small">
          <text color="black">{isDailySolved ? 'Solved!' : ''}</text>
        </vstack>
      </zstack>
    ),
    leaderboard: <LeaderboardPage username={props.username} />,
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
