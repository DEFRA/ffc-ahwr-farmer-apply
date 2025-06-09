import { setToken } from "../../../../../app/session";
import { generate } from '../../../../../app/auth/auth-code-grant/state.js'
import { config } from '../../../../../app/config/index.js'
import { keys } from '../../../../../app/session/keys.js'

jest.mock("../../../../../app/session");

test("generate: state generated and inserted into session", () => {
  const request = {
    query: {},
  };

  const result = generate(request);

  const decodedState = JSON.parse(Buffer.from(result, "base64").toString("ascii"))

  expect(decodedState.source).toBe("apply");
  expect(decodedState.namespace).toBe(config.namespace);

  expect(setToken).toHaveBeenCalledWith(request, keys.tokens.state, result);
});
