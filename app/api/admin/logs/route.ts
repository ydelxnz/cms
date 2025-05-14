import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// 获取所有日志
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "无权访问管理员日志" },
        { status: 403 }
      );
    }
    
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const module = searchParams.get("module");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "100");
    
    // 获取日志
    let logs = await db.getLogs();
    
    // 应用筛选条件
    if (type) {
      logs = logs.filter(log => log.type === type);
    }
    
    if (module) {
      logs = logs.filter(log => log.module === module);
    }
    
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }
    
    if (startDate && endDate) {
      logs = await db.getLogsByDateRange(startDate, endDate);
    } else if (startDate) {
      const now = new Date().toISOString();
      logs = await db.getLogsByDateRange(startDate, now);
    }
    
    // 按时间戳降序排序（最新的在最前面）
    logs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // 限制返回数量
    logs = logs.slice(0, limit);
    
    // 统计信息
    const stats = {
      total: logs.length,
      system: logs.filter(log => log.type === "system").length,
      security: logs.filter(log => log.type === "security").length,
      user: logs.filter(log => log.type === "user").length,
      error: logs.filter(log => log.type === "error").length,
    };
    
    return NextResponse.json({
      logs, 
      stats
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "获取日志数据失败" },
      { status: 500 }
    );
  }
}

// 创建新日志
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "未认证" },
        { status: 401 }
      );
    }
    
    // 解析请求体
    const data = await request.json();
    
    // 获取用户IP地址
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';
    
    // 创建日志对象
    const logData = {
      timestamp: new Date().toISOString(),
      type: data.type || "system",
      module: data.module || "general",
      userId: session.user.id,
      userName: session.user.name || "",
      description: data.description || "未提供描述",
      ip: ip,
      details: data.details || {}
    };
    
    // 保存日志
    const newLog = await db.createLog(logData);
    
    return NextResponse.json({ success: true, log: newLog });
  } catch (error) {
    console.error("Error creating log:", error);
    return NextResponse.json(
      { error: "创建日志失败" },
      { status: 500 }
    );
  }
}

// 清除所有日志 (只有管理员可以执行)
export async function DELETE(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "无权删除日志" },
        { status: 403 }
      );
    }
    
    // 检查查询参数，是否删除单个日志
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get("id");
    
    let success = false;
    if (logId) {
      // 删除单个日志
      success = await db.deleteLog(logId);
      if (!success) {
        return NextResponse.json(
          { error: "未找到指定日志" },
          { status: 404 }
        );
      }
    } else {
      // 清除所有日志
      success = await db.clearLogs();
    }
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error("Error deleting logs:", error);
    return NextResponse.json(
      { error: "删除日志失败" },
      { status: 500 }
    );
  }
} 