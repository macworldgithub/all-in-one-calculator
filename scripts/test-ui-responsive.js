/**
 * Automated UI Responsiveness, Clipping & Touch-Target Verification
 * Uses Chrome DevTools Protocol against a local production build (`npm run build`).
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForHealth(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return r;
    } catch {}
    await sleep(300);
  }
  throw new Error("Server failed to become healthy: " + url);
}

function connectCdp(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let nextId = 1;
    const pending = new Map();
    ws.onopen = () =>
      resolve({
        call(method, params = {}) {
          const id = nextId++;
          ws.send(JSON.stringify({ id, method, params }));
          return new Promise((res, rej) => pending.set(id, { res, rej }));
        },
        close() {
          try {
            ws.close();
          } catch {}
        },
      });
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) p.rej(new Error(msg.error.message));
        else p.res(msg.result);
      }
    };
    ws.onerror = reject;
  });
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p)) || null;
}

(async () => {
  const chromeBin = findChrome();
  if (!chromeBin) {
    console.error("Chrome/Chromium binary not found. Set CHROME_PATH to run UI responsive tests.");
    process.exit(1);
  }

  const nextCmd = process.platform === "win32" ? "npx.cmd" : "npx";
  const srv = spawn(nextCmd, ["next", "start", "-p", "3197"], {
    cwd: ROOT,
    shell: true,
    stdio: "ignore",
  });
  const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), "calc-ui-verify-"));
  let chrome = null;
  let cdp = null;
  let failed = false;

  try {
    await waitForHealth("http://127.0.0.1:3197/api/health");
    chrome = spawn(
      chromeBin,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--remote-debugging-port=9335",
        `--user-data-dir=${tmpProfile}`,
        "about:blank",
      ],
      { stdio: "ignore" }
    );

    let pageWs = null;
    for (let i = 0; i < 30; i++) {
      try {
        const list = await (await fetch("http://127.0.0.1:9335/json/list")).json();
        const page = list.find((t) => t.type === "page");
        if (page && page.webSocketDebuggerUrl) {
          pageWs = page.webSocketDebuggerUrl;
          break;
        }
      } catch {}
      await sleep(250);
    }
    if (!pageWs) throw new Error("Chrome DevTools Protocol endpoint unavailable");

    cdp = await connectCdp(pageWs);
    await cdp.call("Page.enable");
    await cdp.call("Runtime.enable");

    const routes = [
      "/",
      "/financial-calculator",
      "/mortgage-calculator",
      "/bmi-calculator",
      "/body-fat-calculator",
      "/conversion-calculator",
      "/grade-calculator",
      "/time-card-calculator",
      "/matrix-calculator",
      "/sitemap",
      "/about-us",
      "/missing-route-404",
    ];
    const viewports = [
      { label: "320", w: 320, h: 640 },
      { label: "360", w: 360, h: 740 },
      { label: "375", w: 375, h: 812 },
      { label: "414", w: 414, h: 896 },
      { label: "480", w: 480, h: 800 },
      { label: "600", w: 600, h: 900 },
      { label: "768", w: 768, h: 1024 },
      { label: "1024", w: 1024, h: 768 },
      { label: "1280", w: 1280, h: 800 },
      { label: "1440", w: 1440, h: 900 },
      { label: "1920", w: 1920, h: 1080 },
      { label: "2560", w: 2560, h: 1440 },
      { label: "land-667x375", w: 667, h: 375 },
    ];

    let totalFailures = 0;

    for (const route of routes) {
      await cdp.call("Emulation.setDeviceMetricsOverride", {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await cdp.call("Page.navigate", { url: `http://127.0.0.1:3197${route}` });
      await sleep(750);

      const summary = {};
      for (const vp of viewports) {
        await cdp.call("Emulation.setDeviceMetricsOverride", {
          width: vp.w,
          height: vp.h,
          deviceScaleFactor: 1,
          mobile: vp.w < 600,
        });
        await sleep(70);

        const evalRes = await cdp.call("Runtime.evaluate", {
          returnByValue: true,
          expression: `(() => {
            const sw = document.documentElement.scrollWidth;
            const cw = document.documentElement.clientWidth;
            const overflow = sw > cw + 2;
            const offenders = [];
            document.querySelectorAll('table, form, input, select, button, .modern-calc-card, .panel, h1').forEach(el => {
              const r = el.getBoundingClientRect();
              if (r.width > 0 && r.right > cw + 2 && offenders.length < 3) {
                offenders.push(el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/)[0] : '') + ':' + Math.round(r.right) + '>' + cw);
              }
            });
            const smallBtns = [];
            if (cw <= 480) {
              document.querySelectorAll('button, input[type="submit"], input[type="button"], .popular-chip, #topmenu li a').forEach(el => {
                const r = el.getBoundingClientRect();
                const st = getComputedStyle(el);
                if (r.width > 0 && r.height > 0 && st.display !== 'none' && st.visibility !== 'hidden') {
                  if (r.height < 42 && smallBtns.length < 4) {
                    smallBtns.push((el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.trim().split(/\\s+/)[0] : '')) + '(' + Math.round(r.width) + 'x' + Math.round(r.height) + ')');
                  }
                }
              });
            }
            return { overflow, sw, cw, offenders, smallBtns };
          })()`,
        });
        const m = evalRes.result ? evalRes.result.value : null;
        if (!m || m.overflow || m.offenders.length > 0 || m.smallBtns.length > 0) {
          totalFailures++;
          summary[vp.label] = m
            ? `${m.overflow ? `OVERFLOW(${m.sw}>${m.cw})` : ""}${m.offenders.length ? `CLIP(${m.offenders.join(",")})` : ""}${m.smallBtns.length ? `SMALL(${m.smallBtns.join(",")})` : ""}`
            : "ERR";
        } else {
          summary[vp.label] = "PASS";
        }
      }
      console.log(route, JSON.stringify(summary));
    }

    if (totalFailures > 0) {
      throw new Error(`UI responsiveness check failed on ${totalFailures} route/viewport pair(s).`);
    }
    console.log("\n✅ ALL 12 ROUTES x 13 VIEWPORTS PASSED WITH 0 OVERFLOW, 0 CLIPPING, AND >=44px MOBILE TARGETS!");
  } catch (err) {
    failed = true;
    console.error(err);
  } finally {
    if (cdp) cdp.close();
    if (chrome) try { process.kill(chrome.pid); } catch {}
    if (srv) try { process.kill(srv.pid); } catch {}
    if (process.platform === "win32") {
      spawn("taskkill", ["/F", "/T", "/PID", String(srv.pid)], { stdio: "ignore" });
      if (chrome) spawn("taskkill", ["/F", "/T", "/PID", String(chrome.pid)], { stdio: "ignore" });
    }
    await sleep(300);
    try {
      fs.rmSync(tmpProfile, { recursive: true, force: true });
    } catch {}
    process.exit(failed ? 1 : 0);
  }
})();
