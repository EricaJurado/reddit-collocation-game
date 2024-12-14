import { Devvit, useAsync, useState } from '@devvit/public-api';
import { DEVVIT_SETTINGS_KEYS } from './constants.js';
import { Router } from './posts/Router.js';

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
    const resp = await context.reddit.submitPost({
      subredditName: subreddit.name,
      title: 'Daily Thread',
      text: 'This is a daily thread, comment here!',
    });
    console.log('posted resp', JSON.stringify(resp));
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

// Devvit.addMenuItem({
//   // Please update as you work on your idea!
//   label: 'Make my experience post',
//   location: 'subreddit',
//   forUserType: 'moderator',
//   onPress: async (_event, context) => {
//     const { reddit, ui } = context;
//     const subreddit = await reddit.getCurrentSubreddit();
//     const post = await reddit.submitPost({
//       // Title of the post. You'll want to update!
//       title: 'My first experience post',
//       subredditName: subreddit.name,
//       preview: <Preview />,
//     });
//     ui.showToast({ text: 'Created post!' });
//     ui.navigateTo(post.url);
//   },
// });

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: Router,
  //   render: (context) => {
  //     return (
  //       <vstack height="100%" width="100%" alignment="center middle">
  //         <webview
  //           id={WEBVIEW_ID}
  //           url="index.html"
  //           width={'100%'}
  //           height={'100%'}
  //           onMessage={async (event) => {
  //             console.log('Received message', event);
  //             const data = event as unknown as WebviewToBlockMessage;

  //             switch (data.type) {
  //               case 'INIT':
  //                 try {
  //                   const postResponse = await context.reddit.getPostById(context.postId!);
  //                   const createdAt = postResponse?.createdAt ?? '';
  //                   sendMessageToWebview(context, {
  //                     type: 'INIT_RESPONSE',
  //                     payload: {
  //                       postId: context.postId!,
  //                       createdAt: createdAt.toString(),
  //                     },
  //                   });
  //                 } catch (error) {
  //                   console.error('Failed to fetch Reddit post details:', error);
  //                   sendMessageToWebview(context, {
  //                     type: 'INIT_RESPONSE',
  //                     payload: {
  //                       postId: context.postId!,
  //                       createdAt: '',
  //                     },
  //                   });
  //                 }
  //                 break;

  //               // case 'GET_POKEMON_REQUEST':
  //               //   context.ui.showToast({ text: `Received message: ${JSON.stringify(data)}` });
  //               //   const pokemon = await getPokemonByName(data.payload.name);

  //               //   sendMessageToWebview(context, {
  //               //     type: 'GET_POKEMON_RESPONSE',
  //               //     payload: {
  //               //       name: pokemon.name,
  //               //       number: pokemon.id,
  //               //     },
  //               //   });
  //               //   break;

  //               default:
  //                 console.error('Unknown message type', data satisfies never);
  //                 break;
  //             }
  //           }}
  //         />
  //       </vstack>
  //     );
  //   },
});

export default Devvit;
