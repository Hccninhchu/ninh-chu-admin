import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, MessageSquare, Send } from "lucide-react";

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý AI của Trung tâm phục vụ hành chính công phường Ninh Chử. Tôi có thể giúp bạn:\n• Tra cứu thủ tục hành chính\n• Hướng dẫn nộp hồ sơ\n• Giải đáp thắc mắc",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: getBotResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("cccd") || input.includes("căn cước")) {
      return "Để cấp lại CCCD do mất, bạn cần chuẩn bị:\n• Đơn đề nghị cấp lại\n• Bản sao Giấy khai sinh\n• 2 ảnh 3x4 chụp không quá 6 tháng\n• Phí: 15.000 VNĐ\nThời gian xử lý: 7 ngày làm việc.";
    }
    
    if (input.includes("khai sinh")) {
      return "Để làm thủ tục khai sinh, bạn cần:\n• Giấy chứng sinh\n• Bản sao CCCD/CMND của bố mẹ\n• Giấy đăng ký kết hôn (nếu có)\nThời gian xử lý: 3 ngày làm việc.\nPhí: Miễn phí.";
    }
    
    if (input.includes("đất đai") || input.includes("sổ đỏ")) {
      return "Để cấp giấy chứng nhận quyền sử dụng đất, bạn cần:\n• Đơn đề nghị\n• Bản sao CCCD/CMND\n• Giấy tờ chứng minh quyền sử dụng đất\n• Bản đồ hiện trạng sử dụng đất\nThời gian xử lý: 15 ngày làm việc.";
    }
    
    if (input.includes("kinh doanh")) {
      return "Để đăng ký kinh doanh hộ cá thể, bạn cần:\n• Đơn đăng ký kinh doanh\n• Bản sao CCCD/CMND\n• Giấy tờ chứng minh địa điểm kinh doanh\nThời gian xử lý: 5 ngày làm việc.\nPhí: 100.000 VNĐ.";
    }
    
    if (input.includes("giờ làm việc") || input.includes("thời gian")) {
      return "Giờ làm việc của Trung tâm:\n• Thứ 2 - Thứ 6: 7:30 - 11:30, 13:30 - 17:00\n• Thứ 7, Chủ nhật: Nghỉ\n• Nghỉ các ngày lễ theo quy định của Nhà nước";
    }
    
    if (input.includes("địa chỉ") || input.includes("ở đâu")) {
      return "Địa chỉ: Phường Ninh Chử, TP. Nha Trang, Tỉnh Khánh Hòa\nĐiện thoại: 0259.123.4567\nEmail: ttphcninhchu@khanhhoa.gov.vn";
    }
    
    return "Cảm ơn bạn đã liên hệ! Tôi đang học hỏi để trả lời câu hỏi này tốt hơn. Vui lòng liên hệ đường dây nóng 0259.123.4567 hoặc đến trực tiếp trung tâm để được hỗ trợ chi tiết.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 shadow-2xl">
        <div className="bg-gov-blue text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-semibold">Trợ lý AI</span>
            </div>
            <Button 
              onClick={onClose}
              variant="ghost" 
              size="sm"
              className="text-white hover:text-gray-200 hover:bg-blue-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-0">
          <div className="h-64 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gov-blue text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi..."
                className="flex-1"
              />
              <Button 
                onClick={handleSend}
                size="sm"
                className="bg-gov-blue hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
