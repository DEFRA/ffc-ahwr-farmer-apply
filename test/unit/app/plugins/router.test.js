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
      "/healthy",
      "/healthz",
      "/{any*}",
      "/apply/cookies",
      "/apply/privacy-policy",
      "/apply/assets/{path*}",
      "/apply/endemics/declaration",
      "/apply/endemics/numbers",
      "/apply/endemics/timings",
      "/apply/endemics/you-can-claim-multiple",
      "/apply/cookies",
      "/apply/endemics/declaration",
      "/apply/endemics/numbers",
      "/apply/endemics/timings",
      "/apply/endemics/you-can-claim-multiple",
    ]);

    await server.stop();
  });
});
