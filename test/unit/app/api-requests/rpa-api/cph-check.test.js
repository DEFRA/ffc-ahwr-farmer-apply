import Wreck from "@hapi/wreck";
import { when, resetAllWhenMocks } from "jest-when";
import { keys } from "../../../../../app/session/keys";
import { getCustomer, getToken } from "../../../../../app/session";
import { customerMustHaveAtLeastOneValidCph } from "../../../../../app/api-requests/rpa-api/cph-check";

jest.mock("@hapi/wreck", () => ({ get: jest.fn() }));
jest.mock("../../../../../app/session", () => ({
  getCustomer: jest.fn(),
  getToken: jest.fn(),
}));

describe("CPH check", () => {
  afterAll(() => {
    resetAllWhenMocks();
  });

  test.each([
    {
      toString: () => "Both CPH numbers are valid",
      given: {
        apimAccessToken: "apimAccessToken",
        request: {},
        session: {
          accessToken: "accessToken",
          organisationId: "000111222",
          crn: "crn",
        },
      },
      when: {
        cphNumbers: [
          {
            cphNumber: "08/178/0064",
          },
          {
            cphNumber: "21/421/0146",
          },
        ],
      },
      expect: {
        error: false,
      },
    },
    {
      toString: () => "Both CPH numbers are invalid",
      given: {
        request: {},
        session: {
          accessToken: "accessToken",
          apimAccessToken: "apimAccessToken",
          organisationId: "000111222",
          crn: "crn",
        },
      },
      when: {
        cphNumbers: [
          {
            cphNumber: "52/178/0064",
          },
          {
            cphNumber: "21/421/8000",
          },
        ],
      },
      expect: {
        error: "Customer must have at least one valid CPH",
      },
    },
    {
      toString: () => "Only last CPH is valid",
      given: {
        request: {},
        session: {
          accessToken: "accessToken",
          apimAccessToken: "apimAccessToken",
          organisationId: "000111222",
          crn: "crn",
        },
      },
      when: {
        cphNumbers: [
          {
            cphNumber: "52/178/0064",
          },
          {
            cphNumber: "21/421/8000",
          },
          {
            cphNumber: "21/421/7999",
          },
        ],
      },
      expect: {
        error: false,
      },
    },
    {
      toString: () => "No CPH numbers",
      given: {
        request: {},
        session: {
          accessToken: "accessToken",
          apimAccessToken: "apimAccessToken",
          organisationId: "000111222",
          crn: "crn",
        },
      },
      when: {
        cphNumbers: [],
      },
      expect: {
        error: "Customer must have at least one valid CPH",
      },
    },
  ])("%s", async (testCase) => {
    when(getToken)
      .calledWith(expect.anything(), keys.tokens.accessToken)
      .mockReturnValue(testCase.given.session.accessToken);
    when(getCustomer)
      .calledWith(expect.anything(), keys.customer.organisationId)
      .mockReturnValue(testCase.given.session.organisationId);
    when(getCustomer)
      .calledWith(expect.anything(), keys.customer.crn)
      .mockReturnValue(testCase.given.session.crn);

    when(Wreck.get).mockResolvedValue({
      res: {
        statusCode: 200,
      },
      payload: {
        data: testCase.when.cphNumbers,
        success: true,
      },
    });

    if (testCase.expect.error) {
      await expect(() =>
        customerMustHaveAtLeastOneValidCph(
          testCase.given.request,
          testCase.given.apimAccessToken,
        ),
      ).rejects.toThrowError(testCase.expect.error);
    } else {
      await expect(
        customerMustHaveAtLeastOneValidCph(
          testCase.given.request,
          testCase.given.apimAccessToken,
        ),
      ).resolves.toEqual(undefined);
    }
  });

  test("success false is returned", async () => {
    when(getCustomer)
      .calledWith(expect.anything(), keys.customer.organisationId)
      .mockReturnValue("unsuccessful");

    when(Wreck.get).mockResolvedValue({
      res: {
        statusCode: 200,
      },
      payload: {
        data: [],
        success: false,
        errorString: "cph failed",
      },
    });

    await expect(() =>
      customerMustHaveAtLeastOneValidCph({}, "apimAccessToken"),
    ).rejects.toThrowError("cph failed");
  });
});
