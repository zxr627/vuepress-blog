import { defineClientConfig } from "vuepress/client";
import { setupRunningTimeFooter } from "vuepress-theme-hope/presets/footerRunningTime.js";
import { setupTransparentNavbar } from "vuepress-theme-hope/presets/transparentNavbar.js";
import "vuepress-theme-hope/presets/round-blogger-avatar.scss";
import "vuepress-theme-hope/presets/shinning-feature-panel.scss";
import "vuepress-theme-hope/presets/bounce-icon.scss";
import "lxgw-wenkai-screen-webfont/style.css";

const DEBUG_QUERY_KEY = "debug";
const DEBUG_STORAGE_KEY = "zxr-mobile-debug";
const PANEL_QUERY_KEY = "debugPanel";
const PANEL_STORAGE_KEY = "zxr-mobile-debug-panel";
const REPORT_QUERY_KEY = "reportUrl";
const REPORT_STORAGE_KEY = "zxr-debug-report-url";
const DEBUG_REPLAY_LIMIT = 30;

type DebugLogType =
  | "info"
  | "error"
  | "unhandledrejection"
  | "route"
  | "interaction";

type DebugLog = {
  type: DebugLogType;
  message: string;
};

type DebugReport = {
  className?: string;
  href: string;
  message: string;
  reportUrl?: string | null;
  tagName?: string;
  targetHref?: string | null;
  targetText?: string;
  timestamp: string;
  type: DebugLogType;
  userAgent: string;
};

type DebugPanel = "default" | "system" | "network" | "element" | "storage";

declare global {
  interface Window {
    __zxrDebugListenersBound?: boolean;
    __zxrVConsoleLoaded?: boolean;
    __zxrVConsoleInstance?: {
      destroy?: () => void;
      show?: () => void;
      showSwitch?: () => void;
      showPlugin?: (name: DebugPanel) => void;
    };
  }
}

const env = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env;

const normalizeHttpUrl = (value: string | null | undefined): string | null => {
  if (!value || value === "0") return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};

const resolveDebugFlag = (): boolean => {
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

const resolveReportUrl = (): string | null => {
  const url = new URL(window.location.href);
  const queryValue = url.searchParams.get(REPORT_QUERY_KEY);

  if (queryValue !== null) {
    const normalized = normalizeHttpUrl(queryValue);

    if (normalized) {
      window.localStorage.setItem(REPORT_STORAGE_KEY, normalized);
      return normalized;
    }

    window.localStorage.removeItem(REPORT_STORAGE_KEY);
    return null;
  }

  return (
    normalizeHttpUrl(window.localStorage.getItem(REPORT_STORAGE_KEY)) ||
    normalizeHttpUrl(env?.VITE_DEBUG_REPORT_URL)
  );
};

const resolveDebugPanel = (): DebugPanel => {
  const url = new URL(window.location.href);
  const panel = (url.searchParams.get(PANEL_QUERY_KEY) || "").toLowerCase();

  const panelMap: Record<string, DebugPanel> = {
    log: "default",
    default: "default",
    system: "system",
    network: "network",
    element: "element",
    elements: "element",
    storage: "storage",
  };

  const queryPanel = panelMap[panel];

  if (queryPanel) {
    window.localStorage.setItem(PANEL_STORAGE_KEY, queryPanel);
    return queryPanel;
  }

  const storedPanel = window.localStorage.getItem(PANEL_STORAGE_KEY);
  return panelMap[storedPanel || ""] || "default";
};

const sendDebugReport = (reportUrl: string | null, payload: DebugReport): void => {
  if (!reportUrl) return;

  const body = JSON.stringify(payload);

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(reportUrl, blob)) return;
    }
  } catch {
    // Ignore and fallback to fetch below.
  }

  void fetch(reportUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
    mode: "cors",
  }).catch(() => {
    // Ignore reporting failures in the client.
  });
};

const createDebugBuffer = (reportUrl: string | null): DebugLog[] => {
  const logs: DebugLog[] = [];

  const push = (
    type: DebugLogType,
    message: string,
    extra: Partial<DebugReport> = {},
  ): void => {
    if (logs.length >= DEBUG_REPLAY_LIMIT) logs.shift();

    logs.push({ type, message });

    sendDebugReport(reportUrl, {
      type,
      message,
      href: window.location.href,
      userAgent: window.navigator.userAgent,
      timestamp: new Date().toISOString(),
      reportUrl,
      ...extra,
    });
  };

  if (window.__zxrDebugListenersBound) return logs;
  window.__zxrDebugListenersBound = true;

  window.addEventListener("error", (event) => {
    const location =
      event.filename && event.lineno
        ? ` (${event.filename}:${event.lineno}:${event.colno ?? 0})`
        : "";

    push("error", event.error?.stack || `${event.message}${location}`);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason =
      event.reason instanceof Error
        ? event.reason.stack || event.reason.message
        : String(event.reason);

    push("unhandledrejection", reason);
  });

  window.addEventListener("hashchange", () => {
    push("route", `hashchange -> ${window.location.href}`);
  });

  window.addEventListener("popstate", () => {
    push("route", `popstate -> ${window.location.href}`);
  });

  document.addEventListener(
    "click",
    (event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest("a, button, [role='button']")
          : null;

      if (!target) return;

      const text = (target.textContent || "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 120);
      const href =
        target instanceof HTMLAnchorElement
          ? target.href
          : target.getAttribute("href");

      push(
        "interaction",
        `[click] ${(target.tagName || "").toLowerCase()} ${text || "(empty)"}`,
        {
          className: target.className || undefined,
          tagName: target.tagName,
          targetHref: href,
          targetText: text,
        },
      );
    },
    true,
  );

  return logs;
};

const replayBufferedLogs = (logs: DebugLog[]): void => {
  for (const entry of logs) {
    if (entry.type === "error") {
      console.error("[captured error]", entry.message);
      continue;
    }

    if (entry.type === "unhandledrejection") {
      console.warn("[captured unhandledrejection]", entry.message);
      continue;
    }

    console.info(`[captured ${entry.type}]`, entry.message);
  }
};

const enableMobileDebug = async (
  logs: DebugLog[],
  reportUrl: string | null,
  panel: DebugPanel,
): Promise<void> => {
  if (window.__zxrVConsoleLoaded) {
    window.__zxrVConsoleInstance?.show?.();
    window.__zxrVConsoleInstance?.showSwitch?.();
    window.__zxrVConsoleInstance?.showPlugin?.(panel);
    replayBufferedLogs(logs);
    return;
  }

  try {
    const { default: VConsole } = await import("vconsole");
    const instance = new VConsole({
      defaultPlugins: ["system", "network", "element", "storage"],
      theme: "light",
    });

    instance.showSwitch?.();
    instance.show?.();
    instance.showPlugin?.(panel);

    window.__zxrVConsoleLoaded = true;
    window.__zxrVConsoleInstance = instance;

    console.info("[debug] 手机调试面板已开启，地址加 ?debug=0 可关闭。");
    console.info("[debug] 当前页面：", window.location.href);
    console.info("[debug] User-Agent：", window.navigator.userAgent);

    if (reportUrl) {
      console.info("[debug] 远程上报已开启：", reportUrl);
    } else {
      console.info(
        "[debug] 当前未配置远程上报，如需启用可在地址后加 ?reportUrl=https://你的接收地址",
      );
    }

    console.info("[debug] 当前调试面板：", panel);

    replayBufferedLogs(logs);
  } catch (error) {
    console.error("加载 vConsole 调试面板失败", error);
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

    if (typeof window === "undefined") return;

    if (!resolveDebugFlag()) {
      if (window.__zxrVConsoleLoaded) {
        window.__zxrVConsoleInstance?.destroy?.();
        window.__zxrVConsoleInstance = undefined;
        window.__zxrVConsoleLoaded = false;
      }

      return;
    }

    const reportUrl = resolveReportUrl();
    const panel = resolveDebugPanel();
    const logs = createDebugBuffer(reportUrl);
    void enableMobileDebug(logs, reportUrl, panel);
  },
});
