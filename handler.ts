import { Client } from "@notionhq/client";
import { DbType } from "./DbType";
// get recurring tasks that has the "Next Due" property of today.
export const run = async (event, context) => {
  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });

  const dbId = process.env.NOTION_DB_ID || "";

  const todayDate = new Date().toISOString();
  const response = await notion.databases.query({
    database_id: dbId,
    filter: {
      and: [
        {
          property: DbType.INTERVALL.name,
          [DbType.INTERVALL.val]: {
            greater_than: 0,
          },
        },
        {
          property: DbType.NEXT_DUE.name,
          [DbType.NEXT_DUE.val]: {
            is_not_empty: true,
            equals: todayDate,
          },
        },
      ],
    },
  });

  console.log(response);
};
