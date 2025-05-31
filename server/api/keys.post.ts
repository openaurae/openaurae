export default defineEventHandler(async (event) => {
  const userId = requireLogin(event);

  return await signUserKey(userId);
});
