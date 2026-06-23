/**
 * SEO 單一來源:站點正式網址與名稱。
 * layout / sitemap / robots / generateMetadata 全部引用此處,避免硬編散落各檔。
 */
export const SITE_URL = "https://terrychou.com";
export const SITE_NAME = "周暐倫 Terry Chou — 全端 / AI-ML / DevOps 工程師";

/** 將站內相對路徑組成絕對網址(供 OG url / sitemap 使用)。 */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
