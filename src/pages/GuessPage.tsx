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
  const [hints, setHints] = useState<string[]>(
    wordList.map((word, index) => {
      if (index === 0 || index === wordList.length - 1) {
        // if first or last word in series, no need for hint - puzzle should show these at start
        return word;
      } else if (index === 1 || index === wordList.length - 2) {
        return word[0];
        // if second or second to last word in series, show first letter as hint so player can solve from either end
      } else {
        // if middle word, no hint
        return '';
      }
    })
  );

  // initialize correct with all false except for first and last word - set those to true
  const [correct, setCorrect] = useState<boolean[]>(
    wordList.map((word, index) => (index === 0 || index === wordList.length - 1 ? true : false))
  );

  const checkWord = (word: string, index: number): boolean => {
    const isCorrect = word.toUpperCase() === wordList[index].toUpperCase();
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
    const currCorrect = checkWord(newGuess, index + 1);

    if (!currCorrect) {
      context.ui.showToast('Incorrect guess');
      // give user another letter in the word they got wrong
      const newHints = [...hints];
      const currHintLength = newHints[index + 1].length;
      newHints[index + 1] = wordList[index + 1].slice(0, currHintLength + 1);
      setHints(newHints);
    } else {
      // give user a hint for previous or next word (whichever hint is currenty empty)
      const newHints = [...hints];
      if (newHints[index] === '') {
        newHints[index] = wordList[index][0];
      } else {
        newHints[index + 2] = wordList[index + 2][0];
      }
      setHints(newHints);

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
              <GuessForm
                wordList={wordList}
                index={index}
                correctList={correct}
                handleChange={handleGuessChange}
                hints={hints}
              />
            </>
          )}
        </hstack>
      ))}
      {wordList.at(-1) != undefined && <text size="xlarge">{wordList.at(-1)?.toUpperCase()}</text>}
    </vstack>
  );
};
