export const cleanupUnusedMediaFiles = async () => {
  const orphaned = await prisma.mediaFile.findMany({
    where: {
      blogs: { none: {} },
      projects: { none: {} },
    },
  });

  for (const file of orphaned) {
    await deleteMediaFileById(file.id);
  }
};
