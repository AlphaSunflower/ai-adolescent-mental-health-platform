// 联系方式逐字来自《官网需呈现内容》第八节「联系我们」（存档注释不入文案）。
const CONTACTS = [
  { label: "电话", value: "157766972859" },
  { label: "邮箱", value: "157766972859@163.com" },
  { label: "微信公众号", value: "心愈智联" },
  { label: "小红书", value: "63671619707" },
  { label: "抖音", value: "92020319334" },
];

// 页脚导航：栏目名为任务指定，目标页面未建，链接暂用 # 占位。
const FOOTER_NAV = [
  "关于我们",
  "合作服务",
  "咨询师入驻服务",
  "免责声明",
  "平台合规声明",
];

function QrTile({
  name,
  src,
  placeholder,
}: {
  name: string;
  src?: string;
  placeholder?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        className={`h-24 w-24 overflow-hidden rounded-[12px] ${
          placeholder
            ? "official-qr-placeholder border border-dashed border-[rgba(240,233,255,0.35)]"
            : ""
        } bg-white/90`}
      >
        {src && <img src={src} alt={`${name}二维码`} className="h-full w-full object-contain p-1" />}
      </div>
      <span className="text-xs text-[var(--bg)]/70">{name}</span>
    </div>
  );
}

export default function OfficialFooter() {
  return (
    <footer className="mt-28 bg-[var(--ink)] text-[var(--bg)]">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-[1.1fr_1fr_auto]">
        <div>
          <div className="flex items-center gap-2">
            <img src="/xinyuzhilian.svg" alt="心愈智联 Logo" className="h-9 w-9" />
            <span className="official-brand-font text-2xl font-bold">心愈智联</span>
          </div>
          <p className="mt-4 text-sm text-[var(--bg)]/70">
            心愈智联 — 青少年心理健康 AI 平台
          </p>
        </div>

        <div className="flex flex-col gap-10 md:flex-row md:gap-16">
          <div>
            <h3 className="text-sm font-bold">联系我们</h3>
            <ul className="mt-5 space-y-3 text-sm text-[var(--bg)]/75">
              {CONTACTS.map((contact) => (
                <li key={contact.label}>
                  {contact.label}：{contact.value}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold">导航</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {FOOTER_NAV.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-[var(--bg)]/75 transition-colors hover:text-white"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hero「APP 下载」按钮的滚动落点 */}
        <div id="app-download" className="scroll-mt-24">
          <div className="flex gap-4">
            <QrTile name="微信公众号" src="/WeChatOfficialAccount.jpg" />
            <QrTile name="小红书" placeholder />
            <QrTile name="抖音" placeholder />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-5xl px-6 py-5 text-center text-xs text-[var(--bg)]/60">
          心愈智联 — 青少年心理健康 AI 平台
        </p>
      </div>
    </footer>
  );
}
