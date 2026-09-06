"use client";

import { useEffect } from "react";

/**
 * 部署自愈:线上每次发版容器整体换新,旧 HTML 引用的 hashed chunk 会 404,
 * 已打开的老页面在下次路由懒加载时抛 ChunkLoadError 白屏。
 * 检测到 chunk 加载失败即自动刷新一次拿到新 HTML(sessionStorage 计数防死循环)。
 */
export default function ChunkReloadGuard() {
  useEffect(() => {
    const isChunkError = (msg: string) =>
      /Failed to load chunk|ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module/i.test(
        msg,
      );

    let attempted = false;
    const reloadOnce = () => {
      if (attempted) return;
      const key = "chunk-reload-attempts";
      const attempts = Number(sessionStorage.getItem(key) ?? 0) + 1;
      if (attempts > 3) return; // 服务端异常时最多自愈 3 次,避免无限刷新
      attempted = true;
      sessionStorage.setItem(key, String(attempts));
      window.location.reload();
    };

    const onError = (e: ErrorEvent) => {
      if (isChunkError(e.message)) reloadOnce();
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const msg = e.reason instanceof Error ? e.reason.message : String(e.reason);
      if (isChunkError(msg)) reloadOnce();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
