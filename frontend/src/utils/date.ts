export const convertDateFormat = (
  date: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
    year: "numeric",
  },
  locale?: "en-US"
) => {
  if (!date) return "----";

  return new Date(date).toLocaleString(locale, options);
};
