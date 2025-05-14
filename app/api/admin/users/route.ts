import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// 获取所有用户
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "无权访问用户管理" },
        { status: 403 }
      );
    }
    
    // 记录操作日志
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'system',
          module: '用户管理',
          description: '管理员查看用户列表',
          details: {
            adminId: session.user.id,
            adminName: session.user.name
          }
        }),
      });
    } catch (logError) {
      console.error('记录日志失败:', logError);
      // 继续处理，不因日志记录失败而中断主流程
    }
    
    // 获取所有用户
    const users = await db.getUsers();
    
    // 为了安全，过滤掉密码字段
    const safeUsers = users.map(({ password, ...userData }) => userData);
    
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "获取用户列表失败" },
      { status: 500 }
    );
  }
}

// 创建用户
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "无权创建用户" },
        { status: 403 }
      );
    }
    
    // 解析请求体
    const data = await request.json();
    
    // 创建用户
    const newUser = await db.createUser(data);
    
    // 为了安全，过滤掉密码字段
    const { password, ...safeUser } = newUser;
    
    // 记录操作日志
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user',
          module: '用户管理',
          description: `创建新用户: ${data.name} (${data.email})`,
          details: {
            adminId: session.user.id,
            adminName: session.user.name,
            userId: newUser.id,
            userName: newUser.name,
            userEmail: newUser.email,
            userRole: newUser.role
          }
        }),
      });
    } catch (logError) {
      console.error('记录日志失败:', logError);
      // 继续处理，不因日志记录失败而中断主流程
    }
    
    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error("Error creating user:", error);
    
    const errorMessage = error.message === "Email already exists" 
      ? "邮箱已存在" 
      : "创建用户失败";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

// 更新用户
export async function PUT(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "无权更新用户" },
        { status: 403 }
      );
    }
    
    // 解析请求体
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { error: "缺少用户ID" },
        { status: 400 }
      );
    }
    
    // 获取原用户信息（用于日志）
    const originalUser = await db.getUserById(data.id);
    if (!originalUser) {
      return NextResponse.json(
        { error: "未找到用户" },
        { status: 404 }
      );
    }
    
    // 更新用户
    const updatedUser = await db.updateUser(data.id, data);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "未找到用户" },
        { status: 404 }
      );
    }
    
    // 为了安全，过滤掉密码字段
    const { password, ...safeUser } = updatedUser;
    
    // 记录操作日志
    try {
      // 找出更改了哪些字段
      const changes: Record<string, { before: any, after: any }> = {};
      Object.keys(data).forEach(key => {
        if (key !== 'id' && key !== 'password' && data[key] !== (originalUser as any)[key]) {
          changes[key] = {
            before: (originalUser as any)[key],
            after: data[key]
          };
        }
      });
      
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user',
          module: '用户管理',
          description: `更新用户: ${updatedUser.name} (${updatedUser.email})`,
          details: {
            adminId: session.user.id,
            adminName: session.user.name,
            userId: updatedUser.id,
            userName: updatedUser.name,
            changes
          }
        }),
      });
    } catch (logError) {
      console.error('记录日志失败:', logError);
      // 继续处理，不因日志记录失败而中断主流程
    }
    
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "更新用户失败" },
      { status: 500 }
    );
  }
}

// 删除用户
export async function DELETE(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "无权删除用户" },
        { status: 403 }
      );
    }
    
    // 获取用户ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少用户ID" },
        { status: 400 }
      );
    }
    
    // 获取用户信息（用于日志）
    const user = await db.getUserById(id);
    if (!user) {
      return NextResponse.json(
        { error: "未找到用户" },
        { status: 404 }
      );
    }
    
    // 不允许删除自己
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "不能删除当前登录的管理员账户" },
        { status: 400 }
      );
    }
    
    // 删除用户
    const success = await db.deleteUser(id);
    
    if (!success) {
      return NextResponse.json(
        { error: "未找到用户" },
        { status: 404 }
      );
    }
    
    // 记录操作日志
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'security',
          module: '用户管理',
          description: `删除用户: ${user.name} (${user.email})`,
          details: {
            adminId: session.user.id,
            adminName: session.user.name,
            deletedUserId: id,
            deletedUserName: user.name,
            deletedUserEmail: user.email,
            deletedUserRole: user.role
          }
        }),
      });
    } catch (logError) {
      console.error('记录日志失败:', logError);
      // 继续处理，不因日志记录失败而中断主流程
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "删除用户失败" },
      { status: 500 }
    );
  }
} 