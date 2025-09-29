import { userType } from "../../../../app/constants/constants.js";
import { getUserTypeByApplication } from "../../../../app/api-requests/get-user-type-by-application.js";
import { CLAIM_STATUS } from 'ffc-ahwr-common-library'

describe("Business Applied Before Tests", () => {

  test("No error is thrown for an empty array of applications", () => {
    expect(getUserTypeByApplication([])).toEqual(userType.NEW_USER);
  });

  test("Business has a successful VV application within the last 10 months", () => {
    const latestApplications = [
      {
        data: {
          organisation: {
            sbi: "122333",
          },
          visitDate: new Date(),
        },
        createdAt: "2020-06-06T13:52:14.207Z",
        updatedAt: "2020-06-06T13:52:14.207Z",
        statusId: CLAIM_STATUS.READY_TO_PAY,
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
        statusId: CLAIM_STATUS.READY_TO_PAY,
        type: "VV",
      },
    ];
    expect(getUserTypeByApplication(latestApplications)).toEqual(userType.EXISTING_USER);
  });

  test("Business has a successful VV application NOT within the last 10 months", () => {
    const latestApplications = [
      {
        data: {
          organisation: {
            sbi: "122333",
          },
          visitDate: "2020-01-01",
        },
        createdAt: "2020-06-06T13:52:14.207Z",
        updatedAt: "2020-06-06T13:52:14.207Z",
        statusId: CLAIM_STATUS.READY_TO_PAY,
        type: "VV",
      },
    ];
    expect(getUserTypeByApplication(latestApplications)).toEqual(userType.NEW_USER);
  });

  test("Business has a withdrawn VV application within the last 10 months", () => {
    const latestApplications = [
      {
        data: {
          organisation: {
            sbi: "122333",
          },
          visitDate: "2020-01-01",
        },
        createdAt: "2020-06-06T13:52:14.207Z",
        updatedAt: "2020-06-06T13:52:14.207Z",
        statusId: CLAIM_STATUS.WITHDRAWN,
        type: "VV",
      },
    ];

    expect(getUserTypeByApplication(latestApplications)).toEqual(userType.NEW_USER);
  });
});
