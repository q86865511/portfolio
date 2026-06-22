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
#                  預設:main → YOUR_DOMAIN;其他 → <app_name>.YOUR_DOMAIN
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
DOMAIN="${DOMAIN:-YOUR_DOMAIN}"

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

# 健康檢查路徑(對應 Caddyfile 的 `respond /healthz 200`)。
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
# 帶上 Host 標頭,讓 Caddy 命中對應 vhost;-f 讓 HTTP >=400 視為失敗並回非零。
echo "==> 健康檢查..."
HTTP_CODE="$(curl -fsS -o /dev/null -w '%{http_code}' \
	-H "Host: ${HEALTH_HOST}" \
	"http://${ORIGIN}${HEALTH_PATH}")" || {
	echo "健康檢查失敗:無法取得 200(Host=${HEALTH_HOST})" >&2
	exit 1
}

echo "==> 健康檢查通過(HTTP ${HTTP_CODE})"
echo "==> 部署完成:${APP_NAME} → ${DEST_DIR}"
