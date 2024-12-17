import puzzles from './dailyPuzzles.json';

interface JsonData {
  [key: string]: any;
}

function convertStringToDate(date: string): Date {
  try {
    const convertedDate = new Date(date);
    return convertedDate;
  } catch (e) {
    console.log(e);
    return new Date();
  }
}

function getPuzzleByDate(date: Date): string[] | null {
  const data: JsonData = puzzles;
  const targetDate = date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear();
  let dailyPuzzle = data?.[targetDate];
  if (!dailyPuzzle) {
    const safeDate = '12-1-2024';
    dailyPuzzle = data?.[safeDate];
  }
  return dailyPuzzle;
}

export { convertStringToDate, getPuzzleByDate };
