import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json({
    message: "API集成测试成功",
    timestamp: new Date().toISOString(),
    status: "success"
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      message: "数据接收成功",
      receivedData: body,
      timestamp: new Date().toISOString(),
      status: "success"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "请求处理失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 400 }
    );
  }
} 