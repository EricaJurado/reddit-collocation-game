export const formatCreatedAtDate = (date: Date) => {
  const targetDate = date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear();
  return targetDate;
};
