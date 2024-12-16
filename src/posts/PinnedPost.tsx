import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { GuessPage } from '../pages/GuessPage.js';
import type { PostData } from '../shared.js';
import { getPuzzleByDate } from '../../server/serverUtils.js';
import { Service } from '../../server/Service.js';
import { formatCreatedAtDate } from '../utils.js';
import { MenuHomePage } from '../pages/MenuHomePage.js';
import { WinPage } from '../pages/WinPage.js';
import { StatsPage } from '../pages/StatsPage.js';

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
      const puzzleList = await service.getDailySolvedPuzzles(props.username);
      const isDailyInSolvedList = puzzleList.includes(todaysDate) ? true : false;
      return isDailyInSolvedList;
    } else {
      return false;
    }
  });

  const wordList = useAsync(async () => {
    console.log('pinned getting puzzle for today', today);
    const puzzle = getPuzzleByDate(today);
    return puzzle;
  });

  const saveDailySolved = async () => {
    if (props.username) {
      // if this daily wasn't previously solved, add it to the list
      service.addDailySolvedPuzzle(props.username, todaysDate);

      // update streak (based on current time and puzzle date, not when post was created)
      service.updateUserDailySolvedStats(props.username, todaysDate);
      setPage('win');
    }
  };

  const pages: Record<string, JSX.Element> = {
    menu: <MenuHomePage username={props.username} postData={props.postData} pageSetter={setPage} />,
    win: <WinPage winType={isDailySolved ? 'daily' : 'weekly'} onNext={() => setPage('menu')} />,
    daily: !wordList ? (
      <text>Loading...</text>
    ) : Array.isArray(wordList.data) ? (
      <GuessPage wordList={wordList.data} solvedSetter={saveDailySolved} />
    ) : (
      <text>Error: Could not load puzzle data.</text>
    ),
    stats: <StatsPage username={props.username} />,
    leaderboard: (
      <vstack>
        <text>Leaderboard</text>
      </vstack>
    ),
    howto: (
      <vstack>
        <text>How To Play</text>
      </vstack>
    ),
  };

  return (
    <vstack key={page}>
      <text>Current page: {page}</text> {/* Log the page state */}
      {pages[page]}
    </vstack>
  );
};
