import { createMessage } from "../../../../app/messaging/create-message.js";

describe("create message", () => {
  test(" create a message", () => {
    const body = { some: "data" };
    const type = "some type";
    const options = { option1: "option 1", option2: "option 2" };

    const result = createMessage(body, type, options);

    expect(result).toEqual({
      body,
      type,
      source: "ffc-ahwr-farmer-apply",
      ...options,
    });
  });
});
