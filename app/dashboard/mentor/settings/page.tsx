"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  Eye,
  Lock,
  Link as LinkIcon,
  HelpCircle,
  Camera,
  Check,
  Copy,
  Laptop,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Globe,
  ExternalLink,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";

type ToggleState = {
  email: boolean;
  inApp: boolean;
  reminders: boolean;
};

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  active: boolean;
  type: "desktop" | "mobile";
}

interface ConnectedAccount {
  id: string;
  provider: "google" | "github" | "linkedin";
  name: string;
  email: string;
  connected: boolean;
}

interface PrivacyState {
  publicDirectory: boolean;
  activeStatus: boolean;
  searchIndexing: boolean;
}

interface SupportTicket {
  id: string;
  message: string;
  date: string;
  status: "Pending" | "In Review" | "Resolved";
}

export default function MentorSettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("account");

  const searchParams = useSearchParams();
  const router = useRouter();
  const tabQuery = searchParams.get("tab");

  useEffect(() => {
    if (tabQuery && ["account", "security", "notifications", "appearance", "privacy", "connected", "help"].includes(tabQuery)) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  // State Declarations
  const [profile, setProfile] = useState({
    name: "Rajretu Kumar",
    email: "rajertu@dishasetu.com",
    mentorId: "MTR-2024-0058",
    bio: "Passionate about mentoring and evaluating projects. I help students showcase their true potential.",
  });

  const [notificationToggles, setNotificationToggles] = useState<ToggleState>({
    email: true,
    inApp: true,
    reminders: true,
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const [privacy, setPrivacy] = useState<PrivacyState>({
    publicDirectory: true,
    activeStatus: true,
    searchIndexing: false,
  });

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    { id: "g", provider: "google", name: "Rajretu Kumar", email: "rajertu@gmail.com", connected: true },
    { id: "gh", provider: "github", name: "rajertu-dev", email: "rajertu@github.com", connected: false },
    { id: "li", provider: "linkedin", name: "Rajretu Kumar", email: "rajertu@linkedin.com", connected: true },
  ]);

  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: "TK-8802", message: "Need clarification on the grading rubric for Node.js projects.", date: "Jun 04, 2026", status: "Resolved" },
  ]);

  // Avatar state & ref
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading indicator for OAuth connecting
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Avatar file upload handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image size must be less than 2MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
        persist("disha_setu_avatar", reader.result);
        showToast("Profile picture updated successfully!");
      }
    };
    reader.onerror = () => {
      showToast("Error reading file", "error");
    };
    reader.readAsDataURL(file);
  };

  // Editing States
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Toast / Status Notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Passwords Form State
  const [passwords, setPasswords] = useState({ current: "", next: "" });

  // Active Sessions
  const [sessions, setSessions] = useState<Session[]>([
    { id: "1", device: "Chrome / Windows 11", location: "New Delhi, India", ip: "192.168.1.45", active: true, type: "desktop" },
    { id: "2", device: "Safari / iPhone 15 Pro", location: "Noida, India", ip: "103.88.22.12", active: false, type: "mobile" },
  ]);

  // Help FAQ State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Load data from localStorage on Mount
  useEffect(() => {
    setMounted(true);
    try {
      const storedProfile = localStorage.getItem("disha_setu_profile");
      if (storedProfile) setProfile(JSON.parse(storedProfile));

      const storedNotifications = localStorage.getItem("disha_setu_notifications");
      if (storedNotifications) setNotificationToggles(JSON.parse(storedNotifications));

      const stored2FA = localStorage.getItem("disha_setu_two_factor");
      if (stored2FA) setTwoFactorEnabled(JSON.parse(stored2FA));

      const storedPrivacy = localStorage.getItem("disha_setu_privacy");
      if (storedPrivacy) setPrivacy(JSON.parse(storedPrivacy));

      const storedConnections = localStorage.getItem("disha_setu_connections");
      if (storedConnections) setConnectedAccounts(JSON.parse(storedConnections));

      const storedTickets = localStorage.getItem("disha_setu_tickets");
      if (storedTickets) setTickets(JSON.parse(storedTickets));

      const storedAvatar = localStorage.getItem("disha_setu_avatar");
      if (storedAvatar) setAvatar(storedAvatar);
    } catch (err) {
      console.error("Failed to load settings from localStorage:", err);
    }
  }, []);

  // Helpers to persist state changes
  const persist = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error(`Failed to write to localStorage for key: ${key}`, err);
    }
  };

  const tabs = useMemo(
    () => [
      { id: "account", label: "Account Settings", icon: User },
      { id: "security", label: "Security", icon: Shield },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "appearance", label: "Appearance", icon: Eye },
      { id: "privacy", label: "Privacy", icon: Lock },
      { id: "connected", label: "Connected Accounts", icon: LinkIcon },
      { id: "help", label: "Help & Support", icon: HelpCircle },
    ],
    []
  );

  // Clipboard copy helper
  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast("Mentor ID copied to clipboard!");
    } catch {
      showToast("Failed to copy ID", "error");
    }
  };

  // Profile inline edit save
  const startEditing = (field: string, val: string) => {
    setEditingField(field);
    setEditValue(val);
  };

  const saveEdit = (field: keyof typeof profile) => {
    const updated = { ...profile, [field]: editValue };
    setProfile(updated);
    persist("disha_setu_profile", updated);
    setEditingField(null);
    showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`);
  };

  const cancelEdit = () => {
    setEditingField(null);
  };

  // Password Change Handler
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current || !passwords.next) {
      showToast("Please fill in both fields.", "error");
      return;
    }
    if (passwords.next.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }
    setPasswords({ current: "", next: "" });
    showToast("Password updated successfully!");
  };

  // Toggle 2FA
  const handleToggle2FA = () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    persist("disha_setu_two_factor", nextVal);
    showToast(`Two-Factor Authentication ${nextVal ? "Enabled" : "Disabled"}`, nextVal ? "success" : "error");
  };

  // Toggle Connected account with simulator loading state
  const toggleConnection = (id: string) => {
    const targetAccount = connectedAccounts.find((a) => a.id === id);
    if (!targetAccount) return;

    if (targetAccount.connected) {
      // Disconnect directly
      const updated = connectedAccounts.map((acc) =>
        acc.id === id ? { ...acc, connected: false } : acc
      );
      setConnectedAccounts(updated);
      persist("disha_setu_connections", updated);
      showToast(`${targetAccount.provider.charAt(0).toUpperCase() + targetAccount.provider.slice(1)} account disconnected!`, "error");
    } else {
      // Connect with loading states
      setConnectingId(id);
      setTimeout(() => {
        const updated = connectedAccounts.map((acc) =>
          acc.id === id ? { ...acc, connected: true, email: `rajertu@${acc.provider}.com` } : acc
        );
        setConnectedAccounts(updated);
        persist("disha_setu_connections", updated);
        setConnectingId(null);
        showToast(`${targetAccount.provider.charAt(0).toUpperCase() + targetAccount.provider.slice(1)} account connected successfully!`, "success");
      }, 1500);
    }
  };

  // Support Request Submit
  const [supportMessage, setSupportMessage] = useState("");
  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) {
      showToast("Please enter a message.", "error");
      return;
    }
    const newTicket: SupportTicket = {
      id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      message: supportMessage,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      status: "Pending",
    };
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    persist("disha_setu_tickets", updated);
    setSupportMessage("");
    showToast("Support ticket submitted successfully!", "success");
  };

  // Revoke session
  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast("Session terminated successfully.", "error");
  };

  // Update Privacy state
  const updatePrivacy = (key: keyof PrivacyState, val: boolean) => {
    const updated = { ...privacy, [key]: val };
    setPrivacy(updated);
    persist("disha_setu_privacy", updated);
    showToast(
      `${key === "publicDirectory" ? "Public Directory Visibility" : key === "activeStatus" ? "Show Active Status" : "Search Engine Indexing"} ${val ? "enabled" : "disabled"}`,
      val ? "success" : "error"
    );
  };

  // Update notifications state
  const updateNotification = (key: keyof ToggleState, val: boolean) => {
    const updated = { ...notificationToggles, [key]: val };
    setNotificationToggles(updated);
    persist("disha_setu_notifications", updated);
    showToast(
      `${key === "email" ? "Email" : key === "inApp" ? "In-app" : "Evaluation Reminder"} notifications ${val ? "enabled" : "disabled"}`,
      val ? "success" : "error"
    );
  };

  return (
    <div className="min-h-[calc(100vh-120px)] w-full bg-transparent px-0 py-0 text-slate-900 dark:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-5 z-[100] flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-lg transition-all duration-300 ${
          toast.type === "success" ? "bg-emerald-600 shadow-emerald-500/20" : "bg-rose-600 shadow-rose-500/20"
        }`}>
          {toast.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[30px] font-bold tracking-tight text-slate-950 dark:text-white leading-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account, preferences, and security settings.
        </p>
      </div>

      <div className="w-full max-w-full">
        {/* Content Panel */}
        <main className="min-w-0 pb-6">
          {/* 1. Account Settings Tab */}
          {activeTab === "account" && (
            <div className="space-y-6">
              {/* Account Settings Header & Profile Fields */}
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-white/5 dark:bg-[#0b1020]">
                <div className="mb-6">
                  <h2 className="text-base font-extrabold text-slate-950 dark:text-white">Account Settings</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Update your personal information and account details.
                  </p>
                </div>

                <div className="flex flex-col gap-6 md:flex-row">
                  {/* Avatar upload style */}
                  <div className="relative h-20 w-20 shrink-0 self-start">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#7b61ff] text-3xl font-extrabold text-white shadow-[0_0_0_4px_rgba(123,97,255,0.1)] overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        profile.name.charAt(0)
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-950 text-white shadow-md hover:bg-slate-800 dark:border-[#0b1020]"
                      aria-label="Change profile photo"
                    >
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Profile Rows */}
                  <div className="flex-1 space-y-4 font-semibold text-xs text-slate-600 dark:text-slate-300">
                    {/* Full Name Row */}
                    <div className="border-b border-slate-100 pb-4 dark:border-white/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Full Name</label>
                          {editingField === "name" ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="mt-1 h-8 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 font-semibold text-xs text-slate-900 focus:border-[#7b61ff] focus:outline-none dark:border-white/10 dark:bg-[#0e1726] dark:text-white"
                              autoFocus
                            />
                          ) : (
                            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">{profile.name}</p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {editingField === "name" ? (
                            <>
                              <button onClick={() => saveEdit("name")} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold">Save</button>
                              <button onClick={cancelEdit} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-600 dark:bg-white/5 dark:text-slate-300 font-bold">Cancel</button>
                            </>
                          ) : (
                            <button onClick={() => startEditing("name", profile.name)} className="rounded-lg bg-slate-50 px-3 py-1.5 text-[10px] hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 font-bold">Edit</button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Email Row */}
                    <div className="border-b border-slate-100 pb-4 dark:border-white/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Email Address</label>
                          {editingField === "email" ? (
                            <input
                              type="email"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="mt-1 h-8 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 font-semibold text-xs text-slate-900 focus:border-[#7b61ff] focus:outline-none dark:border-white/10 dark:bg-[#0e1726] dark:text-white"
                              autoFocus
                            />
                          ) : (
                            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">{profile.email}</p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {editingField === "email" ? (
                            <>
                              <button onClick={() => saveEdit("email")} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold">Save</button>
                              <button onClick={cancelEdit} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-600 dark:bg-white/5 dark:text-slate-300 font-bold">Cancel</button>
                            </>
                          ) : (
                            <button onClick={() => startEditing("email", profile.email)} className="rounded-lg bg-slate-50 px-3 py-1.5 text-[10px] hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 font-bold">Edit</button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mentor ID Row */}
                    <div className="border-b border-slate-100 pb-4 dark:border-white/5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Mentor ID</label>
                          <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white">{profile.mentorId}</p>
                        </div>
                        <button onClick={() => handleCopy(profile.mentorId)} className="rounded-lg bg-slate-50 px-3 py-1.5 text-[10px] hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 font-bold">Copy</button>
                      </div>
                    </div>

                    {/* Bio Row */}
                    <div className="pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Bio</label>
                          {editingField === "bio" ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              rows={3}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 font-semibold text-xs text-slate-900 focus:border-[#7b61ff] focus:outline-none dark:border-white/10 dark:bg-[#0e1726] dark:text-white"
                              autoFocus
                            />
                          ) : (
                            <p className="mt-1 text-xs font-bold text-slate-900 dark:text-white leading-relaxed">{profile.bio}</p>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {editingField === "bio" ? (
                            <>
                              <button onClick={() => saveEdit("bio")} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold">Save</button>
                              <button onClick={cancelEdit} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-600 dark:bg-white/5 dark:text-slate-300 font-bold">Cancel</button>
                            </>
                          ) : (
                            <button onClick={() => startEditing("bio", profile.bio)} className="rounded-lg bg-slate-50 px-3 py-1.5 text-[10px] hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 font-bold">Edit</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Grid: Change Password & 2FA */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Change Password Card */}
                <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-white/5 dark:bg-[#0b1020]">
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Change Password</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Update your password regularly.</p>

                  <form onSubmit={handlePasswordUpdate} className="mt-5 space-y-3 font-semibold">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Password</label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        value={passwords.current}
                        onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-[#7b61ff] focus:outline-none dark:border-white/10 dark:bg-[#0e1726] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={passwords.next}
                        onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-[#7b61ff] focus:outline-none dark:border-white/10 dark:bg-[#0e1726] dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-2 flex h-10 w-full items-center justify-center rounded-xl bg-[#7b61ff] text-xs font-bold text-white hover:opacity-90 transition-opacity"
                    >
                      Update Password
                    </button>
                  </form>
                </section>

                {/* Two Factor Auth Card */}
                <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-white/5 dark:bg-[#0b1020]">
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Two-Factor Authentication</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>

                  <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-[#0e1726] font-semibold text-xs">
                    <span className="text-slate-600 dark:text-slate-300">Status</span>
                    {twoFactorEnabled ? (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">Enabled</span>
                    ) : (
                      <span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] font-bold text-red-600 dark:bg-red-500/15 dark:text-red-400">Disabled</span>
                    )}
                  </div>

                  <button
                    onClick={handleToggle2FA}
                    type="button"
                    className="mt-10 flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold hover:bg-slate-100 dark:border-white/10 dark:bg-[#1c223c] dark:hover:bg-[#252d4e]"
                  >
                    {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </button>
                </section>
              </div>

              {/* Notification Preferences Section */}
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-white/5 dark:bg-[#0b1020]">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Notification Preferences</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Choose how you want to be notified.</p>

                <div className="mt-6 grid gap-6 sm:grid-cols-3 font-semibold">
                  {/* Email Toggle */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6 dark:border-white/5">
                    <div>
                      <p className="text-xs text-slate-900 dark:text-white">Email Notifications</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Receive email updates</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notificationToggles.email}
                        onChange={(e) => updateNotification("email", e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-[#7b61ff] transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  {/* In App Toggle */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6 dark:border-white/5">
                    <div>
                      <p className="text-xs text-slate-900 dark:text-white">In-app Notifications</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Receive in-app updates</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notificationToggles.inApp}
                        onChange={(e) => updateNotification("inApp", e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-[#7b61ff] transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                    </label>
                  </div>

                  {/* Reminders Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-900 dark:text-white">Evaluation Reminders</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Get reminders for reviews</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notificationToggles.reminders}
                        onChange={(e) => updateNotification("reminders", e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="h-6 w-11 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-[#7b61ff] transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* 2. Security Settings Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-white/5 dark:bg-[#0b1020]">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Active Sessions</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Manage and sign out of your active sessions on other devices.</p>

                <div className="mt-6 space-y-4 font-semibold text-xs">
                  {sessions.map((sess) => (
                    <div key={sess.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 dark:bg-white/5 dark:text-slate-300">
                          {sess.type === "desktop" ? <Laptop className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{sess.device}</span>
                            {sess.active && (
                              <span className="rounded-full bg-[#7b61ff]/10 px-2 py-0.5 text-[9px] font-bold text-[#7b61ff] dark:bg-[#7b61ff]/20 dark:text-[#a291ff]">Current Session</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sess.location} • {sess.ip}</p>
                        </div>
                      </div>
                      {!sess.active && (
                        <button
                          onClick={() => revokeSession(sess.id)}
                          type="button"
                          className="text-red-500 hover:text-red-600 text-[10px] font-bold"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* 3. Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-white/5 dark:bg-[#0b1020]">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Email Preferences</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Subscribe or unsubscribe from different notification groups.</p>

                <div className="mt-6 space-y-4 font-semibold text-xs">
                  {[
                    { title: "Weekly Digests", desc: "Get summary of all student submissions and scheduled vivas." },
                    { title: "Immediate Feedback Alerts", desc: "Get notified as soon as a student comments on evaluations." },
                    { title: "Platform Announcements", desc: "Stay up to date with new features, upgrades and news." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 dark:border-white/5">
                      <div>
                        <p className="text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center mt-1">
                        <input type="checkbox" defaultChecked className="peer sr-only" />
                        <span className="h-5 w-9 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-[#7b61ff] transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
                      </label>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* 4. Appearance Settings */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-white/5 dark:bg-[#0b1020]">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Display Theme</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Choose your interface theme style.</p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 font-bold text-xs">
                  {/* Light Theme option */}
                  <button
                    onClick={() => {
                      setTheme("light");
                      showToast("Light mode applied!");
                    }}
                    className={`flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                      mounted && resolvedTheme === "light"
                        ? "border-[#7b61ff] bg-slate-50 dark:bg-white/5"
                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-white/5 dark:bg-white/5"
                    }`}
                  >
                    <div className="h-20 w-full rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                      <span className="text-slate-400 text-[10px]">Light Preview</span>
                    </div>
                    <span className="text-slate-900 dark:text-white">Light Mode</span>
                  </button>

                  {/* Dark Theme option */}
                  <button
                    onClick={() => {
                      setTheme("dark");
                      showToast("Dark mode applied!");
                    }}
                    className={`flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                      mounted && resolvedTheme === "dark"
                        ? "border-[#7b61ff] bg-slate-950"
                        : "border-slate-200 bg-slate-950 hover:border-slate-300 dark:border-white/5"
                    }`}
                  >
                    <div className="h-20 w-full rounded-xl bg-[#0b1020] shadow-sm border border-white/5 flex items-center justify-center">
                      <span className="text-slate-500 text-[10px]">Dark Preview</span>
                    </div>
                    <span className="text-white">Dark Mode</span>
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* 5. Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-white/5 dark:bg-[#0b1020]">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Privacy Controls</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Control who can search you and view your portfolio activity.</p>

                <div className="mt-6 space-y-4 font-semibold text-xs">
                  {/* Public directory toggle */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-white/5">
                    <div>
                      <p className="text-slate-900 dark:text-white">Public Directory Visibility</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Allow other students and mentors to view your active profile.</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center mt-1">
                      <input
                        type="checkbox"
                        checked={privacy.publicDirectory}
                        onChange={(e) => updatePrivacy("publicDirectory", e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="h-5 w-9 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-[#7b61ff] transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
                    </label>
                  </div>

                  {/* Active status toggle */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-white/5">
                    <div>
                      <p className="text-slate-900 dark:text-white">Show Active Status</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Display when you are actively reviewing evaluations or online.</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center mt-1">
                      <input
                        type="checkbox"
                        checked={privacy.activeStatus}
                        onChange={(e) => updatePrivacy("activeStatus", e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="h-5 w-9 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-[#7b61ff] transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
                    </label>
                  </div>

                  {/* Search index toggle */}
                  <div className="flex items-start justify-between pb-0">
                    <div>
                      <p className="text-slate-900 dark:text-white">Index profile in Search Engines</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Allow external search tools like Google to map your public link.</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center mt-1">
                      <input
                        type="checkbox"
                        checked={privacy.searchIndexing}
                        onChange={(e) => updatePrivacy("searchIndexing", e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="h-5 w-9 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-[#7b61ff] transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
                    </label>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* 6. Connected Accounts */}
          {activeTab === "connected" && (
            <div className="space-y-6">
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-white/5 dark:bg-[#0b1020]">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Connected Services</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Integrate third-party services to access more tools and import credentials.</p>

                <div className="mt-6 space-y-4 font-semibold text-xs">
                  {connectedAccounts.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-b-0 last:pb-0 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 uppercase font-black tracking-widest text-[9px] dark:bg-white/5 dark:text-slate-300">
                          {acc.provider.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white capitalize">{acc.provider}</span>
                          {acc.connected ? (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[140px] sm:max-w-xs">{acc.email}</p>
                          ) : (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Not integrated yet.</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleConnection(acc.id)}
                        disabled={connectingId === acc.id}
                        type="button"
                        className={`min-w-[80px] flex items-center justify-center rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all ${
                          acc.connected
                            ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                            : "bg-slate-900 text-white hover:opacity-90 dark:bg-white dark:text-slate-950"
                        }`}
                      >
                        {connectingId === acc.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : acc.connected ? (
                          "Disconnect"
                        ) : (
                          "Connect"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* 7. Help & Support */}
          {activeTab === "help" && (
            <div className="space-y-6">
              {/* FAQ Section */}
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-white/5 dark:bg-[#0b1020]">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Frequently Asked Questions</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Quick answers to common questions about mentoring and evaluations.</p>

                <div className="mt-6 space-y-3 font-semibold text-xs">
                  {[
                    { q: "How do I change my scheduled viva timings?", a: "Go to the Vivas tab, select the scheduled entry and select the reschedule options from the actions menu." },
                    { q: "Can I download my evaluation report?", a: "Yes, you can export reports in PDF and CSV format via the Reports dashboard tab." },
                    { q: "How are grades computed?", a: "Grades are computed based on pre-defined weightages for problem solving, code cleanliness, and documentation metrics." }
                  ].map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="flex w-full items-center justify-between bg-slate-50/50 p-4 text-left dark:bg-white/[0.02] hover:bg-slate-100/50 dark:hover:bg-white/[0.05]"
                      >
                        <span className="text-slate-900 dark:text-white font-bold">{item.q}</span>
                        {expandedFaq === idx ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {expandedFaq === idx && (
                        <div className="p-4 bg-white dark:bg-[#0b1020] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 leading-relaxed font-semibold">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Submitted Tickets Section */}
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-white/5 dark:bg-[#0b1020]">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Your Support Tickets</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Track and view responses for your submitted queries.</p>

                <div className="mt-6 space-y-3 font-semibold text-xs">
                  {tickets.map((t) => (
                    <div key={t.id} className="rounded-xl border border-slate-100 p-4 dark:border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{t.id}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">{t.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t.message}</p>
                      </div>
                      <span className={`self-start sm:self-center rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                        t.status === "Resolved"
                          ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : t.status === "In Review"
                            ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
                            : "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Contact Support Form */}
              <section className="rounded-[24px] border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:border-white/5 dark:bg-[#0b1020]">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Contact Support</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Send us a message and our support team will help you shortly.</p>

                <form onSubmit={handleSupportSubmit} className="mt-5 space-y-4 font-semibold text-xs">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Your Message</label>
                    <textarea
                      placeholder="Describe the problem you are experiencing..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-[#7b61ff] focus:outline-none dark:border-white/10 dark:bg-[#0e1726] dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex h-10 w-full items-center justify-center rounded-xl bg-[#7b61ff] text-xs font-bold text-white hover:opacity-90 transition-opacity"
                  >
                    Submit Support Ticket
                  </button>
                </form>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
