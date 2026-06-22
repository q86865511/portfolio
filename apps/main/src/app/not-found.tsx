import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        textAlign: "center",
        padding: 24,
      }}
    >
      <p className="mono" style={{ color: "var(--color-brand)", fontSize: 14 }}>
        404
      </p>
      <h1 style={{ fontSize: 28 }}>找不到頁面 / Page not found</h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        這個連結可能已失效。
      </p>
      <Link
        href="/"
        style={{
          color: "var(--color-brand)",
          textDecoration: "underline",
          marginTop: 8,
        }}
      >
        ← 回首頁 / Back home
      </Link>
    </div>
  );
}
