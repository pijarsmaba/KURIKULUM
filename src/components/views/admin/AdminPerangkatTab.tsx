import React, { useState } from 'react';
import {
  CloudUpload,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Search,
  Filter,
  Eye,
  Check,
  AlertTriangle,
  FileUp
} from 'lucide-react';
import { PerangkatItem } from '../../../types';

interface AdminPerangkatTabProps {
  perangkatList: PerangkatItem[];
  onAddPerangkat: (item: PerangkatItem) => void;
  onUpdatePerangkat: (item: PerangkatItem) => void;
  onDeletePerangkat: (id: string) => void;
  onUpdatePerangkatStatus: (id: string, status: 'Disetujui' | 'Perlu Revisi', notes?: string) => void;
  onOpenDocument?: (title: string, category: string, content?: string) => void;
}

export const AdminPerangkatTab: React.FC<AdminPerangkatTabProps> = ({
  perangkatList,
  onAddPerangkat,
  onUpdatePerangkat,
  onDeletePerangkat,
  onUpdatePerangkatStatus,
  onOpenDocument,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PerangkatItem | null>(null);
  const [form, setForm] = useState<{
    title: string;
    subject: string;
    grade: 'X' | 'XI' | 'XII' | 'Semua';
    phase: 'Fase E' | 'Fase F' | 'Umum';
    category: 'CP' | 'TP & ATP' | 'Modul Ajar' | 'Prota & Promes' | 'Modul P5' | 'Asesmen & Kisi-kisi' | 'Bahan Ajar';
    teacherName: string;
    teacherNip: string;
    fileSize: string;
    fileType: 'pdf' | 'docx' | 'xlsx';
    status: 'Disetujui' | 'Perlu Revisi' | 'Menunggu Verifikasi';
    description: string;
    revisionNotes: string;
  }>({
    title: '',
    subject: 'Bahasa Indonesia',
    grade: 'X',
    phase: 'Fase E',
    category: 'Modul Ajar',
    teacherName: 'Dra. Hj. Siti Rahayu, M.Pd.',
    teacherNip: '197508122002122001',
    fileSize: '2.4 MB',
    fileType: 'pdf',
    status: 'Disetujui',
    description: '',
    revisionNotes: '',
  });

  const categories = ['Semua', 'Modul Ajar', 'TP & ATP', 'CP', 'Prota & Promes', 'Modul P5', 'Asesmen & Kisi-kisi', 'Bahan Ajar'];

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const filteredItems = perangkatList.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.teacherName.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'Semua' || item.category === categoryFilter;
    const matchStat = statusFilter === 'Semua' || item.status === statusFilter;
    return matchSearch && matchCat && matchStat;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      title: '',
      subject: 'Bahasa Indonesia',
      grade: 'X',
      phase: 'Fase E',
      category: 'Modul Ajar',
      teacherName: 'Dra. Hj. Siti Rahayu, M.Pd.',
      teacherNip: '197508122002122001',
      fileSize: '2.5 MB',
      fileType: 'pdf',
      status: 'Disetujui',
      description: '',
      revisionNotes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PerangkatItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      subject: item.subject,
      grade: item.grade,
      phase: item.phase,
      category: item.category,
      teacherName: item.teacherName,
      teacherNip: item.teacherNip,
      fileSize: item.fileSize,
      fileType: item.fileType,
      status: item.status,
      description: item.description || '',
      revisionNotes: item.revisionNotes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.teacherName.trim()) {
      showFeedback('error', 'Judul berkas dan nama guru wajib diisi!');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (editingItem) {
      onUpdatePerangkat({
        ...editingItem,
        ...form,
      });
      showFeedback('success', `Perangkat ajar "${form.title}" berhasil diperbarui.`);
    } else {
      const newItem: PerangkatItem = {
        id: `prk-${Date.now()}`,
        ...form,
        uploadDate: today,
        downloadCount: 0,
      };
      onAddPerangkat(newItem);
      showFeedback('success', `Perangkat ajar baru "${form.title}" berhasil diunggah.`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string, title: string) => {
    if (window.confirm(`Hapus berkas perangkat "${title}"?`)) {
      onDeletePerangkat(id);
      showFeedback('success', `Berkas "${title}" telah dihapus.`);
    }
  };

  // Upload new file on behalf of teacher
  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const type: 'pdf' | 'docx' | 'xlsx' = ext === 'xlsx' || ext === 'xls' ? 'xlsx' : ext === 'doc' || ext === 'docx' ? 'docx' : 'pdf';
    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    setForm((prev) => ({
      ...prev,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      fileSize: sizeStr,
      fileType: type,
    }));
    showFeedback('success', `Berkas ${file.name} (${sizeStr}) siap disimpan.`);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs uppercase tracking-wider">
            <CloudUpload className="w-4 h-4" />
            <span>Bank Data & Validasi Perangkat Guru</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Manajemen & Validasi Perangkat Ajar
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Admin dapat mengunggah berkas ajar guru, merevisi status persetujuan, mengubah data, atau menghapus berkas.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah / Unggah Perangkat</span>
        </button>
      </div>

      {/* Notification Toast */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold shadow-sm transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Toolbar Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, nama guru, mapel..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Kategori: {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Perlu Revisi">Perlu Revisi</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 self-end md:self-center">
          {filteredItems.length} berkas ditemukan
        </span>
      </div>

      {/* Table Perangkat Ajar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Judul Dokumen Perangkat</th>
                <th className="py-3 px-3">Guru Pengampu</th>
                <th className="py-3 px-3 text-center">Fase / Kelas</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3 text-center">Ukuran</th>
                <th className="py-3 px-3 text-center">Status Validasi</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada berkas perangkat yang cocok dengan kriteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 leading-snug">{item.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Mapel: {item.subject}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{item.teacherName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">NIP: {item.teacherNip}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-xs">
                        {item.phase} ({item.grade})
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{item.category}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-500 text-xs">
                      {item.fileSize}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.status === 'Disetujui'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Perlu Revisi'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onOpenDocument && (
                          <button
                            onClick={() =>
                              onOpenDocument(
                                item.title,
                                item.category,
                                `PRATINJAU DOKUMEN: ${item.title}\n\nGuru: ${item.teacherName}\nNIP: ${item.teacherNip}\nMata Pelajaran: ${item.subject}\nFase: ${item.phase} (Kelas ${item.grade})\nStatus: ${item.status}\n\nDeskripsi:\n${item.description || 'Modul pembelajaran terintegrasi Kurikulum Merdeka SMABA.'}`
                              )
                            }
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Pratinjau Berkas"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Perangkat"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id, item.title)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Perangkat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Perangkat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">
                {editingItem ? 'Edit Perangkat Ajar Guru' : 'Tambah & Unggah Perangkat Ajar'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Dokumen Perangkat</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Modul Ajar Fisika: Energi Terbarukan & Efisiensi Energi"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Fisika"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Perangkat</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Modul Ajar">Modul Ajar</option>
                    <option value="TP & ATP">TP & ATP</option>
                    <option value="CP">Capaian Pembelajaran (CP)</option>
                    <option value="Prota & Promes">Prota & Promes</option>
                    <option value="Modul P5">Modul P5</option>
                    <option value="Asesmen & Kisi-kisi">Asesmen & Kisi-kisi</option>
                    <option value="Bahan Ajar">Bahan Ajar / LKPD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                    <option value="Semua">Semua Jenjang</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fase Belajar</label>
                  <select
                    value={form.phase}
                    onChange={(e) => setForm({ ...form, phase: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Fase E">Fase E</option>
                    <option value="Fase F">Fase F</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Guru Pengampu</label>
                  <input
                    type="text"
                    value={form.teacherName}
                    onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                    placeholder="e.g. Supriyanto, S.Pd., M.Si."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIP Guru</label>
                  <input
                    type="text"
                    value={form.teacherNip}
                    onChange={(e) => setForm({ ...form, teacherNip: e.target.value })}
                    placeholder="e.g. 197804152006041012"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Verifikasi Tim Kurikulum</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Disetujui">Disetujui (Valid)</option>
                    <option value="Perlu Revisi">Perlu Revisi</option>
                    <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih / Unggah Berkas Baru</label>
                  <label className="w-full p-2 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors">
                    <FileUp className="w-4 h-4" />
                    <span>Upload File (PDF/DOC/XLS)</span>
                    <input type="file" accept=".pdf, .docx, .doc, .xlsx, .xls" onChange={handleUploadFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Ringkas Berkas</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Catatan lingkup materi atau kekhasan modul..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {form.status === 'Perlu Revisi' && (
                <div>
                  <label className="block text-xs font-bold text-rose-700 mb-1">
                    Catatan Revisi dari Waka Kurikulum (Untuk Guru)
                  </label>
                  <textarea
                    rows={2}
                    value={form.revisionNotes}
                    onChange={(e) => setForm({ ...form, revisionNotes: e.target.value })}
                    placeholder="Contoh: Mohon lengkapi rubrik asesmen autentik dan instrumen refleksi siswa."
                    className="w-full p-2.5 rounded-xl border border-rose-300 bg-rose-50/50 text-xs sm:text-sm font-medium text-rose-900 focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Unggah & Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
