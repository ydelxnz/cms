"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, userService, bookingService, photoService, orderService, reviewService } from "@/lib/services";
import { Loader2 } from "lucide-react";

interface ApiResponse {
  message?: string;
  timestamp?: string;
  status?: string;
  receivedData?: any;
  [key: string]: any;
}

export default function TestApiPage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [getResponse, setGetResponse] = useState<ApiResponse | null>(null);
  const [postResponse, setPostResponse] = useState<ApiResponse | null>(null);
  const [serviceResponse, setServiceResponse] = useState<ApiResponse | null>(null);
  const [isLoadingGet, setIsLoadingGet] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [isLoadingService, setIsLoadingService] = useState(false);
  const [postData, setPostData] = useState<string>("{\n  \"name\": \"测试用户\",\n  \"email\": \"test@example.com\"\n}");
  const [selectedService, setSelectedService] = useState<string>("userService");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [methodParams, setMethodParams] = useState<string>("{}");
  const [error, setError] = useState<string | null>(null);

  // 服务方法映射
  const serviceMethods: Record<string, string[]> = {
    userService: ["getCurrentUser", "getAllUsers", "getUserById"],
    bookingService: ["getAllBookings", "getClientBookings", "getPhotographerBookings", "getBookingById"],
    photoService: ["getAllPhotoSessions", "getClientPhotoSessions", "getPhotographerPhotoSessions", "getPhotoSessionById"],
    orderService: ["getAllOrders", "getClientOrders", "getOrderById"],
    reviewService: ["getAllReviews", "getPhotographerReviews", "getClientReviews", "getReviewById"]
  };

  // 当选择的服务变化时，重置方法选择
  useEffect(() => {
    setSelectedMethod("");
    setMethodParams("{}");
  }, [selectedService]);

  const handleTestGet = async () => {
    try {
      setIsLoadingGet(true);
      setError(null);
      
      const response = await api.get('/test');
      setGetResponse(response.data);
    } catch (err) {
      console.error("GET请求失败:", err);
      setError("GET请求失败，请查看控制台了解详情");
    } finally {
      setIsLoadingGet(false);
    }
  };

  const handleTestPost = async () => {
    try {
      setIsLoadingPost(true);
      setError(null);
      
      let dataToSend;
      try {
        dataToSend = JSON.parse(postData);
      } catch (parseError) {
        setError("JSON解析失败，请检查格式");
        setIsLoadingPost(false);
        return;
      }
      
      const response = await api.post('/test', dataToSend);
      setPostResponse(response.data);
    } catch (err) {
      console.error("POST请求失败:", err);
      setError("POST请求失败，请查看控制台了解详情");
    } finally {
      setIsLoadingPost(false);
    }
  };

  const handleTestService = async () => {
    if (!selectedService || !selectedMethod) {
      setError("请选择服务和方法");
      return;
    }

    try {
      setIsLoadingService(true);
      setError(null);
      setServiceResponse(null);
      
      // 解析参数
      let params;
      try {
        params = JSON.parse(methodParams);
      } catch (parseError) {
        setError("参数JSON解析失败，请检查格式");
        setIsLoadingService(false);
        return;
      }

      // 根据选择的服务和方法调用相应的API
      let response;
      const service = eval(selectedService);
      
      if (typeof service[selectedMethod] === 'function') {
        if (Object.keys(params).length > 0) {
          response = await service[selectedMethod](params);
        } else {
          response = await service[selectedMethod]();
        }
        
        setServiceResponse(response);
      } else {
        setError(`方法 ${selectedMethod} 在 ${selectedService} 中不存在`);
      }
    } catch (err) {
      console.error("服务调用失败:", err);
      setError(`服务调用失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsLoadingService(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">API集成测试</h1>
      
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">基础API测试</TabsTrigger>
          <TabsTrigger value="services">服务API测试</TabsTrigger>
          <TabsTrigger value="responses">响应结果</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>测试GET请求</CardTitle>
                <CardDescription>测试与API的GET请求集成</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  点击下面的按钮发送GET请求到 /api/test 端点
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button onClick={handleTestGet} disabled={isLoadingGet}>
                  {isLoadingGet ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      请求中...
                    </>
                  ) : "发送GET请求"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>测试POST请求</CardTitle>
                <CardDescription>测试与API的POST请求集成</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="postData">POST数据 (JSON格式)</Label>
                  <Textarea
                    id="postData"
                    value={postData}
                    onChange={(e) => setPostData(e.target.value)}
                    className="font-mono"
                    rows={5}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button onClick={handleTestPost} disabled={isLoadingPost}>
                  {isLoadingPost ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      请求中...
                    </>
                  ) : "发送POST请求"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>测试服务API</CardTitle>
              <CardDescription>测试各种服务API的调用</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="service">选择服务</Label>
                  <Select 
                    value={selectedService} 
                    onValueChange={setSelectedService}
                  >
                    <SelectTrigger id="service">
                      <SelectValue placeholder="选择服务" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(serviceMethods).map(service => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="method">选择方法</Label>
                  <Select 
                    value={selectedMethod} 
                    onValueChange={setSelectedMethod}
                    disabled={!selectedService}
                  >
                    <SelectTrigger id="method">
                      <SelectValue placeholder="选择方法" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedService && serviceMethods[selectedService]?.map(method => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="params">参数 (JSON格式)</Label>
                <Textarea
                  id="params"
                  value={methodParams}
                  onChange={(e) => setMethodParams(e.target.value)}
                  className="font-mono"
                  rows={5}
                  placeholder='{"id": "123"} 或者留空 {}'
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                onClick={handleTestService} 
                disabled={isLoadingService || !selectedService || !selectedMethod}
              >
                {isLoadingService ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    请求中...
                  </>
                ) : "调用服务方法"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="responses">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>GET响应</CardTitle>
              </CardHeader>
              <CardContent>
                {getResponse ? (
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-gray-100 p-4 text-sm">
                    {JSON.stringify(getResponse, null, 2)}
                  </pre>
                ) : (
                  <p className="text-center text-muted-foreground">暂无响应数据</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>POST响应</CardTitle>
              </CardHeader>
              <CardContent>
                {postResponse ? (
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-gray-100 p-4 text-sm">
                    {JSON.stringify(postResponse, null, 2)}
                  </pre>
                ) : (
                  <p className="text-center text-muted-foreground">暂无响应数据</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>服务调用响应</CardTitle>
              </CardHeader>
              <CardContent>
                {serviceResponse ? (
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-gray-100 p-4 text-sm">
                    {JSON.stringify(serviceResponse, null, 2)}
                  </pre>
                ) : (
                  <p className="text-center text-muted-foreground">暂无响应数据</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 