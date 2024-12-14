import { Context, Devvit, useAsync, useState } from '@devvit/public-api';
import { Service } from '../../server/Service.js';
import { GuessPage } from '../pages/GuessPage.js';
import type { PostData, UserData } from '../shared.js';

interface PinnedPostProps {
  postData: PostData;
  username: string | null;
}

export const PinnedPost = (props: PinnedPostProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const [page, setPage] = useState('menu');

  console.log('pinned post props', props);

  const Menu = (
    <vstack width="100%" height="100%" alignment="center middle">
      {/* Menu */}
      <vstack alignment="center middle" gap="small">
        <button onClick={() => setPage('test')}>TESTING</button>
      </vstack>
    </vstack>
  );

  const onClose = (): void => {
    setPage('menu');
  };

  const pages: Record<string, JSX.Element> = {
    menu: Menu,
    test: Menu,
    // test: <GuessPage postId={''} createdAt={'12-13-2024'} />,
  };

  return pages[page] || Menu;
};
