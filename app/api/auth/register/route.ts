import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import fs from 'fs';
import path from 'path';

// 模拟用户数据存储
let users: any[] = [];
const DATA_FILE = path.join(process.cwd(), 'users.json');

// 尝试加载现有用户数据
try {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    users = JSON.parse(data);
  }
} catch (error) {
  console.error('Failed to load users data:', error);
  // 如果文件不存在或无法解析，继续使用空数组
}

// 保存用户数据到文件
const saveUsers = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save users data:', error);
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // 基本验证
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "缺少必要字段" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: "该邮箱已注册" },
        { status: 409 }
      );
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password: hashedPassword,
      role: role || "client", // 默认为客户角色
      createdAt: new Date().toISOString()
    };

    // 保存用户
    users.push(newUser);
    saveUsers();

    // 返回成功响应（不包含密码）
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(
      { message: "注册成功", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { message: "服务器错误，请稍后再试" },
      { status: 500 }
    );
  }
} 