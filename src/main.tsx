import { Devvit, useAsync, useState } from '@devvit/public-api';
import { DEVVIT_SETTINGS_KEYS } from './constants.js';
import { Router } from './posts/Router.js';
import { Service } from '../server/Service.js';
import { formatCreatedAtDate } from './utils.js';
import './jobs/userFlair.js';

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
  http: true,
  redis: true,
  realtime: true,
});

// daily puzzle create thread
Devvit.addSchedulerJob({
  name: 'daily_thread',
  onRun: async (_, context) => {
    console.log('daily_thread handler called');
    const subreddit = await context.reddit.getCurrentSubreddit();
    const now = new Date();
    const formattedNow = formatCreatedAtDate(now);
    const resp = await context.reddit.submitPost({
      subredditName: subreddit.name,
      title: `Daily Puzzle ${formattedNow}`,
      text: 'This is a daily thread, comment here!',
    });
    const service = new Service(context);
    await service.postService.saveDailyPost(resp.id, resp.createdAt);
  },
});

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => {
    try {
      const jobId = await context.scheduler.runJob({
        cron: '0 12 * * *',
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
  // Please update as you work on your idea!
  label: 'Create Pinned Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const service = new Service(context);
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      // Title of the post. You'll want to update!
      title: 'Collocation Game',
      subredditName: subreddit.name,
      preview: (
        <vstack>
          <text>Loading...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: 'Created post!' });
    await post.sticky();
    await service.postService.savePinnedPost(post.id, post.createdAt);
    ui.navigateTo(post.url);
  },
});

// for testing daily - currently daily should be auto scheduled on app install
Devvit.addMenuItem({
  label: 'Daily Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
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
    ui.showToast({ text: 'Created post!' });
    const service = new Service(context);
    await service.postService.saveDailyPost(post.id, post.createdAt);
    ui.navigateTo(post.url);
  },
});

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: Router,
});

export default Devvit;
