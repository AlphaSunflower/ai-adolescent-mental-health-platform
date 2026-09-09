// 微信公众号二维码展示区：图片为 public/WeChatOfficialAccount.jpg，公众号名来自《官网需呈现内容》第八节。
export default function QrcodeSection() {
  return (
    <section id="qrcode" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-28">
      <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)] md:text-3xl">
        微信公众号
      </h2>
      <div className="mt-4 h-px w-12 bg-[rgba(58,46,92,0.2)]" />

      <div className="mt-16 flex justify-center">
        <div className="rounded-[20px] border border-[rgba(58,46,92,0.08)] bg-white/85 p-6">
          <img
            src="/WeChatOfficialAccount.jpg"
            alt="微信公众号：心愈智联"
            className="h-56 w-56 rounded-[12px] object-contain"
          />
          <p className="mt-5 text-center text-sm font-bold text-[var(--ink)]">
            微信公众号：心愈智联
          </p>
        </div>
      </div>
    </section>
  );
}
