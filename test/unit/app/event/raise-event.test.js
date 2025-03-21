import { raiseEvent } from '../../../../app/event/raise-event.js'
import { PublishEvent } from 'ffc-ahwr-common-library'
import appInsights from 'applicationinsights'

jest.mock("applicationinsights", () => ({
  defaultClient: { trackException: jest.fn() },
}));

afterEach(jest.resetAllMocks);
afterAll(jest.restoreAllMocks);

test("raiseEvent", async () => {
  const mockSendEvent = jest.fn();
  jest
    .spyOn(PublishEvent.prototype, "sendEvent")
    .mockImplementation(mockSendEvent);

  const mockEvent = {
    name: "Mock Name",
    properties: {
      id: "1",
      sbi: "123456789",
      cph: "mock cph",
      reference: "ABCD-1234-5678",
      checkpoint: "ffc-ahwr-farmer-apply-test",
      status: "alert",
      action: {
        type: "mocktype",
        message: "the mock message",
        data: { some: "data" },
        raisedBy: "mock@email.com",
      },
    },
  };

  const logger = { error: jest.fn() };
  await raiseEvent(mockEvent, logger);
  expect(mockSendEvent.mock.calls).toEqual([[mockEvent]]);
});

test("raiseEvent tracks errors", async () => {
  const error = new Error("boom");
  jest.spyOn(PublishEvent.prototype, "sendEvent").mockRejectedValueOnce(error);

  const logger = { error: jest.fn() };
  await raiseEvent({}, logger);

  expect(appInsights.defaultClient.trackException.mock.calls).toEqual([
    [{ exception: error }],
  ]);
});
