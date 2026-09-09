import Link from "next/link";

// 联系方式逐字来自《官网需呈现内容》第八节「联系我们」（存档注释不入文案）。
const CONTACTS = [
  { label: "电话", value: "157766972859" },
  { label: "邮箱", value: "157766972859@163.com" },
  { label: "微信公众号", value: "心愈智联" },
  { label: "小红书", value: "63671619707" },
  { label: "抖音", value: "92020319334" },
];

const NAV_LINKS = [
  { label: "首页", href: "#hero" },
  { label: "功能介绍", href: "#features" },
  { label: "团队文化", href: "#culture" },
  { label: "APP 下载", href: "#download" },
  { label: "微信公众号", href: "#qrcode" },
] as const;

export default function OfficialFooter() {
  return (
    <footer className="relative mt-24 bg-[var(--ink)] text-[var(--bg)]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-[1.2fr_1fr_0.8fr_auto]">
        <div>
          <div className="flex items-center gap-2">
            <img src="/xinyuzhilian.svg" alt="心愈智联 Logo" className="h-9 w-9" />
            <span className="official-brand-font text-2xl font-bold">心愈智联</span>
          </div>
          <p className="mt-4 text-sm text-[var(--bg)]/70">心愈智联 — 青少年心理健康 AI 平台</p>
          <Link
            href="/home"
            className="mt-6 inline-block rounded-full bg-[var(--purple)] px-6 py-2.5 text-sm font-bold text-[var(--on-accent)] transition-transform hover:scale-105"
          >
            进入平台
          </Link>
        </div>

        <div>
          <h3 className="font-black">联系我们</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {CONTACTS.map((contact) => (
              <li key={contact.label} className="text-[var(--bg)]/80">
                {contact.label}：{contact.value}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-black">导航</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-[var(--bg)]/80 transition-colors hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="justify-self-start md:justify-self-end">
          <img
            src="/WeChatOfficialAccount.jpg"
            alt="微信公众号：心愈智联"
            className="h-36 w-36 rounded-[16px] bg-white/90 object-contain p-1"
          />
          <p className="mt-3 text-center text-xs text-[var(--bg)]/70">微信公众号：心愈智联</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-6 py-5 text-center text-xs text-[var(--bg)]/60">
          心愈智联 — 青少年心理健康 AI 平台
        </p>
      </div>
    </footer>
  );
}
