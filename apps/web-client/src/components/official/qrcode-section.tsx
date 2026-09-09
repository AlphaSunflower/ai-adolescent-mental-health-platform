// 微信公众号二维码展示区：图片为 public/WeChatOfficialAccount.jpg，公众号名来自《官网需呈现内容》第八节。
export default function QrcodeSection() {
  return (
    <section id="qrcode" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <div className="text-center">
        <h2 className="text-3xl font-black text-[var(--ink)] md:text-4xl">微信公众号</h2>
        <div className="official-gradient-text mx-auto mt-4 h-1 w-16 rounded-full" />
      </div>

      <div className="official-glass official-float-slow mx-auto mt-12 w-fit rounded-[32px] p-6 md:p-8">
        <img
          src="/WeChatOfficialAccount.jpg"
          alt="微信公众号：心愈智联"
          className="h-56 w-56 rounded-[20px] object-contain md:h-64 md:w-64"
        />
        <p className="mt-5 text-center text-lg font-bold text-[var(--ink)]">
          微信公众号：心愈智联
        </p>
      </div>
    </section>
  );
}
