"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, FileText, PlusCircle, Mail, Megaphone, MessageSquare, 
  HelpCircle, Bot, User, Settings, LogOut, Bell, Flag, ChevronRight, 
  CheckCircle2, Clock, XCircle, FilePlus, Sparkles, Lightbulb, Loader2,
  UploadCloud, Send, Download, Search, Heart, MessageCircle
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [doubtInput, setDoubtInput] = useState("");
  
  // Tab State
  const [activeTab, setActiveTab] = useState("Dashboard");

  // AI Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "Hi! I am your AI Assistant. I can help you draft permission letters, answer questions about syllabus, or tell you about upcoming events. What do you need help with today?" }
  ]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add user message
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setChatInput("");
    
    // Add a temporary loading message
    setChatMessages(prev => [...prev, { sender: "ai", text: "Thinking..." }]);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await res.json();
      
      // Replace the "Thinking..." message with actual response
      setChatMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { sender: "ai", text: data.response };
        return newMessages;
      });
    } catch (error) {
      setChatMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { sender: "ai", text: "Sorry, I couldn't connect to my brain. Please try again." };
        return newMessages;
      });
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState("");
  const [newReqReason, setNewReqReason] = useState("");
  const [newReqFile, setNewReqFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "Student") {
      router.push("/");
      return;
    }
    setUser(parsedUser);
    fetchData(parsedUser.id);
  }, [router]);

  const fetchData = async (studentId: string) => {
    const [reqRes, annRes, msgRes, doubtRes] = await Promise.all([
      fetch(`/api/requests?studentId=${studentId}`),
      fetch('/api/announcements'),
      fetch('/api/messages?type=message'),
      fetch('/api/messages?type=doubt')
    ]);
    if (reqRes.ok) setRequests(await reqRes.json());
    if (annRes.ok) setAnnouncements(await annRes.json());
    if (msgRes.ok) setMessages(await msgRes.json());
    if (doubtRes.ok) setDoubts(await doubtRes.json());
  };

  const handleSendMessageUniversal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: messageInput,
        authorId: user.id,
        authorName: user.name,
        authorRole: user.role,
        type: 'message'
      })
    });
    if (res.ok) {
      const newMsg = await res.json();
      setMessages([...messages, newMsg]);
      setMessageInput("");
    }
  };

  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtInput.trim()) return;
    
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: doubtInput,
        authorId: user.id,
        authorName: user.name,
        authorRole: user.role,
        type: 'doubt',
        answers: 0,
        tags: ["General"]
      })
    });
    if (res.ok) {
      const newDoubt = await res.json();
      setDoubts([newDoubt, ...doubts]);
      setDoubtInput("");
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: user.id,
        studentName: user.name,
        title: newReqTitle,
        reason: newReqReason,
        // File upload mock - in a real app this would use FormData
        hasAttachment: !!newReqFile
      })
    });
    if (res.ok) {
      const newReq = await res.json();
      setRequests([newReq, ...requests]);
      setIsModalOpen(false);
      setNewReqTitle("");
      setNewReqReason("");
      setNewReqFile(null);
    }
    setIsSubmitting(false);
  };

  if (!user) return null;

  const totalReq = requests.length;
  const pendingReq = requests.filter(r => r.status === "Pending").length;
  const approvedReq = requests.filter(r => r.status === "Approved").length;
  const rejectedReq = requests.filter(r => r.status === "Rejected").length;

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel bg-white p-6 rounded-[2rem] relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute right-[-10%] bottom-[-10%] w-40 h-40 bg-gradient-to-tl from-[#EAF4FF] to-transparent rounded-full blur-2xl"></div>
                  <div className="w-12 h-12 bg-[#EDE9FE] rounded-2xl flex items-center justify-center mb-4 relative z-10">
                    <FilePlus className="w-6 h-6 text-[#7C6CFF]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1E2A5A] mb-2 relative z-10">Apply for Permission</h3>
                  <p className="text-sm text-[#6B7280] mb-6 relative z-10 leading-relaxed">
                    Need permission for an event, workshop, or any other activity? Send a request to your HOD/Faculty.
                  </p>
                  <button onClick={() => setIsModalOpen(true)} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#7C6CFF] text-white font-bold shadow-[0_8px_20px_rgba(91,140,255,0.3)] hover:shadow-[0_12px_25px_rgba(91,140,255,0.4)] transform hover:-translate-y-0.5 transition-all relative z-10">
                    + New Permission Request
                  </button>
                </div>

                <div className="glass-panel bg-white p-6 rounded-[2rem] border border-orange-100 relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute right-[-10%] top-[-10%] w-40 h-40 bg-orange-50 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1E2A5A]">AI Insights</h3>
                  </div>
                  <p className="text-sm text-[#6B7280] mb-4 relative z-10 leading-relaxed">
                    Our AI analyzes your requests and flags them based on urgency, deadlines, and importance.
                  </p>
                  <div className="mt-auto p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3 relative z-10">
                    <Flag className="w-5 h-5 text-red-500 mt-0.5" />
                    <p className="text-sm font-semibold text-red-700">{pendingReq} request(s) are pending approval and require attention.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Requests" value={totalReq.toString()} icon={FileText} color="purple" />
                <StatCard title="Pending" value={pendingReq.toString()} icon={Clock} color="orange" />
                <StatCard title="Approved" value={approvedReq.toString()} icon={CheckCircle2} color="green" />
                <StatCard title="Rejected" value={rejectedReq.toString()} icon={XCircle} color="red" />
              </div>

              <div className="glass-panel bg-white rounded-[2rem] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#1E2A5A]">Recent Permission Requests</h3>
                  <button onClick={() => setActiveTab("My Permissions")} className="text-sm font-semibold text-[#5B8CFF] hover:text-[#7C6CFF]">View All</button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-3 text-sm font-semibold text-[#6B7280]">Event / Purpose</th>
                        <th className="pb-3 text-sm font-semibold text-[#6B7280]">Submitted On</th>
                        <th className="pb-3 text-sm font-semibold text-[#6B7280]">Status</th>
                        <th className="pb-3 text-sm font-semibold text-[#6B7280]">Priority (AI)</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {requests.slice(0, 4).map((req: any) => (
                        <TableRow 
                          key={req.id}
                          title={req.title} 
                          date={req.submittedOn} 
                          status={req.status} 
                          priority={req.priority || "Medium"} 
                          onViewLetter={() => setActiveTab("My Letters")}
                        />
                      ))}
                      {requests.length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-gray-500">No requests found. Create one above!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6 flex flex-col">
              <div className="glass-panel bg-white p-6 rounded-[2rem]">
                <h3 className="text-lg font-bold text-[#1E2A5A] mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <QuickAction icon={PlusCircle} label="New Request" color="blue" onClick={() => setIsModalOpen(true)} />
                  <QuickAction icon={Mail} label="My Letters" color="purple" onClick={() => setActiveTab("My Letters")} />
                  <QuickAction icon={Megaphone} label="Announcements" color="green" onClick={() => setActiveTab("Announcements")} />
                  <QuickAction icon={HelpCircle} label="Q&A Forum" color="orange" onClick={() => setActiveTab("Doubts & Q&A")} />
                </div>
              </div>

              <div className="glass-panel bg-white p-6 rounded-[2rem]">
                <h3 className="text-lg font-bold text-[#1E2A5A] mb-4">Recent Announcements</h3>
                <div className="space-y-3">
                  {announcements.slice(0,3).map((a:any) => (
                    <EventItem key={a.id} title={a.title} date={a.date} badge={a.type || "Update"} />
                  ))}
                  {announcements.length === 0 && <p className="text-xs text-gray-500">No announcements yet.</p>}
                </div>
                <button onClick={() => setActiveTab("Announcements")} className="w-full mt-4 py-2 text-sm font-semibold text-[#5B8CFF] hover:bg-[#EAF4FF] rounded-lg transition-colors">
                  View All Announcements
                </button>
              </div>

              <div className="glass-panel bg-gradient-to-br from-[#1E2A5A] to-[#2A3B7D] p-6 rounded-[2rem] text-white mt-auto relative overflow-hidden">
                <div className="absolute right-[-20%] top-[-20%] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <Bot className="w-8 h-8 text-[#C4B5FD] mb-3 relative z-10" />
                <h3 className="text-lg font-bold mb-1 relative z-10">AI Help Assistant</h3>
                <p className="text-sm text-[#C4B5FD] mb-4 relative z-10">Ask doubts or get help from AI Assistant instantly.</p>
                <button onClick={() => setActiveTab("AI Assistant")} className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold text-sm transition-colors relative z-10 border border-white/10">
                  Open AI Assistant
                </button>
              </div>
            </div>
          </div>
        );

      case "My Permissions":
        return (
          <div className="glass-panel bg-white rounded-[2rem] p-8 min-h-[70vh]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#1E2A5A]">My Permission Requests</h2>
                <p className="text-[#6B7280] text-sm mt-1">Track the status of all your submitted permissions.</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 rounded-xl bg-[#5B8CFF] text-white font-semibold flex items-center gap-2 hover:bg-[#4A7BEE]">
                <PlusCircle className="w-4 h-4" /> New Request
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280] rounded-tl-xl">Event / Purpose</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280]">Reason</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280]">Submitted On</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280]">Status</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280] rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {requests.map((req: any) => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-[#F7F8FF] transition-colors">
                      <td className="py-4 px-4 font-semibold text-[#1E2A5A]">{req.title}</td>
                      <td className="py-4 px-4 text-[#6B7280] max-w-xs truncate">{req.reason}</td>
                      <td className="py-4 px-4 text-[#6B7280]">{req.submittedOn}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          req.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {req.status === 'Approved' ? (
                          <button onClick={() => setActiveTab("My Letters")} className="text-[#5B8CFF] hover:text-[#7C6CFF] font-semibold text-sm flex items-center gap-1">
                            <FileText className="w-4 h-4" /> Letter
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Waiting...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr><td colSpan={5} className="py-12 text-center text-gray-500">No requests found. Create one!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "My Letters":
        const approvedRequests = requests.filter(r => r.status === "Approved");
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#1E2A5A]">My Approval Letters</h2>
                <p className="text-[#6B7280] text-sm mt-1">Download and print your approved permission letters.</p>
              </div>
              <div className="p-3 bg-[#EAF4FF] rounded-full text-[#5B8CFF]">
                <Mail className="w-6 h-6" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedRequests.map(req => (
                <div key={req.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-400"></div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-400">{req.submittedOn}</span>
                  </div>
                  <h3 className="font-bold text-[#1E2A5A] mb-1">{req.title}</h3>
                  <p className="text-xs text-gray-500 mb-6 line-clamp-2">{req.reason}</p>
                  <button className="w-full py-2 bg-gray-50 hover:bg-[#5B8CFF] hover:text-white text-[#1E2A5A] rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              ))}
              {approvedRequests.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl">
                  You don't have any approved letters yet.
                </div>
              )}
            </div>
          </div>
        );

      case "Announcements":
        return (
          <div className="glass-panel bg-white rounded-[2rem] p-8 min-h-[70vh]">
            <h2 className="text-2xl font-bold text-[#1E2A5A] mb-1">Campus Announcements</h2>
            <p className="text-[#6B7280] text-sm mb-8">Stay updated with the latest college news and events.</p>
            
            <div className="space-y-4">
              {announcements.map((a:any) => (
                <div key={a.id} className="p-5 border border-gray-100 rounded-2xl hover:border-[#5B8CFF]/30 hover:bg-[#F7F8FF] transition-all flex gap-5">
                  <div className="w-12 h-12 rounded-full bg-[#EAF4FF] flex items-center justify-center shrink-0 text-[#5B8CFF]">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-[#1E2A5A] text-lg">{a.title}</h3>
                      <span className="px-2 py-0.5 bg-[#EDE9FE] text-[#7C6CFF] text-[10px] font-bold rounded uppercase tracking-wider">
                        {a.type || "Update"}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280] mb-2">{a.content}</p>
                    <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Posted on {a.date}
                    </span>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="py-12 text-center text-gray-500">No announcements yet.</div>
              )}
            </div>
          </div>
        );

      case "Messages":
        return (
          <div className="flex h-[75vh] bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
            {/* Sidebar Chat List */}
            <div className="w-1/3 border-r border-gray-100 flex flex-col">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-[#1E2A5A] text-lg mb-4">Universal Campus Chat</h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input type="text" placeholder="Search messages..." className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5B8CFF]/50" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
                <p className="text-xs text-center text-gray-500">Welcome to the Universal Campus Chat. All students and faculty can see this feed.</p>
              </div>
            </div>
            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#F7F8FF]/50">
              <div className="p-4 border-b border-gray-100 bg-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">UC</div>
                <div>
                  <h4 className="font-bold text-[#1E2A5A]">Universal Chat</h4>
                  <p className="text-xs text-green-500">Campus-wide broadcast</p>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                {messages.map(msg => {
                  const isMine = msg.authorId === user.id;
                  return (
                    <div key={msg.id} className={`self-${isMine ? 'end' : 'start'} max-w-[70%]`}>
                      {!isMine && <span className="text-[10px] text-gray-500 font-bold ml-1">{msg.authorName} ({msg.authorRole})</span>}
                      <div className={`${isMine ? 'bg-[#5B8CFF] text-white rounded-tr-none' : 'bg-white text-[#1E2A5A] rounded-tl-none border border-gray-100'} p-3 rounded-2xl shadow-sm text-sm`}>
                        {msg.text}
                      </div>
                      <span className={`text-xs text-gray-400 mt-1 block ${isMine ? 'text-right mr-1' : 'ml-1'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessageUniversal} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message to the campus..." 
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#5B8CFF]/50 text-sm" 
                  />
                  <button type="submit" className="p-2.5 bg-[#5B8CFF] text-white rounded-xl hover:bg-[#4A7BEE] transition-colors"><Send className="w-4 h-4" /></button>
                </form>
              </div>
            </div>
          </div>
        );

      case "Doubts & Q&A":
        return (
          <div className="glass-panel bg-white rounded-[2rem] p-8 min-h-[70vh]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#1E2A5A]">Doubts & Q&A Forum</h2>
                <p className="text-[#6B7280] text-sm mt-1">Ask questions and help your peers globally.</p>
              </div>
            </div>

            <form onSubmit={handleAskDoubt} className="mb-8 flex gap-3">
              <input 
                type="text" 
                value={doubtInput}
                onChange={(e) => setDoubtInput(e.target.value)}
                placeholder="Ask a question..." 
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#5B8CFF]" 
              />
              <button type="submit" className="px-6 py-3 rounded-xl bg-[#7C6CFF] text-white font-semibold flex items-center gap-2 hover:bg-[#6A5AEE]">
                <HelpCircle className="w-4 h-4" /> Ask Question
              </button>
            </form>

            <div className="space-y-4">
              {doubts.map((item: any) => (
                <div key={item.id} className="p-5 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow relative">
                  <h3 className="font-bold text-[#1E2A5A] text-lg mb-2">{item.text}</h3>
                  <div className="flex gap-2 mb-4">
                    {item.tags?.map((t: string) => <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-md font-bold uppercase">{t}</span>)}
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                    <span className="flex items-center gap-1 hover:text-[#5B8CFF] cursor-pointer"><Heart className="w-4 h-4" /> Like</span>
                    <span className="flex items-center gap-1 hover:text-[#5B8CFF] cursor-pointer"><MessageCircle className="w-4 h-4" /> {item.answers || 0} Answers</span>
                  </div>
                  <span className="absolute top-4 right-4 text-xs font-bold text-gray-400">Asked by {item.authorName} ({item.authorRole})</span>
                </div>
              ))}
              {doubts.length === 0 && (
                <p className="text-center py-8 text-gray-500">No doubts posted yet. Be the first!</p>
              )}
            </div>
          </div>
        );

      case "AI Assistant":
        return (
          <div className="flex flex-col h-[75vh] bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
            <div className="p-6 bg-gradient-to-r from-[#1E2A5A] to-[#2A3B7D] text-white flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6 text-[#C4B5FD]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Campus AI Assistant</h2>
                <p className="text-sm text-[#C4B5FD]">Always here to help you navigate campus life.</p>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 bg-gray-50/50">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.sender === 'user' ? 'self-end flex-row-reverse' : ''}`}>
                  {msg.sender === 'ai' ? (
                    <div className="w-8 h-8 bg-[#1E2A5A] rounded-full flex items-center justify-center text-white shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  ) : (
                    <img src={user.avatar} alt="User" className="w-8 h-8 rounded-full border border-gray-200 shrink-0 object-cover" />
                  )}
                  <div className={`${msg.sender === 'user' ? 'bg-[#5B8CFF] text-white rounded-tr-none' : 'bg-white text-[#1E2A5A] border border-gray-100 rounded-tl-none'} p-4 rounded-2xl shadow-sm max-w-[80%] leading-relaxed whitespace-pre-wrap`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask the AI Assistant..." 
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#5B8CFF]/50 transition-shadow" 
                />
                <button type="submit" className="px-6 py-3 bg-[#1E2A5A] text-white rounded-xl hover:bg-[#2A3B7D] transition-colors font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Ask AI
                </button>
              </form>
            </div>
          </div>
        );

      case "Profile":
        return (
          <div className="glass-panel bg-white rounded-[2rem] p-8 min-h-[70vh] max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1E2A5A] mb-8">My Profile</h2>
            <div className="flex flex-col md:flex-row gap-10">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img src={user.avatar} alt="Profile" className="w-32 h-32 rounded-full border-4 border-[#EAF4FF] object-cover" />
                  <button className="absolute bottom-0 right-0 p-2 bg-[#5B8CFF] text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                    <UploadCloud className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#1E2A5A]">{user.name}</h3>
                <p className="text-sm text-[#6B7280]">{user.role}</p>
                <span className="mt-2 px-3 py-1 bg-[#EDE9FE] text-[#7C6CFF] text-xs font-bold rounded-lg">{user.details}</span>
              </div>
              
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">Full Name</label>
                    <input type="text" defaultValue={user.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#5B8CFF]" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">Email Address</label>
                    <input type="email" defaultValue={user.email} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#5B8CFF]" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">Student ID / Roll No</label>
                    <input type="text" defaultValue="2023CS0192" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#5B8CFF]" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">Phone Number</label>
                    <input type="text" defaultValue="+91 98765 43210" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#5B8CFF]" />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                  <button className="px-6 py-2.5 rounded-xl font-semibold text-white bg-[#5B8CFF] hover:bg-[#4A7BEE]">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        );

      case "Settings":
        return (
          <div className="glass-panel bg-white rounded-[2rem] p-8 min-h-[70vh] max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1E2A5A] mb-8">Account Settings</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#1E2A5A] mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-[#5B8CFF]" /> Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div>
                      <p className="font-semibold text-[#1E2A5A]">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive emails for permission approvals.</p>
                    </div>
                    <div className="w-11 h-6 bg-[#5B8CFF] rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div></div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div>
                      <p className="font-semibold text-[#1E2A5A]">Push Notifications</p>
                      <p className="text-xs text-gray-500">Receive alerts on your device for announcements.</p>
                    </div>
                    <div className="w-11 h-6 bg-[#5B8CFF] rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-[#1E2A5A] mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-[#5B8CFF]" /> Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div>
                      <p className="font-semibold text-[#1E2A5A]">Dark Mode</p>
                      <p className="text-xs text-gray-500">Switch between light and dark themes.</p>
                    </div>
                    <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer"><div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm border border-gray-300"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FF] font-sans flex relative">
      
      {/* Create Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-[#1E2A5A]">New Request</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><XCircle className="w-6 h-6" /></button>
            </div>
            <p className="text-sm text-[#6B7280] mb-6">Submit a permission request to your faculty.</p>
            
            <form onSubmit={handleCreateRequest} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-[#1E2A5A]">Event / Purpose</label>
                <input 
                  type="text" required value={newReqTitle} onChange={e => setNewReqTitle(e.target.value)}
                  placeholder="e.g., Hackathon Leave"
                  className="w-full mt-1.5 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#5B8CFF] focus:bg-white transition-colors outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1E2A5A]">Reason / Details</label>
                <textarea 
                  required value={newReqReason} onChange={e => setNewReqReason(e.target.value)}
                  placeholder="Explain why you need this permission..." rows={3}
                  className="w-full mt-1.5 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#5B8CFF] focus:bg-white transition-colors outline-none resize-none"
                ></textarea>
              </div>
              
              {/* File Upload Section */}
              <div>
                <label className="text-sm font-semibold text-[#1E2A5A]">Supporting Document (Optional)</label>
                <div className="mt-1.5 flex items-center justify-center w-full">
                  <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${newReqFile ? 'border-[#5B8CFF] bg-[#EAF4FF]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {newReqFile ? (
                        <>
                          <FileText className="w-8 h-8 mb-2 text-[#5B8CFF]" />
                          <p className="mb-1 text-sm font-bold text-[#1E2A5A]">{newReqFile.name}</p>
                          <p className="text-xs text-[#5B8CFF]">Click to change file</p>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="mb-1 text-sm text-gray-500"><span className="font-semibold text-[#5B8CFF]">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-gray-400">PDF, PNG, JPG (MAX. 5MB)</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" onChange={(e) => {
                      if(e.target.files && e.target.files[0]) setNewReqFile(e.target.files[0]);
                    }} />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-semibold text-[#6B7280] hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#7C6CFF] text-white font-bold hover:shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-[#EAF4FF] flex flex-col hidden lg:flex sticky top-0 h-screen overflow-y-auto hide-scrollbar">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#5B8CFF] to-[#7C6CFF] flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="text-xl font-bold text-[#1E2A5A]">CampusConnect</span>
          </div>
          <span className="text-xs font-semibold text-[#5B8CFF] tracking-wider uppercase ml-10">Student Portal</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <NavItem icon={FileText} label="My Permissions" active={activeTab === "My Permissions"} onClick={() => setActiveTab("My Permissions")} />
          <NavItem icon={PlusCircle} label="Create Request" onClick={() => setIsModalOpen(true)} />
          <NavItem icon={Mail} label="My Letters" active={activeTab === "My Letters"} onClick={() => setActiveTab("My Letters")} />
          <NavItem icon={Megaphone} label="Announcements" active={activeTab === "Announcements"} onClick={() => setActiveTab("Announcements")} />
          <NavItem icon={MessageSquare} label="Messages" active={activeTab === "Messages"} onClick={() => setActiveTab("Messages")} />
          <NavItem icon={HelpCircle} label="Doubts & Q&A" active={activeTab === "Doubts & Q&A"} onClick={() => setActiveTab("Doubts & Q&A")} />
          <NavItem icon={Bot} label="AI Assistant" active={activeTab === "AI Assistant"} onClick={() => setActiveTab("AI Assistant")} />
          
          <div className="pt-6 pb-2">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
          </div>
          <NavItem icon={User} label="Profile" active={activeTab === "Profile"} onClick={() => setActiveTab("Profile")} />
          <NavItem icon={Settings} label="Settings" active={activeTab === "Settings"} onClick={() => setActiveTab("Settings")} />
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={() => { localStorage.removeItem("user"); router.push("/"); }}
            className="flex items-center gap-3 w-full px-4 py-3 mt-4 text-[#EF4444] hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#EAF4FF] flex items-center justify-between px-8 sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-bold text-[#1E2A5A]">
              {activeTab === "Dashboard" ? `Welcome back, ${user.name} 👋` : activeTab}
            </h1>
            <p className="text-sm text-[#6B7280]">
              {activeTab === "Dashboard" ? "Here's what's happening with your requests and activities." : "Student Portal Workspace"}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab("Announcements")} className="relative p-2 rounded-full bg-[#F7F8FF] text-[#1E2A5A] hover:bg-[#EAF4FF] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab("Profile")}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#1E2A5A]">{user.name}</p>
                <p className="text-xs text-[#6B7280]">{user.details}</p>
              </div>
              <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-[#EAF4FF] object-cover" />
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT AREA */}
        <div className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// Subcomponents

function NavItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); if(onClick) onClick(); }} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
      active 
        ? "bg-[#EDE9FE] text-[#7C6CFF] font-semibold" 
        : "text-[#6B7280] hover:bg-gray-50 hover:text-[#1E2A5A] font-medium"
    }`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${active ? "text-[#7C6CFF]" : "text-gray-400"}`} />
        <span className="text-sm">{label}</span>
      </div>
      {active && <ChevronRight className="w-4 h-4 text-[#7C6CFF]" />}
    </a>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: 'purple' | 'orange' | 'green' | 'red' }) {
  const colors = {
    purple: "bg-[#EDE9FE] text-[#7C6CFF]",
    orange: "bg-orange-100 text-orange-500",
    green: "bg-green-100 text-green-500",
    red: "bg-red-100 text-red-500",
  };
  
  return (
    <div className="glass-panel bg-white p-5 rounded-2xl flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex shrink-0 items-center justify-center ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-0.5">{title}</p>
        <p className="text-2xl font-bold text-[#1E2A5A]">{value}</p>
      </div>
    </div>
  );
}

function TableRow({ title, date, status, priority, onViewLetter }: { title: string, date: string, status: string, priority: string, onViewLetter?: () => void }) {
  const getStatusColor = (s: string) => {
    if (s === "Approved") return "bg-green-100 text-green-700";
    if (s === "Pending") return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  const getPriorityIcon = (p: string) => {
    if (p === "High") return <Flag className="w-4 h-4 text-red-500" />;
    if (p === "Medium") return <Flag className="w-4 h-4 text-orange-500" />;
    return <Flag className="w-4 h-4 text-green-500" />;
  };

  return (
    <tr className="border-b border-gray-50 hover:bg-[#F7F8FF] transition-colors group">
      <td className="py-4 font-semibold text-[#1E2A5A]">{title}</td>
      <td className="py-4 text-[#6B7280]">{date}</td>
      <td className="py-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
      <td className="py-4">
        <div className="flex items-center gap-1.5">
          {getPriorityIcon(priority)}
          <span className="text-[#6B7280] font-medium">{priority}</span>
        </div>
      </td>
    </tr>
  );
}

function QuickAction({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: 'blue' | 'purple' | 'green' | 'orange', onClick?: () => void }) {
  const colors = {
    blue: "bg-[#EAF4FF] text-[#5B8CFF]",
    purple: "bg-[#EDE9FE] text-[#7C6CFF]",
    green: "bg-green-50 text-green-500",
    orange: "bg-orange-50 text-orange-500",
  };
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-[#EAF4FF] hover:bg-[#F7F8FF] transition-all group">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold text-[#1E2A5A]">{label}</span>
    </button>
  );
}

function EventItem({ title, date, badge }: { title: string, date: string, badge: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-[#F7F8FF] transition-colors">
      <div>
        <h4 className="text-sm font-bold text-[#1E2A5A] line-clamp-1">{title}</h4>
        <p className="text-xs text-[#6B7280] mt-0.5">{date}</p>
      </div>
      <span className="px-2 py-1 bg-[#EDE9FE] text-[#7C6CFF] text-[10px] font-bold rounded uppercase tracking-wider shrink-0 ml-2">
        {badge}
      </span>
    </div>
  );
}
