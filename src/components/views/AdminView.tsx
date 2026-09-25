import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  ShieldAlert,
  Settings,
  Bell,
  CheckCircle2,
  XCircle,
  FileCheck,
  Download,
  Plus,
  Trash2,
  Save,
  Users,
  AlertTriangle,
  FileSpreadsheet,
  Award,
  ShieldCheck,
  Building,
  Target,
  FileText,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  TrendingUp,
  School,
  KeyRound,
  Edit3,
  Eye,
  EyeOff,
  Palette,
  Layout,
  Search,
  RotateCcw,
  Check,
  Upload,
  Image,
  UploadCloud,
  FileUp,
  CheckSquare
} from 'lucide-react';
import { User, Announcement, PerangkatItem, UserRole, LoginPageConfig } from '../../types';
import { INITIAL_ANNOUNCEMENTS, SCHOOL_INFO, DEFAULT_LOGIN_PAGE_CONFIG } from '../../data/mockData';
import { SmabaCrestLogo, PijarEmblemLogo } from '../Logos';

interface AdminViewProps {
  currentUser: User | null;
  onSwitchToAdmin: () => void;
  perangkatList: PerangkatItem[];
  onUpdatePerangkatStatus: (id: string, status: 'Disetujui' | 'Perlu Revisi') => void;
  onOpenSheetsModal?: () => void;
  onSignByPrincipal?: (id: string, notes?: string) => void;
  usersList?: User[];
  onAddUser?: (user: User) => void;
  onBulkAddUsers?: (newUsers: User[], replaceAll?: boolean) => void;
  onUpdateUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  loginConfig?: LoginPageConfig;
  onUpdateLoginConfig?: (config: LoginPageConfig) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  onSwitchToAdmin,
  perangkatList,
  onUpdatePerangkatStatus,
  onOpenSheetsModal,
  onSignByPrincipal,
  usersList = [],
  onAddUser,
  onBulkAddUsers,
  onUpdateUser,
  onDeleteUser,
  loginConfig = DEFAULT_LOGIN_PAGE_CONFIG,
  onUpdateLoginConfig,
}) => {
  const currentRole: UserRole = currentUser?.role || 'guru';

  // Admin Tab Navigation
  const [adminTab, setAdminTab] = useState<'users' | 'login-design' | 'kurikulum' | 'announcements'>('users');

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState<'Normal' | 'Tinggi'>('Normal');

  // General Settings
  const [savedSettings, setSavedSettings] = useState(false);
  const [academicYear, setAcademicYear] = useState('2024/2025');
  const [semester, setSemester] = useState('Genap');
  const [maxJp, setMaxJp] = useState('40');

  // Login Page Customization Form State
  const [headerTagline, setHeaderTagline] = useState(loginConfig.headerTagline);
  const [headerSchoolName, setHeaderSchoolName] = useState(loginConfig.headerSchoolName);
  const [welcomeTitle, setWelcomeTitle] = useState(loginConfig.welcomeTitle);
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(loginConfig.welcomeSubtitle);
  const [footerText, setFooterText] = useState(loginConfig.footerText);
  const [leftLogoUrl, setLeftLogoUrl] = useState<string>(loginConfig.leftLogoUrl || '');
  const [rightLogoUrl, setRightLogoUrl] = useState<string>(loginConfig.rightLogoUrl || '');
  const [savedLoginConfig, setSavedLoginConfig] = useState(false);

  // User Management State
  const [searchUser, setSearchUser] = useState('');
  const [roleFilter, setRoleFilter] = useState<'Semua' | 'guru' | 'kepsek' | 'admin'>('Semua');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Modals for User Management
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editUserModal, setEditUserModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null,
  });

  // Excel Import Modal State
  const [importModal, setImportModal] = useState<{
    isOpen: boolean;
    parsedUsers: User[];
    fileName: string;
    replaceMode: boolean;
    error: string | null;
  }>({
    isOpen: false,
    parsedUsers: [],
    fileName: '',
    replaceMode: false,
    error: null,
  });

  // Add User Form State
  const [formName, setFormName] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('guru');
  const [formSubject, setFormSubject] = useState('Bahasa Indonesia');
  const [formEmail, setFormEmail] = useState('');

  // Kepsek specific states
  const [kepsekDirectives, setKepsekDirectives] = useState(
    'Fokus semester genap: 1. Penuntasan Asesmen Sumatif Akhir Jenjang (ASAJ) Kelas XII, 2. Penguatan Gelar Karya P5 Kearifan Lokal Pantai Batangan, 3. Supervisi klinis kelengkapan modul ajar 100% sebelum Maret 2025.'
  );
  const [savedDirectives, setSavedDirectives] = useState(false);

  // Toggle show password per user in table
  const toggleShowPassword = (userId: string) => {
    setShowPasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Upload Logo Handlers
  const handleUploadLogoFile = (e: React.ChangeEvent<HTMLInputElement>, position: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (PNG, JPG, SVG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (position === 'left') {
        setLeftLogoUrl(base64Data);
      } else {
        setRightLogoUrl(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLoginConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateLoginConfig) {
      onUpdateLoginConfig({
        headerTagline,
        headerSchoolName,
        welcomeTitle,
        welcomeSubtitle,
        footerText,
        leftLogoUrl,
        rightLogoUrl,
      });
      setSavedLoginConfig(true);
      setTimeout(() => setSavedLoginConfig(false), 2500);
    }
  };

  // Preset quick fill options
  const handleApplyPresetSiperwali = () => {
    setHeaderTagline('PUSAT INFORMASI DAN JARINGAN BELAJAR');
    setHeaderSchoolName('SMA NEGERI 1 BATANGAN');
    setWelcomeTitle('Selamat Datang di Siperwali 👋');
    setWelcomeSubtitle('Sistem Informasi Perwalian Siswa');
    setFooterText('© 2026 SIPERWALI • SMA Negeri 1 Batangan');
  };

  const handleApplyPresetPijar = () => {
    setHeaderTagline('PUSAT INFORMASI DAN JARINGAN BELAJAR');
    setHeaderSchoolName('SMA NEGERI 1 BATANGAN');
    setWelcomeTitle('Selamat Datang di PIJAR SMABA 👋');
    setWelcomeSubtitle('Pusat Informasi dan Jaringan Belajar Smaba');
    setFooterText('© 2026 PIJAR SMABA • SMA Negeri 1 Batangan');
  };

  // EXCEL IMPORT & TEMPLATE DOWNLOAD
  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        'Nama Lengkap': 'Dra. Hj. Siti Rahayu, M.Pd.',
        'NIP': '197508122002122001',
        'Username': 'sitirahayu',
        'Password': 'password123',
        'Peran (guru/kepsek/admin)': 'guru',
        'Mata Pelajaran': 'Bahasa Indonesia',
        'Email': 'siti.rahayu@sman1batangan.sch.id',
      },
      {
        'Nama Lengkap': 'Bambang Triyono, S.Pd.',
        'NIP': '198205142009031004',
        'Username': 'bambang',
        'Password': 'password123',
        'Peran (guru/kepsek/admin)': 'guru',
        'Mata Pelajaran': 'Matematika',
        'Email': 'bambang.triyono@sman1batangan.sch.id',
      },
      {
        'Nama Lengkap': 'H. Sudarmanto, M.Pd.',
        'NIP': '196803201995121002',
        'Username': 'kepsek',
        'Password': 'kepsekpassword',
        'Peran (guru/kepsek/admin)': 'kepsek',
        'Mata Pelajaran': 'Manajemen Pendidikan',
        'Email': 'kepsek@sman1batangan.sch.id',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    // Set auto column width
    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 22 },
      { wch: 18 },
      { wch: 18 },
      { wch: 25 },
      { wch: 22 },
      { wch: 32 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Guru');
    XLSX.writeFile(workbook, 'Template_Import_User_Guru_SMABA.xlsx');
  };

  const handleDownloadCsvTemplate = () => {
    const headers = ['Nama Lengkap', 'NIP', 'Username', 'Password', 'Peran (guru/kepsek/admin)', 'Mata Pelajaran', 'Email'];
    const rows = [
      ['"Dra. Hj. Siti Rahayu, M.Pd."', '197508122002122001', 'sitirahayu', 'password123', 'guru', 'Bahasa Indonesia', 'siti.rahayu@sman1batangan.sch.id'],
      ['"Bambang Triyono, S.Pd."', '198205142009031004', 'bambang', 'password123', 'guru', 'Matematika', 'bambang.triyono@sman1batangan.sch.id'],
      ['"H. Sudarmanto, M.Pd."', '196803201995121002', 'kepsek', 'kepsekpassword', 'kepsek', 'Manajemen Pendidikan', 'kepsek@sman1batangan.sch.id'],
    ];
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Template_Import_User_Guru_SMABA.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExcelFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setImportModal({
            isOpen: true,
            parsedUsers: [],
            fileName: file.name,
            replaceMode: false,
            error: 'File Excel kosong atau tidak memiliki data baris.',
          });
          return;
        }

        // Parse and map rows
        const parsedList: User[] = rawJson.map((row, index) => {
          const name = row['Nama Lengkap'] || row['Nama'] || row['nama'] || row['Name'] || `Guru ${index + 1}`;
          const nip = String(row['NIP'] || row['nip'] || '').trim();
          const rawUsername = String(row['Username'] || row['username'] || row['User'] || '').trim();
          const cleanUsername = rawUsername || (nip ? nip : name.toLowerCase().replace(/[^a-z0-9]/g, ''));
          const password = String(row['Password'] || row['password'] || row['Pass'] || 'password123').trim();
          const rawRole = String(row['Peran (guru/kepsek/admin)'] || row['Peran'] || row['Role'] || row['role'] || 'guru').toLowerCase().trim();
          const role: UserRole = rawRole.includes('kepsek') || rawRole.includes('kepala')
            ? 'kepsek'
            : rawRole.includes('admin') || rawRole.includes('waka')
            ? 'admin'
            : 'guru';
          const subject = row['Mata Pelajaran'] || row['Mapel'] || row['mapel'] || 'Kurikulum Merdeka';
          const email = row['Email'] || row['email'] || `${cleanUsername}@sman1batangan.sch.id`;

          return {
            id: `usr-import-${Date.now()}-${index}`,
            name,
            nip,
            username: cleanUsername,
            password,
            email,
            role,
            roleLabel:
              role === 'admin'
                ? 'Waka Kurikulum / Administrator'
                : role === 'kepsek'
                ? 'Kepala Sekolah / TPMPS'
                : 'Guru Pengampu / Wali Kelas',
            subject,
            status: 'Aktif',
          };
        });

        setImportModal({
          isOpen: true,
          parsedUsers: parsedList,
          fileName: file.name,
          replaceMode: false,
          error: null,
        });
      } catch (err: any) {
        setImportModal({
          isOpen: true,
          parsedUsers: [],
          fileName: file.name,
          replaceMode: false,
          error: `Gagal membaca file Excel: ${err.message || 'Format tidak valid'}`,
        });
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset input
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (importModal.parsedUsers.length === 0) return;

    if (onBulkAddUsers) {
      onBulkAddUsers(importModal.parsedUsers, importModal.replaceMode);
    } else if (onAddUser) {
      importModal.parsedUsers.forEach((u) => onAddUser(u));
    }

    setImportModal({
      isOpen: false,
      parsedUsers: [],
      fileName: '',
      replaceMode: false,
      error: null,
    });
  };

  const handleOpenEditUser = (user: User) => {
    setEditUserModal({
      isOpen: true,
      user: { ...user },
    });
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal.user || !onUpdateUser) return;
    onUpdateUser(editUserModal.user);
    setEditUserModal({ isOpen: false, user: null });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formUsername || !formPassword || !onAddUser) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formName,
      nip: formNip || `198${Math.floor(100000000000000 + Math.random() * 900000000000000)}`,
      username: formUsername.toLowerCase().trim(),
      password: formPassword.trim(),
      email: formEmail || `${formUsername.toLowerCase().trim()}@sman1batangan.sch.id`,
      role: formRole,
      roleLabel:
        formRole === 'admin'
          ? 'Waka Kurikulum / Administrator'
          : formRole === 'kepsek'
          ? 'Kepala Sekolah / Penanggung Jawab TPMPS'
          : 'Guru Pengampu / Wali Kelas',
      subject: formRole === 'kepsek' ? 'Manajemen Pendidikan' : formSubject,
      status: 'Aktif',
    };

    onAddUser(newUser);
    setIsAddUserModalOpen(false);
    setFormName('');
    setFormNip('');
    setFormUsername('');
    setFormPassword('');
    setFormEmail('');
  };

  const handleDeleteUserClick = (userId: string, userName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${userName}"?`)) {
      if (onDeleteUser) {
        onDeleteUser(userId);
      }
    }
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const newAnc: Announcement = {
      id: `anc-${Date.now()}`,
      title: newTitle,
      content: newContent,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      priority: newPriority,
      author: currentUser?.name || (currentRole === 'kepsek' ? 'Kepala Sekolah' : 'Waka Kurikulum'),
    };

    setAnnouncements([newAnc, ...announcements]);
    setNewTitle('');
    setNewContent('');
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  const handleSaveSettings = () => {
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  const handleSaveDirectives = () => {
    setSavedDirectives(true);
    setTimeout(() => setSavedDirectives(false), 2500);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Judul Perangkat', 'Mata Pelajaran', 'Kelas', 'Guru', 'Status', 'Tanggal Unggah'];
    const rows = perangkatList.map((p) => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.subject,
      p.grade,
      `"${p.teacherName}"`,
      p.status,
      p.uploadDate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Kurikulum_SMABA_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered users list
  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
      (u.nip && u.nip.includes(searchUser)) ||
      (u.subject && u.subject.toLowerCase().includes(searchUser.toLowerCase()));
    const matchRole = roleFilter === 'Semua' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  /* -------------------------------------------------------------
     VIEW 1: KEPALA SEKOLAH EXECUTIVE DASHBOARD
  ------------------------------------------------------------- */
  if (currentRole === 'kepsek') {
    return (
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <Award className="w-3.5 h-3.5" />
              <span>Ruang Eksekutif & TPMPS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Eksekutif Kepala Sekolah
            </h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              Penjaminan Mutu Satuan Pendidikan (TPMPS) SMA Negeri 1 Batangan. Pantau indeks kesiapan kurikulum, kepatuhan beban mengajar 54 dewan guru, dan pengesahan dokumen resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {onOpenSheetsModal && (
              <button
                onClick={onOpenSheetsModal}
                className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-colors border border-emerald-400/40"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>Rekap Google Sheets</span>
              </button>
            )}
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Laporan Eksekutif</span>
            </button>
          </div>
        </div>

        {/* Executive High-Level Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Indeks Kesiapan Kurikulum
            </div>
            <div className="text-3xl font-black text-emerald-600">88%</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Kategori: Unggul (Sangat Siap)</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Status Akreditasi Sekolah
            </div>
            <div className="text-3xl font-black text-blue-600">A (96)</div>
            <div className="text-[11px] text-slate-500">
              BAN-S/M Jawa Tengah • NPSN: {SCHOOL_INFO.npsn}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Pengguna Guru & Pegawai
            </div>
            <div className="text-3xl font-black text-slate-900">{usersList.length} Akun</div>
            <div className="text-[11px] text-emerald-600 font-semibold">
              ✓ Terdaftar di Portal PIJAR
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              SK Kurikulum Sah
            </div>
            <div className="text-3xl font-black text-amber-600">4 SK</div>
            <div className="text-[11px] text-slate-500">
              TPMPS, TPK, KP, & SK KBM TA 2024/2025
            </div>
          </div>
        </div>

        {/* Kepsek Directives Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-base">
                Arahan Strategis Kepala Sekolah untuk Dewan Guru
              </h3>
            </div>
            {savedDirectives && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Arahan berhasil diperbarui</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Instruksi dan prioritas kerja akademik yang akan tampil pada beranda seluruh guru dan panitia kurikulum SMA Negeri 1 Batangan:
          </p>

          <textarea
            rows={3}
            value={kepsekDirectives}
            onChange={(e) => setKepsekDirectives(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSaveDirectives}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan & Siarkan Arahan</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     VIEW 2: GURU VIEW (RESTRICTED PANEL)
  ------------------------------------------------------------- */
  if (currentRole === 'guru') {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
              <Bell className="w-4 h-4" />
              <span>Papan Informasi & Pengumuman Kurikulum</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Informasi Kurikulum untuk Dewan Guru
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Pengumuman resmi dari Waka Kurikulum dan Kepala Sekolah SMA Negeri 1 Batangan untuk dewan guru dan wali kelas.
            </p>
          </div>

          <button
            onClick={onSwitchToAdmin}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-1.5 self-start md:self-center"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Alihkan ke Akun Waka Kurikulum (Kelola User & Desain Login)</span>
          </button>
        </div>

        {/* Announcements List for Teachers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Pengumuman Aktif Semester Genap TA 2024/2025</span>
            </h3>
            <span className="text-xs text-slate-400">{announcements.length} Pengumuman</span>
          </div>

          <div className="space-y-3">
            {announcements.map((anc) => (
              <div
                key={anc.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2 bg-slate-50/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        anc.priority === 'Tinggi'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Prioritas {anc.priority}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">Oleh: {anc.author}</span>
                  </div>
                  <span className="text-xs text-slate-400">{anc.date}</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{anc.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{anc.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     VIEW 3: WAKA KURIKULUM / ADMINISTRATOR MASTER PANEL
  ------------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Pusat Kendali Waka Kurikulum & Administrator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">
            Panel Administrator PIJAR SMABA
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Kelola akun user & password (input mandiri / import Excel), upload & kelola logo, serta konfigurasi kurikulum.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          {onOpenSheetsModal && (
            <button
              onClick={onOpenSheetsModal}
              className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-colors border border-emerald-400/40"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Google Sheets</span>
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Admin Feature Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto gap-1">
        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'users'
              ? 'bg-[#0c397b] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Pengguna & Password Guru/Kepsek ({usersList.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('login-design')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'login-design'
              ? 'bg-[#0c397b] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Desain, Logo & Teks Halaman Login</span>
        </button>

        <button
          onClick={() => setAdminTab('kurikulum')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'kurikulum'
              ? 'bg-[#0c397b] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Kurikulum</span>
        </button>

        <button
          onClick={() => setAdminTab('announcements')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            adminTab === 'announcements'
              ? 'bg-[#0c397b] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Siaran Pengumuman</span>
        </button>
      </div>

      {/* =============================================================
          TAB 1: KELOLA PENGGUNA & PASSWORD + IMPORT EXCEL
      ============================================================= */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          {/* Top Bar with Search & Action Buttons */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Cari nama guru, NIP, username, atau mapel..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['Semua', 'guru', 'kepsek', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      roleFilter === r
                        ? 'bg-[#0c397b] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r === 'Semua'
                      ? 'Semua Peran'
                      : r === 'guru'
                      ? 'Guru'
                      : r === 'kepsek'
                      ? 'Kepala Sekolah'
                      : 'Admin'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Import Excel Trigger */}
              <label
                className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                title="Impor Akun Guru dari file Excel (.xlsx / .csv)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Import File Excel</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelFileSelect}
                  className="sr-only"
                />
              </label>

              {/* Download Template Excel */}
              <button
                onClick={handleDownloadExcelTemplate}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                title="Unduh format template Excel untuk impor data guru"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Format Excel</span>
              </button>

              {/* Add User Manual Button */}
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-3.5 py-2.5 bg-[#0c397b] hover:bg-[#082855] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ User Baru</span>
              </button>
            </div>
          </div>

          {/* Quick Notice about credentials import */}
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Fitur Import Excel:</strong> Anda dapat mengunggah file Excel berisi data puluhan guru sekaligus dengan kolom Nama, NIP, Username, dan Password. Gunakan tombol <strong>Format Excel</strong> untuk mendapatkan contoh format resmi.
              </span>
            </div>
            <button
              onClick={handleDownloadCsvTemplate}
              className="text-[11px] font-bold text-emerald-800 hover:underline shrink-0"
            >
              Unduh Versi CSV (.csv)
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Lengkap & NIP</th>
                    <th className="py-3 px-4">Username Login</th>
                    <th className="py-3 px-4">Password</th>
                    <th className="py-3 px-4">Peran (Role)</th>
                    <th className="py-3 px-4">Mata Pelajaran / Bidang</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user, idx) => {
                    const isVisible = showPasswords[user.id];

                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">
                            NIP: {user.nip || '-'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                          {user.username || user.nip}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="bg-slate-100 px-2.5 py-1 rounded text-slate-800 font-semibold text-xs border border-slate-200">
                              {isVisible ? user.password || 'password123' : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleShowPassword(user.id)}
                              className="text-slate-400 hover:text-slate-600 p-1"
                              title={isVisible ? 'Sembunyikan' : 'Lihat Password'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              user.role === 'admin'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : user.role === 'kepsek'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-sky-100 text-sky-900 border border-sky-300'
                            }`}
                          >
                            {user.role === 'kepsek'
                              ? 'Kepala Sekolah'
                              : user.role === 'admin'
                              ? 'Administrator'
                              : 'Guru'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {user.subject || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {user.status || 'Aktif'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditUser(user)}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                              title="Edit Pengguna & Ubah Password"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUserClick(user.id, user.name)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 2: DESAIN & TEKS HALAMAN LOGIN + FASILITAS UPLOAD LOGO
      ============================================================= */}
      {adminTab === 'login-design' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Editor Form for Text & Logos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Kelola Logo, Teks & Identitas Halaman Login
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fasilitas upload/edit logo sekolah & aplikasi, teks header, judul sambutan, dan copyright.
                </p>
              </div>

              {savedLoginConfig && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersimpan!</span>
                </span>
              )}
            </div>

            {/* SECTION 1: UPLOAD / EDIT LOGOS (Fasilitas Upload Logo Baru) */}
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Image className="w-4 h-4 text-[#0c397b]" />
                <span>Upload & Kelola Logo Header Login (Kiri & Kanan):</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Logo Kiri (Logo Sekolah SMAN 1 Batangan) */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Logo Kiri (Sekolah)</span>
                    <span className="text-[10px] text-slate-400">SMABA</span>
                  </div>

                  {/* Logo Preview */}
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded-xl p-2 flex items-center justify-center border border-slate-200">
                    {leftLogoUrl ? (
                      <img src={leftLogoUrl} alt="Logo Kiri" className="w-full h-full object-contain" />
                    ) : (
                      <SmabaCrestLogo className="w-full h-full" />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo Kiri</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadLogoFile(e, 'left')}
                        className="sr-only"
                      />
                    </label>

                    <input
                      type="text"
                      value={leftLogoUrl}
                      onChange={(e) => setLeftLogoUrl(e.target.value)}
                      placeholder="Atau URL gambar logo..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0c397b]"
                    />

                    {leftLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setLeftLogoUrl('')}
                        className="text-[10px] text-rose-600 hover:underline w-full text-center block"
                      >
                        Reset ke Lambang SMABA Asli
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Logo Kanan (Logo PIJAR SMABA) */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Logo Kanan (Aplikasi)</span>
                    <span className="text-[10px] text-slate-400">PIJAR</span>
                  </div>

                  {/* Logo Preview */}
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded-xl p-2 flex items-center justify-center border border-slate-200">
                    {rightLogoUrl ? (
                      <img src={rightLogoUrl} alt="Logo Kanan" className="w-full h-full object-contain" />
                    ) : (
                      <PijarEmblemLogo className="w-full h-full" />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo Kanan</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadLogoFile(e, 'right')}
                        className="sr-only"
                      />
                    </label>

                    <input
                      type="text"
                      value={rightLogoUrl}
                      onChange={(e) => setRightLogoUrl(e.target.value)}
                      placeholder="Atau URL gambar logo..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#0c397b]"
                    />

                    {rightLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setRightLogoUrl('')}
                        className="text-[10px] text-rose-600 hover:underline w-full text-center block"
                      >
                        Reset ke Lambang PIJAR Asli
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Template Teks Cepat:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleApplyPresetSiperwali}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all shadow-2xs"
                >
                  Template Siperwali (Sesuai Gambar)
                </button>
                <button
                  type="button"
                  onClick={handleApplyPresetPijar}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold transition-all shadow-2xs"
                >
                  Template PIJAR SMABA
                </button>
              </div>
            </div>

            {/* SECTION 2: EDIT TEXT FORM */}
            <form onSubmit={handleSaveLoginConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  1. Tagline Header (Bagian Atas Biru)
                </label>
                <input
                  type="text"
                  required
                  value={headerTagline}
                  onChange={(e) => setHeaderTagline(e.target.value)}
                  placeholder="Contoh: PUSAT INFORMASI DAN JARINGAN BELAJAR"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  2. Nama Sekolah Header (Tulisan Besar Putih)
                </label>
                <input
                  type="text"
                  required
                  value={headerSchoolName}
                  onChange={(e) => setHeaderSchoolName(e.target.value)}
                  placeholder="Contoh: SMA NEGERI 1 BATANGAN"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  3. Judul Sambutan (Tulisan Biru Tebal)
                </label>
                <input
                  type="text"
                  required
                  value={welcomeTitle}
                  onChange={(e) => setWelcomeTitle(e.target.value)}
                  placeholder="Contoh: Selamat Datang di Siperwali 👋"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-[#0c397b] focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  4. Subjudul Sambutan (Tulisan Bawah Judul)
                </label>
                <input
                  type="text"
                  required
                  value={welcomeSubtitle}
                  onChange={(e) => setWelcomeSubtitle(e.target.value)}
                  placeholder="Contoh: Sistem Informasi Perwalian Siswa"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  5. Teks Hak Cipta Footer
                </label>
                <input
                  type="text"
                  required
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Contoh: © 2026 SIPERWALI • SMA Negeri 1 Batangan"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#0c397b] hover:bg-[#082855] text-white rounded-xl text-xs sm:text-sm font-black tracking-wider uppercase shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Desain, Logo & Teks Login</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Preview matching image.png */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 pl-1">
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau Langsung (Live Preview Halaman Login):</span>
            </div>

            <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 text-slate-900">
              {/* Header Box */}
              <div className="bg-[#0c397b] text-white p-5 pt-6 text-center">
                <div className="flex items-center justify-between px-2 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center">
                    {leftLogoUrl ? (
                      <img src={leftLogoUrl} alt="Logo Kiri" className="w-full h-full object-contain" />
                    ) : (
                      <SmabaCrestLogo className="w-full h-full" />
                    )}
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center">
                    {rightLogoUrl ? (
                      <img src={rightLogoUrl} alt="Logo Kanan" className="w-full h-full object-contain" />
                    ) : (
                      <PijarEmblemLogo className="w-full h-full" />
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-200">
                  {headerTagline || 'PUSAT INFORMASI DAN JARINGAN BELAJAR'}
                </div>
                <div className="text-lg font-black uppercase tracking-wide text-white mt-0.5">
                  {headerSchoolName || 'SMA NEGERI 1 BATANGAN'}
                </div>
                <div className="border-t border-blue-400/40 mt-3"></div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-black text-[#0c397b]">
                    {welcomeTitle || 'Selamat Datang di Siperwali 👋'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {welcomeSubtitle || 'Sistem Informasi Perwalian Siswa'}
                  </p>
                </div>

                <div className="space-y-3 pointer-events-none opacity-85">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Username
                    </label>
                    <div className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-400">
                      Masukkan username
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-400">
                      Masukkan password
                    </div>
                  </div>

                  <div className="py-2.5 bg-[#0c397b] text-white rounded-xl text-center text-xs font-black tracking-wider uppercase">
                    MASUK
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  {footerText || '© 2026 SIPERWALI • SMA Negeri 1 Batangan'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 3: PENGATURAN KURIKULUM
      ============================================================= */}
      {adminTab === 'kurikulum' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-slate-900 text-base">Konfigurasi Akademik</h3>
            </div>

            {savedSettings && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan berhasil disimpan ke sistem!</span>
              </div>
            )}

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[11px] mb-1">
                  Tahun Pelajaran
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[11px] mb-1">
                  Semester Aktif
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0c397b] font-medium"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[11px] mb-1">
                  Beban Jam Maksimal Guru (JP)
                </label>
                <input
                  type="number"
                  value={maxJp}
                  onChange={(e) => setMaxJp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-2.5 px-4 bg-[#0c397b] hover:bg-[#082855] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Konfigurasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          TAB 4: SIARAN PENGUMUMAN
      ============================================================= */}
      {adminTab === 'announcements' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Kelola Pengumuman Kurikulum ({announcements.length})
              </h3>
            </div>
          </div>

          <form onSubmit={handleAddAnnouncement} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 uppercase block">
              Tambah Siaran Pengumuman Baru:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Judul pengumuman..."
                className="sm:col-span-3 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700"
              >
                <option value="Normal">Normal</option>
                <option value="Tinggi">Penting</option>
              </select>
            </div>

            <textarea
              rows={2}
              required
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Isi teks pengumuman untuk dewan guru..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Siarkan Pengumuman</span>
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {announcements.map((anc) => (
              <div
                key={anc.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        anc.priority === 'Tinggi'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Prioritas {anc.priority}
                    </span>
                    <span className="text-xs text-slate-400">• {anc.date}</span>
                    <span className="text-xs text-slate-500">oleh {anc.author}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{anc.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{anc.content}</p>
                </div>

                <button
                  onClick={() => handleDeleteAnnouncement(anc.id)}
                  title="Hapus Pengumuman"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL 1: PREVIEW IMPORT FILE EXCEL (.xlsx / .csv)
      ============================================================= */}
      {importModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Konfirmasi Impor Data Guru dari Excel
                  </h3>
                  <p className="text-xs text-slate-500">
                    File: <strong className="text-slate-800">{importModal.fileName}</strong> • Terbaca: <strong>{importModal.parsedUsers.length} Guru / Pengguna</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImportModal({ ...importModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {importModal.error ? (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
                {importModal.error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                  ✓ Sebanyak <strong>{importModal.parsedUsers.length} baris akun guru & password</strong> siap diimpor ke sistem PIJAR SMABA.
                </div>

                {/* Import Mode Option */}
                <div className="flex items-center gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="importMode"
                      checked={!importModal.replaceMode}
                      onChange={() => setImportModal({ ...importModal, replaceMode: false })}
                      className="text-emerald-600"
                    />
                    <span>Gabungkan / Tambahkan ke daftar pengguna yang ada</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importModal.replaceMode}
                      onChange={() => setImportModal({ ...importModal, replaceMode: true })}
                      className="text-emerald-600"
                    />
                    <span>Ganti seluruh daftar data pengguna</span>
                  </label>
                </div>

                {/* Preview Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">No</th>
                        <th className="py-2.5 px-3">Nama Lengkap</th>
                        <th className="py-2.5 px-3">NIP</th>
                        <th className="py-2.5 px-3">Username</th>
                        <th className="py-2.5 px-3">Password</th>
                        <th className="py-2.5 px-3">Peran</th>
                        <th className="py-2.5 px-3">Mapel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importModal.parsedUsers.map((u, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-center text-slate-400">{i + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{u.name}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{u.nip || '-'}</td>
                          <td className="py-2 px-3 font-mono font-bold text-blue-900">{u.username}</td>
                          <td className="py-2 px-3 font-mono text-emerald-800 font-semibold">{u.password}</td>
                          <td className="py-2 px-3 capitalize">{u.role}</td>
                          <td className="py-2 px-3 text-slate-600">{u.subject || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setImportModal({ ...importModal, isOpen: false })}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Konfirmasi & Simpan {importModal.parsedUsers.length} Pengguna</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL 2: TAMBAH USER BARU (MANUAL)
      ============================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0c397b]" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Tambah Akun Pengguna Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Dra. Hj. Siti Rahayu, M.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NIP Pegawai
                  </label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="Contoh: 197508122002122001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Peran (Role) *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  >
                    <option value="guru">Guru Pengampu / Wali Kelas</option>
                    <option value="kepsek">Kepala Sekolah / Penanggung Jawab TPMPS</option>
                    <option value="admin">Waka Kurikulum / Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Username Login *
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="Contoh: sitirahayu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Password Akun *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Contoh: password123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mata Pelajaran Diampu
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="Contoh: Bahasa Indonesia"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Contoh: guru@sman1batangan.sch.id"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0c397b] hover:bg-[#082855] text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Simpan & Buat Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================
          MODAL 3: EDIT USER & UBAH PASSWORD
      ============================================================= */}
      {editUserModal.isOpen && editUserModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Edit Pengguna & Ubah Password
                </h3>
              </div>
              <button
                onClick={() => setEditUserModal({ isOpen: false, user: null })}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={editUserModal.user.name}
                  onChange={(e) =>
                    setEditUserModal({
                      ...editUserModal,
                      user: { ...editUserModal.user!, name: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    NIP Pegawai
                  </label>
                  <input
                    type="text"
                    value={editUserModal.user.nip || ''}
                    onChange={(e) =>
                      setEditUserModal({
                        ...editUserModal,
                        user: { ...editUserModal.user!, nip: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Peran (Role) *
                  </label>
                  <select
                    value={editUserModal.user.role}
                    onChange={(e) =>
                      setEditUserModal({
                        ...editUserModal,
                        user: { ...editUserModal.user!, role: e.target.value as UserRole },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  >
                    <option value="guru">Guru Pengampu / Wali Kelas</option>
                    <option value="kepsek">Kepala Sekolah / TPMPS</option>
                    <option value="admin">Waka Kurikulum / Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Username Login *
                  </label>
                  <input
                    type="text"
                    required
                    value={editUserModal.user.username || ''}
                    onChange={(e) =>
                      setEditUserModal({
                        ...editUserModal,
                        user: { ...editUserModal.user!, username: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-700 uppercase mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Ubah Password Baru *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editUserModal.user.password || ''}
                    onChange={(e) =>
                      setEditUserModal({
                        ...editUserModal,
                        user: { ...editUserModal.user!, password: e.target.value },
                      })
                    }
                    placeholder="Ketik password baru..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/50 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={editUserModal.user.subject || ''}
                    onChange={(e) =>
                      setEditUserModal({
                        ...editUserModal,
                        user: { ...editUserModal.user!, subject: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status Akun
                  </label>
                  <select
                    value={editUserModal.user.status || 'Aktif'}
                    onChange={(e) =>
                      setEditUserModal({
                        ...editUserModal,
                        user: {
                          ...editUserModal.user!,
                          status: e.target.value as 'Aktif' | 'Nonaktif',
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0c397b]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditUserModal({ isOpen: false, user: null })}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0c397b] hover:bg-[#082855] text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Simpan Perubahan & Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
