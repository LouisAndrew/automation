import { v4 as uuid } from "uuid";

export const run = async (event, context) => {
  const time = new Date();
  console.log(`Your cron function "${context.functionName}" ran at ${time}`);
  console.log(`uuid is: ${uuid()}`);
  console.log("Is now using TS!");
};
