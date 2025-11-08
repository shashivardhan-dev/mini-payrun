import serverlessExpress from "@vendia/serverless-express";
import app from "./index.js";



// AWS Lambda (Serverless)
export const handler = serverlessExpress({ app });
