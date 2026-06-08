"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  Send,
  Paperclip,
  Mail,
  ExternalLink,
  Download,
  Check,
  CheckCheck,
  Circle,
  FileText,
  User,
  Users,
  Info,
} from "lucide-react"

// Types
type Message = {
  id: string
  text: string
  time: string
  sender: "mentor" | "other"
}

type SharedFile = {
  name: string
  size: string
}

type Conversation = {
  id: string
  name: string
  initials: string
  avatarColor: string
  status: "Online" | "Offline"
  type: "student" | "team" | "system"
  lastMessage: string
  time: string
  unreadCount?: number
  email: string
  role: string
  project: string
  evaluationId: string
  vivaStatus: string
  sharedFiles: SharedFile[]
  messages: Message[]
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    name: "Aryan Sharma",
    initials: "AS",
    avatarColor: "bg-purple-500 text-white",
    status: "Online",
    type: "student",
    lastMessage: "Thank you for the feedback on my project.",
    time: "7:45 PM",
    unreadCount: 2,
    email: "aryan.sharma@example.com",
    role: "Student",
    project: "AI Chatbot",
    evaluationId: "#0b3d2895",
    vivaStatus: "Completed",
    sharedFiles: [{ name: "ai-chatbot-updated.zip", size: "2.4 MB" }],
    messages: [
      { id: "m1", text: "Hello Mentor!", time: "7:30 PM", sender: "other" },
      { id: "m2", text: "Thank you for the feedback on my project.", time: "7:30 PM", sender: "other" },
      { id: "m3", text: "I have updated the code as per your suggestions.", time: "7:31 PM", sender: "other" },
      { id: "m4", text: "Great work, Aryan! The improvements are visible.", time: "7:33 PM", sender: "mentor" },
      { id: "m5", text: "I will mark it as evaluated.", time: "7:32 PM", sender: "mentor" },
    ],
  },
  {
    id: "2",
    name: "Priya Patel",
    initials: "PP",
    avatarColor: "bg-amber-500 text-white",
    status: "Online",
    type: "student",
    lastMessage: "When will my viva be scheduled?",
    time: "5:20 PM",
    email: "priya.patel@example.com",
    role: "Student",
    project: "Smart Attendance System",
    evaluationId: "#0b3d2912",
    vivaStatus: "Pending",
    sharedFiles: [{ name: "attendance-report.pdf", size: "1.2 MB" }],
    messages: [
      { id: "m2_1", text: "Respected Mentor, I finished all milestones.", time: "5:18 PM", sender: "other" },
      { id: "m2_2", text: "When will my viva be scheduled?", time: "5:20 PM", sender: "other" },
      { id: "m2_3", text: "Hello Priya, we are finalizing slots with college admins. I will keep you posted.", time: "5:40 PM", sender: "mentor" },
    ],
  },
  {
    id: "3",
    name: "Aman Kumar",
    initials: "AK",
    avatarColor: "bg-emerald-500 text-white",
    status: "Online",
    type: "student",
    lastMessage: "Please review my updated project.",
    time: "3:10 PM",
    unreadCount: 1,
    email: "aman.kumar@example.com",
    role: "Student",
    project: "E-commerce API",
    evaluationId: "#0b3d2955",
    vivaStatus: "In Progress",
    sharedFiles: [{ name: "ecommerce-endpoints.json", size: "480 KB" }],
    messages: [
      { id: "m3_1", text: "I have added token auth securely.", time: "3:05 PM", sender: "other" },
      { id: "m3_2", text: "Please review my updated project.", time: "3:10 PM", sender: "other" },
    ],
  },
  {
    id: "4",
    name: "System Notification",
    initials: "SN",
    avatarColor: "bg-indigo-500 text-white",
    status: "Online",
    type: "system",
    lastMessage: "Your evaluation report has been published.",
    time: "Yesterday",
    unreadCount: 1,
    email: "system@dishasetu.org",
    role: "System Bot",
    project: "DishaSetu updates",
    evaluationId: "N/A",
    vivaStatus: "N/A",
    sharedFiles: [],
    messages: [
      { id: "m4_1", text: "Welcome to DishaSetu. Your evaluation report has been published.", time: "Yesterday", sender: "other" },
    ],
  },
  {
    id: "5",
    name: "Team DishaSetu",
    initials: "TD",
    avatarColor: "bg-blue-500 text-white",
    status: "Offline",
    type: "team",
    lastMessage: "New feature update: Bulk report download.",
    time: "May 29",
    email: "team@dishasetu.org",
    role: "Admin Team",
    project: "Mentor Platform",
    evaluationId: "N/A",
    vivaStatus: "N/A",
    sharedFiles: [{ name: "bulk-download-guide.pdf", size: "850 KB" }],
    messages: [
      { id: "m5_1", text: "New feature update: Bulk report download. Let us know if you face issues.", time: "May 29", sender: "other" },
    ],
  },
]

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)
  const [activeId, setActiveId] = useState<string>("1")
  const [activeTab, setActiveTab] = useState<"all" | "student" | "team" | "system">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [inputMessage, setInputMessage] = useState("")

  // Find active chat details
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeId) || conversations[0]
  }, [conversations, activeId])

  // Filter conversations list
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === "all" || c.type === activeTab
      return matchesSearch && matchesTab
    })
  }, [conversations, activeTab, searchQuery])

  // Send message handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    const newMessage: Message = {
      id: `m_new_${Date.now()}`,
      text: inputMessage,
      time: timeString,
      sender: "mentor",
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          return {
            ...c,
            lastMessage: inputMessage,
            time: timeString,
            messages: [...c.messages, newMessage],
          }
        }
        return c
      })
    )

    setInputMessage("")
  }

  // Clear unread badge when opening conversation
  const selectConversation = (id: string) => {
    setActiveId(id)
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    )
  }

  return (
    <div className="space-y-6 pb-6 text-slate-800 dark:text-white/90 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header Card */}
      <div className="rounded-3xl border border-blue-100 bg-blue-50/50 dark:bg-[#0f1428] dark:border-white/5 p-6 mb-2">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Messages 💬
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-white/60 mt-1 flex items-center gap-1.5">
          Communicate with your students and peers securely ✨
        </p>
        
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-xs font-bold shadow-sm">
            🎯 Unread Messages
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-sm">
            🤝 Collaboration
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-100/80 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-xs font-bold shadow-sm">
            🚀 Direct Support
          </div>
        </div>
      </div>

      {/* Main Messages Layout */}
      <div className="grid gap-4 lg:grid-cols-[300px_1fr_300px] h-[calc(100vh-210px)] min-h-[500px]">

        {/* Column 1: Conversations List */}
        <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-4 flex flex-col h-full shadow-[0_12px_35px_rgba(46,60,120,0.05)] overflow-hidden">
          
          {/* Search bar */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#13141F] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Filters/Tabs */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1.5 scrollbar-thin">
            {(["all", "student", "team", "system"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all
                  ${activeTab === tab
                    ? "bg-purple-600 text-white dark:bg-[#c8ee44] dark:text-[#13141F] shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
                  }`}
              >
                {tab === "all" ? "All" : tab === "student" ? "Students" : tab === "team" ? "Team" : "System"}
              </button>
            ))}
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {filteredConversations.length === 0 ? (
              <div className="text-center text-xs text-slate-400 dark:text-white/35 py-8">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectConversation(chat.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 relative group
                    ${chat.id === activeId
                      ? "bg-purple-500/5 border-purple-500/20 dark:bg-[#c8ee44]/5 dark:border-[#c8ee44]/20 shadow-inner"
                      : "bg-[#ffffff] border-transparent hover:bg-slate-50/50 dark:bg-white/5 dark:hover:bg-white/[0.08]"
                    }`}
                >
                  {/* Left avatar with Online/Offline indicator */}
                  <div className="relative shrink-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${chat.avatarColor}`}>
                      {chat.initials}
                    </div>
                    <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#0f1428]
                      ${chat.status === "Online" ? "bg-emerald-500" : "bg-slate-400"}`}
                    />
                  </div>

                  {/* Mid details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-[#c8ee44] transition-colors truncate pr-2">
                        {chat.name}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-white/35 shrink-0">
                        {chat.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-white/50 truncate font-medium">
                      {chat.lastMessage}
                    </p>
                  </div>

                  {/* Unread count badge */}
                  {!!chat.unreadCount && (
                    <span className="absolute bottom-3 right-3 h-4 min-w-4 px-1 rounded-full flex items-center justify-center text-[9px] font-black bg-purple-600 text-white dark:bg-[#c8ee44] dark:text-[#13141F]">
                      {chat.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

        </div>

        {/* Column 2: Chat Window */}
        <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] flex flex-col h-full shadow-[0_12px_35px_rgba(46,60,120,0.05)] overflow-hidden">
          
          {/* Top Bar info */}
          <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3.5 bg-slate-50/50 dark:bg-white/[0.01]">
            <div className="relative shrink-0">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${activeConversation.avatarColor}`}>
                {activeConversation.initials}
              </div>
              <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white dark:border-[#0f1428]
                ${activeConversation.status === "Online" ? "bg-emerald-500" : "bg-slate-400"}`}
              />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 dark:text-white leading-none">{activeConversation.name}</h2>
              <span className="text-[9px] font-bold text-slate-400 dark:text-white/45 flex items-center gap-1 mt-1">
                <Circle className={`h-1.5 w-1.5 fill-current ${activeConversation.status === "Online" ? "text-emerald-500" : "text-slate-400"}`} />
                {activeConversation.status}
              </span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {activeConversation.messages.map((msg) => {
              const isMentor = msg.sender === "mentor"
              return (
                <div key={msg.id} className={`flex ${isMentor ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3.5 text-xs font-semibold relative shadow-sm
                    ${isMentor
                      ? "bg-purple-600 text-white dark:bg-[#c8ee44] dark:text-[#13141F] rounded-tr-none"
                      : "bg-slate-50 text-slate-800 dark:bg-white/5 dark:text-white/90 rounded-tl-none"
                    }`}
                  >
                    <p className="leading-5">{msg.text}</p>
                    <div className={`flex items-center gap-1 justify-end text-[9px] mt-1.5 opacity-65 font-bold
                      ${isMentor ? "text-white/80 dark:text-[#13141F]/80" : "text-slate-400 dark:text-white/35"}`}
                    >
                      <span>{msg.time}</span>
                      {isMentor && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Send Panel */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-3">
            {/* Attachment Button */}
            <button
              type="button"
              className="h-9 w-9 shrink-0 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 transition-colors"
            >
              <Paperclip className="h-4.5 w-4.5" />
            </button>

            {/* Input field */}
            <input
              type="text"
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-[#13141F] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="h-9 w-9 shrink-0 rounded-full bg-purple-600 hover:bg-purple-700 dark:bg-[#c8ee44] dark:text-[#13141F] dark:hover:bg-[#b0d238] flex items-center justify-center text-white transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>

        {/* Column 3: Conversation Info Details */}
        <div className="space-y-4 h-full overflow-y-auto pr-1 scrollbar-thin">
          
          {/* Card 1: Main Info */}
          <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-5 shadow-[0_12px_35px_rgba(46,60,120,0.05)] text-center relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center font-black text-lg shadow-md mb-3 ${activeConversation.avatarColor}`}>
                {activeConversation.initials}
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{activeConversation.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-white/45 mt-1">{activeConversation.role}</p>
              
              <div className="flex items-center gap-1.5 mt-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-white/5 max-w-full">
                <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-white/45 shrink-0" />
                <span className="text-[10px] font-semibold text-slate-500 dark:text-white/60 truncate">{activeConversation.email}</span>
              </div>
            </div>
            
            {/* Background design elements */}
            <div className="absolute top-0 right-0 h-16 w-16 bg-purple-500/5 dark:bg-[#c8ee44]/5 rounded-bl-full" />
          </div>

          {/* Card 2: About details */}
          <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-5 shadow-[0_12px_35px_rgba(46,60,120,0.05)] space-y-3.5">
            <h4 className="text-[11px] font-bold text-slate-400 dark:text-white/45 uppercase tracking-wider">About</h4>
            
            <div className="space-y-3 font-semibold text-xs">
              <div className="flex justify-between items-start gap-4">
                <span className="text-slate-500 dark:text-white/55">Project:</span>
                <span className="text-slate-900 dark:text-white text-right">{activeConversation.project}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-500 dark:text-white/55">Evaluation:</span>
                <span className="text-slate-800 dark:text-white font-mono">{activeConversation.evaluationId}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-500 dark:text-white/55">Viva Status:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                  ${activeConversation.vivaStatus === "Completed"
                    ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                    : activeConversation.vivaStatus === "Pending"
                      ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                      : activeConversation.vivaStatus === "In Progress"
                        ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                        : "bg-slate-500/10 text-slate-500"
                  }`}
                >
                  {activeConversation.vivaStatus}
                </span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-slate-500 dark:text-white/55">Last Message:</span>
                <span className="text-slate-800 dark:text-white font-bold">{activeConversation.time}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Shared Files */}
          {activeConversation.sharedFiles.length > 0 && (
            <div className="rounded-[24px] border border-slate-200 dark:border-transparent bg-white dark:bg-[#0f1428] p-5 shadow-[0_12px_35px_rgba(46,60,120,0.05)] space-y-3.5">
              <h4 className="text-[11px] font-bold text-slate-400 dark:text-white/45 uppercase tracking-wider">Shared Files</h4>
              
              <div className="space-y-2">
                {activeConversation.sharedFiles.map((file) => (
                  <div key={file.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <FileText className="h-4.5 w-4.5 text-purple-500 dark:text-[#c8ee44] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-[9px] font-semibold text-slate-400 dark:text-white/35 mt-0.5">{file.size}</p>
                      </div>
                    </div>
                    <button className="h-7 w-7 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-white/60 transition-colors shrink-0">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 4: Action button */}
          {activeConversation.project !== "N/A" && (
            <Link
              href="/dashboard/mentor/evaluations"
              className="w-full flex items-center justify-between p-4 rounded-[24px] border border-slate-200 hover:border-slate-350 dark:border-white/10 dark:hover:border-white/20 bg-white dark:bg-[#0f1428] shadow-[0_12px_35px_rgba(46,60,120,0.05)] text-xs font-bold text-slate-700 hover:text-purple-600 dark:text-white/80 dark:hover:text-[#c8ee44] transition-all cursor-pointer"
            >
              <span>View Project</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}

        </div>

      </div>

    </div>
  )
}
