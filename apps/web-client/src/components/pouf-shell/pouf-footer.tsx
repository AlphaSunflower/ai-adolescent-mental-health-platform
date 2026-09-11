"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Clock, FileText } from "lucide-react";
import { useFeedbackDialog } from "@/components/feedback/feedback-dialog";

function QrTile({ name, src }: { name: string; src: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        title={`${name}二维码（点击查看原图）`}
        className="block h-24 w-24 overflow-hidden rounded-[12px] bg-white/90 transition-transform duration-300 hover:scale-105"
      >
        <img src={src} alt={`${name}二维码`} className="h-full w-full object-contain p-1" />
      </a>
      <span className="text-xs font-bold text-muted">{name}</span>
    </div>
  );
}

export function PoufFooter() {
  const { open: openFeedback } = useFeedbackDialog();
  return (
    <footer className="relative z-10 mt-[120px] border-t border-ink/10">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
          {/* Contact */}
          <div>
            <h4 className="mb-4 text-base font-black text-ink">联系我们</h4>
            <ul className="space-y-3 text-sm font-bold text-muted">
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-purple" />
                客服邮箱：support@aiyouthmental.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-purple" />
                客服热线：400-1234-5678
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-purple" />
                服务时间：周一至周日 9:00-21:00
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-purple" />
                公司地址：北京市海淀区心理健康路88号
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-base font-black text-ink">法律声明</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li>
                <Link href="/legal" className="text-muted transition-colors hover:text-ink">
                  隐私保护协议
                </Link>
              </li>
              <li>
                <Link href="/legal?tab=terms" className="text-muted transition-colors hover:text-ink">
                  心愈智联用户服务协议
                </Link>
              </li>
              <li>
                <Link href="/legal?tab=disclaimer" className="text-muted transition-colors hover:text-ink">
                  免责声明
                </Link>
              </li>
              <li>
                <Link href="/legal?tab=minor" className="text-muted transition-colors hover:text-ink">
                  未成年人保护指引
                </Link>
              </li>
              <li>
                <button type="button" onClick={openFeedback} className="cursor-pointer text-muted transition-colors hover:text-ink">
                  意见反馈
                </button>
              </li>
            </ul>
          </div>

          {/* Filing */}
          <div>
            <h4 className="mb-4 text-base font-black text-ink">备案信息</h4>
            <ul className="space-y-3 text-sm font-bold text-muted">
              <li className="flex flex-wrap items-center gap-x-1 gap-y-1">
                <FileText className="size-3 shrink-0 text-purple" />
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-ink"
                >
                  粤ICP备2025440449号
                </a>
              </li>
              <li className="flex items-center gap-1">
                <MapPin className="size-3 shrink-0 text-purple" />
                备案地区：广东省
              </li>
            </ul>
          </div>

          {/* Follow Us — 三码位（公众号 / 小红书 / 抖音） */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="mb-4 text-base font-black text-ink">关注我们</h4>
            <div className="flex flex-wrap gap-4">
              <QrTile name="微信公众号" src="/WeChatOfficialAccount.jpg" />
              <QrTile name="小红书" src="/qrcode-xiaohongshu.png" />
              <QrTile name="抖音" src="/qrcode-douyin.png" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-ink/10 pt-6 text-center text-xs font-bold text-muted">
          <p>© 2025 AI青少年心理健康平台 版权所有 | 青少年心理健康服务专线：12355</p>
          <p className="mt-1">
            本平台所有内容仅供参考，不能替代专业医疗诊断。如遇紧急情况，请拨打 24 小时心理援助热线：400-161-9995
          </p>
        </div>
      </div>
    </footer>
  );
}
