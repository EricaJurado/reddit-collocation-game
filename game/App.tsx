import { Page } from './shared';
import { usePage } from './hooks/usePage';
import { useEffect, useState } from 'react';
import { sendToDevvit } from './utils';
import { GuessPage } from './pages/GuessPage';
import { useDevvitListener } from './hooks/useDevvitListener';

const getPage = (
  page: Page,
  { postId }: { postId: string },
  { createdAt }: { createdAt: string }
) => {
  switch (page) {
    case 'home':
      return <GuessPage postId={postId} createdAt={createdAt} />;
    default:
      throw new Error(`Unknown page: ${page satisfies never}`);
  }
};

export const App = () => {
  const [postId, setPostId] = useState('');
  const [createdAt, setcreatedAt] = useState('');
  const page = usePage();
  const initData = useDevvitListener('INIT_RESPONSE');

  useEffect(() => {
    sendToDevvit({ type: 'INIT' });
  }, []);

  useEffect(() => {
    if (initData) {
      setPostId(initData.postId);
      setcreatedAt(initData.createdAt);
    }
  }, [initData, setPostId, setcreatedAt]);

  return <div className="h-full">{getPage(page, { postId }, { createdAt })}</div>;
};
