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
          label: 'Title (default is FIRST WORD → LAST WORD)',
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
      const postTitle =
        values.title || `${values.word1.toUpperCase()} → ${values.word5.toUpperCase()}`;
      if (props.username) {
        const community = await context.reddit.getCurrentSubreddit();
        const post = await context.reddit.submitPost({
          title: postTitle,
          subredditName: community.name,
          preview: (
            <zstack width="100%" height="100%" alignment="center middle">
              <image
                imageHeight={1024}
                imageWidth={1500}
                height="100%"
                width="100%"
                url="background-light.gif"
                description="Striped blue background"
                resizeMode="cover"
              />
              <image
                url="spinner.gif"
                description="Loading ..."
                imageHeight={1080}
                imageWidth={1080}
                width="128px"
                height="128px"
                resizeMode="scale-down"
              />
            </zstack>
          ),
        });
        await service.puzzleService.saveUserPuzzle(props.username, wordList, post.id);
        // update user's created puzzles
        await service.userService.addUserCreatedPuzzle(props.username, post.id);
        await service.leaderboardService.updateUserCreatedPuzzleLeaderboard(props.username);
        context.ui.showToast('Puzzle created!');
        context.ui.navigateTo(post);
      }
    }
  );

  return (
    <vstack width="100%" height="100%" alignment="center middle">
      {/* Menu */}

      <vstack height="100%" alignment="center middle" gap="small">
        <image imageHeight={84} imageWidth={676} width="400px" url="logo-transparent.gif" />
        <vstack alignment="center middle" gap="small">
          <hstack gap="small" alignment="center middle" onPress={() => props.pageSetter('daily')}>
            <text size="xlarge" color="black">
              Today's Puzzle
            </text>
            {isDailySolved ? <text>✅</text> : <text>❌</text>}
          </hstack>
        </vstack>
        <vstack alignment="center middle" gap="small">
          <hstack alignment="center middle" onPress={() => props.pageSetter('leaderboard')}>
            <text size="xlarge" color="black">
              Leaderboard
            </text>
          </hstack>
        </vstack>
        <vstack alignment="center middle" gap="small">
          <hstack
            alignment="center middle"
            onPress={() => context.ui.showForm(createForm)} // Show the form on click
          >
            <text size="xlarge" color="black">
              Create Your Own Puzzle
            </text>
          </hstack>
        </vstack>
        <vstack alignment="center middle" gap="small">
          <hstack alignment="center middle" onPress={() => props.pageSetter('howto')}>
            <text size="xlarge" color="black">
              How To Play
            </text>
          </hstack>
        </vstack>
      </vstack>
    </vstack>
  );
};
