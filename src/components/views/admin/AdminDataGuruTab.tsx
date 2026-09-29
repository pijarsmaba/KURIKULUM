import React, { useState } from 'react';
import {
  Monitor,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Check,
  FileCheck,
  ShieldCheck,
  BarChart2,
  FileUp,
  Paperclip
} from 'lucide-react';
import { TeacherProgress } from '../../../types';

interface AdminDataGuruTabProps {
  teachersProgressList: TeacherProgress[];
  onAddTeacherProgress: (item: TeacherProgress) => void;
  onUpdateTeacherProgress: (item: TeacherProgress) => void;
  onDeleteTeacherProgress: (id: string) => void;
  onToggleTeacherChecklist: (teacherId: string, itemKey: keyof TeacherProgress['checklist']) => void;
}

export const AdminDataGuruTab: React.FC<AdminDataGuruTabProps> = ({
  teachersProgressList,
  onAddTeacherProgress,
  onUpdateTeacherProgress,
  onDeleteTeacherProgress,
  onToggleTeacherChecklist,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Lengkap' | 'Proses' | 'Belum'>('Semua');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeacherProgress | null>(null);
  const [form, setForm] = useState<{
    name: string;
    nip: string;
    subject: string;
    classStr: string;
    totalTeachingHours: number;
    checklist: {
      cp: boolean;
      atp: boolean;
      modulAjar: boolean;
      protaPromes: boolean;
      asesmen: boolean;
    };
    uploadedFileName?: string;
  }>({
    name: '',
    nip: '',
    subject: 'Bahasa Indonesia',
    classStr: 'X-1, X-2',
    totalTeachingHours: 24,
    checklist: { cp: true, atp: true, modulAjar: true, protaPromes: true, asesmen: true },
    uploadedFileName: '',
  });

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const filteredTeachers = teachersProgressList.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.nip.includes(search) ||
      item.subject.toLowerCase().includes(search.toLowerCase());
    const matchStat = statusFilter === 'Semua' || item.status === statusFilter;
    return matchSearch && matchStat;
  });

  const completeCount = teachersProgressList.filter((t) => t.completionPercentage === 100).length;
  const inProgressCount = teachersProgressList.filter((t) => t.completionPercentage > 0 && t.completionPercentage < 100).length;
  const notStartedCount = teachersProgressList.filter((t) => t.completionPercentage === 0).length;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      name: '',
      nip: '',
      subject: 'Bahasa Indonesia',
      classStr: 'X-1, X-2, XI-1',
      totalTeachingHours: 24,
      checklist: { cp: false, atp: false, modulAjar: false, protaPromes: false, asesmen: false },
      uploadedFileName: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TeacherProgress) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      nip: item.nip,
      subject: item.subject,
      classStr: item.classAssigned.join(', '),
      totalTeachingHours: item.totalTeachingHours,
      checklist: { ...item.checklist },
      uploadedFileName: item.uploadedFileName || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showFeedback('error', 'Nama guru wajib diisi!');
      return;
    }

    const classList = form.classStr
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const countTrue = Object.values(form.checklist).filter(Boolean).length;
    const percentage = countTrue * 20;
    const status: 'Lengkap' | 'Proses' | 'Belum' = percentage === 100 ? 'Lengkap' : percentage > 0 ? 'Proses' : 'Belum';
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    if (editingItem) {
      onUpdateTeacherProgress({
        ...editingItem,
        name: form.name,
        nip: form.nip,
        subject: form.subject,
        classAssigned: classList,
        totalTeachingHours: form.totalTeachingHours,
        checklist: form.checklist,
        completionPercentage: percentage,
        status,
        lastUpdated: today,
        uploadedFileName: form.uploadedFileName,
      });
      showFeedback('success', `Data administrasi ${form.name} berhasil diperbarui.`);
    } else {
      const newItem: TeacherProgress = {
        id: `tch-${Date.now()}`,
        name: form.name,
        nip: form.nip || '-',
        subject: form.subject,
        classAssigned: classList,
        totalTeachingHours: form.totalTeachingHours,
        checklist: form.checklist,
        completionPercentage: percentage,
        status,
        lastUpdated: today,
        uploadedFileName: form.uploadedFileName,
      };
      onAddTeacherProgress(newItem);
      showFeedback('success', `Guru baru ${form.name} berhasil ditambahkan ke monitoring.`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (window.confirm(`Hapus guru "${name}" dari monitoring administrasi?`)) {
      onDeleteTeacherProgress(id);
      showFeedback('success', `Data guru "${name}" telah dihapus.`);
    }
  };

  // Upload teacher's document portfolio
  const handleUploadTeacherFile = (e: React.ChangeEvent<HTMLInputElement>, teacherId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (teacherId) {
      const existing = teachersProgressList.find((t) => t.id === teacherId);
      if (existing) {
        onUpdateTeacherProgress({
          ...existing,
          uploadedFileName: file.name,
        });
        showFeedback('success', `Berkas portofolio ${file.name} berhasil diunggah untuk ${existing.name}.`);
      }
    } else {
      setForm((prev) => ({ ...prev, uploadedFileName: file.name }));
      showFeedback('success', `Berkas ${file.name} dipilih.`);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Stats */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider">
            <Monitor className="w-4 h-4" />
            <span>Audit & Monitoring Keterisian Administrasi</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Data Kelengkapan 54 Guru Mengajar
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Admin dapat mengedit keterisian 5 dokumen wajib (CP, ATP, Modul, Prota/Promes, Asesmen), menambah dewan guru, atau mengunggah berkas arsip.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Data Guru</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Guru</span>
          <span className="text-2xl font-black text-slate-900">{teachersProgressList.length} Guru</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">100% Lengkap</span>
          <span className="text-2xl font-black text-emerald-600">{completeCount} Guru</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Sedang Proses</span>
          <span className="text-2xl font-black text-amber-600">{inProgressCount} Guru</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-xs">
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">Belum Mengunggah</span>
          <span className="text-2xl font-black text-rose-600">{notStartedCount} Guru</span>
        </div>
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

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama guru, NIP, atau mata pelajaran..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Semua">Semua Status Keterisian</option>
            <option value="Lengkap">Lengkap (100%)</option>
            <option value="Proses">Sedang Proses (&lt; 100%)</option>
            <option value="Belum">Belum Ada Berkas (0%)</option>
          </select>
        </div>
      </div>

      {/* Table Data Guru */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Klik tombol centang di kolom dokumen untuk langsung mengubah status kelengkapan secara instan.</span>
          <span className="font-semibold text-slate-700">{filteredTeachers.length} Guru</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Nama Guru & NIP</th>
                <th className="py-3 px-3">Mata Pelajaran</th>
                <th className="py-3 px-2 text-center w-14">CP</th>
                <th className="py-3 px-2 text-center w-14">ATP</th>
                <th className="py-3 px-2 text-center w-14">Modul</th>
                <th className="py-3 px-2 text-center w-14">Prota</th>
                <th className="py-3 px-2 text-center w-14">Asesmen</th>
                <th className="py-3 px-3 text-center w-24">Progres</th>
                <th className="py-3 px-3">Berkas</th>
                <th className="py-3 px-3.5 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tidak ada data guru yang cocok.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">NIP: {t.nip}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{t.subject}</div>
                      <div className="text-[11px] text-slate-500">{t.totalTeachingHours} JP • {t.classAssigned.join(', ')}</div>
                    </td>

                    {/* 5 Checklist Checkboxes */}
                    {(['cp', 'atp', 'modulAjar', 'protaPromes', 'asesmen'] as const).map((key) => {
                      const isChecked = t.checklist[key];
                      return (
                        <td key={key} className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => onToggleTeacherChecklist(t.id, key)}
                            className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all ${
                              isChecked
                                ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                                : 'bg-slate-100 text-slate-300 hover:bg-slate-200 border border-slate-300'
                            }`}
                            title={`Ubah status ${key}`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-center">
                      <div className="font-extrabold text-xs text-slate-800">{t.completionPercentage}%</div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'Lengkap'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Proses'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {t.uploadedFileName ? (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold truncate max-w-[120px]" title={t.uploadedFileName}>
                          <Paperclip className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{t.uploadedFileName}</span>
                        </div>
                      ) : (
                        <label className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          <span>Upload File</span>
                          <input type="file" onChange={(e) => handleUploadTeacherFile(e, t.id)} className="hidden" />
                        </label>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Guru"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(t.id, t.name)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Guru"
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

      {/* Modal Add / Edit Teacher Progress */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">
                {editingItem ? 'Edit Data Administrasi Guru' : 'Tambah Guru ke Monitoring'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar Guru</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Dra. Hj. Siti Rahayu, M.Pd."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    value={form.nip}
                    onChange={(e) => setForm({ ...form, nip: e.target.value })}
                    placeholder="e.g. 197508122002122001"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Bahasa Indonesia"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Beban Mengajar (JP)</label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={form.totalTeachingHours}
                    onChange={(e) => setForm({ ...form, totalTeachingHours: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Binaan</label>
                  <input
                    type="text"
                    value={form.classStr}
                    onChange={(e) => setForm({ ...form, classStr: e.target.value })}
                    placeholder="e.g. X-1, X-2, XI-1"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 5 Checklist checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Checklist 5 Dokumen Wajib</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'cp', label: '1. Capaian Pembelajaran (CP)' },
                    { key: 'atp', label: '2. TP & ATP' },
                    { key: 'modulAjar', label: '3. Modul Ajar' },
                    { key: 'protaPromes', label: '4. Prota & Promes' },
                    { key: 'asesmen', label: '5. Kisi-kisi & Asesmen' },
                  ].map((chk) => (
                    <label
                      key={chk.key}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={form.checklist[chk.key as keyof TeacherProgress['checklist']]}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            checklist: {
                              ...form.checklist,
                              [chk.key]: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>{chk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* File upload */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Unggah Dokumen Arsip Administrasi</span>
                  <span className="text-[11px] text-slate-500">
                    {form.uploadedFileName ? `Terlampir: ${form.uploadedFileName}` : 'Belum ada berkas portofolio'}
                  </span>
                </div>
                <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
                  <span>Pilih Berkas</span>
                  <input type="file" onChange={(e) => handleUploadTeacherFile(e)} className="hidden" />
                </label>
              </div>

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
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
