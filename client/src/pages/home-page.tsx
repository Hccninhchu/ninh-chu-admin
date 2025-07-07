import { useState } from "react";
import Navigation from "@/components/navigation";
import ProcedureBoard from "@/components/procedure-board";
import Chatbot from "@/components/chatbot";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Users, 
  Clock, 
  Star, 
  CheckCircle, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  FileText,
  MessageSquare,
  BarChart3,
  Settings
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home");
  const [chatOpen, setChatOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Fetch feedback stats
  const { data: feedbackStats } = useQuery({
    queryKey: ["/api/feedback/stats"],
  });

  // Admin queries
  const { data: adminApplications, refetch: refetchApplications } = useQuery({
    queryKey: ["/api/applications"],
    enabled: user?.role === "admin"
  });

  const { data: adminFeedbacks } = useQuery({
    queryKey: ["/api/feedback"],
    enabled: user?.role === "admin"
  });

  const { data: adminContacts } = useQuery({
    queryKey: ["/api/contacts"],
    enabled: user?.role === "admin"
  });

  const { data: adminProcedures, refetch: refetchProcedures } = useQuery({
    queryKey: ["/api/procedures"],
    enabled: user?.role === "admin"
  });

  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    citizenId: "",
    procedureId: "",
    notes: ""
  });

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    phone: "",
    rating: 0,
    category: "",
    content: ""
  });

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    content: ""
  });

  // Admin form states
  const [procedureForm, setProcedureForm] = useState({
    name: "",
    category: "",
    processingTime: "",
    description: "",
    requirements: ""
  });
  const [editingProcedure, setEditingProcedure] = useState<any>(null);
  const [adminTab, setAdminTab] = useState("procedures");

  // Application search
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  // Mutations
  const applicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/applications", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Đăng ký thành công",
        description: `Mã hồ sơ của bạn là: ${data.applicationCode}`,
      });
      setApplicationForm({
        fullName: "",
        phone: "",
        email: "",
        citizenId: "",
        procedureId: "",
        notes: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể đăng ký hồ sơ. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/feedback", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Cảm ơn bạn",
        description: "Góp ý của bạn đã được ghi nhận.",
      });
      setFeedbackForm({
        name: "",
        email: "",
        phone: "",
        rating: 0,
        category: "",
        content: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/stats"] });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể gửi góp ý. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/contacts", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Đã gửi tin nhắn",
        description: "Chúng tôi sẽ phản hồi trong vòng 24 giờ.",
      });
      setContactForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        content: ""
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("GET", `/api/applications/search/${code}`);
      return await res.json();
    },
    onSuccess: (data) => {
      setSearchResult(data);
    },
    onError: () => {
      toast({
        title: "Không tìm thấy",
        description: "Không tìm thấy hồ sơ với mã này.",
        variant: "destructive",
      });
      setSearchResult(null);
    },
  });

  // Admin mutations
  const createProcedureMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/procedures", {
        ...data,
        requirements: data.requirements ? data.requirements.split('\n').filter((r: string) => r.trim()) : []
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Thành công", description: "Đã thêm thủ tục mới" });
      setProcedureForm({ name: "", category: "", processingTime: "", description: "", requirements: "" });
      refetchProcedures();
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể thêm thủ tục", variant: "destructive" });
    },
  });

  const updateProcedureMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest("PUT", `/api/procedures/${id}`, {
        ...data,
        requirements: data.requirements ? data.requirements.split('\n').filter((r: string) => r.trim()) : []
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Thành công", description: "Đã cập nhật thủ tục" });
      setEditingProcedure(null);
      setProcedureForm({ name: "", category: "", processingTime: "", description: "", requirements: "" });
      refetchProcedures();
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể cập nhật thủ tục", variant: "destructive" });
    },
  });

  const deleteProcedureMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/procedures/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Thành công", description: "Đã xóa thủ tục" });
      refetchProcedures();
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể xóa thủ tục", variant: "destructive" });
    },
  });

  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await apiRequest("PUT", `/api/applications/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({ title: "Thành công", description: "Đã cập nhật trạng thái hồ sơ" });
      refetchApplications();
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({ title: "Lỗi", description: "Không thể cập nhật trạng thái", variant: "destructive" });
    },
  });

  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationForm.fullName || !applicationForm.phone || !applicationForm.citizenId || !applicationForm.procedureId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc.",
        variant: "destructive",
      });
      return;
    }
    applicationMutation.mutate(applicationForm);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.rating || !feedbackForm.category || !feedbackForm.content) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin.",
        variant: "destructive",
      });
      return;
    }
    feedbackMutation.mutate(feedbackForm);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.content) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc.",
        variant: "destructive",
      });
      return;
    }
    contactMutation.mutate(contactForm);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã hồ sơ.",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate(searchCode.trim());
  };

  const renderHomeTab = () => (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gov-blue to-blue-700 text-white rounded-xl p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Chào mừng đến với Trung tâm phục vụ hành chính công</h2>
            <p className="text-lg mb-6 opacity-90">Phường Ninh Chử cam kết phục vụ người dân với tinh thần trách nhiệm cao, thủ tục nhanh gọn, minh bạch và hiệu quả.</p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setChatOpen(true)} className="bg-gov-gold text-gov-blue hover:bg-yellow-400">
                <MessageSquare className="mr-2 h-4 w-4" />
                Hỏi đáp với AI
              </Button>
              <Button onClick={() => setActiveTab("registration")} variant="secondary">
                <FileText className="mr-2 h-4 w-4" />
                Đăng ký hồ sơ
              </Button>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-xl p-8">
              <Building2 className="mx-auto h-20 w-20 text-gov-gold mb-4" />
              <p className="text-lg font-medium">Phục vụ 24/7 trực tuyến</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats?.completedApplications || 0}</h3>
            <p className="text-gray-600">Hồ sơ đã giải quyết</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats?.processingApplications || 0}</h3>
            <p className="text-gray-600">Hồ sơ đang xử lý</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{feedbackStats?.average || 0}</h3>
            <p className="text-gray-600">Đánh giá hài lòng</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{stats?.totalApplications || 0}</h3>
            <p className="text-gray-600">Tổng hồ sơ đã tiếp nhận</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Highlights */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-gov-red text-white p-3 rounded-lg mr-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Tra cứu QR Code</h3>
            </div>
            <p className="text-gray-600 mb-4">Quét mã QR để xem chi tiết thủ tục hành chính và tài liệu cần thiết.</p>
            <Button variant="link" onClick={() => setActiveTab("procedures")} className="p-0 text-gov-blue">
              Xem bảng niêm yết →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-gov-blue text-white p-3 rounded-lg mr-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Đăng ký trực tuyến</h3>
            </div>
            <p className="text-gray-600 mb-4">Nộp hồ sơ trước khi đến trung tâm để tiết kiệm thời gian chờ đợi.</p>
            <Button variant="link" onClick={() => setActiveTab("registration")} className="p-0 text-gov-blue">
              Đăng ký ngay →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-gov-gold text-white p-3 rounded-lg mr-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Hỗ trợ 24/7</h3>
            </div>
            <p className="text-gray-600 mb-4">Chatbot AI hỗ trợ tra cứu thông tin và giải đáp thắc mắc mọi lúc.</p>
            <Button variant="link" onClick={() => setChatOpen(true)} className="p-0 text-gov-blue">
              Bắt đầu chat →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderServicesTab = () => (
    <Card>
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dịch vụ hành chính</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gov-blue">Lĩnh vực dịch vụ</h3>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setCategoryFilter("Hộ tịch");
                  setActiveTab("procedures");
                }}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-red-100 p-3 rounded-lg mr-4">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Hộ tịch - Căng cước công dân</h4>
                  <p className="text-sm text-gray-600">Khai sinh, kết hôn, cấp CCCD...</p>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400 ml-auto" />
              </button>
              
              <button
                onClick={() => {
                  setCategoryFilter("Đất đai");
                  setActiveTab("procedures");
                }}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Đất đai - Nhà đất</h4>
                  <p className="text-sm text-gray-600">Sổ đỏ, giấy phép xây dựng...</p>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400 ml-auto" />
              </button>
              
              <button
                onClick={() => {
                  setCategoryFilter("Kinh doanh");
                  setActiveTab("procedures");
                }}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Kinh doanh</h4>
                  <p className="text-sm text-gray-600">Đăng ký kinh doanh, giấy phép...</p>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400 ml-auto" />
              </button>

              <button
                onClick={() => {
                  setCategoryFilter("Xây dựng");
                  setActiveTab("procedures");
                }}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                  <Settings className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-medium">Xây dựng</h4>
                  <p className="text-sm text-gray-600">Giấy phép xây dựng, quy hoạch...</p>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-400 ml-auto" />
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gov-blue">Liên kết dịch vụ công</h3>
            <div className="space-y-4">
              <a href="https://dichvucong.gov.vn" target="_blank" rel="noopener noreferrer" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gov-blue">Cổng dịch vụ công quốc gia</h4>
                    <p className="text-sm text-gray-600">dichvucong.gov.vn</p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </div>
              </a>
              
              <a href="https://ninhthuan.gov.vn" target="_blank" rel="noopener noreferrer" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gov-blue">Cổng dịch vụ công tỉnh Ninh Thuận</h4>
                    <p className="text-sm text-gray-600">ninhthuan.gov.vn</p>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </div>
              </a>
            </div>
            
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Thống kê dịch vụ</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gov-blue">{stats?.totalProcedures || 0}</p>
                  <p className="text-sm text-gray-600">Dịch vụ trực tuyến</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">98.5%</p>
                  <p className="text-sm text-gray-600">Tỷ lệ hoàn thành</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderRegistrationTab = () => (
    <Card>
      <CardContent className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Đăng ký hồ sơ trước</h2>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleApplicationSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Họ và tên *</Label>
                  <Input 
                    id="fullName"
                    value={applicationForm.fullName}
                    onChange={(e) => setApplicationForm({...applicationForm, fullName: e.target.value})}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    value={applicationForm.phone}
                    onChange={(e) => setApplicationForm({...applicationForm, phone: e.target.value})}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={applicationForm.email}
                    onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                    placeholder="Nhập email"
                  />
                </div>
                <div>
                  <Label htmlFor="citizenId">CCCD/CMND *</Label>
                  <Input 
                    id="citizenId"
                    value={applicationForm.citizenId}
                    onChange={(e) => setApplicationForm({...applicationForm, citizenId: e.target.value})}
                    placeholder="Nhập số CCCD/CMND"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="procedure">Thủ tục cần thực hiện *</Label>
                <Select value={applicationForm.procedureId} onValueChange={(value) => setApplicationForm({...applicationForm, procedureId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thủ tục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Cấp lại CCCD do mất</SelectItem>
                    <SelectItem value="2">Cấp giấy chứng nhận quyền sử dụng đất</SelectItem>
                    <SelectItem value="3">Cấp phép xây dựng nhà ở</SelectItem>
                    <SelectItem value="4">Đăng ký kinh doanh hộ cá thể</SelectItem>
                    <SelectItem value="5">Khai sinh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea 
                  id="notes"
                  value={applicationForm.notes}
                  onChange={(e) => setApplicationForm({...applicationForm, notes: e.target.value})}
                  placeholder="Nhập ghi chú (nếu có)"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-4">
                <Button type="submit" disabled={applicationMutation.isPending}>
                  {applicationMutation.isPending ? "Đang xử lý..." : "Đăng ký"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setApplicationForm({
                  fullName: "",
                  phone: "",
                  email: "",
                  citizenId: "",
                  procedureId: "",
                  notes: ""
                })}>
                  Làm lại
                </Button>
              </div>
            </form>
          </div>
          
          <div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Tra cứu hồ sơ</h3>
              <form onSubmit={handleSearch} className="space-y-4">
                <Input 
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Nhập mã hồ sơ"
                />
                <Button type="submit" className="w-full bg-gov-gold text-white hover:bg-yellow-600" disabled={searchMutation.isPending}>
                  {searchMutation.isPending ? "Đang tìm..." : "Tra cứu"}
                </Button>
              </form>
              
              {searchResult && (
                <div className="mt-4 p-4 bg-white rounded border">
                  <h4 className="font-medium text-sm">{(searchResult as any).applicationCode}</h4>
                  <p className="text-xs text-gray-600">{(searchResult as any).fullName}</p>
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                    (searchResult as any).status === 'completed' ? 'bg-green-100 text-green-800' :
                    (searchResult as any).status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {(searchResult as any).status === 'completed' ? 'Hoàn thành' :
                     (searchResult as any).status === 'processing' ? 'Đang xử lý' : 'Chờ xử lý'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderFeedbackTab = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Góp ý đánh giá</h2>
          
          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
            <div>
              <Label htmlFor="feedbackName">Họ và tên</Label>
              <Input 
                id="feedbackName"
                value={feedbackForm.name}
                onChange={(e) => setFeedbackForm({...feedbackForm, name: e.target.value})}
                placeholder="Nhập họ và tên"
              />
            </div>
            
            <div>
              <Label htmlFor="feedbackEmail">Email/Số điện thoại</Label>
              <Input 
                id="feedbackEmail"
                value={feedbackForm.email}
                onChange={(e) => setFeedbackForm({...feedbackForm, email: e.target.value})}
                placeholder="Nhập email hoặc số điện thoại"
              />
            </div>
            
            <div>
              <Label>Đánh giá mức độ hài lòng</Label>
              <div className="flex space-x-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFeedbackForm({...feedbackForm, rating})}
                    className={`text-3xl transition-colors ${
                      feedbackForm.rating >= rating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">Nhấn vào sao để đánh giá</p>
            </div>
            
            <div>
              <Label htmlFor="feedbackContent">Nội dung góp ý</Label>
              <Textarea 
                id="feedbackContent"
                value={feedbackForm.content}
                onChange={(e) => setFeedbackForm({...feedbackForm, content: e.target.value})}
                placeholder="Chia sẻ ý kiến của bạn về chất lượng dịch vụ..."
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="feedbackCategory">Lĩnh vực đánh giá</Label>
              <Select value={feedbackForm.category} onValueChange={(value) => setFeedbackForm({...feedbackForm, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lĩnh vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service_quality">Chất lượng dịch vụ</SelectItem>
                  <SelectItem value="staff_attitude">Thái độ nhân viên</SelectItem>
                  <SelectItem value="processing_time">Thời gian xử lý</SelectItem>
                  <SelectItem value="facilities">Cơ sở vật chất</SelectItem>
                  <SelectItem value="website">Website/Ứng dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" className="w-full" disabled={feedbackMutation.isPending}>
              {feedbackMutation.isPending ? "Đang gửi..." : "Gửi góp ý"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Thống kê đánh giá</h3>
            
            {feedbackStats && (
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {rating === 5 ? 'Rất hài lòng' : 
                       rating === 4 ? 'Hài lòng' :
                       rating === 3 ? 'Bình thường' :
                       rating === 2 ? 'Không hài lòng' : 'Rất không hài lòng'} ({rating}★)
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            rating === 5 ? 'bg-green-500' :
                            rating === 4 ? 'bg-blue-500' :
                            rating === 3 ? 'bg-yellow-500' :
                            rating === 2 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${feedbackStats.ratings?.[`rating${rating}`] || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{feedbackStats.ratings?.[`rating${rating}`] || 0}%</span>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-gov-blue">{feedbackStats.average}</p>
                  <p className="text-gray-600">Điểm trung bình</p>
                  <div className="flex justify-center mt-2">
                    <span className="text-yellow-500">★★★★★</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin liên hệ</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-gov-red text-white p-3 rounded-lg">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Địa chỉ</h3>
                <p className="text-gray-600">123 Đường Phan Bội Châu, Phường Ninh Chử, TP. Phan Rang - Tháp Chàm, Tỉnh Ninh Thuận</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-gov-blue text-white p-3 rounded-lg">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Điện thoại</h3>
                <p className="text-gray-600">Đường dây nóng: <a href="tel:0259123456" className="text-gov-blue font-medium">0259.123.4567</a></p>
                <p className="text-gray-600">Fax: 0259.123.4568</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-gov-gold text-white p-3 rounded-lg">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-600">
                  <a href="mailto:ttphcninhchu@ninhthuan.gov.vn" className="text-gov-blue font-medium">ttphcninhchu@ninhthuan.gov.vn</a>
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-green-600 text-white p-3 rounded-lg">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Giờ làm việc</h3>
                <p className="text-gray-600">Thứ 2 - Thứ 6: 7:30 - 11:30, 13:30 - 17:00</p>
                <p className="text-gray-600">Thứ 7: 7:30 - 11:30</p>
                <p className="text-gray-600">Chủ nhật: Nghỉ</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Gửi tin nhắn</h3>
          
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Họ và tên *</Label>
                <Input 
                  id="contactName"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email *</Label>
                <Input 
                  id="contactEmail"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  placeholder="Nhập email"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="contactPhone">Số điện thoại</Label>
              <Input 
                id="contactPhone"
                type="tel"
                value={contactForm.phone}
                onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                placeholder="Nhập số điện thoại"
              />
            </div>
            
            <div>
              <Label htmlFor="contactSubject">Chủ đề *</Label>
              <Select value={contactForm.subject} onValueChange={(value) => setContactForm({...contactForm, subject: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chủ đề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inquiry">Hỏi đáp thủ tục</SelectItem>
                  <SelectItem value="suggestion">Phản ánh, kiến nghị</SelectItem>
                  <SelectItem value="complaint">Khiếu nại</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="contactContent">Nội dung *</Label>
              <Textarea 
                id="contactContent"
                value={contactForm.content}
                onChange={(e) => setContactForm({...contactForm, content: e.target.value})}
                placeholder="Nhập nội dung tin nhắn..."
                rows={4}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={contactMutation.isPending}>
              {contactMutation.isPending ? "Đang gửi..." : "Gửi tin nhắn"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminTab = () => (
    <div>
      <div className="bg-gov-red text-white p-6 rounded-xl mb-8">
        <h2 className="text-2xl font-bold mb-2">Bảng điều khiển quản trị</h2>
        <p className="opacity-90">Quản lý thủ tục, hồ sơ và thống kê của hệ thống</p>
      </div>

      {/* Admin Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "procedures", label: "Quản lý thủ tục", icon: "📋" },
            { id: "applications", label: "Quản lý hồ sơ", icon: "📄" },
            { id: "feedback", label: "Quản lý góp ý", icon: "💬" },
            { id: "contacts", label: "Quản lý liên hệ", icon: "📞" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                adminTab === tab.id
                  ? "bg-gov-blue text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Procedures Management */}
      {adminTab === "procedures" && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add/Edit Procedure Form */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingProcedure ? "Chỉnh sửa thủ tục" : "Thêm thủ tục mới"}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingProcedure) {
                  updateProcedureMutation.mutate({ id: editingProcedure.id, data: procedureForm });
                } else {
                  createProcedureMutation.mutate(procedureForm);
                }
              }} className="space-y-4">
                <div>
                  <Label htmlFor="procedureName">Tên thủ tục *</Label>
                  <Input
                    id="procedureName"
                    value={procedureForm.name}
                    onChange={(e) => setProcedureForm({...procedureForm, name: e.target.value})}
                    placeholder="Nhập tên thủ tục"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="procedureCategory">Lĩnh vực *</Label>
                  <Select value={procedureForm.category} onValueChange={(value) => setProcedureForm({...procedureForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lĩnh vực" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hộ tịch">Hộ tịch</SelectItem>
                      <SelectItem value="Căng cước công dân">Căng cước công dân</SelectItem>
                      <SelectItem value="Đất đai">Đất đai</SelectItem>
                      <SelectItem value="Kinh doanh">Kinh doanh</SelectItem>
                      <SelectItem value="Xây dựng">Xây dựng</SelectItem>
                      <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="procedureTime">Thời gian xử lý *</Label>
                  <Input
                    id="procedureTime"
                    value={procedureForm.processingTime}
                    onChange={(e) => setProcedureForm({...procedureForm, processingTime: e.target.value})}
                    placeholder="VD: 5 ngày làm việc"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="procedureDesc">Mô tả</Label>
                  <Textarea
                    id="procedureDesc"
                    value={procedureForm.description}
                    onChange={(e) => setProcedureForm({...procedureForm, description: e.target.value})}
                    placeholder="Mô tả chi tiết thủ tục"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="procedureReq">Giấy tờ cần thiết (mỗi dòng một loại)</Label>
                  <Textarea
                    id="procedureReq"
                    value={procedureForm.requirements}
                    onChange={(e) => setProcedureForm({...procedureForm, requirements: e.target.value})}
                    placeholder="VD:&#10;Đơn đề nghị&#10;Bản sao CCCD&#10;Giấy khai sinh"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createProcedureMutation.isPending || updateProcedureMutation.isPending}>
                    {editingProcedure ? "Cập nhật" : "Thêm mới"}
                  </Button>
                  {editingProcedure && (
                    <Button type="button" variant="outline" onClick={() => {
                      setEditingProcedure(null);
                      setProcedureForm({ name: "", category: "", processingTime: "", description: "", requirements: "" });
                    }}>
                      Hủy
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Procedures List */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Danh sách thủ tục ({adminProcedures?.length || 0})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {adminProcedures?.map((procedure: any) => (
                  <div key={procedure.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{procedure.name}</h4>
                        <p className="text-sm text-gray-600">{procedure.category} • {procedure.processingTime}</p>
                        {procedure.description && (
                          <p className="text-sm text-gray-500 mt-1">{procedure.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingProcedure(procedure);
                            setProcedureForm({
                              name: procedure.name,
                              category: procedure.category,
                              processingTime: procedure.processingTime,
                              description: procedure.description || "",
                              requirements: procedure.requirements?.join('\n') || ""
                            });
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm("Bạn có chắc muốn xóa thủ tục này?")) {
                              deleteProcedureMutation.mutate(procedure.id);
                            }
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!adminProcedures || adminProcedures.length === 0) && (
                  <p className="text-gray-500 text-center py-4">Chưa có thủ tục nào</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Applications Management */}
      {adminTab === "applications" && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Quản lý hồ sơ ({adminApplications?.length || 0})</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Mã hồ sơ</th>
                    <th className="text-left p-2">Họ tên</th>
                    <th className="text-left p-2">SĐT</th>
                    <th className="text-left p-2">Thủ tục</th>
                    <th className="text-left p-2">Trạng thái</th>
                    <th className="text-left p-2">Ngày nộp</th>
                    <th className="text-left p-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {adminApplications?.map((app: any) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-sm">{app.applicationCode}</td>
                      <td className="p-2">{app.fullName}</td>
                      <td className="p-2">{app.phone}</td>
                      <td className="p-2">{app.procedureId}</td>
                      <td className="p-2">
                        <Select value={app.status} onValueChange={(status) => updateApplicationStatusMutation.mutate({ id: app.id, status })}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="processing">Đang xử lý</SelectItem>
                            <SelectItem value="completed">Hoàn thành</SelectItem>
                            <SelectItem value="rejected">Từ chối</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2 text-sm">{new Date(app.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="p-2">
                        <Button size="sm" variant="outline">Chi tiết</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!adminApplications || adminApplications.length === 0) && (
                <p className="text-gray-500 text-center py-8">Chưa có hồ sơ nào</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Management */}
      {adminTab === "feedback" && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Quản lý góp ý ({adminFeedbacks?.length || 0})</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {adminFeedbacks?.map((fb: any) => (
                <div key={fb.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{fb.name || "Ẩn danh"}</p>
                      <p className="text-sm text-gray-600">{fb.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < fb.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">{new Date(fb.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  <p className="text-gray-700">{fb.content}</p>
                  {fb.email && <p className="text-xs text-gray-500 mt-1">Email: {fb.email}</p>}
                  {fb.phone && <p className="text-xs text-gray-500">SĐT: {fb.phone}</p>}
                </div>
              ))}
              {(!adminFeedbacks || adminFeedbacks.length === 0) && (
                <p className="text-gray-500 text-center py-4">Chưa có góp ý nào</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contacts Management */}
      {adminTab === "contacts" && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4">Quản lý liên hệ ({adminContacts?.length || 0})</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {adminContacts?.map((contact: any) => (
                <div key={contact.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.subject}</p>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(contact.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <p className="text-gray-700 mb-2">{contact.content}</p>
                  <div className="text-xs text-gray-500">
                    <p>Email: {contact.email}</p>
                    {contact.phone && <p>SĐT: {contact.phone}</p>}
                  </div>
                </div>
              ))}
              {(!adminContacts || adminContacts.length === 0) && (
                <p className="text-gray-500 text-center py-4">Chưa có liên hệ nào</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        user={user}
      />
      
      <main className="container mx-auto px-4 py-8">
        {activeTab === "home" && renderHomeTab()}
        {activeTab === "procedures" && <ProcedureBoard />}
        {activeTab === "services" && renderServicesTab()}
        {activeTab === "registration" && renderRegistrationTab()}
        {activeTab === "feedback" && renderFeedbackTab()}
        {activeTab === "contact" && renderContactTab()}
        {activeTab === "admin" && user?.role === "admin" && renderAdminTab()}
      </main>

      <Chatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      <footer className="bg-gray-800 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Trung tâm phục vụ hành chính công</h3>
              <p className="text-gray-300">Phường Ninh Chử, TP. Nha Trang, Tỉnh Khánh Hòa</p>
              <p className="text-gray-300 mt-2">Phục vụ tận tình - Giải quyết nhanh chóng - Minh bạch hiệu quả</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên kết hữu ích</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="https://dichvucong.gov.vn" className="hover:text-white">Cổng dịch vụ công quốc gia</a></li>
                <li><a href="https://ninhthuan.gov.vn" className="hover:text-white">UBND tỉnh Ninh Thuận</a></li>
                <li><a href="#" className="hover:text-white">Cổng thông tin điện tử</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Kết nối</h3>
              <div className="flex space-x-4">
                <a href="#" className="bg-blue-600 p-2 rounded hover:bg-blue-700 transition-colors">
                  <span className="sr-only">Facebook</span>
                  📘
                </a>
                <a href="#" className="bg-red-600 p-2 rounded hover:bg-red-700 transition-colors">
                  <span className="sr-only">YouTube</span>
                  📹
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Trung tâm phục vụ hành chính công phường Ninh Chử. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
