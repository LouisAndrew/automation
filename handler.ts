import { Client } from "@notionhq/client";
import { SelectOption } from "@notionhq/client/build/src/api-types";
import { DbType } from "./DbType";
// get recurring tasks that has the "Next Due" property of today.
export const run = async (event, context) => {
  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });

  const dbId = process.env.NOTION_DB_ID || "";

  const todayDate = new Date().toISOString();
  const scheduled = await notion.databases.query({
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
        // {
        //   property: DbType.STATE.name,
        //   [DbType.STATE.val]: {
        //     equals: DbType.STATE.selectValue,
        //   },
        // },
      ],
    },
  });

  await Promise.all(
    scheduled.results.map(async (page) => {
      return notion.pages.update({
        page_id: page.id,
        properties: {
          Due: {
            type: "date",
            date: {
              start: todayDate,
            },
          },
          [DbType.STATE.name]: {
            type: DbType.STATE.val,
            [DbType.STATE.val]: {
              name: DbType.STATE.selectValue,
            } as SelectOption,
          },
        },
      });
    })
  );
};
