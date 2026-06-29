import { defineConfig } from "@playwright/test";

// 最小 smoke / e2e:對「已 build 的靜態匯出產物(out/)」起一個本機靜態伺服器後驗證。
// 角色:在合併前確認「首頁載得起來、有專案連結、行動版不破版」這類最基本的可用性,
// 補足 CI 既有的 typecheck/lint/build(那些只保證「build 得起來」,不保證「畫面正常」)。
const PORT = 4321;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL, trace: "on-first-retry" },
  // 直接服務 build 後的 out/(靜態匯出),最貼近正式部署的產物。
  webServer: {
    command: `pnpm exec serve out -l ${PORT} --no-clipboard`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
