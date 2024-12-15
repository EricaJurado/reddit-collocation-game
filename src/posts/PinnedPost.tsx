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
    const puzzle = getPuzzleByDate(today);
    return puzzle;
  });

  const saveDailySolved = async () => {
    if (props.username) {
      service.addDailySolvedPuzzle(props.username, todaysDate);
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
