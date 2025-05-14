import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  Camera, 
  Calendar, 
  ShoppingBag, 
  BarChart, 
  Settings,
  Activity,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AdminNavProps {
  unreadCount?: number;
}

export function AdminNav({ unreadCount = 0 }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      <Link href="/admin">
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === "/admin" ? "bg-accent" : "transparent"
          )}
        >
          <Home className="mr-2 h-4 w-4" />
          <span>控制台</span>
        </span>
      </Link>
      <Link href="/admin/users">
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === "/admin/users" ? "bg-accent" : "transparent"
          )}
        >
          <Users className="mr-2 h-4 w-4" />
          <span>用户管理</span>
        </span>
      </Link>
      <Link href="/admin/photographers">
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === "/admin/photographers" ? "bg-accent" : "transparent"
          )}
        >
          <Camera className="mr-2 h-4 w-4" />
          <span>摄影师管理</span>
        </span>
      </Link>
      <Link href="/admin/bookings">
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === "/admin/bookings" ? "bg-accent" : "transparent"
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          <span>预约管理</span>
        </span>
      </Link>
      <Link href="/admin/orders">
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === "/admin/orders" ? "bg-accent" : "transparent"
          )}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          <span>订单管理</span>
        </span>
      </Link>
      <Link href="/admin/photos">
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname.startsWith("/admin/photos") ? "bg-accent" : "transparent"
          )}
        >
          <Camera className="mr-2 h-4 w-4" />
          <span>照片管理</span>
        </span>
      </Link>
      <Link href="/admin/statistics">
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === "/admin/statistics" ? "bg-accent" : "transparent"
          )}
        >
          <BarChart className="mr-2 h-4 w-4" />
          <span>统计分析</span>
        </span>
      </Link>
      <Link href="/admin/notifications">
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === "/admin/notifications" ? "bg-accent" : "transparent"
          )}
        >
          <Bell className="mr-2 h-4 w-4" />
          <span>通知管理</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unreadCount}
            </Badge>
          )}
        </span>
      </Link>
      <Link href="/admin/logs">
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === "/admin/logs" ? "bg-accent" : "transparent"
          )}
        >
          <Activity className="mr-2 h-4 w-4" />
          <span>系统日志</span>
        </span>
      </Link>
      <Link href="/admin/settings">
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === "/admin/settings" ? "bg-accent" : "transparent"
          )}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>系统设置</span>
        </span>
      </Link>
    </nav>
  );
} 