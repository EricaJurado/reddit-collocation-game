import { Devvit, useAsync, useState } from '@devvit/public-api';
import { DEVVIT_SETTINGS_KEYS } from './constants.js';
import { Router } from './posts/Router.js';
import { Service } from '../server/Service.js';
import { formatCreatedAtDate } from './utils.js';
import './jobs/userFlair.js';
import { Preview } from './components/Preview.js';

Devvit.addSettings([
  // Just here as an example
  {
    name: DEVVIT_SETTINGS_KEYS.SECRET_API_KEY,
    label: 'API Key for secret things',
    type: 'string',
    isSecret: true,
    scope: 'app',
  },
]);

Devvit.configure({
  redditAPI: true,
  redis: true,
  realtime: true,
});

// daily puzzle create thread
Devvit.addSchedulerJob({
  name: 'daily_thread',
  onRun: async (_, context) => {
    const service = new Service(context);
    const { reddit } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const now = new Date();
    const formattedNow = formatCreatedAtDate(now);
    const post = await reddit.submitPost({
      title: `Daily Puzzle ${formattedNow}`,
      subredditName: subreddit.name,
      preview: (
        <vstack>
          <text>Loading...</text>
        </vstack>
      ),
    });
    await service.postService.saveDailyPost(post.id, post.createdAt);
  },
});

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => {
    try {
      const jobId = await context.scheduler.runJob({
        cron: '0 0 * * *',
        name: 'daily_thread',
        data: {},
      });
      await context.redis.set('jobId', jobId);
    } catch (e) {
      console.log('error was not able to schedule:', e);
      throw e;
    }
  },
});

Devvit.addMenuItem({
  label: 'Add Pinned Game Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const service = new Service(context);
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: "Let's play PhraseMe!",
      subredditName: subreddit.name,
      preview: <Preview />,
    });
    ui.showToast({ text: 'Added Pinned Game Post' });
    await post.sticky();
    await service.postService.savePinnedPost(post.id, post.createdAt);
    ui.navigateTo(post.url);
  },
});

// for testing daily - currently daily should be auto scheduled on app install
// Devvit.addMenuItem({
//   label: 'Daily Post',
//   location: 'subreddit',
//   forUserType: 'moderator',
//   onPress: async (_event, context) => {
//     const { reddit, ui } = context;
//     const subreddit = await reddit.getCurrentSubreddit();
//     const now = new Date();
//     const formattedNow = formatCreatedAtDate(now);
//     const post = await reddit.submitPost({
//       title: `Daily Puzzle ${formattedNow}`,
//       subredditName: subreddit.name,
//       preview: (
//         <vstack>
//           <text>Loading...</text>
//         </vstack>
//       ),
//     });
//     ui.showToast({ text: 'Created post!' });
//     const service = new Service(context);
//     await service.postService.saveDailyPost(post.id, post.createdAt);
//     ui.navigateTo(post.url);
//   },
// });

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: Router,
});

export default Devvit;
