import { test, expect } from "@playwright/test";

// 最小 smoke:刻意用「與內容解耦」的通用斷言,改版文案/專案不會讓測試脆弱誤紅。
test("首頁可載入且有實質內容", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.ok(), "首頁應回應 2xx").toBeTruthy();
  await expect(page).toHaveTitle(/.+/); // 標題非空
  const bodyText = (await page.locator("body").innerText()).trim();
  expect(bodyText.length, "首頁應渲染出實質文字(非空白/錯誤頁)").toBeGreaterThan(200);
});

test("首頁有站內專案連結", async ({ page }) => {
  await page.goto("/");
  const projectLinks = page.locator('a[href*="/projects/"]');
  expect(await projectLinks.count(), "首頁應至少有一個 /projects/ 連結").toBeGreaterThan(0);
});

test("行動版 viewport 無明顯水平溢出", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "行動版不應出現明顯水平捲動(破版)").toBeLessThanOrEqual(2);
});
