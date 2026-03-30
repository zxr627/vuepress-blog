import { defineClientConfig } from "vuepress/client";
import { setupRunningTimeFooter } from "vuepress-theme-hope/presets/footerRunningTime.js";
import { setupTransparentNavbar } from "vuepress-theme-hope/presets/transparentNavbar.js";
import "vuepress-theme-hope/presets/round-blogger-avatar.scss";
import "vuepress-theme-hope/presets/shinning-feature-panel.scss";
import "vuepress-theme-hope/presets/bounce-icon.scss";
import "lxgw-wenkai-screen-webfont/style.css";

const DEBUG_QUERY_KEY = "debug";
const DEBUG_STORAGE_KEY = "zxr-mobile-debug";
const DEBUG_REPLAY_LIMIT = 20;

type DebugLog = {
  type: "error" | "unhandledrejection";
  message: string;
};

declare global {
  interface Window {
    __zxrErudaLoaded?: boolean;
  }
}

const shouldEnableMobileDebug = (): boolean => {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  const flag = url.searchParams.get(DEBUG_QUERY_KEY);

  if (flag === "1") {
    window.localStorage.setItem(DEBUG_STORAGE_KEY, "1");
    return true;
  }

  if (flag === "0") {
    window.localStorage.removeItem(DEBUG_STORAGE_KEY);
    return false;
  }

  return window.localStorage.getItem(DEBUG_STORAGE_KEY) === "1";
};

const createDebugBuffer = (): DebugLog[] => {
  const logs: DebugLog[] = [];

  const push = (entry: DebugLog): void => {
    if (logs.length >= DEBUG_REPLAY_LIMIT) logs.shift();
    logs.push(entry);
  };

  window.addEventListener("error", (event) => {
    const location =
      event.filename && event.lineno
        ? ` (${event.filename}:${event.lineno}:${event.colno ?? 0})`
        : "";
    const message = event.error?.stack || `${event.message}${location}`;

    push({
      type: "error",
      message,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason =
      event.reason instanceof Error
        ? event.reason.stack || event.reason.message
        : String(event.reason);

    push({
      type: "unhandledrejection",
      message: reason,
    });
  });

  return logs;
};

const enableMobileDebug = async (logs: DebugLog[]): Promise<void> => {
  if (window.__zxrErudaLoaded) return;

  try {
    const module = await import("eruda");
    const eruda = module.default;

    eruda.init({
      tool: ["console", "network", "elements", "info"],
      useShadowDom: false,
    });
    eruda.show?.("console");

    window.__zxrErudaLoaded = true;

    console.info("[debug] 手机调试面板已开启，地址加 ?debug=0 可关闭。");
    console.info("[debug] 当前页面：", window.location.href);
    console.info("[debug] User-Agent：", window.navigator.userAgent);

    for (const entry of logs) {
      if (entry.type === "error") {
        console.error("[captured error]", entry.message);
        continue;
      }

      console.warn("[captured unhandledrejection]", entry.message);
    }
  } catch (error) {
    console.error("加载 eruda 调试面板失败", error);
  }
};

export default defineClientConfig({
  setup: () => {
    setupRunningTimeFooter(
      new Date("2025-07-15"),
      {
        "/": "本站已运行 :day 天 :hour 小时 :minute 分钟 :second 秒",
      },
      true,
    );

    setupTransparentNavbar({ type: "homepage" });

    if (typeof window !== "undefined" && shouldEnableMobileDebug()) {
      const logs = createDebugBuffer();
      void enableMobileDebug(logs);
    }
  },
});
