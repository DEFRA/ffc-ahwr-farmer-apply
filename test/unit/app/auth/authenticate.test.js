import { when, resetAllWhenMocks } from "jest-when";
import { verify } from "jsonwebtoken";
import { keys } from "../../../../app/session/keys";
import {
  getPkcecodes,
  getToken,
  setCustomer,
  setToken,
} from "../../../../app/session";
import Wreck from "@hapi/wreck";
import jwktopem from "jwk-to-pem";
import { authenticate } from "../../../../app/auth/authenticate";

jest.mock("../../../../app/session");
jest.mock("@hapi/wreck");
jest.mock("jwk-to-pem");
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn().mockReturnValue(true),
  decode: jest.requireActual("jsonwebtoken").decode,
}));
jest.mock("applicationinsights", () => ({
  defaultClient: { trackException: jest.fn(), trackEvent: () => "hello" },
  dispose: jest.fn(),
}));
jest.mock("../../../../app/config/auth", () => ({
  authConfig: {
    ...jest.requireActual("../../../../app/config/auth").authConfig,
    defraId: {
      ...jest.requireActual("../../../../app/config/auth").authConfig.defraId,
      tenantName: "testtenant",
      jwtIssuerId: "dummy_jwt_issuer_id",
    },
  },
}));

const MOCK_NOW = new Date();
const MOCK_COOKIE_AUTH_SET = jest.fn();

describe("authenticate", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern");
    jest.setSystemTime(MOCK_NOW);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    resetAllWhenMocks();
  });

  test.each([
    {
      toString: () => "authenticate",
      given: {
        request: {
          query: {
            state:
              "eyJpZCI6IjgyN2E0NmEyLTEzZGQtNGI4MC04MzM1LWQxZDZhNTVlNmY3MSJ9",
            code: "query_code",
          },
          logger: {
            log: jest.fn(),
            error: jest.fn(),
            setBindings: jest.fn(),
          },
          cookieAuth: {
            set: MOCK_COOKIE_AUTH_SET,
          },
        },
      },
      when: {
        session: {
          state: "eyJpZCI6IjgyN2E0NmEyLTEzZGQtNGI4MC04MzM1LWQxZDZhNTVlNmY3MSJ9",
          pkcecodes: {
            verifier: "verifier",
          },
        },
        jwktopem: "public_key",
        acquiredSigningKey: {
          signingKey: "signing_key",
        },
        redeemResponse: {
          res: {
            statusCode: 200,
          },
          payload: {
            /* Decoded access_token:
            {
              "alg": "HS256",
              "typ": "JWT"
            },
            {
              "sub": "1234567890",
              "name": "John Doe",
              "firstName": "John",
              "lastName": "Doe",
              "email": "john.doe@email.com",
              "iat": 1516239022,
              "iss": "https://testtenant.b2clogin.com/dummy_jwt_issuer_id/v2.0/",
              "roles": [
                "5384769:Agent:3"
              ],
              "contactId": "1234567890",
              "currentRelationshipId": "123456789"
            } */
            access_token:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZmlyc3ROYW1lIjoiSm9obiIsImxhc3ROYW1lIjoiRG9lIiwiZW1haWwiOiJqb2huLmRvZUBlbWFpbC5jb20iLCJpYXQiOjE1MTYyMzkwMjIsImlzcyI6Imh0dHBzOi8vdGVzdHRlbmFudC5iMmNsb2dpbi5jb20vZHVtbXlfand0X2lzc3Vlcl9pZC92Mi4wLyIsInJvbGVzIjpbIjUzODQ3Njk6QWdlbnQ6MyJdLCJjb250YWN0SWQiOiIxMjM0NTY3ODkwIiwiY3VycmVudFJlbGF0aW9uc2hpcElkIjoiMTIzNDU2Nzg5In0.Pt3RWu8F2ObAKWVIeQxSDvZvfBDIrkvM_0HuNJBZSwM",
            id_token:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJub25jZSI6IjEyMyJ9.EFgheK9cJjMwoszwDYbf9n_XF8NJ3qBvLYqUB8uRrzk",
            expires_in: 10,
          },
        },
      },
      expect: {
        error: undefined,
      },
    },
    {
      toString: () => "authenticate - iss not trusted",
      given: {
        request: {
          query: {
            state:
              "eyJpZCI6IjgyN2E0NmEyLTEzZGQtNGI4MC04MzM1LWQxZDZhNTVlNmY3MSJ9",
            code: "query_code",
          },
          logger: {
            log: jest.fn(),
            error: jest.fn(),
            setBindings: jest.fn(),
          },
          cookieAuth: {
            set: MOCK_COOKIE_AUTH_SET,
          },
        },
      },
      when: {
        session: {
          state: "eyJpZCI6IjgyN2E0NmEyLTEzZGQtNGI4MC04MzM1LWQxZDZhNTVlNmY3MSJ9",
          pkcecodes: {
            verifier: "verifier",
          },
        },
        jwktopem: "public_key",
        acquiredSigningKey: {
          signingKey: "signing_key",
        },
        redeemResponse: {
          res: {
            statusCode: 200,
          },
          payload: {
            /* Decoded access_token:
            {
              "alg": "HS256",
              "typ": "JWT"
            },
            {
              "sub": "1234567890",
              "name": "John Doe",
              "firstName": "John",
              "lastName": "Doe",
              "email": "john.doe@email.com",
              "iat": 1516239022,
              "iss": "www.something.wrong",
              "roles": [
                "5384769:Agent:3"
              ],
              "contactId": "1234567890",
              "currentRelationshipId": "123456789"
            } */
            access_token:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZmlyc3ROYW1lIjoiSm9obiIsImxhc3ROYW1lIjoiRG9lIiwiZW1haWwiOiJqb2huLmRvZUBlbWFpbC5jb20iLCJpYXQiOjE1MTYyMzkwMjIsImlzcyI6Ind3dy5zb21ldGhpbmcud3JvbmciLCJyb2xlcyI6WyI1Mzg0NzY5OkFnZW50OjMiXSwiY29udGFjdElkIjoiMTIzNDU2Nzg5MCIsImN1cnJlbnRSZWxhdGlvbnNoaXBJZCI6IjEyMzQ1Njc4OSJ9.iur1MsXsxAjHfDlfKDne0JewXya_j_R8gI_iK9WSYCs",
            id_token:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJub25jZSI6IjEyMyJ9.EFgheK9cJjMwoszwDYbf9n_XF8NJ3qBvLYqUB8uRrzk",
            expires_in: 10,
          },
        },
      },
      expect: {
        error: new Error("Issuer not trusted: www.something.wrong"),
      },
    },
    {
      toString: () => "authenticate - jwtVerify error",
      given: {
        request: {
          query: {
            state:
              "eyJpZCI6IjgyN2E0NmEyLTEzZGQtNGI4MC04MzM1LWQxZDZhNTVlNmY3MSJ9",
            code: "query_code",
          },
          logger: {
            log: jest.fn(),
            error: jest.fn(),
            setBindings: jest.fn(),
          },
          cookieAuth: {
            set: MOCK_COOKIE_AUTH_SET,
          },
        },
      },
      when: {
        session: {
          state: "eyJpZCI6IjgyN2E0NmEyLTEzZGQtNGI4MC04MzM1LWQxZDZhNTVlNmY3MSJ9",
          pkcecodes: {
            verifier: "verifier",
          },
        },
        jwktopem: "WRONG_KEY!!!",
        acquiredSigningKey: {
          signingKey: "signing_key",
        },
        redeemResponse: {
          res: {
            statusCode: 200,
          },
          payload: {
            /* Decoded access_token:
            {
              "alg": "HS256",
              "typ": "JWT"
            },
            {
              "sub": "1234567890",
              "name": "John Doe",
              "firstName": "John",
              "lastName": "Doe",
              "email": "john.doe@email.com",
              "iat": 1516239022,
              "iss": "https://testtenant.b2clogin.com/dummy_jwt_issuer_id/v2.0/",
              "roles": [
                "5384769:Agent:3"
              ],
              "contactId": "1234567890",
              "currentRelationshipId": "123456789"
            } */
            access_token:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZmlyc3ROYW1lIjoiSm9obiIsImxhc3ROYW1lIjoiRG9lIiwiZW1haWwiOiJqb2huLmRvZUBlbWFpbC5jb20iLCJpYXQiOjE1MTYyMzkwMjIsImlzcyI6Imh0dHBzOi8vdGVzdHRlbmFudC5iMmNsb2dpbi5jb20vZHVtbXlfand0X2lzc3Vlcl9pZC92Mi4wLyIsInJvbGVzIjpbIjUzODQ3Njk6QWdlbnQ6MyJdLCJjb250YWN0SWQiOiIxMjM0NTY3ODkwIiwiY3VycmVudFJlbGF0aW9uc2hpcElkIjoiMTIzNDU2Nzg5In0.Pt3RWu8F2ObAKWVIeQxSDvZvfBDIrkvM_0HuNJBZSwM",
            id_token:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJub25jZSI6IjEyMyJ9.EFgheK9cJjMwoszwDYbf9n_XF8NJ3qBvLYqUB8uRrzk",
            expires_in: 10,
          },
        },
      },
      expect: {
        error: new Error("The token has not been verified"),
      },
    },
  ])("%s", async (testCase) => {
    if (testCase.toString().includes("jwtVerify error")) {
      verify.mockReturnValue(false);
    }

    when(getToken)
      .calledWith(testCase.given.request, keys.tokens.state)
      .mockReturnValue(testCase.when.session.state);
    when(getPkcecodes)
      .calledWith(testCase.given.request, keys.pkcecodes.verifier)
      .mockReturnValue(testCase.when.session.pkcecodes.verifier);
    when(Wreck.post).mockResolvedValue(testCase.when.redeemResponse);
    when(Wreck.get).mockResolvedValue({
      res: {
        statusCode: 200,
      },
      payload: {
        keys: [testCase.when.acquiredSigningKey],
      },
    });

    when(jwktopem)
      .calledWith(testCase.when.acquiredSigningKey)
      .mockReturnValue(testCase.when.jwktopem);

    when(getToken)
      .calledWith(testCase.given.request, keys.tokens.nonce)
      .mockReturnValue("123");

    if (testCase.expect.error) {
      await expect(authenticate(testCase.given.request)).rejects.toEqual(
        testCase.expect.error,
      );

      expect(setToken).toHaveBeenCalledTimes(0);
      expect(setCustomer).toHaveBeenCalledTimes(0);
      expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledTimes(0);
    } else {
      await authenticate(testCase.given.request);

      expect(setToken).toHaveBeenCalledWith(
        testCase.given.request,
        keys.tokens.accessToken,
        testCase.when.redeemResponse.payload.access_token,
      );
      expect(setToken).toHaveBeenCalledWith(
        testCase.given.request,
        keys.tokens.tokenExpiry,
        new Date(MOCK_NOW.getTime() + 10 * 1000).toISOString(),
      );
      expect(setCustomer).toHaveBeenCalledWith(
        testCase.given.request,
        keys.customer.crn,
        "1234567890",
      );
      expect(setCustomer).toHaveBeenCalledWith(
        testCase.given.request,
        keys.customer.organisationId,
        "123456789",
      );
      expect(setCustomer).toHaveBeenCalledWith(
        testCase.given.request,
        keys.customer.attachedToMultipleBusinesses,
        false,
      );
      expect(MOCK_COOKIE_AUTH_SET).toHaveBeenCalledWith({
        account: {
          email: "john.doe@email.com",
          name: "John Doe",
        },
        scope: {
          roleNames: ["Agent"],
          roles: [
            {
              relationshipId: "5384769",
              roleName: "Agent",
              status: "3",
            },
          ],
        },
      });
    }
  });
});
