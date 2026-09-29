export type UserRole = 'admin' | 'guru' | 'kepsek' | 'tamu';

export interface User {
  id: string;
  name: string;
  nip?: string;
  username?: string;
  password?: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  subject?: string;
  avatarUrl?: string;
  status?: 'Aktif' | 'Nonaktif';
}

export interface LoginPageConfig {
  headerTagline: string;
  headerSchoolName: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  footerText: string;
  leftLogoUrl?: string;
  rightLogoUrl?: string;
}

export type MenuKey =
  | 'kosp'
  | 'struktur'
  | 'kaldik'
  | 'jadwal'
  | 'uraian'
  | 'sk'
  | 'perangkat'
  | 'data-guru'
  | 'situs'
  | 'admin';

export interface MenuItemConfig {
  key: MenuKey;
  title: string;
  subtitle?: string;
  iconName: string;
  highlighted?: boolean;
  roleBadge?: string;
  badgeCount?: number;
  allowedRoles?: UserRole[];
}

export interface PerangkatItem {
  id: string;
  title: string;
  subject: string;
  grade: 'X' | 'XI' | 'XII' | 'Semua';
  phase: 'Fase E' | 'Fase F' | 'Umum';
  category: 'CP' | 'TP & ATP' | 'Modul Ajar' | 'Prota & Promes' | 'Modul P5' | 'Asesmen & Kisi-kisi' | 'Bahan Ajar';
  teacherName: string;
  teacherNip: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'xlsx';
  uploadDate: string;
  status: 'Disetujui' | 'Perlu Revisi' | 'Menunggu Verifikasi';
  downloadCount: number;
  previewUrl?: string;
  description?: string;
  revisionNotes?: string;
  signedByPrincipal?: boolean;
  signedDate?: string;
}

export interface TeacherProgress {
  id: string;
  nip: string;
  name: string;
  subject: string;
  classAssigned: string[];
  totalTeachingHours: number;
  checklist: {
    cp: boolean;
    atp: boolean;
    modulAjar: boolean;
    protaPromes: boolean;
    asesmen: boolean;
  };
  completionPercentage: number;
  lastUpdated: string;
  status: 'Lengkap' | 'Proses' | 'Belum';
  uploadedFileUrl?: string;
  uploadedFileName?: string;
}

export interface KaldikMonth {
  month: string;
  year: number;
  days: {
    date: number;
    dayName: string;
    type: 'kbm' | 'libur' | 'asesmen' | 'kegiatan' | 'minggu';
    description?: string;
  }[];
}

export interface CurriculumActivity {
  id: string;
  title: string;
  category: 'Perencanaan' | 'KBM' | 'Asesmen' | 'Pengembangan Guru' | 'P5';
  dateRange: string;
  status: 'Selesai' | 'Sedang Berjalan' | 'Mendatang';
  pic: string;
  targetOutput: string;
  description: string;
}

export interface SchoolSK {
  id: string;
  code: string;
  number: string;
  title: string;
  category: 'TPMPS' | 'TPK' | 'KP' | 'SK KBM';
  date: string;
  signedBy: string;
  fileSize: string;
  totalMembers: number;
  summary: string;
  members: { role: string; name: string; nip: string }[];
  fileUrl?: string;
  fileName?: string;
}

export interface ScheduleItem {
  id: string;
  hari: string;
  kelas: string;
  jam: string;
  waktu: string;
  mapel: string;
  guru: string;
  ruang: string;
}

export interface PiketItem {
  id: string;
  hari: string;
  koordinator: string;
  anggota: string[];
  tugasUtama: string;
}

export interface KaldikEvent {
  id: string;
  date: string;
  event: string;
  type: 'kbm' | 'libur' | 'asesmen' | 'kegiatan' | 'minggu';
  semester: 'Ganjil' | 'Genap' | 'Semua';
}

export interface RmeRow {
  id: string;
  no: number;
  bulan: string;
  jmlMinggu: number;
  tdkEfektif: number;
  efektif: number;
  ket: string;
  semester: 'Ganjil' | 'Genap';
}

export interface MapelStruktur {
  id: string;
  no: number;
  fase: 'X' | 'XI' | 'XII';
  mapel: string;
  intra: number;
  p5: number;
  total: number;
  mingguan: number;
  kategori?: string;
}

export interface KospChapter {
  id: string;
  no: string;
  title: string;
  pages: string;
  desc: string;
  fileUrl?: string;
  fileName?: string;
}

export interface KospDocumentInfo {
  title: string;
  subtitle: string;
  skPengesahan: string;
  lastUpdated: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  chapters: KospChapter[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'Tinggi' | 'Normal';
  author: string;
}

export interface AcademicSettings {
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  maxJp: string;
  curriculumName?: string;
  uploadDeadline?: string;
  wakaKurikulumName?: string;
}
