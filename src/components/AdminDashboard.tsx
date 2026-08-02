import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Building2, FileText, Tag, FolderKanban, MessageSquare, 
  AlertTriangle, BarChart3, Settings, ScrollText, ShieldAlert,
  CheckCircle, XCircle, Trash2, Edit3, Plus, UserX, ShieldCheck, Star, Loader2,
  Sparkles, Search, Filter, RefreshCw, Zap, SlidersHorizontal, Eye,
  Activity, Globe, Cpu, Megaphone, Download, Upload, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Company, Ad, Promotion, Review } from '@/types';
import { useAuth } from '@/lib/AuthContext';
import { Sidebar } from '@/components/common/layout/Sidebar';
import { AdminAdvancedPanel } from '@/components/admin/dashboard/AdminAdvancedPanel';
import { UserDetailModal } from '@/components/admin/dashboard/AdminUserModal';

// Enterprise Admin Suite Sub-modules
import { AdminUserAnalytics } from '@/components/admin/AdminUserAnalytics';
import { AdminGusVerifier } from '@/components/admin/AdminGusVerifier';
import { AdminAntiSpam } from '@/components/admin/AdminAntiSpam';
import { AdminAuditLogger } from '@/components/admin/AdminAuditLogger';
import { AdminSecurityRadar } from '@/components/admin/AdminSecurityRadar';
import { AdminModerationQueue } from '@/components/admin/AdminModerationQueue';
import { AdminSystemTelemetry } from '@/components/admin/AdminSystemTelemetry';
import { AdminNotificationCenter } from '@/components/admin/AdminNotificationCenter';

type AdminTab = 
  | 'users' 
  | 'companies' 
  | 'ads' 
  | 'promos' 
  | 'categories' 
  | 'reviews' 
  | 'reports' 
  | 'stats'
  | 'analytics'
  | 'gus'
  | 'antispam'
  | 'audit'
  | 'radar'
  | 'modqueue'
  | 'telemetry'
  | 'broadcast'
  | 'advanced'
  | 'settings'
  | 'logs';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'firma' | 'admin';
  status: 'active' | 'blocked' | 'pending';
  createdAt?: string;
  violationsCount?: number;
  trustScore?: number;
  lastLogin?: string;
  ipAddress?: string;
  deviceInfo?: string;
  country?: string;
  registrationSource?: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  todayRegistrations: number;
  totalCompanies: number;
  verifiedCompanies: number;
  pendingAds: number;
  flaggedContent: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface AdminDashboardProps {
  onNavigate?: (view: any) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'firma' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Real Database State
  const [users, setUsers] = useState<UserItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Backend API Stats
  const [apiStats, setApiStats] = useState<any>(null);
  const [loadingApiStats, setLoadingApiStats] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const loadRealAdminData = async () => {
    setLoadingDb(true);
    try {
      // 1. Try MySQL 8.0 Primary Database
      const [uRes, cRes, aRes, pRes, catRes, rRes, repRes, lRes] = await Promise.allSettled([
        fetch('/api/mysql/users').then(r => r.json()),
        fetch('/api/mysql/companies').then(r => r.json()),
        fetch('/api/mysql/ads').then(r => r.json()),
        fetch('/api/mysql/promotions').then(r => r.json()),
        fetch('/api/mysql/categories').then(r => r.json()),
        fetch('/api/mysql/reviews').then(r => r.json()),
        fetch('/api/mysql/reports').then(r => r.json()),
        fetch('/api/mysql/audit_logs').then(r => r.json())
      ]);

      if (uRes.status === 'fulfilled' && Array.isArray(uRes.value)) {
        setUsers(uRes.value);
      }
      if (cRes.status === 'fulfilled' && Array.isArray(cRes.value)) {
        setCompanies(cRes.value);
      }
      if (aRes.status === 'fulfilled' && Array.isArray(aRes.value)) {
        setAds(aRes.value);
      }
      if (pRes.status === 'fulfilled' && Array.isArray(pRes.value)) {
        setPromotions(pRes.value);
      }
      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value)) {
        const catNames = catRes.value.map((c: any) => c.name);
        if (catNames.length > 0) setCategories(catNames);
        else setCategories(['Uroda i Styl', 'Motoryzacja', 'Usługi domowe', 'Gastronomia', 'Medycyna', 'Nieruchomości']);
      } else {
        setCategories(['Uroda i Styl', 'Motoryzacja', 'Usługi domowe', 'Gastronomia', 'Medycyna', 'Nieruchomości']);
      }
      if (rRes.status === 'fulfilled' && Array.isArray(rRes.value)) {
        setReviews(rRes.value);
      }
      if (repRes.status === 'fulfilled' && Array.isArray(repRes.value)) {
        setReports(repRes.value);
      }
      if (lRes.status === 'fulfilled' && Array.isArray(lRes.value)) {
        setLogs(lRes.value);
      }
    } catch (err) {
      console.error("Error loading real data from MySQL 8.0:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    loadRealAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 'stats') {
      setLoadingApiStats(true);
      fetch('/admin/api/stats/summary', {
        headers: { 'x-admin-token': localStorage.getItem('adminToken') || '' }
      })
        .then(res => res.json())
        .then(data => {
          setApiStats(data);
          setLoadingApiStats(false);
        })
        .catch(() => {
          setApiStats({
            monthlyRevenue: [
              { month: 'Mar', amount: 0 },
              { month: 'Kwi', amount: 0 },
              { month: 'Maj', amount: 0 },
              { month: 'Cze', amount: 0 },
              { month: 'Lip', amount: companies.filter(c => c.visibilityPackage !== 'free').length * 299 }
            ],
            registrationTrends: [
              { name: 'Mieszkańcy', count: users.filter(u => u.role === 'client').length },
              { name: 'Firmy', count: companies.length },
              { name: 'Administratorzy', count: users.filter(u => u.role === 'admin').length }
            ],
            popularCategories: categories.slice(0, 4).map(c => ({ category: c, searches: 0 }))
          });
          setLoadingApiStats(false);
        });
    }
  }, [activeTab, users, companies, categories]);

  const toggleUserStatus = async (id: string) => {
    const userObj = users.find(u => u.id === id);
    if (!userObj) return;
    const newStatus = userObj.status === 'active' ? 'blocked' : 'active';
    setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));

    try {
      const { getFirebaseDb } = await import('@/lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      const db = await getFirebaseDb();
      await updateDoc(doc(db, 'users', id), { status: newStatus, isBlocked: newStatus === 'blocked' });
    } catch (err) {
      console.error("Error updating user status in DB:", err);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to konto trwale z bazy danych?')) return;
    setUsers(users.filter(u => u.id !== id));

    try {
      const { getFirebaseDb } = await import('@/lib/firebase');
      const { doc, deleteDoc } = await import('firebase/firestore');
      const db = await getFirebaseDb();
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      console.error("Error deleting user from DB:", err);
    }
  };

  const toggleCompanyStatus = async (uid: string) => {
    const targetComp = companies.find(c => c.uid === uid);
    if (!targetComp) return;
    const newPkg = targetComp.visibilityPackage === 'free' ? 'platinum' : 'free';
    setCompanies(companies.map(c => c.uid === uid ? { ...c, visibilityPackage: newPkg } : c));

    try {
      const { getFirebaseDb } = await import('@/lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      const db = await getFirebaseDb();
      await updateDoc(doc(db, 'companies', uid), { visibilityPackage: newPkg });
    } catch (err) {
      console.error("Error updating company visibility in DB:", err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    setCategories([...categories, catName]);
    setNewCategoryName('');

    try {
      const { getFirebaseDb } = await import('@/lib/firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      const db = await getFirebaseDb();
      await addDoc(collection(db, 'categories'), { name: catName, createdAt: new Date().toISOString() });
    } catch (err) {
      console.error("Error adding category to DB:", err);
    }
  };

  const deleteCategory = async (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  // ==================== NOWE FUNKCJE ====================

  // Bulk delete users
  const handleBulkDeleteUsers = async () => {
    if (selectedUsers.size === 0) return;
    if (!confirm(`Czy na pewno chcesz usunąć ${selectedUsers.size} użytkowników?`)) return;

    try {
      const { getFirebaseDb } = await import('@/lib/firebase');
      const { doc, deleteDoc } = await import('firebase/firestore');
      const db = await getFirebaseDb();

      for (const userId of selectedUsers) {
        await deleteDoc(doc(db, 'users', userId));
      }

      setUsers(users.filter(u => !selectedUsers.has(u.id)));
      setSelectedUsers(new Set());
    } catch (err) {
      console.error("Error bulk deleting users:", err);
    }
  };

  // Bulk block users
  const handleBulkBlockUsers = async () => {
    if (selectedUsers.size === 0) return;

    try {
      const { getFirebaseDb } = await import('@/lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      const db = await getFirebaseDb();

      for (const userId of selectedUsers) {
        await updateDoc(doc(db, 'users', userId), { status: 'blocked', isBlocked: true });
      }

      setUsers(users.map(u => selectedUsers.has(u.id) ? { ...u, status: 'blocked' } : u));
      setSelectedUsers(new Set());
    } catch (err) {
      console.error("Error bulk blocking users:", err);
    }
  };

  // Export data as CSV
  const handleExportData = (dataType: 'users' | 'companies' | 'reports') => {
    let data = [];
    let headers = [];

    if (dataType === 'users') {
      headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Created At'];
      data = users.map(u => [u.id, u.name, u.email, u.role, u.status, u.createdAt || 'N/A']);
    } else if (dataType === 'companies') {
      headers = ['ID', 'Company Name', 'NIP', 'Phone', 'Visibility Package'];
      data = companies.map(c => [c.uid, c.companyName, c.nip, c.phone, c.visibilityPackage]);
    } else if (dataType === 'reports') {
      headers = ['ID', 'Target ID', 'Reason', 'Status', 'Created At'];
      data = reports.map(r => [r.id, r.targetId, r.reason, r.status, r.createdAt]);
    }

    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Select all filtered users
  const selectAllFilteredUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  // Filtered & sorted users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let compareValue = 0;
    if (sortBy === 'name') {
      compareValue = a.name.localeCompare(b.name);
    } else if (sortBy === 'date') {
      compareValue = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    } else if (sortBy === 'status') {
      compareValue = a.status.localeCompare(b.status);
    }
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  // Find duplicate companies by NIP
  const findDuplicateCompanies = () => {
    const nipMap = new Map<string, typeof companies>();
    const duplicates: typeof companies[] = [];

    companies.forEach(comp => {
      if (comp.nip) {
        if (nipMap.has(comp.nip)) {
          duplicates.push(comp);
        } else {
          nipMap.set(comp.nip, comp);
        }
      }
    });

    return duplicates;
  };

  // Generate admin report
  const generateAdminReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      totalUsers: users.length,
      totalCompanies: companies.length,
      totalAds: ads.length,
      totalReports: reports.length,
      blockedUsers: users.filter(u => u.status === 'blocked').length,
      usersByRole: {
        client: users.filter(u => u.role === 'client').length,
        firma: users.filter(u => u.role === 'firma').length,
        admin: users.filter(u => u.role === 'admin').length,
      },
      pendingReports: reports.filter(r => r.status === 'pending').length,
      duplicateCompanies: findDuplicateCompanies().length,
    };

    return report;
  };

  const handleResolveReport = async (id: string, action: 'keep' | 'delete') => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'resolved' } : r));

    try {
      const { getFirebaseDb } = await import('@/lib/firebase');
      const { doc, updateDoc, deleteDoc } = await import('firebase/firestore');
      const db = await getFirebaseDb();
      await updateDoc(doc(db, 'reports', id), { status: 'resolved' });
      if (action === 'delete') {
        const targetReport = reports.find(r => r.id === id);
        if (targetReport?.targetId) {
          await deleteDoc(doc(db, 'ads', targetReport.targetId));
        }
      }
    } catch (err) {
      console.error("Error resolving report:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      <Sidebar
        title="Admin Główny"
        subtitle="Panel Dowodzenia Enterprise"
        tabs={[
          { id: 'users', label: 'Użytkownicy', icon: Users },
          { id: 'companies', label: 'Firmy', icon: Building2 },
          { id: 'analytics', label: 'Analiza Behawioralna', icon: Activity },
          { id: 'gus', label: 'Weryfikacja GUS', icon: ShieldCheck },
          { id: 'antispam', label: 'Tarcza Anti-Spam', icon: ShieldAlert },
          { id: 'radar', label: 'Radar Threat & IP', icon: Globe },
          { id: 'modqueue', label: 'Kolejka Moderacji', icon: CheckCircle },
          { id: 'audit', label: 'Audit Vault', icon: ScrollText },
          { id: 'telemetry', label: 'Telemetria Węzła', icon: Cpu },
          { id: 'broadcast', label: 'Powiadomienia PUSH', icon: Megaphone },
          { id: 'ads', label: 'Ogłoszenia', icon: FileText },
          { id: 'promos', label: 'Promocje', icon: Tag },
          { id: 'categories', label: 'Kategorie', icon: FolderKanban },
          { id: 'reviews', label: 'Opinie', icon: MessageSquare },
          { id: 'reports', label: 'Zgłoszenia', icon: AlertTriangle },
          { id: 'stats', label: 'Statystyki', icon: BarChart3 },
          { id: 'advanced', label: 'Zaawansowane', icon: SlidersHorizontal },
          { id: 'settings', label: 'Ustawienia', icon: Settings }
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as AdminTab)}
        onLogout={async () => {
          await logout();
          onNavigate?.('login');
        }}
        onGoToSearch={() => onNavigate?.('home')}
        badge="SUPERADMIN"
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1">
                <Sparkles className="w-4 h-4" /> System Kontrolny Enterprise v3.0
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {activeTab === 'users' && 'Zarządzanie Użytkownikami'}
                {activeTab === 'companies' && 'Katalog i Weryfikacja Firm'}
                {activeTab === 'analytics' && 'Analiza Behawioralna & Trust Score'}
                {activeTab === 'gus' && 'Weryfikacja Podmiotów w GUS / REGON'}
                {activeTab === 'antispam' && 'Tarcza Anti-Spam & Filtry Contentu'}
                {activeTab === 'radar' && 'Radar Zagrożeń & Czarna Lista IP'}
                {activeTab === 'modqueue' && 'Szybka Kolejka Moderacji'}
                {activeTab === 'audit' && 'Niezmienny Dziennik Audytowy (Vault)'}
                {activeTab === 'telemetry' && 'Telemetria & Diagnostyka Węzła'}
                {activeTab === 'broadcast' && 'Centrum Powiadomień & Baner Awaryjny'}
                {activeTab === 'ads' && 'Moderacja Ogłoszeń i Ofert'}
                {activeTab === 'promos' && 'Kupony i Promocje'}
                {activeTab === 'categories' && 'Kategorie Branżowe'}
                {activeTab === 'reviews' && 'Moderacja Opinii i Ocen'}
                {activeTab === 'reports' && 'Zgłoszenia i Bezpieczeństwo'}
                {activeTab === 'stats' && 'Analityka i Raporty SaaS'}
                {activeTab === 'advanced' && 'Zaawansowany Panel Kontrolny'}
                {activeTab === 'settings' && 'Ustawienia Portalu'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                Zarządzaj produkcją, bezpieczeństwem, weryfikacją firm oraz komunikacją ze społecznością.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={loadRealAdminData}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingDb ? 'animate-spin' : ''}`} /> Odśwież Dane
              </button>
            </div>
          </motion.div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Konta w Bazie</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">Baza Realna</span>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Zarejestrowane Firmy</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{companies.length}</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full">Firestore</span>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Aktywne Ogłoszenia</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{ads.length}</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">Aktywne</span>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Zgłoszenia Naruszeń</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{reports.filter(r => r.status === 'pending').length}</span>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">Wymaga Akcji</span>
              </div>
            </motion.div>
          </div>

          {/* Animated Tab Content Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none"
            >
              {/* USERS TAB */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* Filters Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Szukaj w bazie po nazwie lub email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                      {(['all', 'client', 'firma', 'admin'] as const).map(role => (
                        <button
                          key={role}
                          onClick={() => setRoleFilter(role)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                            roleFilter === role 
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {role === 'all' ? 'Wszystkie' : role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter & Sort */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Status:</span>
                      {(['all', 'active', 'blocked'] as const).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-2 py-1 text-xs rounded ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                          {s === 'all' ? 'Wszyscy' : s === 'active' ? 'Aktywni' : 'Zablokowani'}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Sortuj:</span>
                      {(['name', 'date', 'status'] as const).map(s => (
                        <button key={s} onClick={() => setSortBy(s)} className={`px-2 py-1 text-xs rounded ${sortBy === s ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                          {s === 'name' ? 'Nazwa' : s === 'date' ? 'Data' : 'Status'}
                        </button>
                      ))}
                      <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-2 py-1 text-xs rounded bg-slate-100">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>

                  {/* Bulk Actions Bar */}
                  {selectedUsers.size > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                          onChange={selectAllFilteredUsers}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          Wybrano {selectedUsers.size} z {filteredUsers.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={handleBulkBlockUsers} className="px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                          🚫 Zablokuj ({selectedUsers.size})
                        </button>
                        <button onClick={handleBulkDeleteUsers} className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                          🗑️ Usuń ({selectedUsers.size})
                        </button>
                        <button onClick={() => handleExportData('users')} className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                          📥 Export
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Users Table */}
                  {loadingDb ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pobieranie kont z Firestore...</span>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-bold">
                      Brak zarejestrowanych kont spełniających kryteria.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                            <th className="pb-4 px-2 w-12">
                              <input 
                                type="checkbox"
                                checked={sortedUsers.length > 0 && selectedUsers.size === sortedUsers.length}
                                onChange={selectAllFilteredUsers}
                                className="w-4 h-4 cursor-pointer"
                              />
                            </th>
                            <th className="pb-4 px-2">Użytkownik</th>
                            <th className="pb-4">Rola</th>
                            <th className="pb-4">Trust Score</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-right px-2">Akcje</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                          {sortedUsers.map(u => (
                            <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${selectedUsers.has(u.id) ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}>
                              <td className="py-4 px-2">
                                <input 
                                  type="checkbox"
                                  checked={selectedUsers.has(u.id)}
                                  onChange={() => toggleUserSelection(u.id)}
                                  className="w-4 h-4 cursor-pointer"
                                />
                              </td>
                              <td className="py-4 px-2">
                                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  {u.name}
                                </p>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{u.email}</p>
                              </td>
                              <td className="py-4 capitalize">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                                  u.role === 'admin' 
                                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' 
                                    : u.role === 'firma'
                                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${
                                        (u.trustScore || 100) > 80 ? 'bg-emerald-500' : 'bg-amber-500'
                                      }`} 
                                      style={{ width: `${u.trustScore || 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{u.trustScore || 100}%</span>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  u.status === 'active' 
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                }`}>
                                  {u.status === 'active' ? 'Aktywny' : 'Zablokowany'}
                                </span>
                              </td>
                              <td className="py-4 text-right space-x-1 px-2">
                                <button
                                  onClick={() => setSelectedUserId(u.id)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                                  title="Szczegóły konta"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => toggleUserStatus(u.id)}
                                  className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                                  title={u.status === 'active' ? 'Zablokuj' : 'Aktywuj'}
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteUser(u.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                  title="Usuń trwale"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ENTERPRISE MODULE TABS */}
              {activeTab === 'analytics' && <AdminUserAnalytics />}
              {activeTab === 'gus' && <AdminGusVerifier />}
              {activeTab === 'antispam' && <AdminAntiSpam />}
              {activeTab === 'radar' && <AdminSecurityRadar />}
              {activeTab === 'modqueue' && <AdminModerationQueue />}
              {activeTab === 'audit' && <AdminAuditLogger />}
              {activeTab === 'telemetry' && <AdminSystemTelemetry />}
              {activeTab === 'broadcast' && <AdminNotificationCenter />}

              {/* COMPANIES TAB */}
              {activeTab === 'companies' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Zweryfikowane Firmy w Systemie</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          const dupes = findDuplicateCompanies();
                          alert(`Znaleziono ${dupes.length} zduplikowanych firm (po NIP):\n\n${dupes.map(d => `${d.companyName} (NIP: ${d.nip})`).join('\n')}`);
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                      >
                        🔍 Szukaj Duplikatów
                      </button>
                      <button 
                        onClick={() => {
                          const report = generateAdminReport();
                          const csvContent = `RAPORT ADMINISTRACYJNY
Generated: ${report.generatedAt}

STATYSTYKA OGÓLNA
Total Users: ${report.totalUsers}
Total Companies: ${report.totalCompanies}
Total Ads: ${report.totalAds}
Total Reports: ${report.totalReports}
Blocked Users: ${report.blockedUsers}
Duplicate Companies: ${report.duplicateCompanies}

UŻYTKOWNICY PO ROLI
Clients: ${report.usersByRole.client}
Companies: ${report.usersByRole.firma}
Admins: ${report.usersByRole.admin}

ZGŁOSZENIA
Pending: ${report.pendingReports}`;
                          
                          const blob = new Blob([csvContent], { type: 'text/plain' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `admin_report_${new Date().toISOString().split('T')[0]}.txt`;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                      >
                        📊 Generuj Raport
                      </button>
                    </div>
                  </div>

                  {companies.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-bold">
                      Brak zarejestrowanych profilów firm w bazie.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {companies.map(c => (
                        <motion.div 
                          key={c.uid} 
                          whileHover={{ scale: 1.01 }}
                          className="p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{c.companyName}</h4>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                                c.visibilityPackage !== 'free' 
                                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' 
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}>
                                {c.visibilityPackage || 'FREE'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                              Adres: {c.address}, {c.city} | Telefon: {c.phone || 'brak'}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/50">
                            <span className="text-xs font-bold text-slate-400">NIP: {c.nip || 'brak'}</span>
                            <button 
                              onClick={() => toggleCompanyStatus(c.uid)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                c.visibilityPackage !== 'free' 
                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {c.visibilityPackage !== 'free' ? 'Promowany Platinum' : 'Promuj na Platinum'}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADS TAB */}
              {activeTab === 'ads' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Moderacja Ogłoszeń</h3>
                  {ads.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-bold">
                      Brak opublikowanych ogłoszeń w bazie.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ads.map(ad => (
                        <div key={ad.id} className="p-4 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/30">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                              {ad.category}
                            </span>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2">{ad.title}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{ad.description}</p>
                          </div>
                          <button 
                            onClick={async () => {
                              setAds(ads.filter(a => a.id !== ad.id));
                              try {
                                const { getFirebaseDb } = await import('@/lib/firebase');
                                const { doc, deleteDoc } = await import('firebase/firestore');
                                const db = await getFirebaseDb();
                                await deleteDoc(doc(db, 'ads', ad.id));
                              } catch(e) {}
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PROMOTIONS TAB */}
              {activeTab === 'promos' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Kupony Rabatowe i Promocje</h3>
                  {promotions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-bold">
                      Brak aktywnych promocji w bazie.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {promotions.map(p => (
                        <div key={p.id} className="p-4 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-3 py-1 rounded-xl">
                              {p.discountValue}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{p.title}</span>
                          </div>
                          <button 
                            onClick={async () => {
                              setPromotions(promotions.filter(pr => pr.id !== p.id));
                              try {
                                const { getFirebaseDb } = await import('@/lib/firebase');
                                const { doc, deleteDoc } = await import('firebase/firestore');
                                const db = await getFirebaseDb();
                                await deleteDoc(doc(db, 'promotions', p.id));
                              } catch(e) {}
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CATEGORIES TAB */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Kategorie Branżowe Portalu</h3>
                  <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md bg-slate-50 dark:bg-slate-800/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <input 
                      type="text" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Dodaj nową kategorię..."
                      className="flex-1 px-3 py-2 bg-transparent text-xs font-medium placeholder-slate-400 focus:outline-none"
                    />
                    <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-md shadow-indigo-600/20">
                      Dodaj
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2.5">
                    {categories.map((cat, idx) => (
                      <span key={idx} className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200/80 dark:border-slate-700">
                        <span>{cat}</span>
                        <button 
                          type="button" 
                          onClick={() => deleteCategory(cat)}
                          className="text-slate-400 hover:text-rose-600 text-base leading-none font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Moderacja Opinii</h3>
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-bold">
                      Brak opinii w bazie.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map(r => (
                        <div key={r.id} className="p-5 border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white text-sm">{r.clientName}</span>
                              <div className="flex items-center text-amber-500 mt-1">
                                <Star className="w-4 h-4 fill-amber-500 mr-1" />
                                <span className="text-xs font-bold">{r.rating} / 5</span>
                              </div>
                            </div>
                            <button 
                              onClick={async () => {
                                setReviews(reviews.filter(rev => rev.id !== r.id));
                                try {
                                  const { getFirebaseDb } = await import('@/lib/firebase');
                                  const { doc, deleteDoc } = await import('firebase/firestore');
                                  const db = await getFirebaseDb();
                                  await deleteDoc(doc(db, 'reviews', r.id));
                                } catch(e) {}
                              }}
                              className="text-xs font-bold text-rose-600 hover:underline"
                            >
                              Usuń opinię
                            </button>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed mt-2">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REPORTS TAB */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Zgłoszenia Naruszeń</h3>
                  {reports.filter(r => r.status === 'pending').length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-bold">
                      Brak oczekujących zgłoszeń naruszeń.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reports.filter(r => r.status === 'pending').map(rep => (
                        <div key={rep.id} className="p-5 border border-rose-200 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-rose-500" />
                              <span className="font-bold text-xs text-rose-700 dark:text-rose-400 uppercase tracking-wider">{rep.targetType || 'ogłoszenie'}</span>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white mt-1 text-sm">{rep.targetTitle || 'Tytuł zgłoszenia'}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Powód: {rep.reason} | Zgłosił: {rep.reporter || 'Użytkownik'}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button 
                              onClick={() => handleResolveReport(rep.id, 'keep')}
                              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs"
                            >
                              Odrzuć
                            </button>
                            <button 
                              onClick={() => handleResolveReport(rep.id, 'delete')}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20"
                            >
                              Usuń Ofertę
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STATS TAB */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Pulpit Analityczny Platformy</h3>
                  {loadingApiStats || !apiStats ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Obliczanie statystyk w czasie rzeczywistym...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 rounded-2xl">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Wzrost przychodów (SaaS)</h4>
                        <div className="h-40 flex items-end justify-between gap-2 pt-6">
                          {apiStats.monthlyRevenue.map((item: any, idx: number) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{item.amount}zł</span>
                              <div 
                                className="w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all duration-500" 
                                style={{ height: `${item.amount > 0 ? (item.amount / 3000) * 100 : 10}%` }}
                              />
                              <span className="text-[10px] font-bold text-slate-400">{item.month}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Struktura kont</h4>
                        {apiStats.registrationTrends.map((trend: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-500">{trend.name}</span>
                              <span className="text-slate-900 dark:text-white">{trend.count}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${users.length > 0 ? (trend.count / users.length) * 100 : 0}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ADVANCED TAB */}
              {activeTab === 'advanced' && (
                <AdminAdvancedPanel />
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-lg">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Ustawienia Portalu</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Nazwa Platformy</label>
                      <input type="text" defaultValue="LOKALNIE PRO" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Kontakt Główny Admina</label>
                      <input type="text" defaultValue="logadmin1@34sdas" className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:outline-none" />
                    </div>
                    <button onClick={() => alert('Ustawienia zapisane')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20">
                      Zapisz Zmiany
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onRefresh={loadRealAdminData}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
