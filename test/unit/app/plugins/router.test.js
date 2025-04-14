import { config } from "../../../../app/config/index.js";
import { createServer } from "../../../../app/server.js";

describe("routes plugin test ", () => {
  test("routes included", async () => {
    const server = await createServer();
    await server.initialize();

    const routePaths = [];
    server.table()
      .filter(x => !x.settings.tags?.includes('mh'))
      .forEach((element) => {
        routePaths.push(element.path)
      })

    expect(routePaths).toEqual([
      "/apply",
      "/healthy",
      "/healthz",
      "/apply/accessibility",
      "/apply/cookies",
      "/apply/privacy-policy",
      "/apply/signin-oidc",
      "/apply/start",
      "/apply/assets/{path*}",
      "/apply/endemics/check-details",
      "/apply/endemics/declaration",
      "/apply/endemics/numbers",
      "/apply/endemics/start",
      "/apply/endemics/timings",
      "/apply/endemics/you-can-claim-multiple",
      "/apply/cookies",
      "/apply/endemics/check-details",
      "/apply/endemics/declaration",
      "/apply/endemics/numbers",
      "/apply/endemics/timings",
      "/apply/endemics/you-can-claim-multiple",
    ]);

    await server.stop();
  });

  test("when isDev is true, dev-sign-in included in routes", async () => {
    config.devLogin.enabled = true;

    const server = await createServer();
    await server.initialize();

    const routePaths = [];
    server.table().forEach((element) => {
      routePaths.push(element.path);
    });

    expect(routePaths).toContain("/apply/endemics/dev-sign-in");
  });

  test("when isDev is false, dev-sign-in not included in routes", async () => {
    config.devLogin.enabled = false;

    const server = await createServer();
    await server.initialize();

    const routePaths = [];
    server.table().forEach((element) => {
      routePaths.push(element.path);
    });

    expect(routePaths).not.toContain("/apply/endemics/dev-sign-in");
  });

});
