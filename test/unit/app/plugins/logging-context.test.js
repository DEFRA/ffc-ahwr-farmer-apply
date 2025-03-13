import Hapi from "@hapi/hapi";
import { loggingContextPlugin } from "../../../../app/plugins/logging-context.js";
import { loggingPlugin } from "../../../../app/plugins/logging.js";

jest.mock("../../../../app/session", () => ({
  getFarmerApplyData: jest.fn().mockImplementation(() => ({
    organisation: {
      sbi: "sbi123",
    },
    reference: "ABC-123",
  })),
  getCustomer: jest.fn().mockReturnValue("crn123"),
  setFarmerApplyData: jest.fn(),
  clear: jest.fn(),
}));

describe("Logging context plugin", () => {
  let server;
  let logBindings;

  beforeAll(async () => {
    server = Hapi.server();

    await server.register(loggingContextPlugin);
    await server.register(loggingPlugin);

    server.route({
      method: "GET",
      path: "/apply/route1",
      handler: (request, h) => {
        logBindings = request.logger.bindings();
        return h.response("ok").code(200);
      },
    });

    server.route({
      method: "GET",
      path: "/apply/route2",
      handler: (request, h) => {
        request.logger.setBindings({
          extra: "new-value",
        });
        logBindings = request.logger.bindings();
        return h.response("ok").code(200);
      },
    });

    await server.initialize();
  });

  afterEach(() => {
    logBindings = undefined;
  });

  afterAll(async () => {
    await server.stop();
  });

  test("should add contextual items to logs", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/apply/route1",
    });

    expect(response.statusCode).toBe(200);
    expect(logBindings.sbi).toEqual("sbi123");
    expect(logBindings.crn).toEqual("crn123");
    expect(logBindings.reference).toEqual("ABC-123");
  });

  test("specific contextual items can be mixed in", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/apply/route2",
    });

    expect(response.statusCode).toBe(200);
    expect(logBindings.extra).toEqual("new-value");
    expect(logBindings.sbi).toEqual("sbi123");
    expect(logBindings.crn).toEqual("crn123");
    expect(logBindings.reference).toEqual("ABC-123");
  });
});
