import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 需要保护的路由路径前缀
const protectedPaths = ["/admin", "/client", "/photographer"];

// 无需认证的路由路径
const publicPaths = ["/login", "/register", "/", "/api", "/contact", "/cases", "/services"];

// 要记录的API路径前缀
const API_PATHS_TO_LOG = [
  '/api/admin',
  '/api/photos',
  '/api/bookings',
  '/api/users',
  '/api/orders',
  '/api/auth'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 记录API请求（仅限于指定的路径）
  if (API_PATHS_TO_LOG.some(path => pathname.startsWith(path))) {
    const method = request.method;
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // 生成用于记录的数据
    const logData = {
      method,
      path: pathname,
      ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    };
    
    // 我们不阻塞请求处理，而是异步记录
    // 注意：这里不直接调用API以避免循环请求
    // 在生产环境中，可以将日志数据发送到专门的日志服务或写入到文件
    console.log(`[API Request] ${method} ${pathname} | IP: ${ip} | Time: ${logData.timestamp}`);
  }
  
  // 如果是公共路径，直接放行
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // 检查是否需要保护
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    // 如果没有令牌，重定向到登录页
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    // 检查用户角色与路由前缀是否匹配
    const userRole = token.role as string;
    
    // 管理员可以访问所有路径
    if (userRole === "admin") {
      return NextResponse.next();
    }
    
    // 摄影师只能访问摄影师路径
    if (userRole === "photographer" && !pathname.startsWith("/photographer")) {
      return NextResponse.redirect(new URL('/photographer/dashboard', request.url));
    }
    
    // 客户只能访问客户路径
    if (userRole === "client" && !pathname.startsWith("/client")) {
      return NextResponse.redirect(new URL('/client/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - api 路由 (除了 /api/auth/me)
     * - _next 系统文件
     * - 静态文件 (public files)
     * - 静态资源文件
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|fonts/).*)',
  ],
}; 