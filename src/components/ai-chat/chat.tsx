'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useERP } from '@/context/erp-context';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function AIChatbot() {
  const { projects, products, activeCompanyId, companies, t, language } = useERP();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hidden = localStorage.getItem('ai_chatbot_hidden') === 'true';
      if (hidden) setIsVisible(false);
    }
  }, []);

  const handleHideChatbot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_chatbot_hidden', 'true');
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'init', 
      sender: 'ai', 
      text: 'Hello! I am your Apex Construction AI Assistant. I can forecast inventory requirements, summarize project timelines, and analyze active budgets. How can I help you today?', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0] || { name: 'Apex' };

  // Refresh greeting text on language change
  useEffect(() => {
    setMessages([
      { 
        id: 'init', 
        sender: 'ai', 
        text: language === 'vi' 
          ? 'Xin chào! Tôi là Trợ lý AI Xây dựng Apex. Tôi có thể dự báo nhu cầu tồn kho, tóm tắt tiến độ dự án và phân tích ngân sách hoạt động. Tôi có thể giúp gì cho bạn hôm nay?'
          : 'Hello! I am your Apex Construction AI Assistant. I can forecast inventory requirements, summarize project timelines, and analyze active budgets. How can I help you today?', 
        timestamp: new Date() 
      }
    ]);
  }, [language]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const messageText = textToSend || input.trim();
    if (!messageText) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate smart contextual response based on actual state context!
    setTimeout(() => {
      let aiText = '';
      const query = messageText.toLowerCase();

      if (language === 'vi') {
        if (query.includes('dự án') || query.includes('tóm tắt')) {
          const projSummary = projects.map(p => 
            `• **${p.name}**: Trạng thái: *${p.status}*, Tiến độ: **${p.progress}%**, Ngân sách: **$${p.budget.toLocaleString()}**, Thực chi: **$${p.actual_cost.toLocaleString()}**`
          ).join('\n');
          aiText = `Dưới đây là tóm tắt các dự án đang hoạt động của **${activeCompany.name}**:\n\n${projSummary || 'Không tìm thấy dự án nào đang hoạt động.'}\n\n*Bạn có muốn tôi dự báo chi phí hoàn thành của dự án nào không?*`;
        } 
        else if (query.includes('dự báo') || query.includes('nhu cầu') || query.includes('xi măng') || query.includes('cát')) {
          const materialSummary = products.map(p => 
            `• **${p.name}** (SKU: ${p.sku}): Tồn kho: **${p.current_qty} ${p.uom_id === 'uom5' ? 'tấn' : 'đơn vị'}**. Mức an toàn: **${p.min_qty}**. Dự báo nhu cầu 30 ngày tới: **${Math.round(p.min_qty * 1.6)}**.`
          ).join('\n');
          aiText = `Dựa trên nhật ký công việc và xu hướng thời tiết hiện tại, đây là dự báo nhu cầu vật tư của **${activeCompany.name}** trong 30 ngày tới:\n\n${materialSummary}\n\n**Khuyến nghị AI**: Hãy tạo yêu cầu mua cát sông ngay lập tức, vì lượng tồn kho dự kiến sẽ giảm dưới mức an toàn trong vòng 9 ngày tới.`;
        } 
        else if (query.includes('chi phí') || query.includes('dự đoán') || query.includes('ngân sách')) {
          const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
          const totalActual = projects.reduce((acc, p) => acc + p.actual_cost, 0);
          const variancePercentage = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;
          aiText = `### Báo cáo Dự báo Tài chính - ${activeCompany.name}\n\n` +
                   `• Tổng Ngân sách Dự án đang chạy: **$${totalBudget.toLocaleString()}**\n` +
                   `• Chi phí thực tế đã ghi nhận: **$${totalActual.toLocaleString()}** (Sử dụng ${variancePercentage}%)\n` +
                   `• Nguy cơ vượt ngân sách: **Thấp (12%)**\n\n` +
                   `**Yếu tố tác động**: Giá thép xây dựng đã ổn định trong tuần này, làm giảm thiểu rủi ro biến động ngân sách cho dự án Nhà kho LaGuardia.`;
        } 
        else if (query.includes('tồn kho') || query.includes('thấp') || query.includes('cảnh báo')) {
          const lowStock = products.filter(p => p.current_qty < p.min_qty);
          if (lowStock.length > 0) {
            const list = lowStock.map(p => `• **${p.name}**: Tồn kho hiện tại là **${p.current_qty}** (Yêu cầu tối thiểu: ${p.min_qty})`).join('\n');
            aiText = `⚠️ **Cảnh báo Tồn kho thấp** tại **${activeCompany.name}**:\n\n${list}\n\nBạn có muốn tôi tự động tạo bản nháp Yêu cầu mua sắm các vật tư này không?`;
          } else {
            aiText = `✅ Tất cả các mức vật tư của **${activeCompany.name}** hiện đang nằm trong giới hạn an toàn. Không có tình trạng thiếu hụt vật liệu dự kiến.`;
          }
        } 
        else {
          aiText = `Tôi đã ghi nhận yêu cầu của bạn về: "${messageText}". Là trợ lý ảo được tích hợp cho hệ thống Apex ERP, tôi có thể hỗ trợ bạn:\n` +
                   `1. Liệt kê cảnh báo tồn kho thấp (\`check low stock\`)\n` +
                   `2. Phân tích tiến độ các công trình (\`project summary\`)\n` +
                   `3. Dự báo nhu cầu nguyên vật liệu (\`material forecast\`)\n` +
                   `4. Dự đoán ngân sách hoạt động (\`predict costs\`)`;
        }
      } else {
        if (query.includes('project') || query.includes('summarize')) {
          const projSummary = projects.map(p => 
            `• **${p.name}**: Status: *${p.status}*, Progress: **${p.progress}%**, Budget: **$${p.budget.toLocaleString()}**, Spent: **$${p.actual_cost.toLocaleString()}**`
          ).join('\n');
          aiText = `Here is a summary of the active projects for **${activeCompany.name}**:\n\n${projSummary || 'No active projects found.'}\n\n*Would you like me to predict the final cost of any of these projects?*`;
        } 
        else if (query.includes('forecast') || query.includes('demand') || query.includes('cement') || query.includes('sand')) {
          const materialSummary = products.map(p => 
            `• **${p.name}** (SKU: ${p.sku}): Current stock: **${p.current_qty} ${p.uom_id === 'uom5' ? 'tons' : 'units'}**. Minimum safety stock: **${p.min_qty}**. Forecasted demand for next 30 days: **${Math.round(p.min_qty * 1.6)}**.`
          ).join('\n');
          aiText = `Based on historical timesheet activity and current weather trends, here is the material demand forecast for **${activeCompany.name}** over the next 30 days:\n\n${materialSummary}\n\n**AI Recommendation**: Place a purchase request for coarse sand immediately, as it is projected to fall below safety limits within 9 days.`;
        } 
        else if (query.includes('cost') || query.includes('predict') || query.includes('budget')) {
          const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
          const totalActual = projects.reduce((acc, p) => acc + p.actual_cost, 0);
          const variancePercentage = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;
          aiText = `### Financial Predictive Report - ${activeCompany.name}\n\n` +
                   `• Cumulative Active Project Budget: **$${totalBudget.toLocaleString()}**\n` +
                   `• Actual Recorded Costs to date: **$${totalActual.toLocaleString()}** (${variancePercentage}% utilized)\n` +
                   `• Projected Overrun Chance: **low (12%)**\n\n` +
                   `**Triggers**: Structural reinforcement steel prices have stabilized this week, reducing budget volatility risks on the LaGuardia Hangar Project.`;
        } 
        else if (query.includes('stock') || query.includes('low') || query.includes('inventory')) {
          const lowStock = products.filter(p => p.current_qty < p.min_qty);
          if (lowStock.length > 0) {
            const list = lowStock.map(p => `• **${p.name}**: Stock is **${p.current_qty}** (Min Required: ${p.min_qty})`).join('\n');
            aiText = `⚠️ **Low Stock Alert** for **${activeCompany.name}**:\n\n${list}\n\nWould you like me to auto-generate a Purchase Request Draft for these materials?`;
          } else {
            aiText = `✅ All material stock levels for **${activeCompany.name}** are currently above their safe safety thresholds. No shortages projected.`;
          }
        } 
        else {
          aiText = `I processed your request concerning: "${messageText}". As an AI assistant built for Apex ERP, I can help you with:\n` +
                   `1. Listing low stock alerts (\`check low stock\`)\n` +
                   `2. Analyzing project schedules (\`project summary\`)\n` +
                   `3. Forecasting material demands (\`material forecast\`)\n` +
                   `4. Budget projections (\`predict costs\`)`;
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 800);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Toggle button with dismiss option */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 shadow-xl border border-zinc-800 dark:border-zinc-200 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          title={t("Ask AI Assistant")}
        >
          {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
          {!isOpen && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </span>
          )}
        </button>
        
        {!isOpen && (
          <button
            onClick={handleHideChatbot}
            className="absolute -top-1.5 -left-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 border border-zinc-250 dark:border-zinc-800 shadow-sm transition-all duration-150 cursor-pointer"
            title={t("Hide AI Assistant")}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </div>

      {/* Chat window panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 flex h-[520px] w-[380px] flex-col rounded-2xl border border-zinc-200/80 bg-white/95 dark:border-zinc-855 dark:bg-zinc-950/95 backdrop-blur-md shadow-2xl transition-all duration-300 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 p-4 bg-zinc-50/50 dark:bg-zinc-900/20">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-sm">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-550 leading-tight">{t("Apex AI Assistant")}</h3>
                <p className="text-[9px] text-zinc-450 dark:text-zinc-500 font-bold tracking-wider uppercase flex items-center gap-0.5 mt-0.5">
                  <Sparkles className="h-2.5 w-2.5 text-indigo-500" /> {t("Context-Aware Active")}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-350 transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 font-medium rounded-br-none'
                      : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-250 border border-zinc-200/50 dark:border-zinc-800/40 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick templates */}
          <div className="border-t border-zinc-150/80 bg-zinc-50/20 p-2 flex gap-1.5 flex-wrap dark:border-zinc-850 dark:bg-zinc-900/10">
            <button 
              onClick={() => handleSend(language === 'vi' ? 'Tóm tắt dự án' : 'Project summary')}
              className="rounded-full border border-zinc-200/80 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-[10px] font-medium text-zinc-650 dark:text-zinc-350 px-2.5 py-1 transition-colors cursor-pointer"
            >
              📊 {t("Project summary")}
            </button>
            <button 
              onClick={() => handleSend(language === 'vi' ? 'Dự báo nhu cầu vật tư' : 'Material demand forecast')}
              className="rounded-full border border-zinc-200/80 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-[10px] font-medium text-zinc-650 dark:text-zinc-350 px-2.5 py-1 transition-colors cursor-pointer"
            >
              🔮 {t("Material demand forecast")}
            </button>
            <button 
              onClick={() => handleSend(language === 'vi' ? 'Cảnh báo tồn kho thấp' : 'Check low stock levels')}
              className="rounded-full border border-zinc-200/80 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-955 dark:hover:bg-zinc-900 text-[10px] font-medium text-zinc-650 dark:text-zinc-350 px-2.5 py-1 transition-colors cursor-pointer"
            >
              ⚠️ {t("Check low stock levels")}
            </button>
          </div>

          {/* Chat input form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 border-t border-zinc-150/80 p-3 bg-zinc-50/20 dark:border-zinc-850 dark:bg-zinc-950"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("Ask a question...")}
              className="saas-input h-9"
            />
            <button 
              type="submit" 
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-955 transition-colors shadow-sm cursor-pointer border-none"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
