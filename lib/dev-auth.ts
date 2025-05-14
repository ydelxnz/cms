// 这是一个开发环境临时使用的认证绕过方案
// 在生产环境中应该移除此文件

// 模拟用户会话数据
export const mockSession = {
  user: {
    id: "dev-user-id",
    name: "开发测试用户",
    email: "dev@example.com",
    role: "client", // 可以修改为 "client", "photographer", "admin" 来测试不同角色
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// 检查是否为开发环境
export const isDevelopment = process.env.NODE_ENV === "development";

// 开发环境中绕过认证检查 - 现已禁用
export function bypassAuthCheck() {
  // 返回false以禁用认证绕过
  return false;
}
