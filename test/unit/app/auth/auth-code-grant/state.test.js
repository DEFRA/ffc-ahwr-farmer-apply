import { verify } from "../../../../../app/auth/auth-code-grant/state";
import { getToken } from "../../../../../app/session";

jest.mock("../../../../../app/session");

test("verify: no error, no state", () => {
  const request = {
    query: {},
  };

  expect(verify(request)).toBe(false);
});

test("verify: no error, state mismatch", () => {
  getToken.mockReturnValueOnce("eyJpZCI6MX0=");
  const request = {
    query: {
      state: "eyJpZCI6Mn0=",
    },
  };

  expect(verify(request)).toBe(false);
});

test("verify: no error, state match", () => {
  getToken.mockReturnValueOnce("eyJpZCI6MX0=");
  const request = {
    query: {
      state: "eyJpZCI6MX0=",
    },
  };

  expect(verify(request)).toBe(true);
});

test("verify: error", () => {
  const request = {
    query: {
      error: "boom",
    },
    logger: {
      error: jest.fn(),
    },
    yar: {},
  };

  expect(verify(request)).toBe(false);
});
