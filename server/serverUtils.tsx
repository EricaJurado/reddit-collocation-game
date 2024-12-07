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
  console.log(targetDate);
  console.log(data);

  const dailyPuzzle = data?.[targetDate];
  return dailyPuzzle;
}

export { convertStringToDate, getPuzzleByDate };
