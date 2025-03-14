import { getLatestApplicationsBySbi } from "../../../../app/api-requests/application-api.js";

jest.mock("@hapi/wreck", () => ({
  get: jest.fn().mockResolvedValue({ payload: "success" }),
}));

test("getLatestApplicationsBySbi", async () => {
  const response = await getLatestApplicationsBySbi("123456789");

  expect(response).toBe("success");
});
