"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, FileText, Megaphone, MessageSquare, 
  HelpCircle, Bot, Settings, LogOut, Bell, Flag,
  Check, X, ChevronRight, BarChart3, PlusCircle, Lightbulb, UserCog, Clock, Search, ShieldAlert,
  UploadCloud, Send, Heart, PieChart, TrendingUp, Activity
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [requests, setRequests] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [facultyRequests, setFacultyRequests] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "Admin") {
      router.push("/");
      return;
    }
    setUser(parsedUser);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    const [reqRes, facReqRes, userRes] = await Promise.all([
      fetch('/api/requests'),
      fetch('/api/facultyRequests'),
      fetch('/api/users')
    ]);
    if (reqRes.ok) setRequests(await reqRes.json());
    if (facReqRes.ok) setFacultyRequests(await facReqRes.json());
    if (userRes.ok) setUsersList(await userRes.json());
  };

  const updateRequest = async (id: string, status: string) => {
    setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status } : r));
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  };

  if (!user) return null;

  const studentRequests = requests;
  const flaggedReq = requests.filter(r => r.status === "Pending" && r.priority === "High");

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard title="Total Students" value={usersList.filter(u => u.role === "Student").length.toString()} icon={Users} color="purple" onClick={() => setActiveTab("Manage Users")} />
              <StatCard title="Total Faculty" value={usersList.filter(u => u.role === "Faculty").length.toString()} icon={UserCog} color="blue" onClick={() => setActiveTab("Manage Users")} />
              <StatCard title="Global Pending" value={requests.filter(r => r.status === 'Pending').length.toString()} icon={Clock} color="orange" onClick={() => setActiveTab("All Requests")} />
              <StatCard title="Approved Today" value="15" icon={Check} color="green" />
              <StatCard title="Rejected Today" value="3" icon={X} color="red" />
              <StatCard title="AI Escalated" value={flaggedReq.length.toString()} icon={ShieldAlert} color="red-solid" onClick={() => setActiveTab("Flagged by AI")} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                {/* AI Escalated */}
                <div className="glass-panel bg-white p-6 rounded-[2rem] border border-red-100 relative overflow-hidden">
                  <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-red-50 rounded-full blur-3xl"></div>
                  <div className="relative z-10 flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-[#1E2A5A] flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-500" /> AI Escalated Requests
                      </h3>
                      <p className="text-sm text-[#6B7280]">Requests escalated to admin level.</p>
                    </div>
                    <button onClick={() => setActiveTab("Flagged by AI")} className="text-sm font-semibold text-[#5B8CFF] hover:text-[#7C6CFF]">View All →</button>
                  </div>
                  
                  <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-3 text-sm font-semibold text-[#6B7280]">Department / Person</th>
                          <th className="pb-3 text-sm font-semibold text-[#6B7280]">Event / Purpose</th>
                          <th className="pb-3 text-sm font-semibold text-[#6B7280]">Reason</th>
                          <th className="pb-3 text-sm font-semibold text-[#6B7280] text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {flaggedReq.slice(0, 3).map((req) => (
                          <FlaggedTableRow 
                            key={req.id}
                            dept={req.studentName} event={req.title} reason={req.reason}
                            priority={req.priority} date={req.submittedOn} 
                            onAccept={() => updateRequest(req.id, "Approved")}
                            onReject={() => updateRequest(req.id, "Rejected")}
                          />
                        ))}
                        {flaggedReq.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-gray-500">No escalated requests.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* All Requests Split view preview */}
                <div className="glass-panel bg-white rounded-[2rem] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#1E2A5A]">Recent Campus Requests</h3>
                    <button onClick={() => setActiveTab("All Requests")} className="px-3 py-1.5 rounded-lg bg-[#F7F8FF] text-sm font-semibold text-[#1E2A5A] hover:bg-[#EAF4FF] transition-colors border border-gray-200">
                      View Full Tables
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-bold text-[#1E2A5A] mb-3 border-b border-gray-200 pb-2 flex items-center gap-2"><Users className="w-4 h-4 text-[#5B8CFF]"/> Student Requests</h4>
                      <div className="space-y-3">
                        {studentRequests.slice(0,3).map(r => (
                          <div key={r.id} className="text-sm flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <span className="font-semibold text-gray-700">{r.studentName}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'Approved' ? 'bg-green-100 text-green-600' : r.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>{r.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-bold text-[#1E2A5A] mb-3 border-b border-gray-200 pb-2 flex items-center gap-2"><UserCog className="w-4 h-4 text-purple-500"/> Faculty Requests</h4>
                      <div className="space-y-3">
                        {facultyRequests.map(r => (
                          <div key={r.id} className="text-sm flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <span className="font-semibold text-gray-700">{r.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'Approved' ? 'bg-green-100 text-green-600' : r.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>{r.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex flex-col">
                <div className="glass-panel bg-white p-6 rounded-[2rem] text-center flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("Announcements")}>
                  <div className="w-14 h-14 bg-[#EDE9FE] rounded-full flex items-center justify-center mb-4">
                    <Megaphone className="w-7 h-7 text-[#7C6CFF]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E2A5A] mb-2">Global Announcements</h3>
                  <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
                    Broadcast important alerts across the entire campus network.
                  </p>
                  <button onClick={() => setActiveTab("Announcements")} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#5B8CFF] to-[#7C6CFF] text-white font-bold shadow-[0_8px_20px_rgba(91,140,255,0.3)] hover:shadow-[0_12px_25px_rgba(91,140,255,0.4)] transform hover:-translate-y-0.5 transition-all">
                    Open Announcements UI
                  </button>
                </div>

                <div className="glass-panel bg-gradient-to-br from-[#1E2A5A] to-[#2A3B7D] p-6 rounded-[2rem] text-white mt-auto relative overflow-hidden">
                  <div className="absolute right-[-20%] top-[-20%] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                  <Bot className="w-8 h-8 text-[#C4B5FD] mb-3 relative z-10" />
                  <h3 className="text-lg font-bold mb-1 relative z-10">Admin AI Bot</h3>
                  <p className="text-sm text-[#C4B5FD] mb-4 relative z-10">Ask AI to generate compliance reports or audit logs instantly.</p>
                  <button className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur text-white font-semibold text-sm transition-colors relative z-10 border border-white/10">
                    Open AI Dashboard
                  </button>
                </div>
              </div>
            </div>
          </>
        );

      case "Manage Users":
        return (
          <div className="glass-panel bg-white rounded-[2rem] p-8 min-h-[70vh]">
            <h2 className="text-2xl font-bold text-[#1E2A5A] mb-1">Manage Users</h2>
            <p className="text-[#6B7280] text-sm mb-8">View and control access for all students, faculty, and staff.</p>
            <div className="flex gap-4 mb-6">
              <input type="text" placeholder="Search users by name or ID..." className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#5B8CFF]" />
              <button className="px-6 py-3 bg-[#5B8CFF] text-white rounded-xl font-bold shadow hover:bg-[#4A7BEE]">Add New User</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="py-4 px-4 font-semibold text-[#6B7280] text-sm">Name</th>
                    <th className="py-4 px-4 font-semibold text-[#6B7280] text-sm">Role</th>
                    <th className="py-4 px-4 font-semibold text-[#6B7280] text-sm">Department</th>
                    <th className="py-4 px-4 font-semibold text-[#6B7280] text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u: any) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-[#F7F8FF] transition-colors">
                      <td className="py-4 px-4 font-semibold text-[#1E2A5A]">{u.name}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 text-xs rounded-lg font-bold uppercase tracking-wider ${
                          u.role === 'Student' ? 'bg-purple-100 text-purple-700' : 
                          u.role === 'Faculty' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">{u.details}</td>
                      <td className="py-4 px-4"><span className="text-green-500 font-bold text-xs flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "All Requests":
        return (
          <div className="glass-panel bg-white rounded-[2rem] p-8 min-h-[70vh]">
            <h2 className="text-2xl font-bold text-[#1E2A5A] mb-1">Campus Request Logs</h2>
            <p className="text-[#6B7280] text-sm mb-8">Audit and override any permission requests.</p>
            
            <h3 className="text-lg font-bold text-[#1E2A5A] mb-4 border-l-4 border-purple-500 pl-3">Faculty Requests</h3>
            <div className="overflow-x-auto mb-10">
              <table className="w-full text-left border-collapse bg-gray-50 rounded-xl overflow-hidden">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280]">Faculty Name</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280]">Request Type</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280]">Status</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {facultyRequests.map(r => (
                    <StandardTableRow 
                      key={r.id} 
                      name={r.name} type={r.type} date={r.date} dept={r.dept} status={r.status} 
                      onAccept={() => updateRequest(r.id, "Approved")}
                      onReject={() => updateRequest(r.id, "Rejected")}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-bold text-[#1E2A5A] mb-4 border-l-4 border-[#5B8CFF] pl-3">Student Requests</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-gray-50 rounded-xl overflow-hidden">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280]">Student Name</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280]">Event / Purpose</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280]">Status</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {studentRequests.map(r => (
                    <StandardTableRow 
                      key={r.id} 
                      name={r.studentName} type={r.title} date={r.submittedOn} dept="CSE" status={r.status} 
                      onAccept={() => updateRequest(r.id, "Approved")}
                      onReject={() => updateRequest(r.id, "Rejected")}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Flagged by AI":
        return (
          <div className="glass-panel bg-white rounded-[2rem] p-8 min-h-[70vh] border border-red-100">
            <h2 className="text-2xl font-bold text-[#1E2A5A] mb-1 flex items-center gap-2"><ShieldAlert className="text-red-500 w-6 h-6"/> AI Escalations</h2>
            <p className="text-[#6B7280] text-sm mb-8">Requests that violate policies, require high budget, or present security risks.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-red-50/50">
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280]">Requester</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280]">Purpose</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280]">AI Alert Reason</th>
                    <th className="py-4 px-4 text-sm font-semibold text-[#6B7280] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {flaggedReq.map((req) => (
                    <FlaggedTableRow 
                      key={req.id}
                      dept={req.studentName} event={req.title} reason={req.reason}
                      priority={req.priority} date={req.submittedOn} 
                      onAccept={() => updateRequest(req.id, "Approved")}
                      onReject={() => updateRequest(req.id, "Rejected")}
                    />
                  ))}
                  {flaggedReq.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-500 font-medium">No active escalations! 🎉</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "Announcements":
        return (
          <div className="glass-panel bg-white rounded-[2rem] p-8 min-h-[70vh]">
             <h2 className="text-2xl font-bold text-[#1E2A5A] mb-8">Global Announcements Control</h2>
             <div className="p-10 border-2 border-dashed border-[#5B8CFF]/30 bg-[#EAF4FF]/30 rounded-3xl flex flex-col items-center justify-center text-center">
               <Megaphone className="w-16 h-16 text-[#5B8CFF] mb-4" />
               <p className="font-bold text-[#1E2A5A] text-lg">Admin Announcement Broadcaster</p>
               <p className="text-sm mt-2 max-w-md text-center text-[#6B7280]">Use this module to send critical alerts, emergency lockdowns, or campus-wide holidays to everyone (Faculty and Students).</p>
               <button 
                 onClick={async () => {
                   const title = prompt("Enter Broadcast Title:");
                   const content = prompt("Enter Announcement Content:");
                   if (title && content) {
                     const res = await fetch('/api/announcements', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ title, content, type: 'Global', authorName: 'System Admin', targetYears: ['All Years'], targetBranches: ['All Branches'] })
                     });
                     if (res.ok) {
                       alert("Global Announcement Broadcasted!");
                       fetchData();
                     }
                   }
                 }}
                 className="mt-6 px-8 py-3 bg-gradient-to-r from-[#5B8CFF] to-[#7C6CFF] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2"
               >
                 <PlusCircle className="w-5 h-5"/> Initiate Broadcast
               </button>
             </div>
          </div>
        );


      case "System Analytics":
        return (
          <div className="glass-panel bg-white rounded-[2rem] p-8 min-h-[70vh]">
            <h2 className="text-2xl font-bold text-[#1E2A5A] mb-8 flex items-center gap-3"><Activity className="text-[#5B8CFF] w-7 h-7" /> System Analytics Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-8 border border-gray-100 rounded-[2rem] bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center text-center shadow-sm">
                <Users className="w-12 h-12 text-[#7C6CFF] mb-4" />
                <h3 className="font-bold text-[#1E2A5A] text-lg">Active Users</h3>
                <p className="text-4xl font-black text-[#7C6CFF] mt-2 tracking-tight">1,024</p>
              </div>
              <div className="p-8 border border-gray-100 rounded-[2rem] bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center text-center shadow-sm">
                <PieChart className="w-12 h-12 text-[#5B8CFF] mb-4" />
                <h3 className="font-bold text-[#1E2A5A] text-lg">Server Load</h3>
                <p className="text-4xl font-black text-[#5B8CFF] mt-2 tracking-tight">14%</p>
              </div>
              <div className="p-8 border border-gray-100 rounded-[2rem] bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center text-center shadow-sm">
                <TrendingUp className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="font-bold text-[#1E2A5A] text-lg">Platform Uptime</h3>
                <p className="text-4xl font-black text-green-500 mt-2 tracking-tight">99.9%</p>
              </div>
            </div>
          </div>
        );

      case "Global Settings":
        return (
          <div className="glass-panel bg-white rounded-[2rem] p-8 min-h-[70vh] max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1E2A5A] mb-8">Global Platform Settings</h2>
            <div className="space-y-6">
              <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#1E2A5A] text-lg">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500 mt-1">Lock all students and faculty out of the portal during upgrades.</p>
                </div>
                <div className="w-14 h-7 bg-gray-200 rounded-full relative cursor-pointer"><div className="w-6 h-6 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div></div>
              </div>
              <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#1E2A5A] text-lg">AI Auto-Moderation</h3>
                  <p className="text-sm text-gray-500 mt-1">Automatically delete toxic or inappropriate messages from Universal Chat.</p>
                </div>
                <div className="w-14 h-7 bg-green-500 rounded-full relative cursor-pointer"><div className="w-6 h-6 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div></div>
              </div>
              <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#1E2A5A] text-lg">Enforce 2FA</h3>
                  <p className="text-sm text-gray-500 mt-1">Require Two-Factor Authentication for all Admin and Faculty logins.</p>
                </div>
                <div className="w-14 h-7 bg-[#5B8CFF] rounded-full relative cursor-pointer"><div className="w-6 h-6 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div></div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FF] font-sans flex">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-[#EAF4FF] flex flex-col hidden lg:flex sticky top-0 h-screen overflow-y-auto hide-scrollbar">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#5B8CFF] to-[#7C6CFF] flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="text-xl font-bold text-[#1E2A5A]">CampusConnect</span>
          </div>
          <span className="text-xs font-semibold text-[#5B8CFF] tracking-wider uppercase ml-10">Admin Portal</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "Dashboard"} onClick={() => setActiveTab("Dashboard")} />
          <NavItem icon={UserCog} label="Manage Users" active={activeTab === "Manage Users"} onClick={() => setActiveTab("Manage Users")} />
          <NavItem icon={FileText} label="All Requests" active={activeTab === "All Requests"} onClick={() => setActiveTab("All Requests")} />
          <NavItem icon={ShieldAlert} label="Flagged by AI" active={activeTab === "Flagged by AI"} onClick={() => setActiveTab("Flagged by AI")} />
          <NavItem icon={Megaphone} label="Announcements" active={activeTab === "Announcements"} onClick={() => setActiveTab("Announcements")} />
          <NavItem icon={HelpCircle} label="Global Doubts & Q&A" active={activeTab === "Global Doubts & Q&A"} onClick={() => setActiveTab("Global Doubts & Q&A")} />
          <NavItem icon={BarChart3} label="System Analytics" active={activeTab === "System Analytics"} onClick={() => setActiveTab("System Analytics")} />
          
          <div className="pt-6 pb-2">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">System</p>
          </div>
          <NavItem icon={Settings} label="Global Settings" active={activeTab === "Global Settings"} onClick={() => setActiveTab("Global Settings")} />
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
            <h1 className="text-2xl font-bold text-[#1E2A5A]">{activeTab === "Dashboard" ? `Welcome back, ${user.name} 👋` : activeTab}</h1>
            <p className="text-sm text-[#6B7280]">
              {activeTab === "Dashboard" ? "Here's an overview of campus-wide activities and requests." : "Administrator Console"}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab("Flagged by AI")} className="relative p-2 rounded-full bg-[#F7F8FF] text-[#1E2A5A] hover:bg-[#EAF4FF] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
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
        
        {/* BOTTOM INFO BAR */}
        <div className="bg-white border-t border-[#EAF4FF] px-8 py-3 flex items-center justify-center gap-2 z-30">
          <Lightbulb className="w-4 h-4 text-orange-400" />
          <p className="text-xs text-[#6B7280] font-medium">
            <span className="text-[#1E2A5A] font-bold">💡 Tip:</span> Use System Analytics to monitor server load during exam periods.
          </p>
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

function StatCard({ title, value, icon: Icon, color, onClick }: { title: string, value: string, icon: any, color: 'purple' | 'orange' | 'green' | 'red' | 'blue' | 'red-solid', onClick?: () => void }) {
  const colors = {
    purple: "bg-[#EDE9FE] text-[#7C6CFF]",
    orange: "bg-orange-100 text-orange-500",
    green: "bg-green-100 text-green-500",
    red: "bg-red-100 text-red-500",
    blue: "bg-[#EAF4FF] text-[#5B8CFF]",
    "red-solid": "bg-red-50 text-red-600 border border-red-200"
  };
  
  return (
    <div onClick={onClick} className={`glass-panel bg-white p-5 rounded-2xl flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow ${color === 'red-solid' ? 'bg-red-50/50 border border-red-100' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex shrink-0 items-center justify-center ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${color === 'red-solid' ? 'text-red-500' : 'text-[#6B7280]'}`}>{title}</p>
        <p className="text-2xl font-bold text-[#1E2A5A]">{value}</p>
      </div>
    </div>
  );
}

function FlaggedTableRow({ dept, event, reason, priority, date, onAccept, onReject }: any) {
  return (
    <tr className="border-b border-gray-50 hover:bg-red-50/30 transition-colors group">
      <td className="py-4 px-4 font-semibold text-[#1E2A5A]">{dept}</td>
      <td className="py-4 px-4 text-[#1E2A5A]">{event}</td>
      <td className="py-4 px-4 text-red-500 font-medium text-xs max-w-[200px] truncate">{reason}</td>
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {onAccept && (
            <button onClick={onAccept} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-100">
              <Check className="w-4 h-4" />
            </button>
          )}
          {onReject && (
            <button onClick={onReject} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function StandardTableRow({ name, type, date, dept, status, onAccept, onReject }: any) {
  const getStatusColor = (s: string) => {
    if (s === "Approved") return "bg-green-100 text-green-700";
    if (s === "Pending") return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <tr className="border-b border-gray-50 hover:bg-[#F7F8FF] transition-colors group">
      <td className="py-4 px-4 font-semibold text-[#1E2A5A]">{name}</td>
      <td className="py-4 px-4 text-[#1E2A5A]">{type}</td>
      <td className="py-4 px-4 text-[#6B7280]">{date}</td>
      <td className="py-4 px-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {status === 'Pending' && onAccept && (
            <button onClick={onAccept} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-100">
              <Check className="w-4 h-4" />
            </button>
          )}
          {status === 'Pending' && onReject && (
            <button onClick={onReject} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100">
              <X className="w-4 h-4" />
            </button>
          )}
          {status !== 'Pending' && <span className="text-xs font-semibold text-gray-400 italic">No Action Needed</span>}
        </div>
      </td>
    </tr>
  );
}
