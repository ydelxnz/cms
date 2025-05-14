"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Camera,
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
  Star,
  Clock,
  MapPin,
  Check,
  X,
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

// 摄影师接口定义
interface Photographer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    specialties?: string[];
    rating?: number;
    reviewCount?: number;
    completedSessions?: number;
    availability?: string;
    location?: string;
    bio?: string;
    hourlyRate?: number;
    featured?: boolean;
  };
}

export default function PhotographersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // 获取摄影师数据
    const fetchPhotographers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users?role=photographer');
        if (!response.ok) {
          throw new Error('获取摄影师数据失败');
        }
        const data = await response.json();
        setPhotographers(data);
      } catch (error) {
        console.error('Error fetching photographers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPhotographers();
  }, []);

  const handleDeletePhotographer = async () => {
    if (!selectedPhotographer) return;

    try {
      const response = await fetch(`/api/users/${selectedPhotographer.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除摄影师失败');
      }

      // 更新本地状态
      setPhotographers(prev => prev.filter(photographer => photographer.id !== selectedPhotographer.id));
      setIsDeleteDialogOpen(false);
      setSelectedPhotographer(null);
    } catch (error) {
      console.error('Error deleting photographer:', error);
    }
  };

  // 获取所有专业领域用于筛选
  const allSpecialties = Array.from(
    new Set(photographers.flatMap(photographer => photographer.profile?.specialties || []))
  );

  const filteredPhotographers = photographers.filter(photographer => {
    // Filter by search query
    if (searchQuery && 
        !photographer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !photographer.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !photographer.phone?.includes(searchQuery)) {
      return false;
    }
    
    // Filter by specialty
    if (specialtyFilter !== "all" && !photographer.profile?.specialties?.includes(specialtyFilter)) {
      return false;
    }
    
    // Filter by availability
    if (availabilityFilter !== "all" && photographer.profile?.availability !== availabilityFilter) {
      return false;
    }
    
    return true;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPhotographers.length / itemsPerPage);
  const paginatedPhotographers = filteredPhotographers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">摄影师管理</h2>
      </div>

      <Tabs value="all" onValueChange={() => {}} className="w-full">
        <TabsList>
          <TabsTrigger value="all">全部摄影师</TabsTrigger>
          <TabsTrigger value="available">可预约</TabsTrigger>
          <TabsTrigger value="unavailable">休假中</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>摄影师列表</CardTitle>
              <CardDescription>
                管理您的摄影师团队，包括专业领域、评价和预约情况。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex w-full items-center gap-2 md:w-auto">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索摄影师名称、邮箱或电话..."
                    className="w-full md:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="专业领域" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部领域</SelectItem>
                      {allSpecialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="可用状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="available">可预约</SelectItem>
                      <SelectItem value="unavailable">休假中</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : paginatedPhotographers.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>摄影师</TableHead>
                        <TableHead>专业领域</TableHead>
                        <TableHead>评价</TableHead>
                        <TableHead>完成预约</TableHead>
                        <TableHead>时薪</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPhotographers.map((photographer) => (
                        <TableRow key={photographer.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{photographer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{photographer.name}</div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  <span>{photographer.profile?.location}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {photographer.profile?.specialties?.map(specialty => (
                                <Badge key={specialty} variant="outline">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{photographer.profile?.rating}</span>
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({photographer.profile?.reviewCount})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{photographer.profile?.completedSessions} 次</TableCell>
                          <TableCell>¥{photographer.profile?.hourlyRate}/小时</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                photographer.profile?.availability === "available"
                                  ? "bg-green-50 text-green-700 hover:bg-green-50"
                                  : "bg-red-50 text-red-700 hover:bg-red-50"
                              }
                            >
                              {photographer.profile?.availability === "available" ? "可预约" : "休假中"}
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
                                  <Calendar className="mr-2 h-4 w-4" /> 查看日程
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {photographer.profile?.featured ? (
                                    <>
                                      <X className="mr-2 h-4 w-4" /> 取消特色
                                    </>
                                  ) : (
                                    <>
                                      <Check className="mr-2 h-4 w-4" /> 设为特色
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedPhotographer(photographer);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> 删除摄影师
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
                  <Camera className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">未找到匹配的摄影师</p>
                </div>
              )}

              {filteredPhotographers.length > 0 && (
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <div className="text-sm text-muted-foreground">
                    显示 {paginatedPhotographers.length} 条，共 {filteredPhotographers.length} 条
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
        
        <TabsContent value="featured" className="space-y-4">
          {/* 特色摄影师内容 */}
          <Card>
            <CardHeader>
              <CardTitle>特色摄影师</CardTitle>
              <CardDescription>管理首页和推荐位置展示的特色摄影师。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {photographers
                  .filter(photographer => photographer.profile?.featured)
                  .map((photographer) => (
                    <Card key={photographer.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted"></div>
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{photographer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-lg">{photographer.name}</CardTitle>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            特色
                          </Badge>
                        </div>
                        <CardDescription className="mt-2">
                          {photographer.profile?.specialties?.join(" • ")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{photographer.profile?.rating}</span>
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({photographer.profile?.reviewCount})
                              </span>
                            </div>
                            <span>¥{photographer.profile?.hourlyRate}/小时</span>
                          </div>
                          <p className="line-clamp-2 text-muted-foreground">
                            {photographer.profile?.bio}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button variant="outline" size="sm" className="w-full">
                          管理特色位置
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="available" className="space-y-4">
          {/* 可预约摄影师内容 */}
          <Card>
            <CardHeader>
              <CardTitle>可预约摄影师</CardTitle>
              <CardDescription>
                当前可接受预约的摄影师列表。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>摄影师</TableHead>
                      <TableHead>专业领域</TableHead>
                      <TableHead>评价</TableHead>
                      <TableHead>本月预约</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {photographers
                      .filter(photographer => photographer.profile?.availability === "available")
                      .map((photographer) => (
                        <TableRow key={photographer.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{photographer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{photographer.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {photographer.profile?.specialties?.join(", ")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{photographer.profile?.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>12 次</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              查看日程
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
        
        <TabsContent value="unavailable" className="space-y-4">
          {/* 休假中摄影师内容 */}
          <Card>
            <CardHeader>
              <CardTitle>休假中摄影师</CardTitle>
              <CardDescription>
                当前处于休假状态的摄影师列表。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>摄影师</TableHead>
                      <TableHead>休假开始</TableHead>
                      <TableHead>预计返回</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {photographers
                      .filter(photographer => photographer.profile?.availability === "unavailable")
                      .map((photographer) => (
                        <TableRow key={photographer.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{photographer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{photographer.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            2025-04-20
                          </TableCell>
                          <TableCell>
                            2025-05-05
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              设为可用
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

      {/* Delete Photographer Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除摄影师</DialogTitle>
            <DialogDescription>
              您确定要删除此摄影师吗？此操作不可撤销，摄影师的所有数据将被永久删除。
            </DialogDescription>
          </DialogHeader>
          {selectedPhotographer && (
            <div className="py-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{selectedPhotographer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedPhotographer.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedPhotographer.email}</div>
                    <div className="text-sm text-muted-foreground">{selectedPhotographer.phone}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeletePhotographer}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
