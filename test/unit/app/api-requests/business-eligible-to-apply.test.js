import { getLatestApplicationsBySbi } from "../../../../app/api-requests/application-api.js";
import { OutstandingAgreementError } from "../../../../app/exceptions/OutstandingAgreementError.js";
import { AlreadyAppliedError } from "../../../../app/exceptions/AlreadyAppliedError.js";
import { businessEligibleToApply } from "../../../../app/api-requests/business-eligible-to-apply.js";
import { applicationType } from "../../../../app/constants/constants.js";

jest.mock("../../../../app/api-requests/application-api");

describe("Business Eligible to Apply Tests", () => {
  const MOCK_SYSTEM_DATE = "2023-08-24T12:00:00.000Z";

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers("modern");
    jest.setSystemTime(Date.parse(MOCK_SYSTEM_DATE));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Business is eligible when no existing applications found", () => {
    test("getLatestApplicationsBySbi is called", async () => {
      const SBI = 123456789;
      getLatestApplicationsBySbi.mockResolvedValueOnce([]);
      const result = await businessEligibleToApply(SBI);
      expect(getLatestApplicationsBySbi).toHaveBeenCalledTimes(1);
      expect(getLatestApplicationsBySbi).toHaveBeenCalledWith(SBI);
      expect(result).toEqual("no existing applications");
    });
  });

  test.each([{ apiResponse: null }, { apiResponse: undefined }])(
    "Business is not eligible when application API response is null or undefined",
    async ({ apiResponse }) => {
      const SBI = 123456789;
      getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse);
      await expect(businessEligibleToApply(SBI)).rejects.toEqual(
        new Error("Bad response from API"),
      );
    },
  );

  describe("When endemics is enabled", () => {
    test.each([
      {
        latestApplications: [
          {
            data: {
              organisation: {
                sbi: "122333",
              },
            },
            createdAt: "2023-05-06T13:52:14.207Z",
            updatedAt: "2023-05-06T13:52:14.207Z",
            statusId: 2,
          },
        ],
      },
      {
        latestApplications: [
          {
            data: {
              organisation: {
                sbi: "122333",
              },
            },
            createdAt: "2023-05-06T13:52:14.207Z",
            updatedAt: "2023-05-06T13:52:14.207Z",
            statusId: 7,
          },
        ],
      },
      {
        latestApplications: [
          {
            data: {
              organisation: {
                sbi: "122333",
              },
            },
            createdAt: "2023-05-06T13:52:14.207Z",
            updatedAt: "2023-05-06T13:52:14.207Z",
            statusId: 9,
          },
        ],
      },
      {
        latestApplications: [
          {
            data: {
              organisation: {
                sbi: "122333",
              },
            },
            createdAt: "2023-06-06T13:52:14.207Z",
            updatedAt: "2023-06-06T13:52:14.207Z",
            statusId: 10,
          },
        ],
      },
    ])(
      "Business is eligible when the last previous application is VV and is a closed agreement",
      async ({ latestApplications }) => {
        const SBI = 123456789;
        getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications);
        await expect(businessEligibleToApply(SBI)).resolves.not.toThrow(
          new Error(),
        );
      },
    );

    test.each([
      {
        latestApplications: [
          {
            data: {
              organisation: {
                sbi: "122333",
              },
            },
            createdAt: "2023-05-06T13:52:14.207Z",
            updatedAt: "2023-05-06T13:52:14.207Z",
            statusId: 1,
          },
        ],
      },
      {
        latestApplications: [
          {
            data: {
              organisation: {
                sbi: "122333",
              },
            },
            createdAt: "2023-05-06T13:52:14.207Z",
            updatedAt: "2023-05-06T13:52:14.207Z",
            statusId: 5,
          },
        ],
      },
      {
        latestApplications: [
          {
            data: {
              organisation: {
                sbi: "122333",
              },
            },
            createdAt: "2023-05-06T13:52:14.207Z",
            updatedAt: "2023-05-06T13:52:14.207Z",
            statusId: 6,
          },
        ],
      },
      {
        latestApplications: [
          {
            data: {
              organisation: {
                sbi: "122333",
              },
            },
            createdAt: "2023-06-06T13:52:14.207Z",
            updatedAt: "2023-06-06T13:52:14.207Z",
            statusId: 11,
          },
        ],
      },
    ])(
      "Last application is an open application so returns a OutstandingAgreementError",
      async ({ latestApplications }) => {
        const SBI = 123456789;
        const expectedError = new OutstandingAgreementError(
          "Business with SBI 122333 must claim or withdraw agreement before creating another.",
        );
        getLatestApplicationsBySbi.mockResolvedValueOnce(latestApplications);
        const thrownError = await businessEligibleToApply(SBI).catch(
          (error) => {
            return error;
          },
        );
        expect(thrownError).toEqual(expectedError);
      },
    );

    test("Last application was an Endemics application so returns a AlreadyAppliedError", async () => {
      const SBI = 123456789;
      const apiResponse = [
        {
          data: {
            organisation: {
              sbi: "122333",
            },
          },
          createdAt: "2024-02-28T13:52:14.207Z",
          updatedAt: "2024-02-28T13:52:14.207Z",
          statusId: 1,
          type: applicationType.ENDEMICS,
        },
      ];
      const expectedError = new AlreadyAppliedError(
        "Business with SBI 122333 already has an endemics agreement",
      );
      getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse);
      const thrownError = await businessEligibleToApply(SBI).catch((error) => {
        return error;
      });
      expect(thrownError).toEqual(expectedError);
    });
  });
});
