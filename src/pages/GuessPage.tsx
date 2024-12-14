import { Devvit, type Context } from '@devvit/public-api';

import { useState } from '@devvit/public-api';
import { GuessInput } from '../components/GuessInput.js';
import { convertStringToDate, getPuzzleByDate } from '../../server/serverUtils.js';

interface GuessPageProps {
  postId: string;
  createdAt: string;
}

export const GuessPage = (props: GuessPageProps, context: Context): JSX.Element => {
  const [wordList, setWordList] = useState<string[]>([]);
  const [guessValues, setGuessValues] = useState<string[]>([]);
  const [correct, setCorrect] = useState<boolean[]>([]);

  console.log('props.createdAt:', props.createdAt);

  // useEffect(() => {
  //   console.log('props.createdAt:', props.createdAt);
  //   if (!props.createdAt) return;
  //   try {
  //     const targetDate = convertStringToDate(props.createdAt);
  //     const puzzle = getPuzzleByDate(targetDate);

  //     if (puzzle && Array.isArray(puzzle)) {
  //       setWordList(puzzle);
  //       const initGuessValues = puzzle.map((word, index) =>
  //         index === 0 || index === puzzle.length - 1 ? word : word[0]
  //       );
  //       setGuessValues(initGuessValues.slice(1, initGuessValues.length - 1));
  //       setCorrect(Array(puzzle.length - 2).fill(false));
  //     } else {
  //       console.error('No valid puzzle data found');
  //     }
  //   } catch (error) {
  //     console.error('Error processing puzzle date:', error);
  //   }
  // }, [props.createdAt]);

  // const checkWord = (word: string, index: number) => {
  //   const isCorrect = word === wordList[index + 1];
  //   const newCorrect = [...correct];
  //   newCorrect[index] = isCorrect;
  //   setCorrect(newCorrect);
  // };

  // const handleGuessChange = (newGuess: string, index: number) => {
  //   console.log('event: ', newGuess);
  //   console.log('index: ', index);
  //   const newGuessValues = [...guessValues];
  //   newGuessValues[index] = newGuess;
  //   setGuessValues(newGuessValues);
  // };

  // const stableHandleGuessChange = useCallback(
  //   (guess: string, idx: number) => handleGuessChange(guess, idx),
  //   [guessValues]
  // );

  return (
    <vstack>
      <text>{wordList[0]}</text>
      {/* {wordList[0] && <text>{wordList[0]}</text>} */}
      {/* {wordList.slice(1, wordList.length - 1).map((word, index) => (
        <div key={index}>
          <GuessInput
            setGuessedWord={(guess) => stableHandleGuessChange(guess, index)}
            answer={wordList[index + 1] || ''}
            onSubmit={() => checkWord(guessValues[index], index)}
          />
          {correct[index] ? <p>Correct!</p> : <p>Incorrect!</p>}
        </div>
      ))}
      {wordList.at(-1) && <p>{wordList.at(-1)}</p>} */}
    </vstack>
  );
};
