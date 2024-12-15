import { Devvit, useForm, type Context } from '@devvit/public-api';

import { useState } from '@devvit/public-api';
import { ButtonForm } from '../components/ButtonForm.js';

interface StatsPageProps {
  wordList: string[];
}

export const StatsPage = (props: StatsPageProps, context: Context): JSX.Element => {
  return (
    <vstack padding="medium" gap="medium">
      <text>Stats Page</text>
    </vstack>
  );
};
