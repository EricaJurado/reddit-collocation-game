import { Devvit, useForm, type Context } from '@devvit/public-api';

import { useState } from '@devvit/public-api';
import { ButtonForm } from '../components/ButtonForm.js';

interface WinPageProps {
  winType: string;
  onNext: () => void;
}

export const WinPage = (props: WinPageProps, context: Context): JSX.Element => {
  return (
    <vstack padding="medium" gap="medium">
      <text>You Win!</text>
      <button onPress={props.onNext}>Next</button>
    </vstack>
  );
};
