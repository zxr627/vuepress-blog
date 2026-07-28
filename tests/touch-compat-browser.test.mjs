import assert from "node:assert/strict";
import test from "node:test";

import { isIOSTouchDevice } from "../src/.vuepress/touchCompatBrowser.mjs";

test("enables touch fallback for iPhone browsers even without a Via marker", () => {
  const viaLikeUserAgent =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) " +
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 " +
    "Mobile/15E148 Safari/604.1";

  assert.equal(
    isIOSTouchDevice({
      userAgent: viaLikeUserAgent,
      platform: "iPhone",
      maxTouchPoints: 5,
    }),
    true,
  );
});

test("supports iPadOS desktop user agents through touch capability", () => {
  assert.equal(
    isIOSTouchDevice({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15",
      platform: "MacIntel",
      maxTouchPoints: 5,
    }),
    true,
  );
});

test("does not bind the fallback on Android or desktop browsers", () => {
  assert.equal(
    isIOSTouchDevice({
      userAgent:
        "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/138 Mobile",
      platform: "Linux armv8l",
      maxTouchPoints: 5,
    }),
    false,
  );

  assert.equal(
    isIOSTouchDevice({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      platform: "Win32",
      maxTouchPoints: 0,
    }),
    false,
  );
});
