import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("詳情頁的導覽、頁尾與品牌連結能回到首頁區塊", async ({ page }) => {
  const targets = [
    ["專案", "projects"],
    ["關於", "about"],
    ["技能", "skills"],
    ["聯絡", "contact"],
  ] as const;
  for (const [label, id] of targets) {
    await page.goto("/projects/ai-deployment-pipeline/");
    await page
      .getByRole("navigation", { name: "主導覽", exact: true })
      .getByRole("link", { name: label, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  await page.goto("/projects/ai-deployment-pipeline/");
  const footer = page.getByRole("navigation", {
    name: "頁尾導覽",
    exact: true,
  });
  for (const [label, id] of targets.slice(0, 3)) {
    await expect(
      footer.getByRole("link", { name: label, exact: true }),
    ).toHaveAttribute("href", `/#${id}`);
  }
  await page.getByRole("link", { name: "周暐倫 · Terry", exact: true }).click();
  await expect(page).toHaveURL(/\/#main$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "周暐倫 Terry",
  );
});

test("詳情頁依語言提供履歷下載及易讀專案名稱", async ({ page }) => {
  await page.goto("/projects/smart-pedestrian-navigation/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "智慧導航系統",
  );
  await expect(
    page.getByRole("link", { name: "下載履歷", exact: true }),
  ).toHaveAttribute("href", "/resume-zh.pdf");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Smart Navigation System",
  );
  await expect(
    page.getByRole("link", { name: "Download résumé", exact: true }),
  ).toHaveAttribute("href", "/resume-en.pdf");
  await expect(page).not.toHaveTitle(/Traffic.Light/);
});

test("手機詳情頁可下載履歷並透過選單回到首頁", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/projects/erp-system/");
  await expect(
    page.getByRole("link", { name: "下載 PDF 履歷", exact: true }),
  ).toHaveAttribute("href", "/resume-zh.pdf");
  await page.getByRole("button", { name: "開啟選單", exact: true }).click();
  await page
    .getByRole("navigation", { name: "行動版導覽", exact: true })
    .getByRole("link", { name: "技能", exact: true })
    .click();
  await expect(page).toHaveURL(/\/#skills$/);
  await expect(page.locator("#skills")).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "開啟選單", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
});

test("首頁先展示代表作與線上體驗，保留其他作品入口", async ({ page }) => {
  await page.goto("/");
  const sectionIds = await page
    .locator("main > section[id]")
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(sectionIds).toEqual([
    "projects",
    "live-demos",
    "about",
    "skills",
    "more-projects",
  ]);
  await expect(page.locator("#projects article")).toHaveCount(2);
  await expect(page.locator("#live-demos article")).toHaveCount(4);
  await expect(
    page.getByText("展示專案", { exact: true }).first(),
  ).toBeAttached();
  await expect(page.getByText("公開專案", { exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "瀏覽其他作品 ↓", exact: true }).click();
  await expect(page.locator("#more-projects")).toBeInViewport();
});

test("作品卡片呈現易讀標題、代表技術與精簡摘要", async ({ page }) => {
  await page.goto("/");
  const featured = page.locator("#projects article").filter({
    has: page.getByRole("heading", {
      name: "AI 模型部署與監控平台",
      exact: true,
    }),
  });
  await expect(featured).toHaveCount(1);
  await expect(featured.getByText("TensorRT", { exact: true })).toBeVisible();
  await expect(featured.getByText("Triton", { exact: true })).toBeVisible();
  await expect(
    featured.getByText("AI-Deployment-Pipeline", { exact: true }),
  ).toBeVisible();
  await expect(featured.getByText(/自動化模型轉換、效能評測/)).toBeVisible();
  await expect(
    page
      .locator("#projects")
      .getByRole("heading", { name: "智慧導航系統", exact: true }),
  ).toBeVisible();
  const privateProject = page.locator("#more-projects article").filter({
    has: page.getByRole("heading", { name: "輪迴盟約 Cyclepact", exact: true }),
  });
  await expect(
    privateProject.getByRole("link", { name: "GitHub", exact: true }),
  ).toHaveCount(0);
  await expect(
    privateProject.getByText("進行中", { exact: true }),
  ).toBeAttached();
  const detail = await page.request.get("/projects/ai-deployment-pipeline/");
  expect(detail.ok()).toBeTruthy();
  expect(await detail.text()).toContain("多批次多精度效能評測");
});

test("重排後首頁在手機、平板及桌面皆無水平溢出", async ({ page }) => {
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${width}px 的中文版不應水平溢出`).toBeLessThanOrEqual(2);
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Featured work", exact: true }),
    ).toBeVisible();
    const englishOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(
      englishOverflow,
      `${width}px 的英文版不應水平溢出`,
    ).toBeLessThanOrEqual(2);
    await page.getByRole("button", { name: "繁", exact: true }).click();
  }
});
