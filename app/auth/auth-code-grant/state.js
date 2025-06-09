import { randomUUID } from "node:crypto";
import { setToken } from "../../session/index.js";
import { keys } from "../../session/keys.js";
import { config } from "../../config/index.js";

export const generate = (request) => {
  const state = {
    id: randomUUID(),
    namespace: config.namespace,
    source: "apply",
  };

  const base64EncodedState = Buffer.from(JSON.stringify(state)).toString(
    "base64",
  );
  setToken(request, keys.tokens.state, base64EncodedState);
  return base64EncodedState;
};
