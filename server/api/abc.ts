export default defineEventHandler(async (event) => {

  const userlist = await pgDB.select().from(usersTable);;
  return { data: userlist };
});
