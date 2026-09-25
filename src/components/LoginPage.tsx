import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  Palette,
  Upload,
  Image as ImageIcon,
  Edit3,
  X,
  Save,
  RotateCcw,
  Check
} from 'lucide-react';
import { User as CurrentUser, UserRole, LoginPageConfig } from '../types';
import { DEFAULT_LOGIN_PAGE_CONFIG } from '../data/mockData';
import { signInWithGoogle } from '../services/googleAuth';
import { SmabaCrestLogo, PijarEmblemLogo } from './Logos';

interface LoginPageProps {
  onLoginSuccess: (user: CurrentUser) => void;
  onBackToHome: () => void;
  onGoogleAuthSuccess?: (user: any, token: string) => void;
  usersList?: CurrentUser[];
  loginConfig?: LoginPageConfig;
  onUpdateLoginConfig?: (config: LoginPageConfig) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToHome,
  onGoogleAuthSuccess,
  usersList = [],
  loginConfig = DEFAULT_LOGIN_PAGE_CONFIG,
  onUpdateLoginConfig,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelpAccounts, setShowHelpAccounts] = useState(false);

  // Modal Fasilitas Upload/Edit Logo & Teks Halaman Login
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [activeDesignTab, setActiveDesignTab] = useState<'logo' | 'text'>('logo');

  // Local Form state for Design Modal
  const [editHeaderTagline, setEditHeaderTagline] = useState(loginConfig.headerTagline);
  const [editHeaderSchoolName, setEditHeaderSchoolName] = useState(loginConfig.headerSchoolName);
  const [editWelcomeTitle, setEditWelcomeTitle] = useState(loginConfig.welcomeTitle);
  const [editWelcomeSubtitle, setEditWelcomeSubtitle] = useState(loginConfig.welcomeSubtitle);
  const [editFooterText, setEditFooterText] = useState(loginConfig.footerText);
  const [editLeftLogoUrl, setEditLeftLogoUrl] = useState<string>(loginConfig.leftLogoUrl || '');
  const [editRightLogoUrl, setEditRightLogoUrl] = useState<string>(loginConfig.rightLogoUrl || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Sync state if prop changes
  React.useEffect(() => {
    setEditHeaderTagline(loginConfig.headerTagline);
    setEditHeaderSchoolName(loginConfig.headerSchoolName);
    setEditWelcomeTitle(loginConfig.welcomeTitle);
    setEditWelcomeSubtitle(loginConfig.welcomeSubtitle);
    setEditFooterText(loginConfig.footerText);
    setEditLeftLogoUrl(loginConfig.leftLogoUrl || '');
    setEditRightLogoUrl(loginConfig.rightLogoUrl || '');
  }, [loginConfig]);

  // Handle direct file upload for logos
  const handleUploadLogoFile = (e: React.ChangeEvent<HTMLInputElement>, position: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar yang valid (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (position === 'left') {
        setEditLeftLogoUrl(base64Data);
        // Automatically save if editing directly
        if (onUpdateLoginConfig) {
          onUpdateLoginConfig({
            ...loginConfig,
            leftLogoUrl: base64Data,
          });
        }
      } else {
        setEditRightLogoUrl(base64Data);
        if (onUpdateLoginConfig) {
          onUpdateLoginConfig({
            ...loginConfig,
            rightLogoUrl: base64Data,
          });
        }
      }
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 2500);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveDesign = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateLoginConfig) {
      onUpdateLoginConfig({
        headerTagline: editHeaderTagline,
        headerSchoolName: editHeaderSchoolName,
        welcomeTitle: editWelcomeTitle,
        welcomeSubtitle: editWelcomeSubtitle,
        footerText: editFooterText,
        leftLogoUrl: editLeftLogoUrl,
        rightLogoUrl: editRightLogoUrl,
      });
    }
    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      setIsDesignModalOpen(false);
    }, 1200);
  };

  const handleApplyPresetSiperwali = () => {
    setEditHeaderTagline('PUSAT INFORMASI DAN JARINGAN BELAJAR');
    setEditHeaderSchoolName('SMA NEGERI 1 BATANGAN');
    setEditWelcomeTitle('Selamat Datang di Siperwali 👋');
    setEditWelcomeSubtitle('Sistem Informasi Perwalian Siswa');
    setEditFooterText('© 2026 SIPERWALI • SMA Negeri 1 Batangan');
  };

  const handleApplyPresetPijar = () => {
    setEditHeaderTagline('PUSAT INFORMASI DAN JARINGAN BELAJAR');
    setEditHeaderSchoolName('SMA NEGERI 1 BATANGAN');
    setEditWelcomeTitle('Selamat Datang di PIJAR SMABA 👋');
    setEditWelcomeSubtitle('Pusat Informasi dan Jaringan Belajar Smaba');
    setEditFooterText('© 2026 PIJAR SMABA • SMA Negeri 1 Batangan');
  };

  // Strictly verify username and password
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const cleanInput = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanInput || !cleanPass) {
      setErrorMsg('Harap masukkan Username dan Password Anda secara lengkap.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      // Find matching user in the system database
      const matchedUser = usersList.find((u) => {
        const matchUsername = u.username?.toLowerCase() === cleanInput;
        const matchNip = u.nip === username.trim();
        const matchEmail = u.email?.toLowerCase() === cleanInput;
        return matchUsername || matchNip || matchEmail;
      });

      if (!matchedUser) {
        setErrorMsg('Username atau NIP tidak terdaftar dalam sistem. Hubungi administrator.');
        setIsLoading(false);
        return;
      }

      // Strictly verify password
      const userExpectedPassword = matchedUser.password || 'password123';
      if (cleanPass !== userExpectedPassword) {
        setErrorMsg('Password yang Anda masukkan salah. Silakan periksa kembali kata sandi Anda.');
        setIsLoading(false);
        return;
      }

      // Check account status
      if (matchedUser.status === 'Nonaktif') {
        setErrorMsg('Akun pengguna ini berstatus nonaktif. Silakan hubungi Administrator.');
        setIsLoading(false);
        return;
      }

      // Successful login
      setIsLoading(false);
      onLoginSuccess(matchedUser);
    }, 350);
  };

  // Helper function to fill form inputs
  const handleFillCredentials = (u: CurrentUser) => {
    setUsername(u.username || u.nip || '');
    setPassword(u.password || 'password123');
    setErrorMsg('');
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    try {
      const res = await signInWithGoogle();
      if (res) {
        if (onGoogleAuthSuccess) {
          onGoogleAuthSuccess(res.user, res.accessToken);
        }
        const found = usersList.find((u) => u.email.toLowerCase() === res.user.email?.toLowerCase());

        const googleUser: CurrentUser = found || {
          id: res.user.uid,
          name: res.user.displayName || 'Bpk/Ibu Guru SMAN 1 Batangan',
          nip: '198001012005011005',
          username: res.user.email?.split('@')[0] || 'guru',
          password: 'password123',
          email: res.user.email || 'guru@sman1batangan.sch.id',
          role: 'guru',
          roleLabel: 'Guru Pengampu / Tim Kurikulum',
          subject: 'Kurikulum Merdeka',
          status: 'Aktif',
        };
        onLoginSuccess(googleUser);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal masuk dengan Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/90 text-slate-100 flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative overflow-x-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950 -z-10"></div>
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Top Header Bar with Navigation & Logo/Design Facility Button */}
      <div className="w-full max-w-sm sm:max-w-md mb-4 flex items-center justify-between gap-2">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Beranda Publik</span>
        </button>

        {/* FASILITAS UPLOAD/EDIT LOGO & TEKS BUTTON */}
        <button
          onClick={() => setIsDesignModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 transition-all py-1.5 px-3 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 shadow-md cursor-pointer"
          title="Buka fasilitas upload logo baru dan edit teks tampilan halaman login"
        >
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span>Fasilitas Upload & Edit Logo</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-900 transition-all relative">
        {/* Top Header Card Section in Deep Blue (#0c397b) */}
        <div className="bg-[#0c397b] text-white p-6 pt-7 sm:p-7 sm:pt-8 flex flex-col items-center text-center relative group">
          {/* Dual Logos Row (Supports custom uploaded logo or default) */}
          <div className="w-full flex items-center justify-between px-2 sm:px-4 mb-4">
            {/* Left: School Crest Logo (or Uploaded Logo) */}
            <div className="relative group/left">
              <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center filter drop-shadow-md">
                {loginConfig.leftLogoUrl ? (
                  <img
                    src={loginConfig.leftLogoUrl}
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain max-h-16"
                  />
                ) : (
                  <SmabaCrestLogo className="w-full h-full" />
                )}
              </div>
              {/* Quick direct upload button on hover */}
              <label
                className="absolute -bottom-1 -right-1 bg-white hover:bg-slate-100 text-[#0c397b] p-1.5 rounded-full shadow-md cursor-pointer border border-blue-200 transition-all transform hover:scale-110 flex items-center justify-center"
                title="Ganti / Upload Logo Sekolah (Kiri)"
              >
                <Upload className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadLogoFile(e, 'left')}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Right: PIJAR Emblem Logo (or Uploaded Logo) */}
            <div className="relative group/right">
              <div className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center filter drop-shadow-md">
                {loginConfig.rightLogoUrl ? (
                  <img
                    src={loginConfig.rightLogoUrl}
                    alt="Logo Aplikasi"
                    className="w-full h-full object-contain max-h-16"
                  />
                ) : (
                  <PijarEmblemLogo className="w-full h-full" />
                )}
              </div>
              {/* Quick direct upload button on hover */}
              <label
                className="absolute -bottom-1 -right-1 bg-white hover:bg-slate-100 text-[#0c397b] p-1.5 rounded-full shadow-md cursor-pointer border border-blue-200 transition-all transform hover:scale-110 flex items-center justify-center"
                title="Ganti / Upload Logo Aplikasi (Kanan)"
              >
                <Upload className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadLogoFile(e, 'right')}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Header Text (Configurable by Admin) */}
          <div className="space-y-1 w-full px-2">
            <h3 className="text-xs sm:text-[13px] font-extrabold uppercase tracking-widest text-slate-100/90 leading-tight">
              {loginConfig.headerTagline || 'PUSAT INFORMASI DAN JARINGAN BELAJAR'}
            </h3>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white mt-1 drop-shadow-xs">
              {loginConfig.headerSchoolName || 'SMA NEGERI 1 BATANGAN'}
            </h2>
          </div>

          {/* Quick link to customize login design */}
          <button
            type="button"
            onClick={() => setIsDesignModalOpen(true)}
            className="mt-3 text-[10px] font-semibold text-blue-200 hover:text-white flex items-center gap-1 bg-blue-900/60 hover:bg-blue-800/80 px-2.5 py-1 rounded-full border border-blue-400/30 transition-all"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Logo & Teks Tampilan</span>
          </button>

          {/* Thin Horizontal Divider Line */}
          <div className="w-full border-t border-blue-400/40 mt-4 mb-1"></div>
        </div>

        {/* White Card Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Greeting Section (Configurable by Admin) */}
          <div className="text-center space-y-1 pt-1">
            <h2 className="text-2xl sm:text-[26px] font-black text-[#0c397b] tracking-tight leading-snug">
              {loginConfig.welcomeTitle || 'Selamat Datang di Siperwali 👋'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {loginConfig.welcomeSubtitle || 'Sistem Informasi Perwalian Siswa'}
            </p>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form: Requires Username and Password input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-left flex items-center justify-between">
                <span>Username atau NIP</span>
                <span className="text-[10px] text-slate-400 font-normal">Wajib diisi</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username atau NIP"
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c397b] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-left flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] text-slate-400 font-normal">Wajib diisi</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className="w-full px-4 pr-11 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c397b] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* MASUK Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#0c397b] hover:bg-[#082855] text-white rounded-xl text-sm font-black tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isLoading ? <span>MEMVERIFIKASI...</span> : <span>MASUK</span>}
            </button>
          </form>

          {/* Helper Section: Clickable credentials filler for quick testing */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => setShowHelpAccounts(!showHelpAccounts)}
              className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-500 hover:text-[#0c397b] font-semibold transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>{showHelpAccounts ? 'Tutup Bantuan Akun' : 'Bantuan Info Akun Pengujian (Klik untuk Isi Kolom)'}</span>
            </button>

            {showHelpAccounts && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Pilih akun di bawah untuk mengisi form, lalu klik tombol MASUK:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {/* Guru */}
                  <button
                    type="button"
                    onClick={() => {
                      const u = usersList.find((x) => x.role === 'guru') || usersList[0];
                      if (u) handleFillCredentials(u);
                    }}
                    className="p-2 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-black text-sky-950">👨‍🏫 Guru</div>
                    <div className="text-[9px] text-sky-700 font-mono truncate">sitirahayu</div>
                    <div className="text-[9px] text-slate-400">pass: password123</div>
                  </button>

                  {/* Admin */}
                  <button
                    type="button"
                    onClick={() => {
                      const u = usersList.find((x) => x.role === 'admin');
                      if (u) handleFillCredentials(u);
                    }}
                    className="p-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-black text-amber-950">🛡️ Admin</div>
                    <div className="text-[9px] text-amber-700 font-mono truncate">admin</div>
                    <div className="text-[9px] text-slate-400">pass: adminpassword</div>
                  </button>

                  {/* Kepsek */}
                  <button
                    type="button"
                    onClick={() => {
                      const u = usersList.find((x) => x.role === 'kepsek');
                      if (u) handleFillCredentials(u);
                    }}
                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-left transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-black text-emerald-950">👔 Kepsek</div>
                    <div className="text-[9px] text-emerald-700 font-mono truncate">kepsek</div>
                    <div className="text-[9px] text-slate-400">pass: kepsekpassword</div>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 italic text-center">
                  *Klik akun di atas untuk mengisi kolom, lalu klik <strong>MASUK</strong> untuk verifikasi password.
                </p>
              </div>
            )}
          </div>

          {/* Google Workspace Sign In Option */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-3 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50/70 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
            </button>
          </div>

          {/* Footer Copyright (Configurable by Admin) */}
          <div className="text-center pt-2 text-[11px] text-slate-400 font-medium">
            {loginConfig.footerText || '© 2026 SIPERWALI • SMA Negeri 1 Batangan'}
          </div>
        </div>
      </div>

      {/* ==============================================================
          MODAL FASILITAS UPLOAD/EDIT LOGO & TEKS HALAMAN LOGIN
          (Fasilitas Lengkap untuk Admin/Pengguna Mengubah Logo & Teks)
      ============================================================== */}
      {isDesignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in text-slate-800">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#0c397b] flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Fasilitas Upload Logo & Edit Teks Login
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kustomisasi logo sekolah, logo aplikasi, teks header, dan sambutan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDesignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success notification */}
            {saveSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Perubahan logo & teks berhasil disimpan dan langsung diterapkan!</span>
              </div>
            )}

            {/* Modal Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-5 gap-1">
              <button
                type="button"
                onClick={() => setActiveDesignTab('logo')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeDesignTab === 'logo'
                    ? 'bg-white text-[#0c397b] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload & Kelola Logo</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDesignTab('text')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeDesignTab === 'text'
                    ? 'bg-white text-[#0c397b] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Teks Sambutan & Header</span>
              </button>
            </div>

            {/* TAB 1: UPLOAD LOGO */}
            {activeDesignTab === 'logo' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Logo Kiri (Sekolah SMAN 1 Batangan) */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Logo Kiri (Sekolah)</span>
                      <span className="text-[10px] text-blue-600 font-semibold">SMABA</span>
                    </div>

                    {/* Logo Preview */}
                    <div className="w-20 h-20 mx-auto bg-white rounded-2xl p-2.5 flex items-center justify-center border border-slate-200 shadow-2xs">
                      {editLeftLogoUrl ? (
                        <img
                          src={editLeftLogoUrl}
                          alt="Preview Logo Kiri"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <SmabaCrestLogo className="w-full h-full" />
                      )}
                    </div>

                    {/* Upload actions */}
                    <div className="space-y-2">
                      <label className="w-full py-2 px-3 bg-[#0c397b] hover:bg-[#082855] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih File Logo Baru</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadLogoFile(e, 'left')}
                          className="sr-only"
                        />
                      </label>

                      <input
                        type="text"
                        value={editLeftLogoUrl}
                        onChange={(e) => setEditLeftLogoUrl(e.target.value)}
                        placeholder="Atau tempel URL gambar logo..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0c397b]"
                      />

                      {editLeftLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setEditLeftLogoUrl('')}
                          className="text-[11px] text-rose-600 hover:underline w-full text-center block"
                        >
                          Reset ke Logo Asli SMABA
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Logo Kanan (Aplikasi / PIJAR) */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Logo Kanan (Aplikasi)</span>
                      <span className="text-[10px] text-blue-600 font-semibold">PIJAR</span>
                    </div>

                    {/* Logo Preview */}
                    <div className="w-20 h-20 mx-auto bg-white rounded-2xl p-2.5 flex items-center justify-center border border-slate-200 shadow-2xs">
                      {editRightLogoUrl ? (
                        <img
                          src={editRightLogoUrl}
                          alt="Preview Logo Kanan"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <PijarEmblemLogo className="w-full h-full" />
                      )}
                    </div>

                    {/* Upload actions */}
                    <div className="space-y-2">
                      <label className="w-full py-2 px-3 bg-[#0c397b] hover:bg-[#082855] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih File Logo Baru</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUploadLogoFile(e, 'right')}
                          className="sr-only"
                        />
                      </label>

                      <input
                        type="text"
                        value={editRightLogoUrl}
                        onChange={(e) => setEditRightLogoUrl(e.target.value)}
                        placeholder="Atau tempel URL gambar logo..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0c397b]"
                      />

                      {editRightLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setEditRightLogoUrl('')}
                          className="text-[11px] text-rose-600 hover:underline w-full text-center block"
                        >
                          Reset ke Logo Asli PIJAR
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tips:</strong> Format file gambar yang disarankan adalah PNG dengan latar transparan, JPG, atau WebP. Gambar yang diunggah akan otomatis tersimpan dalam browser Anda.
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: EDIT TEKS */}
            {activeDesignTab === 'text' && (
              <form onSubmit={handleSaveDesign} className="space-y-4">
                {/* Presets */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Pilihan Format Cepat:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleApplyPresetSiperwali}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all"
                    >
                      Format Siperwali (Sesuai Gambar)
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyPresetPijar}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-all"
                    >
                      Format PIJAR SMABA
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tagline Atas Header (Huruf Kapital Kecil)
                  </label>
                  <input
                    type="text"
                    value={editHeaderTagline}
                    onChange={(e) => setEditHeaderTagline(e.target.value)}
                    placeholder="Contoh: PUSAT INFORMASI DAN JARINGAN BELAJAR"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Sekolah Header (Huruf Kapital Besar)
                  </label>
                  <input
                    type="text"
                    value={editHeaderSchoolName}
                    onChange={(e) => setEditHeaderSchoolName(e.target.value)}
                    placeholder="Contoh: SMA NEGERI 1 BATANGAN"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Judul Sambutan Selamat Datang
                  </label>
                  <input
                    type="text"
                    value={editWelcomeTitle}
                    onChange={(e) => setEditWelcomeTitle(e.target.value)}
                    placeholder="Contoh: Selamat Datang di Siperwali 👋"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subtitle Sambutan Bawahnya
                  </label>
                  <input
                    type="text"
                    value={editWelcomeSubtitle}
                    onChange={(e) => setEditWelcomeSubtitle(e.target.value)}
                    placeholder="Contoh: Sistem Informasi Perwalian Siswa"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teks Footer Copyright Bagian Bawah
                  </label>
                  <input
                    type="text"
                    value={editFooterText}
                    onChange={(e) => setEditFooterText(e.target.value)}
                    placeholder="Contoh: © 2026 SIPERWALI • SMA Negeri 1 Batangan"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>
              </form>
            )}

            {/* Modal Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 mt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDesignModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveDesign}
                className="px-5 py-2.5 bg-[#0c397b] hover:bg-[#082855] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan & Terapkan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
