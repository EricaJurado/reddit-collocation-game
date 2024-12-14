import React, { useEffect, useState } from 'react';
import { Context, Devvit, useAsync, useState } from '@devvit/public-api';

function CharInput({
  onChange,
  letterRevealed,
  correctLetter,
  changeIndex,
  inputRef,
  onFocus,
  onSubmit,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  letterRevealed: boolean;
  correctLetter: string;
  changeIndex: (direction: number) => void;
  inputRef: React.Ref<HTMLInputElement>;
  onFocus: () => void;
  onSubmit: () => void;
}) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && value === '') {
      changeIndex(-1);
    } else if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <vstack>
      {letterRevealed && <text>{correctLetter}</text>}
      {/* {!letterRevealed && (
        <input
          className="char-input"
          ref={inputRef}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value.slice(0, 1); // Allow only one character
            setValue(newValue);
            onChange({ ...e, target: { ...e.target, value: newValue } });
          }}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          type="text"
          autoCorrect="off"
        />
      )} */}
    </vstack>
  );
}

interface Guess {
  id: number;
  value: string;
}

export function GuessInput({
  answer,
  setGuessedWord,
  onSubmit,
}: {
  answer: string;
  setGuessedWord: (guess: string) => void;
  onSubmit: () => void;
}) {
  const initializeGuessList = (n: number): Guess[] =>
    Array.from({ length: n }, (_, i) => ({
      id: i,
      value: '',
    }));

  const initGuessList = initializeGuessList(answer.length);
  initGuessList[0].value = answer[0];
  const [guessList, setGuessList] = useState<Guess[]>(initGuessList);
  const inputRefs: React.RefObject<HTMLInputElement>[] = Array.from({ length: answer.length }, () =>
    React.createRef<HTMLInputElement>()
  );

  const initRevealed = new Array(answer.length).fill(false);
  initRevealed[0] = true;
  const [revealed, setRevealed] = useState(initRevealed);
  const [index, setIndex] = useState(0);

  const handleIndexChange = (direction: number) => {
    const newIndex = Math.max(1, Math.min(answer.length - 1, index + direction));
    setIndex(newIndex);
    inputRefs[newIndex]?.current?.focus();
  };

  const updateItem = (itemId: number, newValue: string) => {
    setGuessList((prevItems) =>
      prevItems.map((item, idx) => (idx === itemId ? { ...item, value: newValue } : item))
    );

    if (newValue !== '') {
      handleIndexChange(1);
    }
  };

  useEffect(() => {
    console.log('Index changed to:', index);
  }, [index]);

  useEffect(() => {
    const guessedWord = guessList.map((item) => item.value).join('');
    if (guessList.length > 0) {
      setGuessedWord(guessedWord);
    }
  }, [guessList]);

  return (
    <div className="guess-input">
      {answer.split('').map((char, i) => (
        <CharInput
          key={i}
          onChange={(e) => updateItem(i, e.target.value)}
          letterRevealed={revealed[i]}
          correctLetter={char}
          changeIndex={handleIndexChange}
          inputRef={inputRefs[i]}
          onFocus={() => setIndex(i)}
          onSubmit={onSubmit}
        />
      ))}
    </div>
  );
}
