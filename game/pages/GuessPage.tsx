import { useEffect, useState } from 'react';
import { CustomInput } from '../components/CustomInput';
import { sendToDevvit } from '../utils';
import { useDevvitListener } from '../hooks/useDevvitListener';
import { Devvit, RedditAPIClient } from '@devvit/public-api';
import { convertStringToDate, getPuzzleByDate } from '../../server/serverUtils';

interface GuessPageProps {
  postId: string;
  createdAt: string;
}

export const GuessPage = ({ postId, createdAt }: GuessPageProps) => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  //   const pokemon = useDevvitListener('GET_POKEMON_RESPONSE');
  const [wordList, setWordList] = useState(['']);

  useEffect(() => {
    if (createdAt) {
      try {
        const targetDate = convertStringToDate(createdAt);
        const puzzle = getPuzzleByDate(targetDate);
        if (!puzzle) {
          throw new Error('No puzzle found');
        }
        setWordList(puzzle);
      } catch (e) {
        console.log(e);
      }
    }
  }, [createdAt]);

  const [correct, setCorrect] = useState([false, false, false]);

  function checkWord(word: string, index: number) {
    if (word === wordList[index + 1]) {
      correct[index] = true;
      setCorrect([...correct]);
    } else {
      correct[index] = false;
      setCorrect([...correct]);
    }
  }

  return (
    <div>
      {wordList[0] && <p>{wordList[0]}</p>}
      {wordList.slice(1, wordList.length - 1).map((word, index) => (
        <div key={word}>
          <CustomInput
            onChange={(e) => setValue(e.target.value)}
            onSubmit={() => {
              console.log(value);
              console.log(index);
              checkWord(value, index);
              //   setLoading(true);
              //   sendToDevvit({
              //     type: 'GET_POKEMON_REQUEST',
              //     payload: { name: word.trim().toLowerCase() },
              //   });
            }}
          />
          {correct[index] ? <p>Correct!</p> : <p>Incorrect!</p>}
        </div>
      ))}
      {wordList.at(-1) && <p>{wordList.at(-1)}</p>}
      {/* <CustomInput
        onChange={(e) => setValue(e.target.value)}
        onSubmit={() => {
          setLoading(true);
          sendToDevvit({
            type: 'GET_POKEMON_REQUEST',
            payload: { name: value.trim().toLowerCase() },
          });
        }}
      />
      {loading && !pokemon ? <div>Loading...</div> : <p>Pokemon Number: {pokemon?.number}</p>} */}
    </div>
  );
};
