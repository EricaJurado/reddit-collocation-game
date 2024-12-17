import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { GuessPage } from '../pages/GuessPage.js';
import type { PostData } from '../shared.js';
import { getPuzzleByDate } from '../../server/serverUtils.js';
import { Service } from '../../server/Service.js';
import { formatCreatedAtDate } from '../utils.js';
import { MenuHomePage } from '../pages/MenuHomePage.js';
import { WinPage } from '../pages/WinPage.js';

interface DailyPostProps {
  postData: PostData;
  username: string | null;
}

// posted every day, puzzle should default to the puzzle for the date the post was created
export const DailyPost = (props: DailyPostProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const [page, setPage] = useState('puzzle');
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

    console.log('save daily from daily post');
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
    puzzle: !wordList ? (
      <text>Loading...</text>
    ) : Array.isArray(wordList.data) ? (
      <GuessPage wordList={wordList.data} solvedSetter={saveDailySolved} />
    ) : (
      <text>Error: Could not load puzzle data.</text>
    ),
    win: <WinPage onNext={() => setPage('menu')} />,
    menu: <MenuHomePage username={props.username} postData={props.postData} pageSetter={setPage} />,
  };

  return (
    <vstack key={page} height="100%" width="100%">
      <zstack height="100%" width="100%">
        <hstack alignment="top end" width="100%">
          <button onPress={() => setPage('menu')}>Back</button>
        </hstack>
        {/* {isDailySolved && <text>Daily ✅</text>}
      {targetDate && <text>{targetDate}</text>}
      {currStreak && <text>Current Streak: {currStreak}</text>} */}
        <hstack alignment="middle center" height="100%" width="100%">
          {pages[page]}
        </hstack>
      </zstack>
    </vstack>
  );
};
