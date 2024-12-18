import { Devvit } from '@devvit/public-api';

import { Service } from '../../server/Service.js';

const flairInfo = [
  {
    "rank": 1,
    "min": 0,
    "max": 0,
    "name": "Newbie",
    "backgroundColor": "#F94144",
    "textColor": "dark"
  },
  {
    "rank": 2,
    "min": 1,
    "max": 6,
    "name": "Fresh Start",
    "backgroundColor": "#F3722C",
    "textColor": "dark"
  },
  {
    "rank": 3,
    "min": 7,
    "max": 30,
    "name": "Weekly Warrior",
    "backgroundColor": "#F8961E",
    "textColor": "dark"
  },
  {
    "rank": 4,
    "min": 31,
    "max": 89,
    "name": "Monthly Master",
    "backgroundColor": "#F9C74F",
    "textColor": "dark"
  },
  {
    "rank": 5,
    "min": 90,
    "max": 179,
    "name": "Quatermaster",
    "backgroundColor": "#90BE6D",
    "textColor": "dark"
  },
  {
    "rank": 6,
    "min": 180,
    "max": 364,
    "name": "Halfway Hero",
    "backgroundColor": "#43AA8B",
    "textColor": "dark"
  },
  {
    "rank": 7,
    "min": 365,
    "name": "Dedicated Puzzler",
    "backgroundColor": "#577590",
    "textColor": "dark"
  }
]

// Get flair info by streak
const getFlairByStreak = (streak: number = 0) => {
  return flairInfo.find((flair) => {
    if (flair.min <= streak && (!flair.max || streak <= flair.max)) {
      return flair;
    }
  });
};

export const userStreakUpFlair = Devvit.addSchedulerJob({
  name: 'USER_STREAK_UP',
  onRun: async (
    event: {
      data: {
        username: string;
        streak: number;
        subredditName: string;
      };
    },
    context
  ) => {
    if (event.data) {
      try {
        const service = new Service(context);

        const targetFlair = getFlairByStreak(event.data.streak);

        const currentFlair = await service.getUserFlairData(event.data.username);

        // If the user already has a higher or same flair (or can't find target flair), don't do anything
        if (!targetFlair || currentFlair === targetFlair.rank || currentFlair > targetFlair.rank) {
          return;
        }

        await Promise.all([
          context.reddit.sendPrivateMessage({
            to: event.data.username,
            subject: `Game Streak Achievement 🏆`,
            text: `Nice work, ${event.data.username}! You've reached a **${event.data.streak} day streak** in the Collocation Game!
    
    Along with bragging rights, you've also earned an ✨exclusive user flair✨ to showcase your achievement!
    
    Keep up the great work! 👏`,
          }),
          context.reddit.setUserFlair({
            subredditName: event.data.subredditName,
            username: event.data.username,
            text: targetFlair.name,
            backgroundColor: targetFlair.backgroundColor,
            textColor: targetFlair.textColor === 'dark' ? 'dark' : 'light',
          }),
          service.saveUserFlairData(event.data.username, targetFlair.rank),
        ]);
      } catch (error) {
        console.error(`Failed to process level up for ${event.data.username}`, error);
      }
    }
  },
});