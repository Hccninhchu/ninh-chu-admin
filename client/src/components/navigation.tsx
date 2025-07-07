import { Button } from "@/components/ui/button";
import { Building2, Phone, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
}

export default function Navigation({ activeTab, setActiveTab, user }: NavigationProps) {
  const { logoutMutation } = useAuth();

  const tabs = [
    { id: "home", label: "Trang chủ", icon: "🏠" },
    { id: "procedures", label: "Bảng niêm yết thủ tục", icon: "📋" },
    { id: "services", label: "Dịch vụ hành chính", icon: "⚙️" },
    { id: "registration", label: "Đăng ký trước", icon: "📄" },
    { id: "feedback", label: "Góp ý đánh giá", icon: "💬" },
    { id: "contact", label: "Liên hệ", icon: "📞" },
    ...(user?.role === "admin" ? [{ id: "admin", label: "Quản trị", icon: "🛡️" }] : [])
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-gov-red text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gov-gold p-2 rounded-lg">
                <Building2 className="text-gov-red h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG</h1>
                <p className="text-sm opacity-90">PHƯỜNG NINH CHỬ - TỈNH KHÁNH HÒA</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm">Đường dây nóng</p>
                <p className="font-bold text-lg">0259.123.4567</p>
              </div>
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Xin chào, {user.fullName}</span>
                  <Button 
                    onClick={() => logoutMutation.mutate()}
                    variant="secondary" 
                    size="sm"
                    className="bg-white text-gov-red hover:bg-gray-100"
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <Link href="/auth">
                  <Button variant="secondary" className="bg-white text-gov-red hover:bg-gray-100">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng nhập
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-gov-red text-gov-red"
                    : "border-transparent text-gray-600 hover:text-gov-blue"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
