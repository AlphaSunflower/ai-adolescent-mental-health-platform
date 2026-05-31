"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Shield, FileText, Stamp, Medal } from "lucide-react";
import { useFeedbackDialog } from "@/components/feedback/feedback-dialog";

export function Footer() {
  const { open: openFeedback } = useFeedbackDialog();
  return (
    <footer className="relative z-10 mt-[150px] border-t border-white/10 bg-transparent text-cosmic-footer">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Contact */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-cosmic-nav-hover">
              联系我们
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-cosmic-blue" />
                客服邮箱：support@aiyouthmental.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-cosmic-blue" />
                客服热线：400-1234-5678
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-cosmic-blue" />
                服务时间：周一至周日 9:00-21:00
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-cosmic-blue" />
                公司地址：北京市海淀区心理健康路88号
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-cosmic-nav-hover">
              法律声明
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/legal" className="hover:text-cosmic-blue transition-colors">
                  隐私保护协议
                </Link>
              </li>
              <li>
                <Link href="/legal?tab=terms" className="hover:text-cosmic-blue transition-colors">
                  用户服务协议
                </Link>
              </li>
              <li>
                <Link href="/legal?tab=disclaimer" className="hover:text-cosmic-blue transition-colors">
                  免责声明
                </Link>
              </li>
              <li>
                <Link href="/legal?tab=minor" className="hover:text-cosmic-blue transition-colors">
                  未成年人保护指引
                </Link>
              </li>
              <li>
                <button type="button" onClick={openFeedback} className="hover:text-cosmic-blue transition-colors cursor-pointer">
                  意见反馈
                </button>
              </li>
            </ul>
          </div>

          {/* Filing */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-cosmic-nav-hover">
              备案信息
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex flex-wrap items-center gap-x-1 gap-y-1">
                <FileText className="size-3 shrink-0 text-cosmic-blue" />
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cosmic-blue transition-colors"
                >
                  粤ICP备2025440449号
                </a>
              </li>
              <li className="flex items-center gap-1">
                <Shield className="size-3 shrink-0 text-cosmic-blue" />
                京公网安备 11010802030001号
              </li>
              <li className="flex items-center gap-1">
                <Medal className="size-3 shrink-0 text-cosmic-blue" />
                互联网信息服务许可证
              </li>
              <li className="flex items-center gap-1">
                <Stamp className="size-3 shrink-0 text-cosmic-blue" />
                心理健康服务备案号：XLJK2025001
              </li>
            </ul>
          </div>

          {/* QR Code */}
          <div className="text-center lg:text-left">
            <h4 className="mb-4 text-base font-semibold text-cosmic-nav-hover">
              关注我们
            </h4>
            <div className="flex justify-center gap-6 lg:justify-start">
              <div className="text-center">
                <div className="mx-auto mb-2 flex size-[100px] items-center justify-center rounded-lg bg-white/10 text-xs text-cosmic-dim">
                  小程序码
                </div>
                <span className="text-xs">微信小程序</span>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex size-[100px] items-center justify-center rounded-lg bg-white/10 text-xs text-cosmic-dim">
                  公众号码
                </div>
                <span className="text-xs">微信公众号</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-cosmic-dim">
          <p>© 2025 AI青少年心理健康平台 版权所有 | 青少年心理健康服务专线：12355</p>
          <p className="mt-1">
            本平台所有内容仅供参考，不能替代专业医疗诊断。如遇紧急情况，请拨打 24 小时心理援助热线：400-161-9995
          </p>
        </div>
      </div>
    </footer>
  );
}
