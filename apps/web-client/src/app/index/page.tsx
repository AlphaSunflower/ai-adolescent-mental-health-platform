import OfficialNavbar from "@/components/official/official-navbar";
import "@/components/official/official.css";

/**
 * 官网 /index（M2）：板块组件全部下沉到 components/official/，本页仅负责组装。
 * 板块顺序：导航栏 → Hero → 功能介绍 → 团队文化 → APP 下载 → 微信公众号 → 页脚。
 */
export default function OfficialSitePage() {
  return (
    <div className="relative min-h-dvh text-[var(--ink)]">
      <OfficialNavbar />
      <main>
        {/* M2 增量组装中：hero / features / culture / download / qrcode / footer 逐个接入 */}
      </main>
    </div>
  );
}
