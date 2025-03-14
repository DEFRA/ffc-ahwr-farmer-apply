import { requestAuthorizationCodeUrl } from "../../../../app/auth/auth-code-grant/request-authorization-code-url";
import { authenticate } from "../../../../app/auth/authenticate";
import { verify } from "../../../../app/auth/auth-code-grant/state";
// import { generate } from '../../../../app/auth/auth-code-grant/state'

jest.mock("../../../../app/session");
jest.mock("../../../../app/auth/auth-code-grant/state", () => ({
  verify: jest.fn(),
  generate: jest.fn(),
}));

describe("Generate authentication url test", () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  test("when requestAuthorizationCodeUrl with pkce true challenge parameter added", async () => {
    const setPkcecodesMock = jest.fn();
    const setTokenMock = jest.fn();
    const session = {
      setPkcecodes: setPkcecodesMock,
      setToken: setTokenMock,
    };
    const result = requestAuthorizationCodeUrl(session, undefined);
    const params = new URL(result).searchParams;
    expect(params.get("code_challenge")).not.toBeNull();
  });

  test("when requestAuthorizationCodeUrl with pkce false no challenge parameter is added", async () => {
    const setPkcecodesMock = jest.fn();
    const setTokenMock = jest.fn();
    const session = {
      setPkcecodes: setPkcecodesMock,
      setToken: setTokenMock,
    };
    const result = requestAuthorizationCodeUrl(session, false);
    const params = new URL(result).searchParams;
    expect(params.get("code_challenge")).toBeNull();
  });

  test("when invalid state error is thrown", async () => {
    verify.mockReturnValueOnce(false);
    const request = { yar: { id: "33" } };

    try {
      await authenticate(request);
    } catch (error) {
      expect(error.message).toEqual("Invalid state");
      expect(verify).toHaveBeenCalledWith(request);
    }
  });
});
