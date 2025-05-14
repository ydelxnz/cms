"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Users,
  UserPlus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  Plus,
  Save,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { logService, roleService, userService } from "@/lib/services";
import { Role } from "@/lib/services/roleService";

// 类型定义
interface Permission {
  id: string;
  name: string;
}

interface PermissionGroup {
  id: string;
  name: string;
  permissions: Permission[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: Date;
}

interface NewRole {
  name: string;
  description: string;
  permissions: string[];
}

// 模拟权限数据（这部分保留，因为权限定义通常是前端固定的）
const mockPermissions = [
  {
    id: "clients",
    name: "客户管理",
    permissions: [
      { id: "clients.view", name: "查看客户" },
      { id: "clients.create", name: "创建客户" },
      { id: "clients.edit", name: "编辑客户" },
      { id: "clients.delete", name: "删除客户" },
    ],
  },
  {
    id: "photographers",
    name: "摄影师管理",
    permissions: [
      { id: "photographers.view", name: "查看摄影师" },
      { id: "photographers.create", name: "添加摄影师" },
      { id: "photographers.edit", name: "编辑摄影师" },
      { id: "photographers.delete", name: "删除摄影师" },
      { id: "photographers.assign", name: "分配任务" },
    ],
  },
  {
    id: "bookings",
    name: "预约管理",
    permissions: [
      { id: "bookings.view", name: "查看所有预约" },
      { id: "bookings.view.own", name: "查看自己的预约" },
      { id: "bookings.create", name: "创建预约" },
      { id: "bookings.edit", name: "编辑预约" },
      { id: "bookings.cancel", name: "取消预约" },
    ],
  },
  {
    id: "photos",
    name: "照片管理",
    permissions: [
      { id: "photos.view", name: "查看所有照片" },
      { id: "photos.view.own", name: "查看自己的照片" },
      { id: "photos.upload", name: "上传照片" },
      { id: "photos.upload.own", name: "上传自己的照片" },
      { id: "photos.edit", name: "编辑照片信息" },
      { id: "photos.edit.own", name: "编辑自己的照片信息" },
      { id: "photos.delete", name: "删除照片" },
    ],
  },
  {
    id: "orders",
    name: "订单管理",
    permissions: [
      { id: "orders.view", name: "查看订单" },
      { id: "orders.create", name: "创建订单" },
      { id: "orders.edit", name: "编辑订单" },
      { id: "orders.cancel", name: "取消订单" },
      { id: "orders.refund", name: "退款处理" },
    ],
  },
  {
    id: "reports",
    name: "报表管理",
    permissions: [
      { id: "reports.view", name: "查看报表" },
      { id: "reports.export", name: "导出报表" },
    ],
  },
  {
    id: "system",
    name: "系统管理",
    permissions: [
      { id: "system.users", name: "用户管理" },
      { id: "system.roles", name: "角色管理" },
      { id: "system.logs", name: "查看日志" },
    ],
  },
];

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState("roles");
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<PermissionGroup[]>(mockPermissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isDeleteRoleDialogOpen, setIsDeleteRoleDialogOpen] = useState(false);
  const [isEditUserRoleDialogOpen, setIsEditUserRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<NewRole>({
    name: "",
    description: "",
    permissions: [],
  });

  // 初始加载数据
  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await roleService.getRoles();
      setRoles(data);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || '获取角色数据失败');
      setIsLoading(false);
      toast({
        title: "错误",
        description: err.message || '获取角色数据失败',
        variant: "destructive",
      });
    }
  };
  
  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '获取用户数据失败',
        variant: "destructive",
      });
    }
  };
  
  // 打开添加角色对话框
  const handleAddRole = () => {
    setNewRole({
      name: "",
      description: "",
      permissions: [],
    });
    setIsAddRoleDialogOpen(true);
  };
  
  // 处理编辑角色
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setNewRole({
      name: role.name,
      description: role.description || "",
      permissions: [...role.permissions],
    });
    setIsEditRoleDialogOpen(true);
  };
  
  // 处理删除角色
  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteRoleDialogOpen(true);
  };
  
  // 保存角色编辑
  const saveEditedRole = async () => {
    if (!selectedRole) return;
    
    try {
      setIsLoading(true);
      
      await roleService.updateRole(selectedRole.id, {
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
      });
      
      // 记录操作日志
      await logService.logUserAction(
        '权限管理',
        `更新角色: ${newRole.name}`,
        { roleId: selectedRole.id, permissions: newRole.permissions }
      );
      
      toast({
        title: "成功",
        description: "角色已更新",
      });
      
      // 重新获取角色列表
      await fetchRoles();
      setIsEditRoleDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '更新角色失败',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 确认删除角色
  const confirmDeleteRole = async () => {
    if (!selectedRole) return;
    
    try {
      setIsLoading(true);
      
      await roleService.deleteRole(selectedRole.id);
      
      // 记录操作日志
      await logService.logUserAction(
        '权限管理',
        `删除角色: ${selectedRole.name}`,
        { roleId: selectedRole.id }
      );
      
      toast({
        title: "成功",
        description: "角色已删除",
      });
      
      // 重新获取角色列表
      await fetchRoles();
      setIsDeleteRoleDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '删除角色失败',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理编辑用户角色
  const handleEditUserRole = (user: User) => {
    setSelectedUser(user);
    setIsEditUserRoleDialogOpen(true);
  };
  
  // 保存用户角色
  const saveUserRole = async (userId?: string, newRoleId?: string) => {
    if (!userId || !newRoleId) return;
    
    try {
      setIsLoading(true);
      
      await roleService.assignRoleToUser(userId, newRoleId);
      
      // 记录操作日志
      const user = users.find(u => u.id === userId);
      const role = roles.find(r => r.id === newRoleId);
      await logService.logUserAction(
        '权限管理',
        `更新用户角色: ${user?.name} → ${role?.name}`,
        { userId, roleId: newRoleId }
      );
      
      toast({
        title: "成功",
        description: "用户角色已更新",
      });
      
      // 更新本地用户数据
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRoleId } : user
      ));
      
      setIsEditUserRoleDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '更新用户角色失败',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 获取角色名称
  const getRoleName = (roleId: string): string => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : "未知角色";
  };
  
  const handleNewRoleChange = (field: string, value: string) => {
    setNewRole({
      ...newRole,
      [field]: value,
    });
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setNewRole({
        ...newRole,
        permissions: [...newRole.permissions, permissionId],
      });
    } else {
      setNewRole({
        ...newRole,
        permissions: newRole.permissions.filter((id) => id !== permissionId),
      });
    }
  };

  const handlePermissionGroupChange = (groupId: string, checked: boolean) => {
    const groupPermissions = permissions
      .find((group) => group.id === groupId)
      ?.permissions.map((p) => p.id) || [];

    if (checked) {
      const newPermissions = [...new Set([...newRole.permissions, ...groupPermissions])];
      setNewRole({
        ...newRole,
        permissions: newPermissions,
      });
    } else {
      setNewRole({
        ...newRole,
        permissions: newRole.permissions.filter(
          (id) => !groupPermissions.includes(id)
        ),
      });
    }
  };

  const saveNewRole = async () => {
    if (newRole.name.trim() === "") {
      toast({
        title: "错误",
        description: "请输入角色名称",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const createdRole = await roleService.createRole({
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
      });
      
      // 记录操作日志
      await logService.logUserAction(
        '权限管理',
        `创建新角色: ${newRole.name}`,
        { roleId: createdRole.id, permissions: newRole.permissions }
      );
      
      toast({
        title: "成功",
        description: "新角色已创建",
      });
      
      // 重新获取角色列表
      await fetchRoles();
      setIsAddRoleDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '创建角色失败',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isPermissionGroupChecked = (groupId: string): boolean => {
    const groupPermissions = permissions
      .find((group) => group.id === groupId)
      ?.permissions.map((p) => p.id) || [];
      
    return groupPermissions.length > 0 && 
      groupPermissions.every((id) => newRole.permissions.includes(id));
  };
  
  const isPermissionGroupIndeterminate = (groupId: string): boolean => {
    const groupPermissions = permissions
      .find((group) => group.id === groupId)
      ?.permissions.map((p) => p.id) || [];
    
    const selectedCount = groupPermissions.filter((id) => 
      newRole.permissions.includes(id)).length;
      
    return selectedCount > 0 && selectedCount < groupPermissions.length;
  };

  // Filter roles based on search query
  const filteredRoles = roles.filter(role => 
    searchQuery.trim() === '' || 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    searchQuery.trim() === '' || 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 p-8">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">权限管理</h2>
        <Button onClick={handleAddRole}>
          <Plus className="mr-2 h-4 w-4" />
          添加角色
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b">
          <div className="flex items-center justify-between py-4">
            <TabsList>
              <TabsTrigger value="roles" className="relative">
                角色管理
              </TabsTrigger>
              <TabsTrigger value="users" className="relative">
                用户权限
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜索..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <TabsContent value="roles" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>系统角色</CardTitle>
              <CardDescription>
                管理系统中的角色及其权限
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-muted-foreground">加载角色数据...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">角色名称</TableHead>
                        <TableHead className="w-[300px]">描述</TableHead>
                        <TableHead className="w-[100px]">用户数</TableHead>
                        <TableHead>权限</TableHead>
                        <TableHead className="w-[150px]">创建时间</TableHead>
                        <TableHead className="w-[120px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            没有找到匹配的角色
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRoles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">{role.name}</TableCell>
                            <TableCell>{role.description}</TableCell>
                            <TableCell>{role.usersCount}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {role.permissions[0] === "all" ? (
                                  <Badge variant="default">所有权限</Badge>
                                ) : (
                                  role.permissions.slice(0, 3).map((perm) => (
                                    <Badge key={perm} variant="outline" className="text-xs">
                                      {perm.split('.').pop()}
                                    </Badge>
                                  ))
                                )}
                                {role.permissions.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{role.permissions.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(role.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditRole(role)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteRole(role)}
                                  disabled={role.usersCount > 0}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>用户权限</CardTitle>
              <CardDescription>
                管理系统用户的角色分配
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-muted-foreground">加载用户数据...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">用户名</TableHead>
                        <TableHead className="w-[200px]">邮箱</TableHead>
                        <TableHead className="w-[150px]">当前角色</TableHead>
                        <TableHead className="w-[120px]">状态</TableHead>
                        <TableHead className="w-[180px]">最后登录</TableHead>
                        <TableHead className="w-[100px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            没有找到匹配的用户
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getRoleName(user.role)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.status === "active" ? (
                                <Badge variant="success">活跃</Badge>
                              ) : (
                                <Badge variant="secondary">非活跃</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.lastLogin ? user.lastLogin.toLocaleString() : '未登录'}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditUserRole(user)}
                              >
                                修改角色
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 编辑角色对话框 */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑角色权限</DialogTitle>
            <DialogDescription>
              修改角色权限设置，更改将影响所有分配了此角色的用户。
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="role-name" className="text-right">
                    角色名称
                  </label>
                  <Input
                    id="role-name"
                    defaultValue={selectedRole.name}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="role-description" className="text-right">
                    角色描述
                  </label>
                  <Input
                    id="role-description"
                    defaultValue={selectedRole.description}
                    className="col-span-3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">权限设置</h4>
                <div className="max-h-80 space-y-4 overflow-y-auto p-2">
                  {mockPermissions.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <h5 className="font-medium">{group.name}</h5>
                      <div className="ml-6 space-y-2">
                        {group.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              defaultChecked={
                                selectedRole.permissions.includes("all") ||
                                selectedRole.permissions.includes(permission.id)
                              }
                            />
                            <label
                              htmlFor={permission.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleDialogOpen(false)}>
              取消
            </Button>
            <Button>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除角色对话框 */}
      <Dialog open={isDeleteRoleDialogOpen} onOpenChange={setIsDeleteRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除角色</DialogTitle>
            <DialogDescription>
              您确定要删除此角色吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="py-4">
              <div className="rounded-lg bg-muted p-4">
                <div>
                  <div className="font-medium">{selectedRole.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedRole.description}</div>
                </div>
              </div>
              {selectedRole.usersCount > 0 && (
                <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-destructive">
                  <p>
                    此角色已分配给 {selectedRole.usersCount} 名用户。
                    删除前请先将这些用户重新分配到其他角色。
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteRoleDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteRole}
              disabled={selectedRole?.usersCount > 0}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加角色对话框 */}
      <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>添加新角色</DialogTitle>
            <DialogDescription>
              创建新的系统角色并设置权限。角色创建后可以分配给用户。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="role-name" className="text-right">
                角色名称
              </label>
              <Input
                id="role-name"
                value={newRole.name}
                onChange={(e) => handleNewRoleChange("name", e.target.value)}
                placeholder="输入角色名称"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="role-description" className="text-right">
                角色描述
              </label>
              <Textarea
                id="role-description"
                value={newRole.description}
                onChange={(e) => handleNewRoleChange("description", e.target.value)}
                placeholder="输入角色描述信息"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right pt-2">
                权限设置
              </label>
              <div className="col-span-3 space-y-6">
                {permissions.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`group-${group.id}`}
                        checked={isPermissionGroupChecked(group.id)}
                        indeterminate={isPermissionGroupIndeterminate(group.id)}
                        onCheckedChange={(checked) => 
                          handlePermissionGroupChange(group.id, checked)
                        }
                      />
                      <label 
                        htmlFor={`group-${group.id}`}
                        className="text-base font-medium"
                      >
                        {group.name}
                      </label>
                    </div>
                    <div className="ml-6 grid grid-cols-2 gap-2">
                      {group.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`permission-${permission.id}`}
                            checked={newRole.permissions.includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission.id, checked)
                            }
                          />
                          <label 
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm"
                          >
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoleDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={saveNewRole}>
              创建角色
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑用户角色对话框 */}
      <Dialog open={isEditUserRoleDialogOpen} onOpenChange={setIsEditUserRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改用户角色</DialogTitle>
            <DialogDescription>
              为用户分配新的系统角色以更改其权限。
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-4">
                <div>
                  <div className="font-medium">{selectedUser.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                  <div className="mt-2 text-sm">
                    当前角色：<Badge variant="outline">{getRoleName(selectedUser.role)}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="new-role" className="text-right">
                  新角色
                </label>
                <Select defaultValue={selectedUser.role} className="col-span-3">
                  <SelectTrigger id="new-role">
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserRoleDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => saveUserRole(selectedUser?.id, selectedUser?.role)}>
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
