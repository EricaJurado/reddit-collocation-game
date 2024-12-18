import { Devvit, type Context } from '@devvit/public-api';

interface WinPageProps {
  onNext: () => void;
}

export const WinPage = (props: WinPageProps, context: Context): JSX.Element => {
  const congratsPhrases = [
    'You pieced it together perfectly! 🧩',
    'Speechless... almost. 🤯',
    "You're on fire! 🔥",
    'Flawless victory! 💯',
    "You're a natural! 🌟",
    'Puzzled no more—victory is yours! 🧠🏆',
    'You solved it! 🎉',
    'You got it! 🎊',
    'You’re in a league of your own! 🏅💬',
    'Talk about a perfect solve! 💬✔️',
    'Words well-chosen! 📚💡',
    'Right on the mark! 🎯',
    'Phrase complete! 💪',
    "You're on the same page! 🥳",
  ];

  // Function to pick a random phrase
  const getRandomPhrase = (): string => {
    const randomIndex = Math.floor(Math.random() * congratsPhrases.length);
    return congratsPhrases[randomIndex];
  };

  const randomPhrase = getRandomPhrase();

  return (
    <vstack padding="medium" gap="medium">
      <text color="black" size="xlarge">
        🏆You Win!🏆{' '}
      </text>
      <text color="green">{randomPhrase}</text>
      <button onPress={props.onNext}>Menu</button>
    </vstack>
  );
};
