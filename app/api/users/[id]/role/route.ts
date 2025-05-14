import { NextRequest, NextResponse } from "next/server";
import { assignRoleToUser, getRoleById, getUserById } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 更新用户角色
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户是否为管理员
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "认证失败，没有权限访问此资源" },
        { status: 403 }
      );
    }

    const userId = params.id;
    const body = await request.json();
    const { roleId } = body;
    
    // 验证必填字段
    if (!roleId) {
      return NextResponse.json(
        { error: "缺少角色ID" },
        { status: 400 }
      );
    }
    
    // 验证用户是否存在
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    // 验证角色是否存在
    const role = await getRoleById(roleId);
    if (!role) {
      return NextResponse.json(
        { error: "角色不存在" },
        { status: 404 }
      );
    }
    
    // 更新用户角色
    const updatedUser = await assignRoleToUser(userId, roleId);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "更新用户角色失败" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "用户角色已更新",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "更新用户角色失败" },
      { status: 500 }
    );
  }
} 