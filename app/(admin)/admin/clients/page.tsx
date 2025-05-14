"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Calendar,
  Mail,
  Phone,
  UserCheck,
  UserX,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 客户接口定义
interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    lastActive?: string;
    bookingsCount?: number;
    ordersCount?: number;
    totalSpent?: number;
    status?: string;
    vip?: boolean;
  };
}

export default function ClientsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vipFilter, setVipFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // 获取客户数据
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users?role=client');
        if (!response.ok) {
          throw new Error('获取客户数据失败');
        }
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  const handleDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      const response = await fetch(`/api/users/${selectedClient.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除客户失败');
      }

      // 更新本地状态
      setClients(prev => prev.filter(client => client.id !== selectedClient.id));
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const filteredClients = clients.filter(client => {
    // Filter by search query
    if (searchQuery && 
        !client.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !client.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !client.phone?.includes(searchQuery)) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== "all" && client.profile?.status !== statusFilter) {
      return false;
    }
    
    // Filter by VIP status
    if (vipFilter === "vip" && !client.profile?.vip) {
      return false;
    } else if (vipFilter === "regular" && client.profile?.vip) {
      return false;
    }
    
    return true;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">客户管理</h2>
      </div>

      <Tabs value="all" onValueChange={() => {}} className="w-full">        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>客户列表</CardTitle>
              <CardDescription>
                管理您的所有客户信息，包括联系方式、预约和消费记录。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex w-full items-center gap-2 md:w-auto">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索客户名称、邮箱或电话..."
                    className="w-full md:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="客户状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="active">活跃</SelectItem>
                      <SelectItem value="inactive">非活跃</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={vipFilter} onValueChange={setVipFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="VIP状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部客户</SelectItem>
                      <SelectItem value="vip">VIP客户</SelectItem>
                      <SelectItem value="regular">普通客户</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : paginatedClients.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>客户名称</TableHead>
                        <TableHead>联系方式</TableHead>
                        <TableHead>注册日期</TableHead>
                        <TableHead>预约次数</TableHead>
                        <TableHead>总消费</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{client.name}</div>
                                {client.profile?.vip && (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                                    VIP
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="mr-1 h-3 w-3" />
                                <span>{client.email}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Phone className="mr-1 h-3 w-3" />
                                <span>{client.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {format(new Date(client.createdAt), "yyyy-MM-dd")}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="mr-1 h-3 w-3" />
                                <span>
                                  最近活跃: {format(new Date(client.updatedAt), "yyyy-MM-dd")}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">{client.profile?.bookingsCount} 次预约</div>
                              <div className="text-xs text-muted-foreground">
                                {client.profile?.ordersCount} 次订单
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>¥{client.profile?.totalSpent?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                client.profile?.status === "active"
                                  ? "bg-green-50 text-green-700 hover:bg-green-50"
                                  : "bg-gray-50 text-gray-700 hover:bg-gray-50"
                              }
                            >
                              {client.profile?.status === "active" ? "活跃" : "非活跃"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" /> 编辑信息
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" /> 查看预约
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {client.profile?.vip ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" /> 取消VIP
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" /> 设为VIP
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> 删除客户
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed">
                  <Users className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">未找到匹配的客户</p>
                </div>
              )}

              {filteredClients.length > 0 && (
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <div className="text-sm text-muted-foreground">
                    显示 {paginatedClients.length} 条，共 {filteredClients.length} 条
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                            }
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={page === currentPage}
                            size="default"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1);
                            }
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vip" className="space-y-4">
          {/* VIP客户内容与全部客户类似，但已预先筛选 */}
          <Card>
            <CardHeader>
              <CardTitle>VIP客户</CardTitle>
              <CardDescription>管理您的VIP客户，提供特殊服务和优惠。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>客户名称</TableHead>
                      <TableHead>联系方式</TableHead>
                      <TableHead>注册日期</TableHead>
                      <TableHead>预约次数</TableHead>
                      <TableHead>总消费</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients
                      .filter(client => client.profile?.vip)
                      .map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{client.name}</div>
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                                  VIP
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="mr-1 h-3 w-3" />
                                <span>{client.email}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Phone className="mr-1 h-3 w-3" />
                                <span>{client.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(client.createdAt), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell>{client.profile?.bookingsCount} 次预约</TableCell>
                          <TableCell>¥{client.profile?.totalSpent?.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              管理VIP
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {/* 活跃客户标签内容 */}
          <Card>
            <CardHeader>
              <CardTitle>活跃客户</CardTitle>
              <CardDescription>
                最近30天内有活动的客户。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>客户名称</TableHead>
                      <TableHead>最近活跃</TableHead>
                      <TableHead>预约次数</TableHead>
                      <TableHead>总消费</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients
                      .filter(client => client.profile?.status === "active")
                      .map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{client.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(client.updatedAt), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell>{client.profile?.bookingsCount} 次预约</TableCell>
                          <TableCell>¥{client.profile?.totalSpent?.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              查看活动
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive" className="space-y-4">
          {/* 非活跃客户标签内容 */}
          <Card>
            <CardHeader>
              <CardTitle>非活跃客户</CardTitle>
              <CardDescription>
                超过30天没有活动的客户，可以考虑发送营销邮件重新激活。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>客户名称</TableHead>
                      <TableHead>最后活跃</TableHead>
                      <TableHead>注册日期</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients
                      .filter(client => client.profile?.status === "inactive")
                      .map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{client.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(client.updatedAt), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(client.createdAt), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              发送邮件
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Client Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除客户</DialogTitle>
            <DialogDescription>
              您确定要删除此客户吗？此操作不可撤销，客户的所有数据将被永久删除。
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="py-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedClient.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedClient.email}</div>
                    <div className="text-sm text-muted-foreground">{selectedClient.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteClient}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
