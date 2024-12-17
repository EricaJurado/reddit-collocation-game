import { Devvit, useForm, type Context } from '@devvit/public-api';

import { useState } from '@devvit/public-api';
import { GuessForm } from '../components/GuessForm.js';

interface GuessPageProps {
  wordList: string[];
  solvedSetter: () => Promise<void>;
}

export const GuessPage = (props: GuessPageProps, context: Context): JSX.Element => {
  const [wordList] = useState<string[]>(props.wordList);
  // initialize guessValues with empty string for each word except first and last word - set those to the word
  const [guessValues, setGuessValues] = useState<string[]>(
    wordList.map((word, index) => (index === 0 || index === wordList.length - 1 ? word : ''))
  );
  // initialize hints with first letter of each word
  const [hints, setHints] = useState<string[]>(wordList.map((word) => word[0]));

  // initialize correct with all false except for first and last word - set those to true
  const [correct, setCorrect] = useState<boolean[]>(
    wordList.map((word, index) => (index === 0 || index === wordList.length - 1 ? true : false))
  );

  const checkWord = (word: string, index: number): boolean => {
    const isCorrect = word === wordList[index];
    const newCorrect = [...correct];
    newCorrect[index] = isCorrect;
    setCorrect(newCorrect);

    // check if correct is list of all true
    if (newCorrect.every((value) => value === true)) {
      props.solvedSetter();
    }
    return isCorrect;
  };

  const handleGuessChange = (newGuess: string, index: number) => {
    const newGuessValues = [...guessValues];
    newGuessValues[index + 1] = newGuess;
    console.log(newGuessValues);
    const correct = checkWord(newGuess, index + 1);

    if (!correct) {
      context.ui.showToast('Incorrect guess');
      // give user another letter in the word they got wrong
      const newHints = [...hints];
      const currHintLength = newHints[index + 1].length;
      console.log(currHintLength);
      newHints[index + 1] = wordList[index + 1].slice(0, currHintLength + 1);
      console.log(newHints);
      setHints(newHints);
    } else {
      context.ui.showToast('Correct guess');
    }
  };

  return (
    <vstack padding="medium" gap="medium" alignment="start middle">
      {wordList[0] && <text size="xlarge">{wordList[0].toUpperCase()}</text>}
      {wordList.slice(1, wordList.length - 1).map((word, index) => (
        <hstack key={`${index}`} gap="medium">
          {correct[index + 1] ? (
            <text size="xlarge">{wordList[index + 1].toUpperCase()}</text>
          ) : (
            <>
              <text size="xlarge" key={hints.toString()}>
                {hints[index + 1].toUpperCase()}
              </text>
              <GuessForm
                wordList={wordList}
                index={index}
                correctList={correct}
                handleChange={handleGuessChange}
                // is disabled unless previous or next word is correct
                isDisabled={!(correct[index] || correct[index + 2])}
              />
            </>
          )}
        </hstack>
      ))}
      {wordList.at(-1) != undefined && <text size="xlarge">{wordList.at(-1)?.toUpperCase()}</text>}
    </vstack>
  );
};
