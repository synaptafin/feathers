// import { users } from '../database/pg/schema';
export default defineEventHandler(async (event) => {

  const userlist = await pgDB.select().from(usersTable);;
  return { data: userlist };
});
