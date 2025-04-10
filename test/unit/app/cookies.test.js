import { config } from "../../../app/config/index.js";
import { getCurrentPolicy, updatePolicy } from "../../../app/cookies.js";

const {
  cookie: { cookieNameCookiePolicy },
} = config;
let request;
let h;
const defaultCookie = { confirmed: false, essential: true, analytics: false };

describe("cookies", () => {
  beforeEach(() => {
    request = {
      state: {
        [cookieNameCookiePolicy]: undefined,
        _ga: "123",
        _gid: "123",
      },
    };
    h = {
      state: jest.fn(),
      unstate: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("getCurrentPolicy returns default cookie if does not exist", () => {
    const result = getCurrentPolicy(request, h);
    expect(result).toStrictEqual(defaultCookie);
  });

  test("getCurrentPolicy sets default cookie if does not exist", () => {
    getCurrentPolicy(request, h);
    expect(h.state).toHaveBeenCalledWith(cookieNameCookiePolicy, defaultCookie);
  });

  test("getCurrentPolicy returns cookie if exists", () => {
    request.state[cookieNameCookiePolicy] = {
      confirmed: true,
      essential: false,
      analytics: true,
    };
    const result = getCurrentPolicy(request, h);
    expect(result).toStrictEqual({
      confirmed: true,
      essential: false,
      analytics: true,
    });
  });

  test("getCurrentPolicy does not set default cookie if exists", () => {
    request.state[cookieNameCookiePolicy] = {
      confirmed: true,
      essential: false,
      analytics: true,
    };
    getCurrentPolicy(request, h);
    expect(h.state).not.toHaveBeenCalled();
  });

  test("updatePolicy sets cookie twice if does not exist", () => {
    updatePolicy(request, h, true);
    expect(h.state).toHaveBeenCalledTimes(2);
  });

  test("updatePolicy sets confirmed cookie second if does not exist", () => {
    updatePolicy(request, h, true);
    expect(h.state).toHaveBeenNthCalledWith(2, cookieNameCookiePolicy, {
      confirmed: true,
      essential: true,
      analytics: true,
    });
  });

  test("updatePolicy sets cookie to accepted", () => {
    request.state[cookieNameCookiePolicy] = {
      confirmed: false,
      essential: true,
      analytics: false,
    };
    updatePolicy(request, h, true);
    expect(h.state).toHaveBeenCalledWith(cookieNameCookiePolicy, {
      confirmed: true,
      essential: true,
      analytics: true,
    });
  });

  test("updatePolicy sets cookie to rejected", () => {
    request.state[cookieNameCookiePolicy] = {
      confirmed: false,
      essential: true,
      analytics: false,
    };
    updatePolicy(request, h, false);
    expect(h.state).toHaveBeenCalledWith(cookieNameCookiePolicy, {
      confirmed: true,
      essential: true,
      analytics: false,
    });
  });

  test("updatePolicy denying analytics removes Google cookies", () => {
    request.state.cookies_policy = {
      confirmed: false,
      essential: true,
      analytics: false,
    };
    updatePolicy(request, h, false);
    expect(h.unstate).toHaveBeenCalledWith("_ga");
    expect(h.unstate).toHaveBeenCalledWith("_gid");
  });

  test("updatePolicy approving analytics does not remove Google cookies", () => {
    request.state.cookies_policy = {
      confirmed: false,
      essential: true,
      analytics: true,
    };
    updatePolicy(request, h, true);
    expect(h.unstate).not.toHaveBeenCalled();
  });
});
