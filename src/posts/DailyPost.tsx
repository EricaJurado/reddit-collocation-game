import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { GuessPage } from '../pages/GuessPage.js';
import type { PostData } from '../shared.js';
import { getPuzzleByDate } from '../../server/serverUtils.js';
import { Service } from '../../server/Service.js';
import { formatCreatedAtDate } from '../utils.js';
import { MenuHomePage } from '../pages/MenuHomePage.js';

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
      const puzzleList = await service.getDailySolvedPuzzles(props.username);
      const isDailyInSolvedList = puzzleList.includes(targetDate) ? true : false;
      return isDailyInSolvedList;
    } else {
      return false;
    }
  });

  const [currStreak] = useState(async () => {
    if (props.username) {
      const streak = await service.getUserStreak(props.username);
      return streak;
    } else {
      return 0;
    }
  });

  // day solved should be one that is solved for the day the post was created
  const saveDailySolved = async () => {
    if (props.username) {
      const createdAtDate = new Date(props.postData.createdAt);
      const createdAtString = formatCreatedAtDate(createdAtDate);
      // if this daily wasn't previously solved, add it to the list
      service.addDailySolvedPuzzle(props.username, createdAtString);

      // update streak (based on current time and puzzle date, not when post was created)
      service.updateUserDailySolvedStats(props.username, targetDate);

      setPage('menu');
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
    menu: <MenuHomePage username={props.username} postData={props.postData} pageSetter={setPage} />,
  };

  return (
    <vstack key={page}>
      {isDailySolved && <text>Daily ✅</text>}
      {targetDate && <text>{targetDate}</text>}
      {currStreak && <text>Current Streak: {currStreak}</text>}
      <text>Current page: {page}</text> {/* Log the page state */}
      {pages[page]}
    </vstack>
  );
};
