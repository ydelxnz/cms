import { NextRequest, NextResponse } from "next/server";

/**
 * API错误处理工具函数，可在任何API路由中使用
 */
export async function withErrorHandling(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // 尝试处理请求
    return await handler(request);
  } catch (error: any) {
    console.error("[API错误处理] 捕获到未处理的错误:", error);
    
    // 确定错误消息
    let errorMessage = "服务器内部错误";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    
    // 确定错误状态码
    let statusCode = 500;
    if (error.statusCode) {
      statusCode = error.statusCode;
    } else if (error.status) {
      statusCode = error.status;
    }
    
    // 记录有关请求的信息，以便调试
    console.error(`[API错误处理] 请求URL: ${request.url}`);
    console.error(`[API错误处理] 请求方法: ${request.method}`);
    
    try {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.error(`[API错误处理] 请求头:`, JSON.stringify(headers, null, 2));
    } catch (e) {
      console.error(`[API错误处理] 无法记录请求头: ${e}`);
    }
    
    // 返回统一格式的错误响应
    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
      { status: statusCode }
    );
  }
}

/**
 * 全局进程错误处理设置
 * 应在服务器启动时调用
 */
export function setupGlobalErrorHandlers() {
  if (typeof process !== 'undefined') {
    try {
      // 处理未捕获的异常
      process.on('uncaughtException', (error) => {
        console.error('[全局] 未捕获的异常:', error);
        // 记录错误但不退出进程
      });
      
      // 处理未处理的Promise拒绝
      process.on('unhandledRejection', (reason, promise) => {
        console.error('[全局] 未处理的Promise拒绝:', reason);
        // 记录错误但不退出进程
      });
      
      console.log('[全局] 已设置全局错误处理器');
    } catch (error) {
      console.error('[全局] 设置全局错误处理器失败:', error);
    }
  }
}

// 在服务器启动时自动设置全局错误处理
try {
  setupGlobalErrorHandlers();
} catch (e) {
  console.error('设置全局错误处理器失败:', e);
} 