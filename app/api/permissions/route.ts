import { NextRequest, NextResponse } from "next/server";
import { getPermissions, createPermission, updatePermission, deletePermission } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取权限列表
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

    const permissions = await getPermissions();
    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "获取权限数据失败" },
      { status: 500 }
    );
  }
}

// 创建权限
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
    const { name, description } = body;
    
    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { error: "缺少必要字段" },
        { status: 400 }
      );
    }
    
    // 创建权限
    const newPermission = await createPermission({
      name,
      description,
    });
    
    return NextResponse.json(
      { message: "权限已创建", permission: newPermission },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating permission:", error);
    return NextResponse.json(
      { error: "创建权限失败" },
      { status: 500 }
    );
  }
}

// 更新权限
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
    const { id, name, description } = body;
    
    // 验证必填字段
    if (!id || !name) {
      return NextResponse.json(
        { error: "缺少必要字段" },
        { status: 400 }
      );
    }
    
    // 更新权限
    const updatedPermission = await updatePermission(id, {
      name,
      description,
    });
    
    if (!updatedPermission) {
      return NextResponse.json(
        { error: "权限不存在" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: "权限已更新",
      permission: updatedPermission,
    });
  } catch (error) {
    console.error("Error updating permission:", error);
    return NextResponse.json(
      { error: "更新权限失败" },
      { status: 500 }
    );
  }
}

// 删除权限
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
        { error: "缺少权限ID" },
        { status: 400 }
      );
    }
    
    // 删除权限
    const success = await deletePermission(id);
    
    if (!success) {
      return NextResponse.json(
        { error: "权限不存在或删除失败" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: "权限已删除" });
  } catch (error) {
    console.error("Error deleting permission:", error);
    return NextResponse.json(
      { error: "删除权限失败" },
      { status: 500 }
    );
  }
} 