import { getIneligibilityEvent } from "../../../../app/event/get-ineligibility-event.js";
import { setEnvVar, restoreEnvVars } from "../../../helpers/env-vars.js";

afterEach(restoreEnvVars);

test("getIneligibilityEvent", async () => {
  const cloudRole = "ffc-ahwr-farmer-apply-test";
  setEnvVar("APPINSIGHTS_CLOUDROLE", cloudRole);

  const MOCK_NOW = new Date();
  jest.useFakeTimers("modern");
  jest.setSystemTime(MOCK_NOW);

  const sessionId = "0255ab98-14d9-4453-b723-e3816ad7288b";
  const sbi = "987654321";
  const crn = "0987654321";
  const email = "test@email.test";
  const exception = "test exception";
  const reference = "AHWR-TEST-REF1";

  const expected = {
    name: "send-ineligibility-event",
    properties: {
      action: {
        data: {
          crn,
          exception,
          journey: "apply",
          raisedAt: MOCK_NOW,
          sbi,
        },
        message: `Apply: ${exception}`,
        raisedBy: email,
        type: "ineligibility-event",
      },
      checkpoint: cloudRole,
      cph: "n/a",
      id: sessionId,
      reference,
      sbi,
      status: "alert",
    },
  };

  const event = await getIneligibilityEvent(
    sessionId,
    sbi,
    crn,
    email,
    exception,
    reference
  );
  jest.useRealTimers();

  expect(event).toEqual(expected);
});
