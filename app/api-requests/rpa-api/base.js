import Wreck from "@hapi/wreck";
import { getToken } from "../../session/index.js";

import { keys } from "../../session/keys.js";
import { config } from "../../config/index.js";
import { authConfig } from "../../config/auth.js";
import { apiHeaders } from "../../constants/constants.js";

export const get = async (hostname, url, request, headers = {}) => {
  headers[apiHeaders.xForwardedAuthorization] = getToken(
    request,
    keys.tokens.accessToken,
  );
  headers[apiHeaders.ocpSubscriptionKey] = authConfig.apim.ocpSubscriptionKey;

  const response = await Wreck.get(`${hostname}${url}`, {
    headers,
    json: true,
    rejectUnauthorized: false,
    timeout: config.wreckHttp.timeoutMilliseconds,
  });

  return response.payload;
};
