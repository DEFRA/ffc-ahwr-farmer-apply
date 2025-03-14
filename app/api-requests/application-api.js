import Wreck from "@hapi/wreck";
import { config } from "../config/index.js";

export async function getLatestApplicationsBySbi(sbi) {
  const response = await Wreck.get(
    `${config.applicationApi.uri}/applications/latest?sbi=${sbi}`,
    { json: true }
  );

  return response.payload;
}
