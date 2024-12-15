import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { GuessPage } from '../pages/GuessPage.js';
import type { PostData } from '../shared.js';
import { getPuzzleByDate } from '../../server/serverUtils.js';
import { Service } from '../../server/Service.js';
import { formatCreatedAtDate } from '../utils.js';

interface PinnedPostProps {
  postData: PostData;
  username: string | null;
}

export const PinnedPost = (props: PinnedPostProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const [page, setPage] = useState('menu');
  const wordList = useAsync(async () => {
    const createdAtDate = new Date(props.postData.createdAt);
    console.log('createdAtDate:', createdAtDate);
    const puzzle = getPuzzleByDate(createdAtDate);
    return puzzle;
  });

  const [isDailySolved] = useState(async () => {
    if (props.username) {
      const puzzleList = await service.getDailySolvedPuzzles(props.username);
      console.log('puzzleList:', puzzleList);
      const targetDate = formatCreatedAtDate(new Date(props.postData.createdAt));
      const isDailyInSolvedList = puzzleList.includes(targetDate) ? true : false;
      console.log('isDailyInSolvedList:', isDailyInSolvedList);
      return isDailyInSolvedList;
    } else {
      return false;
    }
  });

  const saveDailySolved = async () => {
    console.log('saving daily solved');
    if (props.username) {
      console.log(props.postData.createdAt);
      const createdAtDate = new Date(props.postData.createdAt);
      const targetDate =
        createdAtDate.getMonth() +
        1 +
        '-' +
        createdAtDate.getDate() +
        '-' +
        createdAtDate.getFullYear();
      console.log('targetDate:', targetDate);
      service.addDailySolvedPuzzle(props.username, targetDate);
      console.log('Puzzle saved. Changing page to menu.');
      setPage('menu');
    }
  };

  const Menu = (
    <vstack width="100%" height="100%" alignment="center middle">
      {/* Menu */}
      <vstack alignment="center middle" gap="small">
        <hstack
          alignment="center middle"
          width="100%"
          height="100%"
          padding="small"
          gap="small"
          onPress={() => setPage('test')}
        >
          <text>Today's Puzzle</text>
          {isDailySolved ? <text>✅</text> : <text>❌</text>}
        </hstack>
      </vstack>
      <vstack alignment="center middle" gap="small">
        <hstack
          alignment="center middle"
          width="100%"
          height="100%"
          padding="small"
          gap="small"
          onPress={() => setPage('test')}
        >
          <text>My Stats</text>
        </hstack>
      </vstack>
      <vstack alignment="center middle" gap="small">
        <hstack
          alignment="center middle"
          width="100%"
          height="100%"
          padding="small"
          gap="small"
          onPress={() => setPage('leaderboard')}
        >
          <text>Leaderboard</text>
        </hstack>
      </vstack>
      <vstack alignment="center middle" gap="small">
        <hstack
          alignment="center middle"
          width="100%"
          height="100%"
          padding="small"
          gap="small"
          onPress={() => setPage('howto')}
        >
          <text>How To Play</text>
        </hstack>
      </vstack>
    </vstack>
  );

  const pages: Record<string, JSX.Element> = {
    menu: Menu,
    test: !wordList ? (
      <text>Loading...</text>
    ) : Array.isArray(wordList.data) ? (
      <GuessPage wordList={wordList.data} solvedSetter={saveDailySolved} />
    ) : (
      <text>Error: Could not load puzzle data.</text>
    ),
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
      {pages[page] || Menu}
    </vstack>
  );
};
