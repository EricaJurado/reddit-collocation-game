import { Devvit, type Context } from '@devvit/public-api';

export const HowToPage = (): JSX.Element => {
  return (
    <vstack padding="medium" gap="medium" width="80%">
      <text wrap size="xlarge">
        Complete the word series by guessing the common two-word phrases (e.g., "hot water"),
        split-up compound words (e.g., "water-mark"), or even proper nouns (e.g., "Mark Twain").
      </text>
    </vstack>
  );
};
