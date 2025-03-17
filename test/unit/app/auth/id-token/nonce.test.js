import { verify } from "../../../../../app/auth/id-token/nonce";
import { getToken } from "../../../../../app/session";

jest.mock("../../../../../app/session");

test("verify: undefined id token", () => {
  expect(() => verify({}, undefined)).toThrow("Empty id_token");
});

test("verify: missing token on session", () => {
  getToken.mockReturnValueOnce(undefined);
  expect(() => verify({}, "123")).toThrow("HTTP Session contains no nonce");
});

test("verify: different token on session", () => {
  getToken.mockReturnValueOnce("NotTheSame");
  expect(() => verify({}, "123")).toThrow("Nonce mismatch");
});
