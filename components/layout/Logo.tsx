import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export function Logo({ size = "md" }: LogoProps) {
  // 根据尺寸设置宽高
  const dimensions = {
    sm: { width: 30, height: 30 },
    md: { width: 40, height: 40 },
    lg: { width: 50, height: 50 },
  };

  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="relative">
        <Image 
          src="/images/logo.svg" 
          alt="摄影影楼管理系统" 
          width={dimensions[size].width}
          height={dimensions[size].height}
          className="rounded-full"
        />
      </div>
      <span className={`font-bold ${size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"}`}>
        摄影影楼管理系统
      </span>
    </Link>
  );
}
