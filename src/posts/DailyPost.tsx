import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { GuessPage } from '../pages/GuessPage.js';
import type { PostData } from '../shared.js';
import { getPuzzleByDate } from '../../server/serverUtils.js';
import { Service } from '../../server/Service.js';
import { formatCreatedAtDate } from '../utils.js';

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

  // day solved should be one that is solved for the day the post was created
  const saveDailySolved = async () => {
    if (props.username) {
      const createdAtDate = new Date(props.postData.createdAt);
      const targetDate =
        createdAtDate.getMonth() +
        1 +
        '-' +
        createdAtDate.getDate() +
        '-' +
        createdAtDate.getFullYear();
      service.addDailySolvedPuzzle(props.username, targetDate);
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
    menu: (
      <vstack>
        <text>Leaderboard</text>
      </vstack>
    ),
  };

  return (
    <vstack key={page}>
      {isDailySolved && <text>Daily ✅</text>}
      {targetDate && <text>{targetDate}</text>}
      <text>Current page: {page}</text> {/* Log the page state */}
      {pages[page]}
    </vstack>
  );
};
