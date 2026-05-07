import Link from "next/link";
import { Phone, Mail, MapPin, Shield, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-transparent text-cosmic-footer">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Contact */}
          <div>
            <h4 className="mb-4 text-center text-base font-semibold text-cosmic-nav-hover lg:text-left">
              联系方式
            </h4>
            <ul className="space-y-3 text-center text-sm lg:text-left">
              <li className="flex items-center justify-center gap-2 lg:justify-start">
                <Phone className="size-4 text-cosmic-blue" /> 400-123-4567
              </li>
              <li className="flex items-center justify-center gap-2 lg:justify-start">
                <Mail className="size-4 text-cosmic-blue" /> support@xinyuzhilian.com
              </li>
              <li className="flex items-center justify-center gap-2 lg:justify-start">
                <MapPin className="size-4 text-cosmic-blue" /> 北京市海淀区
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-center text-base font-semibold text-cosmic-nav-hover lg:text-left">
              法律声明
            </h4>
            <ul className="space-y-3 text-center text-sm lg:text-left">
              <li>
                <Link href="#" className="hover:text-cosmic-blue transition-colors">用户协议</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-cosmic-blue transition-colors">隐私政策</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-cosmic-blue transition-colors">免责声明</Link>
              </li>
            </ul>
          </div>

          {/* Filing */}
          <div>
            <h4 className="mb-4 text-center text-base font-semibold text-cosmic-nav-hover lg:text-left">
              备案信息
            </h4>
            <ul className="space-y-3 text-center text-sm lg:text-left">
              <li className="flex items-center justify-center gap-1 lg:justify-start">
                <Shield className="size-3" /> 京ICP备2025XXXXXX号
              </li>
              <li className="flex items-center justify-center gap-1 lg:justify-start">
                <FileText className="size-3" /> 京公网安备 XXXXXXXX号
              </li>
              <li className="flex items-center justify-center gap-1 lg:justify-start">
                <Shield className="size-3" /> 医疗器械网络交易服务第三方平台备案
              </li>
            </ul>
          </div>

          {/* QR Code */}
          <div className="text-center lg:text-left">
            <h4 className="mb-4 text-base font-semibold text-cosmic-nav-hover">
              关注我们
            </h4>
            <div className="flex justify-center gap-8 lg:justify-start">
              <div className="text-center">
                <div className="mx-auto mb-2 size-[100px] rounded-lg bg-white/10" />
                <span className="text-xs">微信小程序</span>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 size-[100px] rounded-lg bg-white/10" />
                <span className="text-xs">微信公众号</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-cosmic-dim">
          <p>© 2025 心愈智联 xinyuzhilian.com 版权所有</p>
          <p className="mt-1">
            如遇紧急情况，请拨打 24 小时心理援助热线：400-161-9995 或 12355 青少年服务热线
          </p>
        </div>
      </div>
    </footer>
  );
}
