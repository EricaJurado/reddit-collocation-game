import { useCallback, useEffect, useState } from 'react';
import { GuessInput } from '../components/GuessInput';
import { convertStringToDate, getPuzzleByDate } from '../../server/serverUtils';

interface GuessPageProps {
  postId: string;
  createdAt: string;
}

export const GuessPage = ({ postId, createdAt }: GuessPageProps) => {
  const [wordList, setWordList] = useState<string[]>([]);
  const [guessValues, setGuessValues] = useState<string[]>([]);
  const [correct, setCorrect] = useState<boolean[]>([]);

  useEffect(() => {
    if (!createdAt) return;
    try {
      const targetDate = convertStringToDate(createdAt);
      const puzzle = getPuzzleByDate(targetDate);

      if (puzzle && Array.isArray(puzzle)) {
        setWordList(puzzle);
        setGuessValues(Array(puzzle.length - 2).fill(''));
        setCorrect(Array(puzzle.length - 2).fill(false));
      } else {
        console.error('No valid puzzle data found');
      }
    } catch (error) {
      console.error('Error processing puzzle date:', error);
    }
  }, [createdAt]);

  const checkWord = (word: string, index: number) => {
    const isCorrect = word === wordList[index + 1];
    const newCorrect = [...correct];
    newCorrect[index] = isCorrect;
    setCorrect(newCorrect);
  };

  const handleGuessChange = (newGuess: string, index: number) => {
    console.log('event: ', newGuess);
    console.log('index: ', index);
    const newGuessValues = [...guessValues];
    newGuessValues[index] = newGuess;
    setGuessValues(newGuessValues);
  };

  const stableHandleGuessChange = useCallback(
    (guess: string, idx: number) => handleGuessChange(guess, idx),
    [guessValues]
  );

  useEffect(() => {
    console.log('guessValues:', guessValues);
  }, [guessValues]);

  return (
    <div>
      {wordList[0] && <p>{wordList[0]}</p>}
      {wordList.slice(1, wordList.length - 1).map((word, index) => (
        <div key={index}>
          <GuessInput
            setGuessedWord={(guess) => stableHandleGuessChange(guess, index)}
            answer={wordList[index + 1] || ''}
          />
          {correct[index] ? <p>Correct!</p> : <p>Incorrect!</p>}
        </div>
      ))}
      {wordList.at(-1) && <p>{wordList.at(-1)}</p>}
    </div>
  );
};
