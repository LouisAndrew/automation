import { Client } from "@notionhq/client";
import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { DbType } from "./DbType";

const getBetween = () => {};

// AWSLambda
export const run = async (event: APIGatewayEvent, context: Context) => {
  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });

  const dbId = process.env.NOTION_DB_ID || "";

  const weight = (event.body as any).weight;
  console.log(typeof weight);

  const todayDate = new Date().toISOString();
  const entries = await notion.databases.query({
    database_id: dbId,
  });

  console.log(
    await entries.results.map((r) => ({
      properties: r.properties,
      endDate: r.properties[DbType.END_DATE.name][DbType.END_DATE.type],
    }))
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello, world!",
    }),
  };
};
