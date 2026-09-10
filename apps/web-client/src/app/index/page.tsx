import OfficialNavbar from "@/components/official/official-navbar";
import HeroSection from "@/components/official/hero-section";
import ServicePath from "@/components/official/service-path";
import FeaturesSection from "@/components/official/features-section";
import OfficialFooter from "@/components/official/official-footer";
import "@/components/official/official.css";

/**
 * 官网 /index（M2.6 定稿：方案 B「浅色柔和」）：板块组件全部下沉到 components/official/，本页仅负责组装。
 * 板块顺序：导航栏 → Hero（双按钮 + 统计行）→ 功能介绍 → 团队文化 → 页脚（含三二维码与 APP 下载锚点）。
 * 微信公众号独立板块已按决策并入页脚三码位。
 */
export default function OfficialSitePage() {
  return (
    <div className="official-page relative min-h-dvh bg-[#FBFAFF] text-[#4A4266]">
      <OfficialNavbar />
      <main>
        <HeroSection />
        <ServicePath />
        <FeaturesSection />
      </main>
      <OfficialFooter />
    </div>
  );
}
