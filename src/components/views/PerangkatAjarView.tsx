import React, { useState } from 'react';
import {
  CloudUpload,
  Download,
  Eye,
  Search,
  Filter,
  FileText,
  CheckCircle,
  Plus,
  UploadCloud,
  FileCheck,
  Calendar,
  User,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Award,
  ShieldCheck,
  Send,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { PerangkatItem, User as CurrentUser, UserRole } from '../../types';

interface PerangkatAjarViewProps {
  currentUser: CurrentUser | null;
  items: PerangkatItem[];
  onAddNewItem: (item: PerangkatItem) => void;
  onOpenDocument: (title: string, category: string, content?: string) => void;
  onOpenSheetsModal?: () => void;
  onUpdatePerangkatStatus?: (id: string, status: 'Disetujui' | 'Perlu Revisi', revisionNotes?: string) => void;
  onSignByPrincipal?: (id: string, notes?: string) => void;
}

export const PerangkatAjarView: React.FC<PerangkatAjarViewProps> = ({
  currentUser,
  items,
  onAddNewItem,
  onOpenDocument,
  onOpenSheetsModal,
  onUpdatePerangkatStatus,
  onSignByPrincipal,
}) => {
  const currentRole: UserRole = currentUser?.role || 'guru';

  // Set default active tab based on role
  const [activeTab, setActiveTab] = useState<'saya' | 'unduh' | 'unggah' | 'verifikasi' | 'supervisi'>(
    currentRole === 'guru'
      ? 'saya'
      : currentRole === 'admin'
      ? 'verifikasi'
      : currentRole === 'kepsek'
      ? 'supervisi'
      : 'unduh'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Semua');
  const [selectedGrade, setSelectedGrade] = useState('Semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Bahasa Indonesia');
  const [grade, setGrade] = useState<'X' | 'XI' | 'XII'>('X');
  const [category, setCategory] = useState<PerangkatItem['category']>('Modul Ajar');
  const [teacherName, setTeacherName] = useState(currentUser?.name || 'Dra. Hj. Siti Rahayu, M.Pd.');
  const [teacherNip, setTeacherNip] = useState(currentUser?.nip || '197508122002122001');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Revision / Supervision Modal states
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    item: PerangkatItem | null;
    action: 'revisi' | 'supervisi' | null;
    notes: string;
  }>({
    isOpen: false,
    item: null,
    action: null,
    notes: '',
  });

  const subjects = [
    'Semua',
    'Bahasa Indonesia',
    'Matematika',
    'Fisika',
    'Kimia',
    'Biologi',
    'Sosiologi',
    'Ekonomi',
    'Bahasa Inggris',
    'Bahasa Jawa',
    'P5 (Projek Pancasila)',
    'Informatika',
    'Pendidikan Agama Islam',
  ];

  const categories = [
    'Semua',
    'Modul Ajar',
    'TP & ATP',
    'CP',
    'Prota & Promes',
    'Modul P5',
    'Asesmen & Kisi-kisi',
    'Bahan Ajar',
  ];

  // Filter items based on activeTab and filters
  const filteredItems = items.filter((item) => {
    // Tab based filtering
    if (activeTab === 'saya') {
      const isMyItem =
        item.teacherNip === currentUser?.nip ||
        item.teacherName.toLowerCase().includes(currentUser?.name.toLowerCase().split(',')[0] || 'siti');
      if (!isMyItem) return false;
    } else if (activeTab === 'verifikasi') {
      // Admin verification tab
      if (item.status === 'Disetujui' && item.signedByPrincipal) return false;
    } else if (activeTab === 'supervisi') {
      // Kepsek supervision tab
      // Show documents awaiting principal endorsement or ready for supervision
      if (item.status === 'Perlu Revisi') return false;
    }

    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = selectedSubject === 'Semua' || item.subject === selectedSubject;
    const matchGrade = selectedGrade === 'Semua' || item.grade === selectedGrade;
    const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchSearch && matchSubject && matchGrade && matchCategory;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newItem: PerangkatItem = {
      id: `prk-${Date.now()}`,
      title,
      subject,
      grade,
      phase: grade === 'X' ? 'Fase E' : 'Fase F',
      category,
      teacherName: currentUser?.name || teacherName,
      teacherNip: currentUser?.nip || teacherNip,
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '2.1 MB',
      fileType: fileName.endsWith('.docx') ? 'docx' : fileName.endsWith('.xlsx') ? 'xlsx' : 'pdf',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Menunggu Verifikasi',
      downloadCount: 1,
      description: description || 'Perangkat ajar diunggah melalui portal kurikulum PIJAR SMABA.',
    };

    onAddNewItem(newItem);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setActiveTab(currentRole === 'guru' ? 'saya' : 'unduh');
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setFileName('');
    }, 1500);
  };

  const handleOpenReviewModal = (item: PerangkatItem, action: 'revisi' | 'supervisi') => {
    setReviewModal({
      isOpen: true,
      item,
      action,
      notes: action === 'revisi' ? (item.revisionNotes || '') : '',
    });
  };

  const handleConfirmReviewAction = () => {
    if (!reviewModal.item || !reviewModal.action) return;

    if (reviewModal.action === 'revisi') {
      if (onUpdatePerangkatStatus) {
        onUpdatePerangkatStatus(reviewModal.item.id, 'Perlu Revisi', reviewModal.notes || 'Mohon lengkapi instrumen sesuai panduan.');
      }
    } else if (reviewModal.action === 'supervisi') {
      if (onSignByPrincipal) {
        onSignByPrincipal(reviewModal.item.id, reviewModal.notes);
      }
    }

    setReviewModal({ isOpen: false, item: null, action: null, notes: '' });
  };

  const handleApproveDirect = (id: string) => {
    if (onUpdatePerangkatStatus) {
      onUpdatePerangkatStatus(id, 'Disetujui');
    }
  };

  const handleSignDirect = (id: string) => {
    if (onSignByPrincipal) {
      onSignByPrincipal(id, 'Memenuhi standar mutu kurikulum operasional SMA Negeri 1 Batangan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <CloudUpload className="w-3.5 h-3.5" />
            <span>
              {currentRole === 'guru'
                ? 'Portal Perangkat Ajar Guru Pengampu'
                : currentRole === 'admin'
                ? 'Validasi & Verifikasi Kurikulum (Admin)'
                : currentRole === 'kepsek'
                ? 'Supervisi Klinis & Pengesahan Kepala Sekolah'
                : 'Repositori Kurikulum Terbuka'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentRole === 'guru'
              ? 'Perangkat Ajar Saya & Bank Materi'
              : currentRole === 'admin'
              ? 'Validasi & Verifikasi Perangkat Ajar Guru'
              : currentRole === 'kepsek'
              ? 'Supervisi Klinis & Pengesahan Resmi'
              : 'Unggah, Lihat & Unduh Perangkat Ajar'}
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
            {currentRole === 'guru'
              ? 'Unggah modul ajar, Alur Tujuan Pembelajaran (ATP), CP, dan asesmen Anda. Pantau status telaah dan catatan revisi tim kurikulum.'
              : currentRole === 'admin'
              ? 'Panel verifikasi berkas kurikulum 54 dewan guru SMAN 1 Batangan. Berikan persetujuan atau catatan revisi instrumen pembelajaran.'
              : currentRole === 'kepsek'
              ? 'Ruang pengesahan resmi (tanda tangan digital / stempel) Kepala Sekolah untuk dokumen kurikulum yang telah diverifikasi tim pengembang.'
              : 'Bank data perangkat ajar Kurikulum Merdeka SMA Negeri 1 Batangan. Akses materi dan dokumen operasional pembelajaran.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          {onOpenSheetsModal && (
            <button
              onClick={onOpenSheetsModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-700/70 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold border border-emerald-400/40 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Google Sheets</span>
            </button>
          )}

          {/* Role-tailored Tabs */}
          <div className="flex bg-white/10 p-1.5 rounded-xl border border-white/20">
            {currentRole === 'guru' && (
              <button
                onClick={() => setActiveTab('saya')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'saya'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Berkas Saya</span>
              </button>
            )}

            {currentRole === 'admin' && (
              <button
                onClick={() => setActiveTab('verifikasi')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'verifikasi'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verifikasi Berkas</span>
              </button>
            )}

            {currentRole === 'kepsek' && (
              <button
                onClick={() => setActiveTab('supervisi')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'supervisi'
                    ? 'bg-emerald-400 text-slate-950 shadow-md font-extrabold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Pengesahan & Supervisi</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('unduh')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'unduh'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Semua Dokumen ({items.length})</span>
            </button>

            {currentRole !== 'tamu' && (
              <button
                onClick={() => setActiveTab('unggah')}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'unggah'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Unggah Baru</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Role Notice Banners */}
      {currentRole === 'guru' && activeTab === 'saya' && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sky-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center font-bold">
              SR
            </div>
            <div>
              <div className="font-bold">
                Berkas Administrasi: Dra. Hj. Siti Rahayu, M.Pd. (NIP: 197508122002122001)
              </div>
              <div className="text-sky-700 text-[11px]">
                Menampilkan perangkat ajar yang telah Anda serahkan. Perhatikan berkas berstatus <span className="font-bold text-amber-700">Perlu Revisi</span> untuk diperbaiki.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('unggah')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-center shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Unggah Perangkat Baru</span>
          </button>
        </div>
      )}

      {currentRole === 'admin' && activeTab === 'verifikasi' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Mode Verifikasi & Validasi Waka Kurikulum:</span> Klik tombol <span className="font-bold text-emerald-800">Setujui</span> untuk meloloskan berkas ke Kepala Sekolah, atau <span className="font-bold text-amber-800">Minta Revisi</span> untuk menyertakan catatan telaah kepada guru yang bersangkutan.
            </div>
          </div>
        </div>
      )}

      {currentRole === 'kepsek' && activeTab === 'supervisi' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Hak Pengesahan & Tanda Tangan Digital Kepala Sekolah:</span> Sebagai penanggung jawab TPMPS, berikan pengesahan resmi dan catatan supervisi klinis untuk meningkatkan kompetensi pedagogik dewan guru.
            </div>
          </div>
        </div>
      )}

      {/* TAB: LIST VIEW (Saya / Unduh / Verifikasi / Supervisi) */}
      {activeTab !== 'unggah' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === 'saya'
                      ? 'Cari perangkat ajar Anda...'
                      : 'Cari judul perangkat, guru, atau mata pelajaran...'
                  }
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Semua">Semua Jenjang</option>
                  <option value="X">Kelas X (Fase E)</option>
                  <option value="XI">Kelas XI (Fase F)</option>
                  <option value="XII">Kelas XII (Fase F)</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase shrink-0 mr-1">
                Mapel:
              </span>
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedSubject === sub
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Tidak ada perangkat ajar yang sesuai</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === 'saya'
                  ? 'Anda belum memiliki perangkat yang diunggah dengan kriteria pencarian ini.'
                  : 'Coba ubah kata kunci pencarian atau reset filter mata pelajaran dan jenjang kelas.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                    item.status === 'Perlu Revisi'
                      ? 'border-amber-300 ring-1 ring-amber-200'
                      : item.signedByPrincipal
                      ? 'border-emerald-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[11px] font-bold border border-teal-200">
                          {item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                          Kelas {item.grade} ({item.phase})
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.signedByPrincipal && (
                          <span
                            title="Telah disahkan resmi oleh Kepala SMA Negeri 1 Batangan"
                            className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1"
                          >
                            <Award className="w-3 h-3 text-emerald-600" />
                            <span>Sah Kepsek</span>
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.status === 'Disetujui'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.status === 'Perlu Revisi'
                              ? 'bg-rose-50 text-rose-700 border-rose-300 font-extrabold'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Revision Notes Alert (Prominently visible for teacher & admin) */}
                    {item.revisionNotes && (
                      <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs space-y-1">
                        <div className="font-bold flex items-center gap-1 text-[11px] text-amber-800">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Catatan Telaah / Supervisi:</span>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-normal pl-4">
                          {item.revisionNotes}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 text-xs text-slate-500 space-y-1 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{item.teacherName}</span>
                        <span className="font-mono text-slate-400">{item.fileSize}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>{item.subject}</span>
                        <span>Diunggah: {item.uploadDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onOpenDocument(
                            item.title,
                            item.category,
                            `PERANGKAT AJAR SMA NEGERI 1 BATANGAN\n\nJudul: ${item.title}\nMata Pelajaran: ${item.subject}\nFase / Kelas: ${item.phase} (Kelas ${item.grade})\nPengampu: ${item.teacherName} (NIP. ${item.teacherNip})\nStatus: ${item.status}${item.signedByPrincipal ? ' (Telah Disahkan Kepala Sekolah: ' + (item.signedDate || '2025') + ')' : ''}\n\nDESKRIPSI PEMBELAJARAN:\n${item.description}\n\n1. Capaian Pembelajaran & Tujuan:\nPeserta didik mampu memahami konsep inti secara kontekstual dengan mengangkat kearifan lokal wilayah pesisir Batangan Kabupaten Pati.\n\n2. Alur Kegiatan Pembelajaran (Berdiferensiasi):\n- Pendahuluan: Orientasi, Apersepsi kearifan lokal, Asesmen Diagnostik Awal.\n- Kegiatan Inti: Kolaborasi kelompok, Eksplorasi materi, Diskusi pemecahan masalah.\n- Penutup: Refleksi belajar, Asesmen Formatif, Rencana pertemuan berikutnya.\n\n3. Instrumen Asesmen & Rubrik:\nTersedia instrumen asesmen diagnostik, formatif berkala, dan rubrik penilaian portofolio pembelajaran.`
                          )
                        }
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() =>
                          onOpenDocument(
                            item.title,
                            item.category,
                            `Unduh berkas: ${item.title} (${item.fileSize}) berhasil dimulai.`
                          )
                        }
                        className="flex-1 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-teal-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh</span>
                      </button>
                    </div>

                    {/* Role Specific Control Actions */}
                    {/* Admin Actions: Approve or Request Revision */}
                    {currentRole === 'admin' && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleApproveDirect(item.id)}
                          className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                        <button
                          onClick={() => handleOpenReviewModal(item, 'revisi')}
                          className="py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Minta Revisi</span>
                        </button>
                      </div>
                    )}

                    {/* Kepala Sekolah Actions: Official Sign-off & Clinical Supervision */}
                    {currentRole === 'kepsek' && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => handleSignDirect(item.id)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                            item.signedByPrincipal
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{item.signedByPrincipal ? 'Telah Disahkan' : 'Sahkan Dokumen'}</span>
                        </button>
                        <button
                          onClick={() => handleOpenReviewModal(item, 'supervisi')}
                          className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Catatan Supervisi</span>
                        </button>
                      </div>
                    )}

                    {/* Teacher Action: If need revision, quick button to re-upload */}
                    {currentRole === 'guru' && item.status === 'Perlu Revisi' && (
                      <button
                        onClick={() => {
                          setTitle(`Revisi - ${item.title}`);
                          setSubject(item.subject);
                          setGrade(item.grade as any);
                          setCategory(item.category);
                          setActiveTab('unggah');
                        }}
                        className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Perbaiki & Unggah Versi Revisi</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: UNGGAH DOKUMEN BARU */}
      {activeTab === 'unggah' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Formulir Unggah Perangkat Ajar Kurikulum Merdeka
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Silakan lengkapi identitas modul ajar atau perangkat pembelajaran sebelum diunggah ke repositori PIJAR SMABA.
            </p>
          </div>

          {isSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-semibold border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Perangkat ajar berhasil diunggah dan disimpan ke sistem PIJAR SMABA.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Judul Perangkat Ajar *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Modul Ajar Fisika: Energi Terbarukan & Efisiensi Energi..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mata Pelajaran *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {subjects.filter((s) => s !== 'Semua').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jenjang & Fase *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="X">Kelas X (Fase E)</option>
                  <option value="XI">Kelas XI (Fase F)</option>
                  <option value="XII">Kelas XII (Fase F)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Jenis Dokumen *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {categories.filter((c) => c !== 'Semua').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Guru Pengampu *
                </label>
                <input
                  type="text"
                  required
                  value={currentUser?.name || teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  NIP Guru *
                </label>
                <input
                  type="text"
                  required
                  value={currentUser?.nip || teacherNip}
                  onChange={(e) => setTeacherNip(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Deskripsi & Catatan Pembelajaran
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan ringkasan materi, tema kearifan lokal Pati, pendekatan pembelajaran, atau catatan asesmen..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* File Drag and Drop / Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pilih Berkas Dokumen (PDF, DOCX, XLSX)
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center transition-colors">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-xs text-slate-600">
                  <label className="font-bold text-teal-600 hover:underline cursor-pointer">
                    <span>Klik untuk memilih berkas</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.xlsx"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <span> atau tarik dan lepas file ke area ini</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Maksimal ukuran file: 25 MB • Format: PDF, Word DOCX, Excel XLSX
                </p>
                {fileName && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-lg text-xs font-semibold text-teal-800">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab(currentRole === 'guru' ? 'saya' : 'unduh')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-teal-500/25 transition-all flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Simpan & Kirim Perangkat</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review & Supervision Notes Modal */}
      {reviewModal.isOpen && reviewModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {reviewModal.action === 'revisi' ? (
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                ) : (
                  <Award className="w-5 h-5 text-emerald-600" />
                )}
                <h3 className="font-bold text-slate-900 text-base">
                  {reviewModal.action === 'revisi'
                    ? 'Catatan Telaah Revisi Perangkat'
                    : 'Pengesahan & Catatan Supervisi Kepala Sekolah'}
                </h3>
              </div>
              <button
                onClick={() => setReviewModal({ isOpen: false, item: null, action: null, notes: '' })}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900">{reviewModal.item.title}</div>
              <div>Guru: {reviewModal.item.teacherName} (NIP: {reviewModal.item.teacherNip})</div>
              <div>Mata Pelajaran: {reviewModal.item.subject} • Kelas {reviewModal.item.grade}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {reviewModal.action === 'revisi'
                  ? 'Uraian Catatan Revisi untuk Guru *'
                  : 'Catatan Supervisi Klinis / Apresiasi Mutu (Opsional)'}
              </label>
              <textarea
                rows={4}
                value={reviewModal.notes}
                onChange={(e) => setReviewModal({ ...reviewModal, notes: e.target.value })}
                placeholder={
                  reviewModal.action === 'revisi'
                    ? 'Contoh: Mohon tambahkan rubrik asesmen formatif lembar observasi diskusi kelompok dan sesuaikan alokasi JP pada kegiatan inti...'
                    : 'Contoh: Modul ajar sangat baik, diferensiasi konten kontekstual pesisir Batangan telah tampak jelas...'
                }
                className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewModal({ isOpen: false, item: null, action: null, notes: '' })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReviewAction}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-sm ${
                  reviewModal.action === 'revisi'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {reviewModal.action === 'revisi' ? 'Kirim Catatan Revisi' : 'Sahkan & Simpan Supervisi'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
