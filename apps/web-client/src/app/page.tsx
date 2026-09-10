import { redirect } from "next/navigation";

// 根路由保持动态渲染，不做静态预渲染。
// 原因：静态产物会占用 .next 下的 index.html 文件名，与 /index（app/index/page.tsx，
// 官网）的产物 index/index.html 撞名，导致生产环境（next start / standalone）把 /index
// 解析成根页这条 307，官网整站不可达。动态渲染不落 index.html，即可腾出该文件名。
export const dynamic = "force-dynamic";

export default function RootPage() {
  redirect("/home");
}
