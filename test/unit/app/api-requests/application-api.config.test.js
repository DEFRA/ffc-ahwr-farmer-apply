import { getConfig } from '../../../../app/api-requests/application-api.config.js'

test("throws an error for invalid config", () => {
  jest.resetModules();
  process.env.APPLICATION_API_URI = 'not-a-valid-uri';

  expect(() => getConfig()).toThrow(
    'The config is invalid: "uri" must be a valid uri',
  );
});
