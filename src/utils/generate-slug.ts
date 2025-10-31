export const generateSlug = (title: string): string => {
  const baseSlug = title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -

  const uniqueSuffix = Math.random().toString(36).substring(2, 8);

  return `${baseSlug}-${uniqueSuffix}`;
};
