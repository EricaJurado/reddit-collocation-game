import { Devvit, useForm, type Context } from '@devvit/public-api';
import { useState } from '@devvit/public-api';
import type { PostData } from '../shared.js';
import { Service } from '../../server/Service.js';
import { formatCreatedAtDate } from '../utils.js';

interface MenuProps {
  username: string | null;
  postData: PostData;
  pageSetter: (page: string) => void;
}

export const MenuHomePage = (props: MenuProps, context: Context): JSX.Element => {
  const service = new Service(context);
  const targetDate = formatCreatedAtDate(new Date(props.postData.createdAt));

  const [isDailySolved] = useState(async () => {
    if (props.username) {
      const puzzleList = await service.getDailySolvedPuzzles(props.username);
      return puzzleList.includes(targetDate);
    }
    return false;
  });

  const createForm = useForm(
    {
      fields: [
        {
          type: 'string',
          name: 'word1',
          label: 'Word 1',
          required: true,
          placeholder: 'Enter a word',
        },
        {
          type: 'string',
          name: 'word2',
          label: 'Word 2',
          required: true,
          placeholder: 'Enter a word',
        },
        {
          type: 'string',
          name: 'word3',
          label: 'Word 3',
          required: true,
          placeholder: 'Enter a word',
        },
        {
          type: 'string',
          name: 'word4',
          label: 'Word 4',
          required: true,
          placeholder: 'Enter a word',
        },
        {
          type: 'string',
          name: 'word5',
          label: 'Word 5',
          required: true,
          placeholder: 'Enter a word',
        },
      ],
    },
    async (values) => {
      const wordList = [values.word1, values.word2, values.word3, values.word4, values.word5];
      // Submit the created puzzle
      console.log('submitting created puzzle', wordList);
    }
  );

  return (
    <vstack width="100%" height="100%" alignment="center middle">
      {/* Menu */}
      <vstack alignment="center middle" gap="small">
        <hstack
          alignment="center middle"
          width="100%"
          height="100%"
          padding="small"
          gap="small"
          onPress={() => props.pageSetter('daily')}
        >
          <text>Today's Puzzle</text>
          {isDailySolved ? <text>✅</text> : <text>❌</text>}
        </hstack>
      </vstack>
      <vstack alignment="center middle" gap="small">
        <hstack
          alignment="center middle"
          width="100%"
          height="100%"
          padding="small"
          gap="small"
          onPress={() => props.pageSetter('leaderboard')}
        >
          <text>Leaderboard</text>
        </hstack>
      </vstack>
      <vstack alignment="center middle" gap="small">
        <hstack
          alignment="center middle"
          width="100%"
          height="100%"
          padding="small"
          gap="small"
          onPress={() => context.ui.showForm(createForm)} // Show the form on click
        >
          <text>Create Your Own Puzzle</text>
        </hstack>
      </vstack>
      <vstack alignment="center middle" gap="small">
        <hstack
          alignment="center middle"
          width="100%"
          height="100%"
          padding="small"
          gap="small"
          onPress={() => props.pageSetter('howto')}
        >
          <text>How To Play</text>
        </hstack>
      </vstack>
    </vstack>
  );
};
