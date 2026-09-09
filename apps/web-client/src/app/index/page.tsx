import OfficialNavbar from "@/components/official/official-navbar";
import HeroSection from "@/components/official/hero-section";
import FeaturesSection from "@/components/official/features-section";
import CultureSection from "@/components/official/culture-section";
import QrcodeSection from "@/components/official/qrcode-section";
import OfficialFooter from "@/components/official/official-footer";
import "@/components/official/official.css";

/**
 * 官网 /index（M2.5 视觉重构）：板块组件全部下沉到 components/official/，本页仅负责组装。
 * 板块顺序：导航栏 → Hero（双按钮）→ 功能介绍 → 团队文化 → 微信公众号 → 页脚（含三二维码）。
 */
export default function OfficialSitePage() {
  return (
    <div className="relative min-h-dvh text-[var(--ink)]">
      <OfficialNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CultureSection />
        <QrcodeSection />
      </main>
      <OfficialFooter />
    </div>
  );
}
