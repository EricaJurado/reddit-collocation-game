import { Context, Devvit, useForm, useState } from '@devvit/public-api';

interface GuessFormProps {
  wordList: string[];
  index: number;
  correctList: boolean[];
  isDisabled: boolean;
  handleChange: (newGuess: string, index: number) => void;
}

export const GuessForm = (props: GuessFormProps, context: Context): JSX.Element => {
  const { wordList, index, correctList, isDisabled, handleChange } = props;

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
      disabled={isDisabled}
    >
      test
    </button>
  );
};
