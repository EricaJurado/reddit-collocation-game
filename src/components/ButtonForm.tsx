import { Context, Devvit, useForm, useState } from '@devvit/public-api';

interface ButtonFormProps {
  wordList: string[];
  index: number;
  correctList: boolean[];
  handleChange: (newGuess: string, index: number) => void;
}

export const ButtonForm = (props: ButtonFormProps, context: Context): JSX.Element => {
  const { wordList, index, correctList, handleChange } = props;

  const form = useForm(
    {
      fields: [
        {
          type: 'string',
          name: wordList[index],
          label: wordList[index],
          disabled: true,
        },
        {
          type: 'string',
          name: 'newGuess',
          label: 'Enter your guess here:',
          required: true,
          placeholder: 'ABC...',
          helpText: 'Starts with ABC',
        },
        {
          type: 'string',
          name: wordList[index + 2],
          label: wordList[index + 2],
          helpText: 'Starts with ABC',
          disabled: true,
        },
      ],
    },
    async (values) => {
      if (!values.newGuess) return;
      handleChange(values.newGuess, index);
    }
  );

  return (
    <button
      width="200px"
      onPress={() => {
        context.ui.showForm(form);
      }}
      disabled={correctList[index]}
    >
      test
    </button>
  );
};
