import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Calendar,
  CalendarDays,
  ClipboardList,
  Scroll,
  CloudUpload,
  Monitor,
  Search,
  UserCheck,
  Home,
  ArrowRight,
  Sparkles,
  School,
  Lock,
  LogOut,
  User,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  Clock,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { MENU_ITEMS, ROLE_MENU_CONFIGS, ROLE_DETAILS, DEMO_USERS, SCHOOL_INFO } from '../data/mockData';
import { MenuKey, User as CurrentUser, UserRole, MenuItemConfig } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface HomeMenuCardProps {
  onSelectMenu: (key: MenuKey) => void;
  currentUser: CurrentUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  googleUser: FirebaseUser | null;
  onOpenSheetsModal: () => void;
  onSwitchUserRole?: (role: UserRole) => void;
  onSelectDemoUser?: (user: CurrentUser) => void;
}

export const HomeMenuCard: React.FC<HomeMenuCardProps> = ({
  onSelectMenu,
  currentUser,
  onOpenLogin,
  onLogout,
  googleUser,
  onOpenSheetsModal,
  onSwitchUserRole,
  onSelectDemoUser,
}) => {
  const [viewMode, setViewMode] = useState<'role' | 'all'>('role');

  const currentRole: UserRole = currentUser?.role || 'guru';
  const roleConfig = ROLE_DETAILS[currentRole];

  // Pick menu items based on active role or all
  const activeMenuItems: MenuItemConfig[] =
    viewMode === 'all'
      ? MENU_ITEMS
      : ROLE_MENU_CONFIGS[currentRole] || ROLE_MENU_CONFIGS.guru;

  // Map icons
  const getIcon = (iconName: string, isHighlighted?: boolean) => {
    switch (iconName) {
      case 'book-open':
        return <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />;
      case 'file-text':
        return <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />;
      case 'calendar':
        return <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" />;
      case 'calendar-days':
        return <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />;
      case 'clipboard-list':
        return <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />;
      case 'scroll':
        return <Scroll className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />;
      case 'cloud-upload':
        return <CloudUpload className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />;
      case 'monitor':
        return <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />;
      case 'search':
        return <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />;
      case 'user-check':
        return <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />;
    }
  };

  const handleRoleClick = (role: UserRole) => {
    if (role === 'tamu') {
      if (onSwitchUserRole) {
        onSwitchUserRole('tamu');
      }
      return;
    }

    if (currentUser?.role === role) {
      return;
    }

    // User must authenticate through login page with username & password
    onOpenLogin();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Background Glows & Bokeh Effect */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950 -z-10"></div>
      <div className="absolute top-12 left-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-8 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Bar with user status & Google Sheets shortcut */}
      <header className="w-full max-w-4xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
            SB
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-blue-300/80 font-bold block">
              Kurikulum Merdeka
            </span>
            <span className="text-xs font-bold text-white">
              SMA Negeri 1 Batangan
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Google Sheets Trigger */}
          <button
            onClick={onOpenSheetsModal}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
              googleUser
                ? 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300'
            }`}
            title="Integrasi Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Google Sheets</span>
            {googleUser ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ) : null}
          </button>

          {currentUser ? (
            <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium hidden sm:inline">
                {currentUser.name.split(',')[0]}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleConfig.badgeClass}`}>
                {roleConfig.badge}
              </span>
              <button
                onClick={onLogout}
                title="Keluar"
                className="text-slate-400 hover:text-rose-400 transition-colors p-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login Portal</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-2xl w-full mx-auto">
        {/* Brand Header */}
        <div className="w-full text-left mb-4 pl-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-md">
              PIJAR
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-md">
              SMABA
            </span>
          </div>
          <p className="text-sky-400 text-xs sm:text-sm font-semibold tracking-wide mt-0.5">
            Pusat Informasi dan Jaringan Belajar Smaba • SMA Negeri 1 Batangan
          </p>
        </div>

        {/* Banner if user is not logged in */}
        {!currentUser && (
          <div className="w-full mb-4 bg-gradient-to-r from-blue-900/80 via-slate-900 to-slate-900 border border-blue-500/40 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">Mode Tamu / Belum Masuk</div>
                <div className="text-slate-300 text-xs">
                  Untuk mengakses menu khusus Guru, Administrator, atau Kepala Sekolah, silakan masuk dengan Username & Password Anda.
                </div>
              </div>
            </div>
            <button
              onClick={onOpenLogin}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Masuk dengan Akun</span>
            </button>
          </div>
        )}

        {/* Quick Role Switcher Selector Tabs (Allows effortless testing of all 3 distinct user roles) */}
        <div className="w-full mb-4 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-lg backdrop-blur-sm">
          <div className="text-[11px] font-bold text-slate-400 px-2 pb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
              <span>Peralihan Peran Pengguna (Hak Akses & Menu Berbeda):</span>
            </span>
            <span className="text-[10px] text-slate-500">Klik untuk berganti peran</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {/* 1. Guru */}
            <button
              onClick={() => handleRoleClick('guru')}
              className={`p-2 rounded-xl text-left border transition-all flex flex-col ${
                currentRole === 'guru'
                  ? 'bg-blue-600/20 border-blue-500/60 text-white ring-1 ring-blue-500 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-300">👨‍🏫 Guru</span>
                {currentRole === 'guru' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                Dra. Hj. Siti Rahayu
              </span>
              <span className="text-[9px] text-slate-400">Guru B. Indonesia</span>
            </button>

            {/* 2. Administrator */}
            <button
              onClick={() => handleRoleClick('admin')}
              className={`p-2 rounded-xl text-left border transition-all flex flex-col ${
                currentRole === 'admin'
                  ? 'bg-amber-600/20 border-amber-500/60 text-white ring-1 ring-amber-500 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300">🛡️ Admin</span>
                {currentRole === 'admin' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                Supriyanto, S.Pd.
              </span>
              <span className="text-[9px] text-slate-400">Waka Kurikulum</span>
            </button>

            {/* 3. Kepala Sekolah */}
            <button
              onClick={() => handleRoleClick('kepsek')}
              className={`p-2 rounded-xl text-left border transition-all flex flex-col ${
                currentRole === 'kepsek'
                  ? 'bg-emerald-600/20 border-emerald-500/60 text-white ring-1 ring-emerald-500 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-300">👔 Kepsek</span>
                {currentRole === 'kepsek' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                H. Sudarmanto, M.Pd.
              </span>
              <span className="text-[9px] text-slate-400">Kepala Sekolah</span>
            </button>

            {/* 4. Tamu */}
            <button
              onClick={() => handleRoleClick('tamu')}
              className={`p-2 rounded-xl text-left border transition-all flex flex-col ${
                currentRole === 'tamu'
                  ? 'bg-slate-700/40 border-slate-600 text-white ring-1 ring-slate-500 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-300">👥 Tamu</span>
                {currentRole === 'tamu' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-300 font-medium truncate mt-0.5">
                Siswa & Publik
              </span>
              <span className="text-[9px] text-slate-400">Peninjau Kurikulum</span>
            </button>
          </div>
        </div>

        {/* Center White Card reproducing the screenshot aesthetic with dynamic role differentiation */}
        <div className="w-full bg-white text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 p-5 sm:p-7 space-y-5">
          {/* Card Top Title Row with Active Role Indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {viewMode === 'all'
                    ? 'Semua Menu Kurikulum'
                    : `Menu Khusus: ${roleConfig.name.split('/')[0]}`}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleConfig.badgeClass}`}
                >
                  {roleConfig.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {roleConfig.description}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Toggle to see all 10 standard items or role-filtered items */}
              <button
                onClick={() => setViewMode(viewMode === 'role' ? 'all' : 'role')}
                title={viewMode === 'role' ? 'Buka Semua 10 Menu' : 'Kembali ke Menu Khusus Peran'}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 transition-colors hidden sm:inline-flex items-center gap-1"
              >
                <Layers className="w-3 h-3" />
                <span>{viewMode === 'role' ? 'Lihat Semua Menu' : 'Menu Khusus'}</span>
              </button>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                title="Beranda Menu"
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center transition-colors shadow-xs"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Role Status Insight Banner */}
          {currentRole === 'guru' && (
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span>Status Administrasi Mengajar: Dra. Hj. Siti Rahayu, M.Pd.</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-blue-800 text-[11px]">
                  <span className="bg-white/90 px-2 py-0.5 rounded-md font-semibold border border-blue-200">
                    Beban: 28 JP (Fase E & F)
                  </span>
                  <span className="bg-white/90 px-2 py-0.5 rounded-md font-semibold border border-blue-200">
                    Piket: Senin
                  </span>
                  <span className="bg-amber-100/90 text-amber-800 px-2 py-0.5 rounded-md font-bold border border-amber-300">
                    1 Berkas Perlu Revisi
                  </span>
                </div>
              </div>
              <button
                onClick={() => onSelectMenu('perangkat')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Periksa Berkas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {currentRole === 'admin' && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Panel Kendali Waka Kurikulum (Supriyanto, S.Pd., M.Si.)</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-amber-800 text-[11px]">
                  <span className="bg-white/90 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                    54 Guru Termonitoring
                  </span>
                  <span className="bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded-md font-bold border border-amber-300">
                    2 Dokumen Menunggu Verifikasi
                  </span>
                  <span className="bg-emerald-100/90 text-emerald-800 px-2 py-0.5 rounded-md font-bold border border-emerald-300">
                    Google Sheets: Siap Sinkron
                  </span>
                </div>
              </div>
              <button
                onClick={() => onSelectMenu('admin')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Kelola Kurikulum</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {currentRole === 'kepsek' && (
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Ruang Supervisi Eksekutif Kepala Sekolah (H. Sudarmanto, M.Pd.)</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-emerald-800 text-[11px]">
                  <span className="bg-white/90 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                    Indeks Kesiapan: 88%
                  </span>
                  <span className="bg-emerald-100/90 text-emerald-900 px-2 py-0.5 rounded-md font-bold border border-emerald-300">
                    2 Dokumen Siap Disahkan
                  </span>
                  <span className="bg-white/90 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                    4 SK Sekolah Sah
                  </span>
                </div>
              </div>
              <button
                onClick={() => onSelectMenu('perangkat')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Supervisi & Pengesahan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {currentRole === 'tamu' && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-800">
                  Akses Publik Kurikulum SMAN 1 Batangan
                </div>
                <p className="text-slate-500 text-[11px]">
                  Informasi kalender akademik, jadwal pelajaran siswa, dan profil kurikulum terbuka untuk umum.
                </p>
              </div>
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center justify-center gap-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>Masuk Guru / Pegawai</span>
              </button>
            </div>
          )}

          {/* Menu Items List - Custom tailored per role */}
          <div className="space-y-2.5">
            {activeMenuItems.map((item) => {
              const isHighlight = item.highlighted;

              return (
                <button
                  key={`${item.key}-${item.title}`}
                  onClick={() => onSelectMenu(item.key)}
                  className={`w-full text-left px-4 py-3 sm:py-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                    isHighlight
                      ? 'bg-[#edf9f7] hover:bg-[#e2f6f3] border-teal-200 text-slate-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                      {getIcon(item.iconName, isHighlight)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </span>
                        {item.roleBadge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                              item.roleBadge.includes('Prioritas') || item.roleBadge.includes('Wajib')
                                ? 'bg-teal-100 text-teal-800 border-teal-300'
                                : item.roleBadge.includes('Admin') || item.roleBadge.includes('Validasi')
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : item.roleBadge.includes('Pengesahan') || item.roleBadge.includes('Supervisi') || item.roleBadge.includes('Audit')
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {item.roleBadge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-6 h-6 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dashed divider line */}
          <div className="border-t border-dashed border-slate-300 pt-2"></div>
        </div>

        {/* Footer Credits */}
        <footer className="mt-8 text-center text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-center space-x-1 text-slate-300 font-medium">
            <span className="w-4 h-4 rounded bg-orange-600 text-white font-bold flex items-center justify-center text-[10px]">
              B
            </span>
            <span>Diberdayakan oleh SMA Negeri 1 Batangan</span>
          </div>
          <p className="text-[11px] text-slate-500">
            PIJAR • Pusat Informasi dan Jaringan Belajar Smaba
          </p>
          <p className="text-[10px] text-slate-600 font-mono">
            Kabupaten Pati, Jawa Tengah • Terintegrasi Google Sheets
          </p>
        </footer>
      </main>
    </div>
  );
};
