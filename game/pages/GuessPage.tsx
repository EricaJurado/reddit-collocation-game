import { useEffect, useState } from 'react';
import { CustomInput } from '../components/CustomInput';
import { sendToDevvit } from '../utils';
import { useDevvitListener } from '../hooks/useDevvitListener';
import { Devvit, RedditAPIClient } from '@devvit/public-api';

interface GuessPageProps {
  postId: string;
  createdAt: string;
}

export const GuessPage = ({ postId, createdAt }: GuessPageProps) => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  //   const pokemon = useDevvitListener('GET_POKEMON_RESPONSE');
  const wordList = ['light', 'box', 'car', 'park'];
  const [correct, setCorrect] = useState([false, false, false, false]);

  function checkWord(word: string, index: number) {
    if (word === wordList[index]) {
      correct[index] = true;
      setCorrect([...correct]);
    } else {
      correct[index] = false;
      setCorrect([...correct]);
    }
  }

  useEffect(() => {
    console.log(createdAt);
  }, [createdAt]);

  return (
    <div>
      {wordList.map((word, index) => (
        <div key={word}>
          <CustomInput
            onChange={(e) => setValue(e.target.value)}
            onSubmit={() => {
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
