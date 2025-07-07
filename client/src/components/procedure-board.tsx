import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import QRCodeGenerator from "./qr-code-generator";
import { Search } from "lucide-react";

export default function ProcedureBoard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data: procedures, isLoading } = useQuery({
    queryKey: ["/api/procedures"],
  });

  const filteredProcedures = procedures?.filter((procedure: any) => {
    const matchesSearch = procedure.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === "all" || procedure.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = [...new Set(procedures?.map((p: any) => p.category) || [])];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách thủ tục...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gov-red text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gov-gold p-3 rounded-lg mr-4">
            <span className="text-gov-red text-2xl">🏛️</span>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold">TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG PHƯỜNG NINH CHỬ</h2>
            <h3 className="text-xl font-semibold mt-2">BẢNG NIÊM YẾT</h3>
            <p className="text-sm opacity-90 mt-1">BỘ THỦ TỤC HÀNH CHÍNH THUỘC PHẠM VI GIẢI QUYẾT CỦA ỦY BAN NHÂN DÂN PHƯỜNG NINH CHỬ</p>
          </div>
        </div>
      </div>

      <Card className="rounded-t-none">
        <CardContent className="p-6">
          {/* Search and Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              <Input
                placeholder="Tìm kiếm thủ tục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-64"
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tất cả lĩnh vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-gov-blue hover:bg-blue-700">
                <Search className="mr-2 h-4 w-4" />
                Tìm kiếm
              </Button>
            </div>
          </div>

          {/* Procedures Grid */}
          {filteredProcedures.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Không tìm thấy thủ tục nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProcedures.map((procedure: any) => (
                <div key={procedure.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="bg-gov-red text-white p-3 rounded-lg text-center mb-3">
                    <h4 className="font-semibold text-sm">LĨNH VỰC</h4>
                    <h4 className="font-semibold text-sm">{procedure.category.toUpperCase()}</h4>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <div className="bg-white p-2 rounded mb-2">
                      <QRCodeGenerator 
                        data={`${window.location.origin}/procedure/${procedure.id}`}
                        size={96}
                      />
                    </div>
                    <p className="text-xs font-medium">{procedure.name}</p>
                    <p className="text-xs text-gray-600 mt-1">Thời gian: {procedure.processingTime}</p>
                    {procedure.description && (
                      <p className="text-xs text-gray-500 mt-1">{procedure.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredProcedures.length > 0 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex space-x-2">
                <button className="px-3 py-2 bg-gov-blue text-white rounded-lg">1</button>
                <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">2</button>
                <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">3</button>
                <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">→</button>
              </nav>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
