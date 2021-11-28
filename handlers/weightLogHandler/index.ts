import { Client } from "@notionhq/client";
import {
  PagesCreateParameters,
  PagesCreateResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { Page } from "@notionhq/client/build/src/api-types";
import { APIGatewayEvent, Context } from "aws-lambda";
import { DbType, PageNumbers } from "./DbType";

/**
 * Get Date object of a start page
 * @param page page to be extracted
 */
const getStartDate = (page: Page): Date =>
  new Date(
    page.properties[DbType.START_DATE.name][DbType.START_DATE.nestedType]
  );

/**
 * Create new weekly entry on `Weight Logs` Notion DB
 * @param notion notion client instance
 * @param todayDate today's date in ISO string
 */
const createWeeeklyEntry = (
  notion: Client,
  todayDate: string,
  dbId: string
): Promise<PagesCreateResponse> => {
  const date = new Date(todayDate);
  const pad = (str: number) => (str < 10 ? `0${str}` : str);
  return notion.pages.create({
    parent: {
      database_id: dbId,
    },
    properties: {
      ...PageNumbers,
      Name: {
        title: [
          {
            text: {
              content: `${pad(date.getDay() + 1)}.${pad(
                date.getMonth() + 1
              )}.${date.getFullYear()}`,
            },
          },
        ],
      },
    },
  } as unknown as PagesCreateParameters);
};

const getCurrentSlot = (page: Page, todayDate: string): number => {
  const dayTimestamp = 24 * 3600 * 1000; // timestamp for one day

  return (
    Math.round(
      (new Date(todayDate).getTime() - getStartDate(page).getTime()) /
        dayTimestamp
    ) + 1
  );
};

const getTodaysDate = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0)
  return date
}

// AWSLambda
export const run = async (event: APIGatewayEvent, context: Context) => {
  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });

  const dbId = process.env.NOTION_DB_ID || "";
  const todayDate = getTodaysDate().toISOString()

  const weight: string = JSON.parse(
    event.body || '{ "weight": 0 }'
  ).weight.toString();

  const weightAsNum = parseFloat(
    `${weight.substr(0, 2)}.${weight.substr(2, 2) || 0}`
  );

  // get entry that for the current week
  const { results: currentWeekEntry } = await notion.databases.query({
    database_id: dbId,
    filter: {
      and: [
        {
          property: DbType.START_DATE.name,
          [DbType.START_DATE.type]: {
            on_or_before: todayDate,
          },
        },
        {
          property: DbType.END_DATE.name,
          [DbType.END_DATE.nestedType]: {
            on_or_after: todayDate,
          },
        },
      ],
    },
  });

  const entry =
    currentWeekEntry[0] || (await createWeeeklyEntry(notion, todayDate, dbId));
  const currentSlot = getCurrentSlot(entry, todayDate);

  await notion.pages.update({
    page_id: entry.id,
    properties: {
      [`#${currentSlot}`]: {
        type: "number",
        number: weightAsNum,
      },
    },
  });

  return {
    statusCode: 200,
    body: null,
  };
};
