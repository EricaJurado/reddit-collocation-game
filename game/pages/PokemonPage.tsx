import { useState } from 'react';
import { CustomInput } from '../components/CustomInput';
import { sendToDevvit } from '../utils';
import { useDevvitListener } from '../hooks/useDevvitListener';

export const PokemonPage = () => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const pokemon = useDevvitListener('GET_POKEMON_RESPONSE');

  return (
    <div>
      <CustomInput
        onChange={(e) => setValue(e.target.value)}
        onSubmit={() => {
          setLoading(true);
          sendToDevvit({
            type: 'GET_POKEMON_REQUEST',
            payload: { name: value.trim().toLowerCase() },
          });
        }}
      />
      {loading && !pokemon ? <div>Loading...</div> : <p>Pokemon Number: {pokemon?.number}</p>}
    </div>
  );
};
