import { Devvit, useForm, type Context } from '@devvit/public-api';

import { useState } from '@devvit/public-api';
import { ButtonForm } from '../components/GuessForm.js';

interface CreatePuzzlePageProps {
  username: string | null;
}

// for hackathon don't restrict who can create puzzles, in the future restrict based on total solved
export const CreatePuzzlePage = (props: CreatePuzzlePageProps, context: Context): JSX.Element => {
  const [wordList, setWordList] = useState<string[]>(new Array(5).fill(''));

  return (
    <vstack padding="medium" gap="medium">
      <text>Create a puzzle</text>
      {wordList.map((word, index) => (
        <input
          key={index.toString()}
          value={word}
          onChange={(e) => {
            const newWordList = [...wordList];
            newWordList[index] = e.target.value;
            setWordList(newWordList);
          }}
        />
      ))}
      <ButtonForm wordList={wordList} />
    </vstack>
  );
};
