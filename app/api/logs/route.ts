import { NextRequest, NextResponse } from "next/server";
import { getLogs, createLog, deleteLog, clearLogs, getLogsByType, getLogsByModule, getLogsByUser, getLogsByDateRange } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取日志列表
export async function GET(request: NextRequest) {
  try {
    // 验证用户是否为管理员
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "认证失败，没有权限访问此资源" },
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
    
    let logs;
    
    // 根据查询参数获取日志
    if (type) {
      logs = await getLogsByType(type);
    } else if (module) {
      logs = await getLogsByModule(module);
    } else if (userId) {
      logs = await getLogsByUser(userId);
    } else if (startDate && endDate) {
      logs = await getLogsByDateRange(startDate, endDate);
    } else {
      logs = await getLogs();
    }
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "获取日志数据失败" },
      { status: 500 }
    );
  }
}

// 创建日志记录
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败，需要登录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, module, description, details = {} } = body;
    
    // 验证必填字段
    if (!type || !module || !description) {
      return NextResponse.json(
        { error: "缺少必要字段" },
        { status: 400 }
      );
    }
    
    // 获取客户端IP
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "未知IP";
    
    // 创建日志记录
    const newLog = await createLog({
      timestamp: new Date().toISOString(),
      type,
      module,
      userId: session.user.id,
      userName: session.user.name || session.user.email || "未知用户",
      description,
      ip,
      details,
    });
    
    return NextResponse.json(
      { message: "日志记录已创建", log: newLog },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating log:", error);
    return NextResponse.json(
      { error: "创建日志记录失败" },
      { status: 500 }
    );
  }
}

// 删除日志记录
export async function DELETE(request: NextRequest) {
  try {
    // 验证用户是否为管理员
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "认证失败，没有权限访问此资源" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll");
    
    if (clearAll === "true") {
      // 清空所有日志
      const success = await clearLogs();
      if (!success) {
        return NextResponse.json(
          { error: "清空日志失败" },
          { status: 500 }
        );
      }
      return NextResponse.json({ message: "所有日志已清空" });
    } else if (id) {
      // 删除单条日志
      const success = await deleteLog(id);
      if (!success) {
        return NextResponse.json(
          { error: "日志不存在或删除失败" },
          { status: 404 }
        );
      }
      return NextResponse.json({ message: "日志已删除" });
    } else {
      return NextResponse.json(
        { error: "需要指定日志ID或clearAll参数" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting log:", error);
    return NextResponse.json(
      { error: "删除日志失败" },
      { status: 500 }
    );
  }
} 