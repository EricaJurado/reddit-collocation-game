import { Devvit, useForm, type Context } from '@devvit/public-api';

import { useState } from '@devvit/public-api';
import { ButtonForm } from '../components/ButtonForm.js';

interface GuessPageProps {
  wordList: string[];
}

export const GuessPage = (props: GuessPageProps, context: Context): JSX.Element => {
  const [wordList, setWordList] = useState<string[]>(props.wordList);
  const [guessValues, setGuessValues] = useState<string[]>([]);
  const [correct, setCorrect] = useState<boolean[]>([]);
  const [current, setCurrent] = useState<number>(0);

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
    checkWord(newGuess, index);
  };

  return (
    <vstack padding="medium" gap="medium">
      {wordList[0] && <text>{wordList[0]}</text>}
      {wordList.slice(1, wordList.length - 1).map((word, index) => (
        <hstack key={`${index}`} gap="medium" alignment="bottom center">
          {correct[index] ? (
            <text>{wordList[index + 1]}</text>
          ) : (
            <>
              <text>{word[0]}</text>
              <ButtonForm
                wordList={wordList}
                index={index}
                correctList={correct}
                handleChange={handleGuessChange}
              />
            </>
          )}
        </hstack>
      ))}
      {wordList.at(-1) != undefined && <text>{wordList.at(-1)}</text>}
    </vstack>
  );
};
