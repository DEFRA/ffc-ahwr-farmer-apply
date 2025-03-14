import { status, userType } from "../../../../app/constants/constants.js";
import { getLatestApplicationsBySbi } from "../../../../app/api-requests/application-api.js";
import { businessAppliedBefore } from "../../../../app/api-requests/business-applied-before.js";

jest.mock("../../../../app/api-requests/application-api", () => ({
  getLatestApplicationsBySbi: jest.fn(),
}));

describe("Business Applied Before Tests", () => {
  describe("Business is eligible when no existing applications found", () => {
    test("getLatestApplicationsBySbi is called", async () => {
      const SBI = 123456789;
      getLatestApplicationsBySbi.mockResolvedValueOnce([]);
      await businessAppliedBefore(SBI);
      expect(getLatestApplicationsBySbi).toHaveBeenCalledTimes(1);
      expect(getLatestApplicationsBySbi).toHaveBeenCalledWith(SBI);
    });

    test("No error is thrown", async () => {
      const SBI = 123456789;
      getLatestApplicationsBySbi.mockResolvedValueOnce([]);
      await expect(businessAppliedBefore(SBI)).resolves.toEqual(
        userType.NEW_USER
      );
    });
  });

  describe("Throw error when API errors", () => {
    test.each([{ apiResponse: null }, { apiResponse: undefined }])(
      "Business is not eligible when application API response is null or undefined",
      async ({ apiResponse }) => {
        const SBI = 123456789;
        getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse);
        await expect(businessAppliedBefore(SBI)).rejects.toEqual(
          new Error("Bad response from API")
        );
      }
    );
  });

  test("Business has a successful VV application within the last 10 months", async () => {
    const SBI = 123456789;
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: "122333",
          },
          visitDate: new Date(),
        },
        createdAt: "2020-06-06T13:52:14.207Z",
        updatedAt: "2020-06-06T13:52:14.207Z",
        statusId: status.READY_TO_PAY,
        type: "VV",
      },
      {
        data: {
          organisation: {
            sbi: "122333",
          },
          visitDate: new Date(),
        },
        createdAt: "2019-06-06T13:52:14.207Z",
        updatedAt: "2019-06-06T13:52:14.207Z",
        statusId: status.READY_TO_PAY,
        type: "VV",
      },
    ];
    getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse);
    await expect(businessAppliedBefore(SBI)).resolves.toEqual(
      userType.EXISTING_USER
    );
  });

  test("Business has a withdrawn VV application within the last 10 months", async () => {
    const SBI = 123456789;
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: "122333",
          },
          visitDate: new Date(),
        },
        createdAt: "2020-06-06T13:52:14.207Z",
        updatedAt: "2020-06-06T13:52:14.207Z",
        statusId: status.WITHDRAWN,
        type: "VV",
      },
    ];
    getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse);
    await expect(businessAppliedBefore(SBI)).resolves.toEqual(
      userType.NEW_USER
    );
  });

  test("Business has a successful VV application NOT within the last 10 months", async () => {
    const SBI = 123456789;
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: "122333",
          },
          visitDate: "2020-01-01",
        },
        createdAt: "2020-06-06T13:52:14.207Z",
        updatedAt: "2020-06-06T13:52:14.207Z",
        statusId: status.READY_TO_PAY,
        type: "VV",
      },
    ];
    getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse);
    await expect(businessAppliedBefore(SBI)).resolves.toEqual(
      userType.NEW_USER
    );
  });

  test("Business has a withdrawn VV application within the last 10 months", async () => {
    const SBI = 123456789;
    const apiResponse = [
      {
        data: {
          organisation: {
            sbi: "122333",
          },
          visitDate: "2020-01-01",
        },
        createdAt: "2020-06-06T13:52:14.207Z",
        updatedAt: "2020-06-06T13:52:14.207Z",
        statusId: status.WITHDRAWN,
        type: "VV",
      },
    ];
    getLatestApplicationsBySbi.mockResolvedValueOnce(apiResponse);
    await expect(businessAppliedBefore(SBI)).resolves.toEqual(
      userType.NEW_USER
    );
  });
});
