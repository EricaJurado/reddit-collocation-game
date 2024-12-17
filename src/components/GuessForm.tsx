import { Context, Devvit, useForm, useState } from '@devvit/public-api';

interface GuessFormProps {
  wordList: string[];
  index: number;
  correctList: boolean[];
  hints: string[];
  handleChange: (newGuess: string, index: number) => void;
}

export const GuessForm = (props: GuessFormProps, context: Context): JSX.Element => {
  const { wordList, index, correctList, hints, handleChange } = props;

  const previousCorrect = correctList[index];
  const nextCorrect = correctList[index + 2];
  const prevText = (previousCorrect ? wordList[index] : hints[index]).toUpperCase();
  const nextText = (nextCorrect ? wordList[index + 2] : hints[index + 2]).toUpperCase();

  // is disabled unless previous or next word is correct
  const currentFieldDisabled = !(correctList[index] || correctList[index + 2]);

  const form = useForm(
    {
      fields: [
        {
          type: 'string',
          name: prevText,
          label: prevText,
          disabled: true,
        },
        {
          type: 'string',
          name: 'newGuess',
          label: 'Enter your guess here:',
          required: true,
          placeholder: `${hints[index + 1].toUpperCase()}...`,
          helpText: `Starts ${hints[index + 1].toUpperCase()}`,
        },
        {
          type: 'string',
          name: nextText,
          label: nextText,
          disabled: true,
        },
      ],
    },
    async (values) => {
      if (!values.newGuess) return;
      handleChange(values.newGuess.toUpperCase(), index);
    }
  );

  return (
    <button
      width="200px"
      onPress={() => {
        context.ui.showForm(form);
      }}
      disabled={currentFieldDisabled}
    >
      {hints[index + 1].toUpperCase()}
    </button>
  );
};
