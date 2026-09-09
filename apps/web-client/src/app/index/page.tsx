/**
 * 官网骨架页（M1 占位）。
 * M2 将引入 components/official/ 各板块（Hero、产品介绍、团队、联系方式等），
 * 届时本页改为 Page-as-wrapper 薄包装，业务逻辑全部下沉到组件。
 */
export default function OfficialSitePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center">
      <h1 className="text-4xl font-bold tracking-tight">心愈智联</h1>
    </main>
  );
}
