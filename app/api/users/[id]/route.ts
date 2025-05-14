import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// 获取指定用户的详细信息
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // 验证用户身份和权限
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 只有管理员或用户本人可以查看用户详情
    if (session.user.role !== "admin" && session.user.id !== userId) {
      return NextResponse.json(
        { error: "没有权限访问此资源" },
        { status: 403 }
      );
    }
    
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    // 返回用户数据（不包含密码）
    const { password, ...safeUser } = user;
    
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    return NextResponse.json(
      { error: "获取用户数据失败" },
      { status: 500 }
    );
  }
}

// 更新用户信息
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    
    // 验证用户身份和权限
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "认证失败" },
        { status: 401 }
      );
    }
    
    // 只有管理员或用户本人可以更新用户信息
    if (session.user.role !== "admin" && session.user.id !== userId) {
      return NextResponse.json(
        { error: "没有权限修改此用户" },
        { status: 403 }
      );
    }
    
    // 检查用户是否存在
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    // 准备要更新的数据
    const { password, role, ...updateData } = body;
    
    // 非管理员不能修改用户角色
    if (role && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "没有权限修改用户角色" },
        { status: 403 }
      );
    }
    
    // 如果提供了新密码，进行加密
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }
    
    // 管理员可以更新角色
    if (role && session.user.role === "admin") {
      updateData.role = role;
    }
    
    // 更新用户数据
    const updatedUser = await updateUser(userId, updateData);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "更新用户失败" },
        { status: 500 }
      );
    }
    
    // 返回更新后的用户数据（不包含密码）
    const { password: _, ...safeUser } = updatedUser;
    
    return NextResponse.json({
      message: "用户更新成功",
      user: safeUser
    });
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    return NextResponse.json(
      { error: "更新用户失败" },
      { status: 500 }
    );
  }
}

// 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // 验证用户身份和权限（只有管理员可以删除用户）
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "没有权限删除用户" },
        { status: 403 }
      );
    }
    
    // 检查用户是否存在
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    // 删除用户
    const deleted = await deleteUser(userId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "删除用户失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "用户删除成功"
    });
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    return NextResponse.json(
      { error: "删除用户失败" },
      { status: 500 }
    );
  }
} 