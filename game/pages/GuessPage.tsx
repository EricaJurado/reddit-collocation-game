import { useEffect, useState } from 'react';
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
    if (createdAt) {
      try {
        const targetDate = convertStringToDate(createdAt);
        const puzzle = getPuzzleByDate(targetDate);
        if (!puzzle) {
          throw new Error('No puzzle found');
        }
        setWordList(puzzle);
        setGuessValues(Array(puzzle.length - 1).fill('')); // Initialize guess values for each input
        setCorrect(Array(puzzle.length - 1).fill(false)); // Initialize correctness for each guess
      } catch (e) {
        console.log(e);
      }
    }
  }, [createdAt]);

  const checkWord = (word: string, index: number) => {
    const isCorrect = word === wordList[index + 1];
    const newCorrect = [...correct];
    newCorrect[index] = isCorrect;
    setCorrect(newCorrect);
  };

  const [guessedWord, setGuessedWord] = useState('');

  const handleGuessChange = (guessedWord: string) => {
    setGuessedWord(guessedWord);
    console.log('Guessed word is:', guessedWord);
  };

  return (
    <div>
      {wordList[0] && <p>{wordList[0]}</p>}
      {wordList.slice(1, wordList.length - 1).map((word, index) => (
        <div key={word}>
          <GuessInput onChange={handleGuessChange} answer={wordList[0] || ''} />
          {correct[index] ? <p>Correct!</p> : <p>Incorrect!</p>}
        </div>
      ))}
      {wordList.at(-1) && <p>{wordList.at(-1)}</p>}
    </div>
  );
};
