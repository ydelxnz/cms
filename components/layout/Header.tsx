import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

interface HeaderProps {
  activePage?: "home" | "services" | "contact";
}

export function Header({ activePage = "home" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Logo size="md" />
        
        <nav className="hidden space-x-6 md:flex">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              activePage === "home" ? "text-primary" : ""
            }`}
          >
            首页
          </Link>
          <Link 
            href="/services" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              activePage === "services" ? "text-primary" : ""
            }`}
          >
            服务
          </Link>

          <Link 
            href="/contact" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              activePage === "contact" ? "text-primary" : ""
            }`}
          >
            联系我们
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="outline" size="sm">登录</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">注册</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
