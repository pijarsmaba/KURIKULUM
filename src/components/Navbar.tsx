import React, { useState } from 'react';
import {
  Home,
  ArrowLeft,
  User,
  LogOut,
  FileSpreadsheet,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Award,
  BookOpen
} from 'lucide-react';
import { MenuKey, User as CurrentUser, UserRole } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { DEMO_USERS, ROLE_DETAILS } from '../data/mockData';

interface NavbarProps {
  currentMenu: MenuKey | null;
  onGoHome: () => void;
  currentUser: CurrentUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  googleUser: FirebaseUser | null;
  onOpenSheetsModal: () => void;
  onSwitchUserRole?: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMenu,
  onGoHome,
  currentUser,
  onOpenLogin,
  onLogout,
  googleUser,
  onOpenSheetsModal,
  onSwitchUserRole,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const currentRole: UserRole = currentUser?.role || 'guru';
  const roleConfig = ROLE_DETAILS[currentRole];

  const getMenuTitle = (key: MenuKey | null, role: UserRole) => {
    switch (key) {
      case 'kosp':
        return role === 'kepsek'
          ? 'Pengesahan & Evaluasi KOSP SMABA'
          : role === 'admin'
          ? 'Kelola KOSP Kurikulum Merdeka'
          : 'KOSP Panduan Kurikulum Satuan Pendidikan';
      case 'struktur':
        return role === 'kepsek'
          ? 'Kebijakan Struktur Kurikulum & Peminatan'
          : role === 'admin'
          ? 'Kelola Struktur & Alokasi Jam Mengajar'
          : 'Struktur Kurikulum Merdeka Fase E & F';
      case 'kaldik':
        return role === 'kepsek'
          ? 'Persetujuan Kalender Pendidikan & RME'
          : role === 'admin'
          ? 'Pengaturan Kaldik, Pekan Efektif & RME'
          : 'Kaldik, RME & Jam Efektif Semester';
      case 'jadwal':
        return role === 'guru'
          ? 'Jadwal Mengajar & Piket Saya'
          : role === 'kepsek'
          ? 'Evaluasi Beban Jam Mengajar Dewan Guru'
          : 'Kelola Jadwal KBM, Ruang, dan Piket Guru';
      case 'uraian':
        return role === 'kepsek'
          ? 'Roadmap Mutu & Agenda Prioritas Sekolah'
          : role === 'admin'
          ? 'Uraian Program Kerja & Roadmap Kurikulum'
          : 'Uraian Kegiatan & Agenda Kurikulum';
      case 'sk':
        return role === 'kepsek'
          ? 'Penetapan & Penandatanganan SK Sekolah'
          : role === 'admin'
          ? 'Penyusunan & Pengelolaan SK Kurikulum'
          : 'SK Pembagian Tugas Mengajar & Penugasan';
      case 'perangkat':
        return role === 'guru'
          ? 'Perangkat Ajar Saya & Bank Materi'
          : role === 'admin'
          ? 'Validasi & Verifikasi Perangkat Ajar Guru'
          : role === 'kepsek'
          ? 'Supervisi Klinis & Pengesahan Dokumen'
          : 'Repositori Perangkat Ajar Terpublikasi';
      case 'data-guru':
        return role === 'guru'
          ? 'Status Kelengkapan Administrasi Saya'
          : role === 'admin'
          ? 'Monitoring & Rekapitulasi Data 54 Guru'
          : role === 'kepsek'
          ? 'Audit Kepatuhan & Kinerja Guru (TPMPS)'
          : 'Informasi Kelengkapan Kurikulum';
      case 'situs':
        return 'Situs Belajar & Portal Digital SMABA';
      case 'admin':
        return role === 'kepsek'
          ? 'Dashboard Eksekutif Kepala Sekolah'
          : role === 'admin'
          ? 'Panel Kendali Waka Kurikulum'
          : 'Pengumuman & Pengaturan Kurikulum';
      default:
        return 'Portal Kurikulum PIJAR SMABA';
    }
  };

  const handleSelectRole = (role: UserRole) => {
    setIsRoleDropdownOpen(false);
    if (onSwitchUserRole) {
      onSwitchUserRole(role);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Back & Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onGoHome}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Kembali ke Menu Utama"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Menu Utama</span>
            </button>

            <div className="h-6 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs text-white">
                SB
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-sky-400">SMAN 1 BATANGAN</span>
                  <span className="text-[10px] text-slate-400 hidden md:inline">• PIJAR</span>
                </div>
                <h1 className="text-sm font-extrabold text-white truncate max-w-[200px] sm:max-w-xs md:max-w-none">
                  {getMenuTitle(currentMenu, currentRole)}
                </h1>
              </div>
            </div>
          </div>

          {/* Right: Role Switcher, Google Sheets & User Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Role Switcher Dropdown */}
            {onSwitchUserRole && (
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all ${roleConfig.badgeClass} bg-slate-900 hover:bg-slate-800`}
                  title="Ganti Peran Pengguna"
                >
                  <span className="hidden sm:inline text-slate-400 font-normal">Peran:</span>
                  <span>{roleConfig.badge}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pilih Peran Pengguna:
                    </div>
                    {DEMO_USERS.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSelectRole(u.role)}
                        className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors ${
                          currentRole === u.role
                            ? 'bg-blue-600/30 text-white font-bold border border-blue-500/50'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="text-xs">{u.name.split(',')[0]}</div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {u.role === 'admin'
                              ? 'Administrator Kurikulum'
                              : u.role === 'kepsek'
                              ? 'Kepala Sekolah'
                              : u.role === 'guru'
                              ? 'Guru Pengampu'
                              : 'Tamu / Umum'}
                          </div>
                        </div>
                        {currentRole === u.role && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Google Sheets Sync Button */}
            <button
              onClick={onOpenSheetsModal}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                googleUser
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300'
              }`}
              title="Integrasi Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Google Sheets</span>
              {googleUser ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ) : null}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 rounded-full px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[120px]">
                    {currentUser.name.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-blue-300 font-medium leading-none capitalize">
                    {currentUser.role}
                  </div>
                </div>
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
                <span>Masuk Akun</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
