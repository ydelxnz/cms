import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t bg-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <Logo size="sm" />
            <span className="ml-4 text-sm text-muted-foreground">© {new Date().getFullYear()} 保留所有权利</span>
          </div>
          
          <div className="flex space-x-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              首页
            </Link>
            <Link href="/services" className="text-sm text-muted-foreground hover:text-primary">
              服务
            </Link>
            <Link href="/cases" className="text-sm text-muted-foreground hover:text-primary">
              客户案例
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
              联系我们
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
