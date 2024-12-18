import { Devvit, useAsync, useForm, type Context } from '@devvit/public-api';
import { useState } from '@devvit/public-api';
import { Service } from '../../server/Service.js';
import { LeaderboardEntry } from '../shared.js';

interface LeaderboardPageProps {
  username: string | null;
}

export const LeaderboardPage = (props: LeaderboardPageProps, context: Context): JSX.Element => {
  const service = new Service(context);

  // State hooks
  const [streak] = useState(async () =>
    props.username ? await service.userService.getUserStreak(props.username) : 0
  );
  const [dailySolved] = useState(async () =>
    props.username ? await service.userService.getUserDailySolvedCount(props.username) : 0
  );
  const [lastSolved] = useState(async () =>
    props.username ? (await service.userService.getUserLastSolved(props.username)) || '' : ''
  );
  const [userGenSolved] = useState(async () =>
    props.username ? await service.userService.getUserGeneratedPuzzleSolvedCount(props.username) : 0
  );

  const [userCreated] = useState(async () =>
    props.username ? await service.userService.getUserCreatedPuzzleCount(props.username) : 0
  );

  const [dailyLeaderboard] = useState<LeaderboardEntry[]>(
    async () => (await service.leaderboardService.getDailyLeaderboard()) || []
  );
  const [streakLeaderboard] = useState<LeaderboardEntry[]>(
    async () => (await service.leaderboardService.getDailyStreakLeaderboard()) || []
  );

  const [userGenSolvedLeaderboard] = useState<LeaderboardEntry[]>(
    async () => (await service.leaderboardService.getUserGenSolvedLeaderboard()) || []
  );

  const [userCreatedLeaderboard] = useState<LeaderboardEntry[]>(
    async () => (await service.leaderboardService.getUserCreatedPuzzleLeaderboard()) || []
  );

  // Utility function to create a vertical column of leaderboard data
  const createColumn = (
    data: LeaderboardEntry[],
    keyName: keyof LeaderboardEntry,
    title: string,
    colTitleAlignment: Devvit.Blocks.Alignment,
    colDataAlignment: Devvit.Blocks.Alignment
  ) => (
    <vstack gap="small">
      <hstack alignment={colTitleAlignment || 'top center'} gap="small">
        <text color="black" weight="bold">
          {title}
        </text>
      </hstack>
      {data.map((entry, index) => (
        <text color="black" alignment={colDataAlignment || 'middle center'} key={index.toString()}>
          {entry[keyName]}
        </text>
      ))}
    </vstack>
  );

  const [currLeaderPage, setCurrLeaderPage] = useState('dailyStreak');

  // UI render
  return (
    <vstack padding="medium" gap="medium" height="100%" alignment="center middle">
      <hstack gap="medium" width="100%">
        <hstack
          backgroundColor="white"
          padding="small"
          cornerRadius="medium"
          alignment="center middle"
        >
          <text color="black" onPress={() => setCurrLeaderPage('dailyStreak')}>
            Daily Streak 🔥
          </text>
        </hstack>

        <hstack
          backgroundColor="white"
          padding="small"
          cornerRadius="medium"
          alignment="center middle"
        >
          <text color="black" onPress={() => setCurrLeaderPage('dailyTotal')}>
            Total Daily 📅
          </text>
        </hstack>

        <hstack
          backgroundColor="white"
          padding="small"
          cornerRadius="medium"
          alignment="center middle"
        >
          <text color="black" onPress={() => setCurrLeaderPage('userGenSolved')}>
            Community Solved🧠
          </text>
        </hstack>

        <hstack
          backgroundColor="white"
          padding="small"
          cornerRadius="medium"
          alignment="center middle"
        >
          <text color="black" onPress={() => setCurrLeaderPage('userCreated')}>
            Top Created 📝
          </text>
        </hstack>
      </hstack>

      {currLeaderPage === 'dailyStreak' && (
        <>
          {/* Streak Leaderboard */}
          <text color="black" size="medium" weight="bold">
            Longest Daily Streak
          </text>
          <hstack alignment="top start" gap="large">
            {createColumn(streakLeaderboard, 'username', 'User', 'middle center', 'top center')}
            {createColumn(streakLeaderboard, 'score', 'Streak', 'middle center', 'top center')}
          </hstack>
        </>
      )}

      {currLeaderPage === 'dailyTotal' && (
        <>
          {/* Daily Leaderboard */}
          <text color="black" size="medium" weight="bold">
            Total Dailies Solved
          </text>
          <hstack alignment="top start" gap="large">
            {createColumn(dailyLeaderboard, 'username', 'User', 'middle center', 'top center')}
            {createColumn(dailyLeaderboard, 'score', 'Streak', 'middle center', 'top center')}
          </hstack>
        </>
      )}

      {currLeaderPage === 'userGenSolved' && (
        <>
          {/* User Generated Solved Puzzles */}
          <text color="black" size="medium" weight="bold">
            Total Community Generated Puzzles Solved
          </text>
          <hstack alignment="top start" gap="large">
            {createColumn(
              userGenSolvedLeaderboard,
              'username',
              'User',
              'middle center',
              'top center'
            )}
            {createColumn(
              userGenSolvedLeaderboard,
              'score',
              'Solved',
              'middle center',
              'top center'
            )}
          </hstack>
        </>
      )}

      {currLeaderPage === 'userCreated' && (
        <>
          {/* User Created Puzzles */}
          <text color="black" size="medium" weight="bold">
            Total Puzzles Created
          </text>
          <hstack alignment="top start" gap="large">
            {createColumn(
              userCreatedLeaderboard,
              'username',
              'User',
              'middle center',
              'top center'
            )}
            {createColumn(
              userCreatedLeaderboard,
              'score',
              'Created',
              'middle center',
              'top center'
            )}
          </hstack>
        </>
      )}
    </vstack>
  );
};
