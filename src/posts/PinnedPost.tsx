import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { GuessPage } from '../pages/GuessPage.js';
import type { PostData } from '../shared.js';
import { getPuzzleByDate } from '../../server/serverUtils.js';

interface PinnedPostProps {
  postData: PostData;
  username: string | null;
}

export const PinnedPost = (props: PinnedPostProps, context: Context): JSX.Element => {
  const [page, setPage] = useState('menu');
  const wordList = useAsync(async () => {
    const createdAtDate = new Date(props.postData.createdAt);
    console.log('createdAtDate:', createdAtDate);
    const puzzle = getPuzzleByDate(createdAtDate);
    return puzzle;
  });

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
          <text>TESTING</text>
        </hstack>
      </vstack>
    </vstack>
  );

  const pages: Record<string, JSX.Element> = {
    menu: Menu,
    test: !wordList
      ? <text>Loading...</text>
      : Array.isArray(wordList.data)
      ? <GuessPage wordList={wordList.data} />
      : <text>Error: Could not load puzzle data.</text>,
  };

  return pages[page] || Menu;
};
