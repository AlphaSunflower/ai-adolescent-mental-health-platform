"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Clock, FileText } from "lucide-react";
import { useFeedbackDialog } from "@/components/feedback/feedback-dialog";

export function PoufFooter() {
  const { open: openFeedback } = useFeedbackDialog();
  return (
    <footer className="relative z-10 mt-[120px] border-t border-ink/10">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                  用户服务协议
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

          {/* QR Codes */}
          <div className="text-center lg:text-left">
            <h4 className="mb-4 text-base font-black text-ink">关注我们</h4>
            <div className="flex justify-center gap-6 lg:justify-start">
              <div className="text-center">
                <div className="mx-auto mb-2 flex size-[100px] items-center justify-center rounded-control bg-surface/70 text-xs font-bold text-muted cushion-field">
                  小程序码
                </div>
                <span className="text-xs font-bold text-muted">微信小程序</span>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex size-[100px] items-center justify-center rounded-control bg-surface/70 text-xs font-bold text-muted cushion-field">
                  公众号码
                </div>
                <span className="text-xs font-bold text-muted">微信公众号</span>
              </div>
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
