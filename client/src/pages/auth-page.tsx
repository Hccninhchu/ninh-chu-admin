import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Shield, Users, Clock } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ 
    username: "", 
    password: "", 
    fullName: "",
    role: "user"
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8">
        {/* Auth Forms */}
        <div className="flex flex-col justify-center">
          <div className="mx-auto w-full max-w-md">
            <div className="text-center mb-8">
              <div className="bg-gov-red text-white p-3 rounded-lg inline-block mb-4">
                <Building2 className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Đăng nhập hệ thống
              </h2>
              <p className="mt-2 text-gray-600">
                Trung tâm phục vụ hành chính công phường Ninh Chử
              </p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register">Đăng ký</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Đăng nhập</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-username">Tên đăng nhập</Label>
                        <Input
                          id="login-username"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                          placeholder="Nhập tên đăng nhập"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-password">Mật khẩu</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                          placeholder="Nhập mật khẩu"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gov-blue hover:bg-blue-700"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Đăng ký tài khoản</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="register-fullname">Họ và tên</Label>
                        <Input
                          id="register-fullname"
                          value={registerForm.fullName}
                          onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                          placeholder="Nhập họ và tên"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-username">Tên đăng nhập</Label>
                        <Input
                          id="register-username"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                          placeholder="Nhập tên đăng nhập"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="register-password">Mật khẩu</Label>
                        <Input
                          id="register-password"
                          type="password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                          placeholder="Nhập mật khẩu"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gov-blue hover:bg-blue-700"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Hero Section */}
        <div className="hidden lg:flex flex-col justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-gov-red text-white p-4 rounded-lg inline-block mb-4">
                <Shield className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Hệ thống quản lý hành chính công
              </h3>
              <p className="text-gray-600 text-lg">
                Dịch vụ hành chính công minh bạch, hiệu quả, phục vụ người dân tốt nhất
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-lg mb-3">
                  <Users className="h-8 w-8 text-blue-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-800">Dễ sử dụng</h4>
                <p className="text-sm text-gray-600">Giao diện thân thiện, dễ tiếp cận</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-lg mb-3">
                  <Clock className="h-8 w-8 text-green-600 mx-auto" />
                </div>
                <h4 className="font-semibold text-gray-800">Nhanh chóng</h4>
                <p className="text-sm text-gray-600">Xử lý hồ sơ nhanh chóng, hiệu quả</p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-3">Các tính năng chính:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Đăng ký hồ sơ trực tuyến</li>
                <li>• Tra cứu thủ tục qua QR Code</li>
                <li>• Theo dõi tiến độ xử lý</li>
                <li>• Góp ý và đánh giá dịch vụ</li>
                <li>• Hỗ trợ chatbot 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
