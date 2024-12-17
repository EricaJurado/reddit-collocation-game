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
      const puzzleList = await service.userService.getDailySolvedPuzzles(props.username);
      return puzzleList.includes(targetDate);
    }
    return false;
  });

  // user create their own
  const createForm = useForm(
    {
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Title',
          required: true,
          placeholder: 'Enter a title',
        },
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
      // Submit the created puzzle - for right now one per user for testing
      if (props.username) {
        context.ui.showToast('Puzzle created!');
        const community = await context.reddit.getCurrentSubreddit();
        const post = await context.reddit.submitPost({
          title: values.title,
          subredditName: community.name,
          preview: <text>Loading...</text>,
        });
        await service.puzzleService.saveUserPuzzle(props.username, wordList, post.id);
        context.ui.showToast('Created Post');
        context.ui.navigateTo(post);
      }
    }
  );

  return (
    <vstack width="100%" height="100%" alignment="center middle">
      {/* Menu */}

      <vstack height="100%">
        <image imageHeight={84} imageWidth={676} url="logo-transparent.gif" />
        <vstack alignment="center middle" gap="small">
          <hstack
            alignment="center middle"
            width="100%"
            height="50px"
            padding="small"
            gap="small"
            onPress={() => props.pageSetter('daily')}
          >
            <image
              imageHeight={58}
              imageWidth={452}
              url="TodaysPuzzle.gif"
              description="Today's Puzzle"
            />
            {isDailySolved ? <text>✅</text> : <text>❌</text>}
          </hstack>
        </vstack>
        <vstack alignment="center middle" gap="small">
          <hstack
            alignment="center middle"
            width="100%"
            height="50px"
            padding="small"
            gap="small"
            onPress={() => props.pageSetter('leaderboard')}
          >
            <image
              imageHeight={50}
              imageWidth={362}
              url="Leaderboard.gif"
              description="Leaderboard"
            />
          </hstack>
        </vstack>
        <vstack alignment="center middle" gap="small">
          <hstack
            alignment="center middle"
            width="100%"
            height="50px"
            padding="small"
            gap="small"
            onPress={() => context.ui.showForm(createForm)} // Show the form on click
          >
            <image
              imageHeight={50}
              imageWidth={420}
              url="CreatePuzzle.gif"
              description="Create Puzzle"
            />
          </hstack>
        </vstack>
        <vstack alignment="center middle" gap="small">
          <hstack
            alignment="center middle"
            width="100%"
            height="50px"
            padding="small"
            gap="small"
            onPress={() => props.pageSetter('howto')}
          >
            <image
              imageHeight={52}
              imageWidth={386}
              url="HowToPlay.gif"
              description="How To Play"
            />
          </hstack>
        </vstack>
      </vstack>
    </vstack>
  );
};
