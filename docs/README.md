# 教學文件索引(Cloudflare / CI/CD)

這裡的文件採「邊做邊學」的方式撰寫,每篇都盡量回答四件事:**為什麼這樣做、它在整體架構中的角色、有哪些替代方案、各自的取捨**。目標是讓 Terry 能把這些內容寫進履歷、並向面試官清楚說明設計理由。

## 規劃中的文件(隨各 Phase 完成補上)

| 檔案 | 主題 | 對應 Phase |
|---|---|---|
| `00-architecture-overview.md` | 整體架構與名詞:monorepo、子網域 vs 路徑、邊緣 vs origin | Phase 0 |
| `10-cloudflare-basics.md` | Cloudflare 全貌:DNS、橘雲 proxy、CDN 快取、WAF、TLS | Phase 4 |
| `11-cloudflare-tunnel.md` | Cloudflare Tunnel(cloudflared):零信任、免開埠、ingress 規則 | Phase 4 |
| `12-caddy-origin.md` | Caddy 作為 origin:vhost 分流、static、reverse_proxy、edge/origin TLS | Phase 4 |
| `20-cicd-github-actions.md` | GitHub Actions:workflow、runner(hosted vs self-hosted)、secrets | Phase 5 |
| `21-path-filtered-pipelines.md` | path-filtered workflows:如何讓每個子站獨立 build/deploy | Phase 5 |
| `22-self-hosted-arm-runner.md` | 在 Oracle A1 上註冊 self-hosted ARM runner、零入站部署 | Phase 5 |
| `30-interview-talking-points.md` | 面試講稿:用一頁說清楚整套架構與取捨 | Phase 7 |
