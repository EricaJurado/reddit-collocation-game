import { Page } from './shared';
import { PokemonPage } from './pages/PokemonPage';
import { usePage } from './hooks/usePage';
import { useEffect } from 'react';
import { sendToDevvit } from './utils';

const getPage = (page: Page) => {
  switch (page) {
    case 'home':
      return <PokemonPage />;
    default:
      throw new Error(`Unknown page: ${page satisfies never}`);
  }
};

export const App = () => {
  const page = usePage();

  useEffect(() => {
    sendToDevvit({ type: 'INIT' });
  }, []);

  return <div className="h-full">{getPage(page)}</div>;
};
