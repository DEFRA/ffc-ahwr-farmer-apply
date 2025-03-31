import { getSessionEvent } from "../../../../app/event/get-session-event.js";
import { setEnvVar, restoreEnvVars } from "../../../helpers/env-vars.js";

afterEach(restoreEnvVars);

test("getSessionEvent", () => {
  const cloudRole = "ffc-ahwr-farmer-apply-test";
  setEnvVar("APPINSIGHTS_CLOUDROLE", cloudRole);

  const organisation = {
    sbi: "123456789",
    emai: "test@test.test",
  };
  const sessionId = "9e016c50-046b-4597-b79a-ebe4f0bf8505";
  const entryKey = "organisation";
  const key = "test";
  const value = "test value";
  const ip = "1.1.1.1";
  const reference = "AHWR-TEMP-IDE";

  const expected = {
    name: "send-session-event",
    properties: {
      action: {
        data: {
          ip,
          reference,
          test: value,
        },
        message: "Session set for organisation and test.",
        raisedBy: organisation.email,
        type: `${entryKey}-${key}`,
      },
      checkpoint: cloudRole,
      cph: "n/a",
      id: sessionId,
      reference,
      sbi: organisation.sbi,
      status: "success",
    },
  };

  const event = getSessionEvent(
    organisation,
    sessionId,
    entryKey,
    key,
    value,
    ip,
    reference,
  );

  expect(event).toEqual(expected);
});
