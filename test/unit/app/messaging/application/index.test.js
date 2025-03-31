import { applicationResponseQueue } from "../../../../../app/config/messaging.js";
import { sendApplication } from "../../../../../app/messaging/application/index.js";
import { receiveMessage } from "../../../../../app/messaging/receive-message.js";
import { sendMessage } from "../../../../../app/messaging/send-message.js";

jest.mock("../../../../../app/messaging/receive-message");
jest.mock("../../../../../app/messaging/send-message");

describe("application messaging tests", () => {
  const sessionId = "a-session-id";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("sendApplication returns undefined on non submitted state", async () => {
    const application = { test: 123 };
    const receiveMessageRes = {
      applicationReference: "test-reference",
      applicationState: "failed",
    };
    receiveMessage.mockResolvedValue(receiveMessageRes);

    const message = await sendApplication(application, sessionId);

    expect(message).toEqual(undefined);
    expect(receiveMessage).toHaveBeenCalledTimes(1);
    expect(receiveMessage).toHaveBeenCalledWith(
      sessionId,
      applicationResponseQueue,
    );
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });

  test("sendApplication returns reference on submitted state", async () => {
    const application = { test: 123 };
    const receiveMessageRes = {
      applicationReference: "test-reference",
      applicationState: "submitted",
    };
    receiveMessage.mockResolvedValue(receiveMessageRes);

    const message = await sendApplication(application, sessionId);

    expect(message).toEqual("test-reference");
    expect(receiveMessage).toHaveBeenCalledTimes(1);
    expect(receiveMessage).toHaveBeenCalledWith(
      sessionId,
      applicationResponseQueue,
    );
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });
});
