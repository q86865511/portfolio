#!/usr/bin/env bash
# ============================================================================
# deploy-static.sh — 把某個 app 的靜態輸出同步到 Caddy 服務目錄並做健康檢查
# ----------------------------------------------------------------------------
# 角色:跑在「self-hosted ARM runner」上(runner 與 Caddy 在同一台 Oracle A1)。
#       CI build 完某個 app 後,呼叫本腳本把 out/ 同步到 /srv/<site>/,
#       並 curl 本機確認服務正常;失敗則以非零退出,讓 CI 標記失敗。
#
# 為什麼 rsync --delete:
#       讓目標目錄「完全等於」來源,刪掉上版殘留的舊檔(避免改名 / 刪頁後仍可被訪問)。
#
# 用法:
#   ./deploy-static.sh <app_name> [src_dir] [dest_dir] [health_host]
#
#   <app_name>     必填。網站代號,例如 main / soulshard / cyclepact。
#                  也用來組出預設來源 / 目標 / 健康檢查 Host。
#   [src_dir]      選填。靜態輸出目錄,預設 apps/<app_name>/out
#   [dest_dir]     選填。Caddy 服務目錄,預設 /srv/<app_name>
#   [health_host]  選填。健康檢查時帶的 Host 標頭(對應 Caddyfile 的 vhost)。
#                  預設:main → terrychou.com;其他 → <app_name>.terrychou.com
#                  ⚠️ 使用者稍後以實際網域替換下方 DOMAIN 變數。
#
# 範例:
#   ./deploy-static.sh main
#   ./deploy-static.sh soulshard apps/soulshard/out /srv/soulshard
# ============================================================================

set -euo pipefail

# --- 參數與預設值 ----------------------------------------------------------

# 至少要給 app 名稱。
if [[ $# -lt 1 ]]; then
	echo "用法: $0 <app_name> [src_dir] [dest_dir] [health_host]" >&2
	exit 2
fi

APP_NAME="$1"

# ⚠️ 佔位符:使用者稍後以實際網域替換(也可改成由環境變數 DOMAIN 傳入)。
DOMAIN="${DOMAIN:-terrychou.com}"

# 來源目錄:預設指向 monorepo 內該 app 的 out/。
SRC_DIR="${2:-apps/${APP_NAME}/out}"

# 目標目錄:Caddy 的 root 指向 /srv/<site>。
DEST_DIR="${3:-/srv/${APP_NAME}}"

# 健康檢查的 Host:main 用裸網域,其餘用子網域。
if [[ "$APP_NAME" == "main" ]]; then
	DEFAULT_HEALTH_HOST="$DOMAIN"
else
	DEFAULT_HEALTH_HOST="${APP_NAME}.${DOMAIN}"
fi
HEALTH_HOST="${4:-$DEFAULT_HEALTH_HOST}"

# Caddy 在本機監聽的位址(對應 Caddyfile 的 bind 127.0.0.1 :8080)。
ORIGIN="127.0.0.1:8080"

# 健康檢查路徑(對應 Caddyfile 主站 vhost 的獨立 `handle /healthz`)。
HEALTH_PATH="/healthz"

echo "==> 部署 app='${APP_NAME}'"
echo "    來源:     ${SRC_DIR}"
echo "    目標:     ${DEST_DIR}"
echo "    健康檢查: http://${ORIGIN}${HEALTH_PATH}  (Host: ${HEALTH_HOST})"

# --- 前置檢查 --------------------------------------------------------------

# 來源必須存在且非空,避免把空目錄 rsync --delete 上去把線上清空。
if [[ ! -d "$SRC_DIR" ]]; then
	echo "錯誤:來源目錄不存在:${SRC_DIR}" >&2
	exit 1
fi
if [[ -z "$(ls -A "$SRC_DIR" 2>/dev/null)" ]]; then
	echo "錯誤:來源目錄是空的,拒絕部署(避免清空線上):${SRC_DIR}" >&2
	exit 1
fi

# 確保目標目錄存在(首次部署時)。runner 需有寫入 /srv 的權限(見 README 權限說明)。
mkdir -p "$DEST_DIR"

# --- 同步 ------------------------------------------------------------------
# -a 保留權限/時間;--delete 讓目標等於來源;尾端斜線代表「同步目錄內容」。
echo "==> rsync 同步中..."
rsync -a --delete "${SRC_DIR}/" "${DEST_DIR}/"

# --- 健康檢查 --------------------------------------------------------------
# 為什麼不只打 /healthz:那只證明「Caddy 還活著」。rsync 若只同步到一半
# (index.html 在、_next/ chunks 缺),/healthz 與 / 照樣 200,線上卻是白畫面。
# 因此改成三段:① Caddy 存活 ② 首頁可取得 ③ 抽查剛同步過去的實體資產。
echo "==> 健康檢查..."

# 帶上 Host 標頭讓 Caddy 命中對應 vhost;逐項比對狀態碼,不符即以非零退出。
check_path() {
	local path="$1" expect="$2" desc="$3" code
	code="$(curl -sS -o /dev/null -w '%{http_code}' \
		-H "Host: ${HEALTH_HOST}" \
		"http://${ORIGIN}${path}" 2>/dev/null)" || code="000"
	if [[ "$code" != "$expect" ]]; then
		echo "健康檢查失敗:${desc} ${path} 預期 ${expect},實得 ${code}(Host=${HEALTH_HOST})" >&2
		exit 1
	fi
	echo "    OK  ${desc}:${path} → ${code}"
}

# ① Caddy 存活。
check_path "$HEALTH_PATH" 200 "存活"

# ② 首頁可取得。
check_path "/" 200 "首頁"

# ③ 資產抽查:清單取自「來源」而非目標——要驗的正是「來源有、線上卻取不到」。
#    從目標挑的話,少同步的檔案本來就不會被挑到,等於自己驗自己。
ASSET_REL="$(cd "$SRC_DIR" && find . -type f \( -name '*.js' -o -name '*.css' \) \
	2>/dev/null | head -n 1 | sed 's|^\.||' || true)"
if [[ -n "$ASSET_REL" ]]; then
	check_path "$ASSET_REL" 200 "資產"
else
	echo "    (略過資產抽查:${SRC_DIR} 下找不到 .js/.css)"
fi

# ④ 靜態匯出站(out/ 內有 404.html)另驗該檔真的上去了——它是自訂 404 頁的來源,
#    缺了會讓 Caddy 的 handle_errors 退回預設錯誤頁。SPA 子站沒這個檔,自動略過。
if [[ -f "${SRC_DIR}/404.html" ]]; then
	check_path "/404.html" 200 "404 頁"
fi

echo "==> 健康檢查通過"
echo "==> 部署完成:${APP_NAME} → ${DEST_DIR}"
