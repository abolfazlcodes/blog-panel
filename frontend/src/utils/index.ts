export const displayBlogReadingTime = (readingTime: number): number => {
  if (!readingTime) return 0;

  return Math.max(1, Math.ceil(readingTime));
};
