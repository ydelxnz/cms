import { NextRequest, NextResponse } from "next/server";
import { getRoles, createRole, updateRole, deleteRole, getUsersWithRole } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取角色列表
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
    const withUserCount = searchParams.get("withUserCount");
    
    const roles = await getRoles();
    
    // 如果需要用户数量，则为每个角色添加用户数量
    if (withUserCount === "true") {
      const rolesWithUserCount = await Promise.all(
        roles.map(async (role) => {
          const users = await getUsersWithRole(role.id);
          return {
            ...role,
            usersCount: users.length,
          };
        })
      );
      
      return NextResponse.json(rolesWithUserCount);
    }
    
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "获取角色数据失败" },
      { status: 500 }
    );
  }
}

// 创建角色
export async function POST(request: NextRequest) {
  try {
    // 验证用户是否为管理员
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "认证失败，没有权限访问此资源" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, permissions } = body;
    
    // 验证必填字段
    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "缺少必要字段或格式不正确" },
        { status: 400 }
      );
    }
    
    // 创建角色
    const newRole = await createRole({
      name,
      description,
      permissions,
    });
    
    return NextResponse.json(
      { message: "角色已创建", role: newRole },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "创建角色失败" },
      { status: 500 }
    );
  }
}

// 更新角色
export async function PATCH(request: NextRequest) {
  try {
    // 验证用户是否为管理员
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "认证失败，没有权限访问此资源" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, description, permissions } = body;
    
    // 验证必填字段
    if (!id || !name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "缺少必要字段或格式不正确" },
        { status: 400 }
      );
    }
    
    // 更新角色
    const updatedRole = await updateRole(id, {
      name,
      description,
      permissions,
    });
    
    if (!updatedRole) {
      return NextResponse.json(
        { error: "角色不存在" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "角色已更新",
      role: updatedRole,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "更新角色失败" },
      { status: 500 }
    );
  }
}

// 删除角色
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
    
    if (!id) {
      return NextResponse.json(
        { error: "缺少角色ID" },
        { status: 400 }
      );
    }
    
    // 检查是否有用户正在使用此角色
    const users = await getUsersWithRole(id);
    if (users.length > 0) {
      return NextResponse.json(
        { error: "无法删除正在使用的角色，请先更改相关用户的角色" },
        { status: 400 }
      );
    }
    
    // 删除角色
    const success = await deleteRole(id);
    
    if (!success) {
      return NextResponse.json(
        { error: "角色不存在或删除失败" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "角色已删除" });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "删除角色失败" },
      { status: 500 }
    );
  }
} 