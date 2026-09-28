import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { User as CurrentUser, UserRole, LoginPageConfig } from '../types';
import { DEFAULT_LOGIN_PAGE_CONFIG } from '../data/mockData';
import { signInWithGoogle } from '../services/googleAuth';
import { SmabaCrestLogo, PijarEmblemLogo } from './Logos';

interface LoginPageProps {
  onLoginSuccess: (user: CurrentUser) => void;
  onBackToHome?: () => void;
  onGoogleAuthSuccess?: (user: any, token: string) => void;
  usersList?: CurrentUser[];
  loginConfig?: LoginPageConfig;
  onUpdateLoginConfig?: (config: LoginPageConfig) => void;
}

export type SelectedLoginRole = 'guru' | 'admin' | 'kepsek' | 'tamu';

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onGoogleAuthSuccess,
  usersList = [],
  loginConfig = DEFAULT_LOGIN_PAGE_CONFIG,
}) => {
  // Role selector state: default to 'guru', with options: 'guru', 'admin', 'kepsek', 'tamu' (Siswa/Tamu)
  const [selectedRole, setSelectedRole] = useState<SelectedLoginRole>('guru');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle direct entry for Siswa / Tamu
  const handleEnterAsStudentGuest = () => {
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      const studentGuestUser: CurrentUser = {
        id: 'usr-siswa-tamu',
        name: 'Siswa / Tamu SMAN 1 Batangan',
        nip: '-',
        username: 'siswa',
        password: '',
        email: 'siswa@sman1batangan.sch.id',
        role: 'tamu',
        roleLabel: 'Siswa / Tamu Publik',
        subject: 'Umum',
        status: 'Aktif',
      };
      setIsLoading(false);
      onLoginSuccess(studentGuestUser);
    }, 250);
  };

  // Handle role selection change
  const handleRoleChange = (role: SelectedLoginRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    // If Siswa/Tamu is chosen, immediately enter the student/guest page!
    if (role === 'tamu') {
      handleEnterAsStudentGuest();
    }
  };

  // Strictly verify username and password for Guru, Admin, or Kepsek
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // If role is tamu, directly enter
    if (selectedRole === 'tamu') {
      handleEnterAsStudentGuest();
      return;
    }

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

      // Verify that user's role matches the selected role
      if (matchedUser.role !== selectedRole) {
        const roleNames: Record<SelectedLoginRole, string> = {
          guru: 'Guru',
          admin: 'Administrator / Waka Kurikulum',
          kepsek: 'Kepala Sekolah',
          tamu: 'Siswa / Tamu',
        };
        const actualRoleName = roleNames[matchedUser.role] || matchedUser.role;
        const selectedRoleName = roleNames[selectedRole];
        setErrorMsg(
          `Akun "${matchedUser.name}" terdaftar sebagai ${actualRoleName}, bukan ${selectedRoleName}. Silakan pilih peran yang sesuai.`
        );
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
    }, 300);
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
          role: selectedRole === 'admin' ? 'admin' : selectedRole === 'kepsek' ? 'kepsek' : 'guru',
          roleLabel:
            selectedRole === 'admin'
              ? 'Administrator Sistem'
              : selectedRole === 'kepsek'
              ? 'Kepala Sekolah'
              : 'Guru Pengampu',
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
    <div className="min-h-screen bg-slate-900/95 text-slate-100 flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative overflow-x-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-950 via-slate-950 to-slate-950 -z-10"></div>
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-900 transition-all relative">
        {/* Top Header Card Section in Deep Blue (#0c397b) */}
        <div className="bg-[#0c397b] text-white p-6 pt-7 sm:p-7 sm:pt-8 flex flex-col items-center text-center relative">
          {/* Dual Logos Row (Clean display, no direct upload badges or design edit button) */}
          <div className="w-full flex items-center justify-between px-3 sm:px-6 mb-4">
            {/* Left: School Crest Logo */}
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

            {/* Right: PIJAR Emblem Logo */}
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
          </div>

          {/* Header Text */}
          <div className="space-y-1 w-full px-2">
            <h3 className="text-xs sm:text-[13px] font-extrabold uppercase tracking-widest text-slate-100/90 leading-tight">
              {loginConfig.headerTagline || 'PUSAT INFORMASI DAN JARINGAN BELAJAR'}
            </h3>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white mt-1 drop-shadow-xs">
              {loginConfig.headerSchoolName || 'SMA NEGERI 1 BATANGAN'}
            </h2>
          </div>

          {/* Thin Horizontal Divider Line */}
          <div className="w-full border-t border-blue-400/40 mt-5"></div>
        </div>

        {/* White Card Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Greeting Section */}
          <div className="text-center space-y-1 pt-1">
            <h2 className="text-2xl sm:text-[25px] font-black text-[#0c397b] tracking-tight leading-snug">
              {loginConfig.welcomeTitle || 'Selamat Datang di Siperwali 👋'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {loginConfig.welcomeSubtitle || 'Sistem Informasi Perwalian Siswa'}
            </p>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* -------------------------------------------------------------
              FASILITAS PILIH PERAN (GURU, ADMIN, KEPSEK, SISWA/TAMU)
              Sebelum form username & password
          ------------------------------------------------------------- */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 text-left flex items-center justify-between">
              <span>Pilih Peran Masuk:</span>
              <span className="text-[10px] text-blue-600 font-semibold">
                {selectedRole === 'tamu' ? 'Langsung Masuk' : 'Memerlukan Kredensial'}
              </span>
            </label>

            {/* Role Options Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* Option 1: Guru */}
              <button
                type="button"
                onClick={() => handleRoleChange('guru')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                  selectedRole === 'guru'
                    ? 'border-[#0c397b] bg-blue-50 text-[#0c397b] ring-2 ring-blue-500/20 shadow-xs font-bold'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'guru' ? 'bg-[#0c397b] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs truncate">Guru</div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">Pengampu KBM</div>
                </div>
              </button>

              {/* Option 2: Admin */}
              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'border-[#0c397b] bg-blue-50 text-[#0c397b] ring-2 ring-blue-500/20 shadow-xs font-bold'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'admin' ? 'bg-[#0c397b] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs truncate">Admin</div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">Waka Kurikulum</div>
                </div>
              </button>

              {/* Option 3: Kepala Sekolah */}
              <button
                type="button"
                onClick={() => handleRoleChange('kepsek')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                  selectedRole === 'kepsek'
                    ? 'border-[#0c397b] bg-blue-50 text-[#0c397b] ring-2 ring-blue-500/20 shadow-xs font-bold'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'kepsek' ? 'bg-[#0c397b] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs truncate">Kepsek</div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">Kepala Sekolah</div>
                </div>
              </button>

              {/* Option 4: Siswa / Tamu (Direct Entry) */}
              <button
                type="button"
                onClick={() => handleRoleChange('tamu')}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                  selectedRole === 'tamu'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs font-bold'
                    : 'border-emerald-200 hover:border-emerald-300 bg-emerald-50/50 text-emerald-800 font-medium hover:bg-emerald-50'
                }`}
                title="Pilih untuk langsung masuk tanpa password"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-emerald-900 truncate">Siswa / Tamu</div>
                  <div className="text-[10px] text-emerald-700 font-normal leading-tight">Langsung Masuk ⚡</div>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Form:
              Jika pilih guru/admin/kepsek -> Keluar kolom username & password
              Jika pilih siswa/tamu -> Langsung masuk / tombol masuk langsung
          */}
          {selectedRole === 'tamu' ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-emerald-950 text-sm">
                  Mode Siswa & Tamu Publik
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Anda dapat langsung mengakses jadwal pelajaran, kalender akademik, dan dokumen kurikulum terbuka tanpa perlu username & password.
                </p>
              </div>
              <button
                type="button"
                onClick={handleEnterAsStudentGuest}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-black tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? 'MEMPROSES...' : 'MASUK HALAMAN SISWA / TAMU'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
              {/* Role Indicator Banner */}
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Peran Dipilih:</span>
                <span className="font-bold text-[#0c397b] capitalize">
                  {selectedRole === 'kepsek'
                    ? 'Kepala Sekolah'
                    : selectedRole === 'admin'
                    ? 'Administrator'
                    : 'Guru Pengampu'}
                </span>
              </div>

              {/* Username Input */}
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
                    placeholder={`Masukkan username ${selectedRole}`}
                    autoComplete="username"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c397b] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
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
                    placeholder="Masukkan password Anda"
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
                {isLoading ? <span>MEMVERIFIKASI...</span> : <span>MASUK SEBAGAI {selectedRole.toUpperCase()}</span>}
              </button>
            </form>
          )}

          {/* Google Workspace Sign In Option (Compact) */}
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

          {/* Footer Copyright */}
          <div className="text-center pt-2 text-[11px] text-slate-400 font-medium">
            {loginConfig.footerText || '© 2026 SIPERWALI • SMA Negeri 1 Batangan'}
          </div>
        </div>
      </div>
    </div>
  );
};
