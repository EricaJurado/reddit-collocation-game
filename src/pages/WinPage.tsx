import { Devvit, type Context } from '@devvit/public-api';

interface WinPageProps {
  onNext: () => void;
}

export const WinPage = (props: WinPageProps, context: Context): JSX.Element => {
  return (
    <vstack padding="medium" gap="medium">
      <text color="black">You Win!</text>
      <button onPress={props.onNext}>Menu</button>
    </vstack>
  );
};
