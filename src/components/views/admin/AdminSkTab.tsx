import React, { useState } from 'react';
import {
  Scroll,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Users,
  Search,
  FileUp,
  FileCheck
} from 'lucide-react';
import { SchoolSK } from '../../../types';

interface AdminSkTabProps {
  skList: SchoolSK[];
  onAddSk: (sk: SchoolSK) => void;
  onUpdateSk: (sk: SchoolSK) => void;
  onDeleteSk: (id: string) => void;
}

export const AdminSkTab: React.FC<AdminSkTabProps> = ({
  skList,
  onAddSk,
  onUpdateSk,
  onDeleteSk,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSk, setEditingSk] = useState<SchoolSK | null>(null);
  const [form, setForm] = useState<{
    code: string;
    number: string;
    title: string;
    category: 'TPMPS' | 'TPK' | 'KP' | 'SK KBM';
    date: string;
    signedBy: string;
    fileSize: string;
    summary: string;
    membersStr: string; // "Role: Nama (NIP)\nRole: Nama (NIP)"
    fileName?: string;
  }>({
    code: 'SK-KBM-2025',
    number: '421.3 / 225 / 2025',
    title: '',
    category: 'SK KBM',
    date: '15 Juli 2024',
    signedBy: 'H. Sudarmanto, M.Pd.',
    fileSize: '2.1 MB',
    summary: '',
    membersStr: 'Ketua: Supriyanto, S.Pd., M.Si. (197804152006041012)\nSekretaris: Dra. Hj. Siti Rahayu, M.Pd. (197508122002122001)',
  });

  const categories = ['Semua', 'TPMPS', 'TPK', 'KP', 'SK KBM'];

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const filteredSk = skList.filter((sk) => {
    const matchSearch =
      sk.title.toLowerCase().includes(search.toLowerCase()) ||
      sk.number.toLowerCase().includes(search.toLowerCase()) ||
      sk.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'Semua' || sk.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleOpenAdd = () => {
    setEditingSk(null);
    setForm({
      code: `SK-${Date.now().toString().slice(-4)}`,
      number: `421.3 / ${Math.floor(Math.random() * 800 + 100)} / 2024`,
      title: '',
      category: 'SK KBM',
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
      signedBy: 'H. Sudarmanto, M.Pd.',
      fileSize: '1.5 MB',
      summary: '',
      membersStr: 'Penanggung Jawab: H. Sudarmanto, M.Pd. (196803201995121002)\nKetua: Supriyanto, S.Pd., M.Si. (197804152006041012)',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sk: SchoolSK) => {
    setEditingSk(sk);
    const membersText = sk.members.map((m) => `${m.role}: ${m.name} (${m.nip})`).join('\n');
    setForm({
      code: sk.code,
      number: sk.number,
      title: sk.title,
      category: sk.category,
      date: sk.date,
      signedBy: sk.signedBy,
      fileSize: sk.fileSize,
      summary: sk.summary,
      membersStr: membersText,
      fileName: sk.fileName,
    });
    setIsModalOpen(true);
  };

  const parseMembers = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    return lines.map((line) => {
      // Example: "Ketua: Supriyanto, S.Pd. (197804152006041012)"
      const parts = line.split(':');
      let role = 'Anggota';
      let rest = line;
      if (parts.length > 1) {
        role = parts[0].trim();
        rest = parts.slice(1).join(':').trim();
      }

      let name = rest;
      let nip = '-';
      const nipMatch = rest.match(/\((.*?)\)/);
      if (nipMatch) {
        nip = nipMatch[1].trim();
        name = rest.replace(/\(.*?\)/, '').trim();
      }

      return { role, name, nip };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.number.trim()) {
      showFeedback('error', 'Nomor SK dan judul SK wajib diisi!');
      return;
    }

    const parsedMemberList = parseMembers(form.membersStr);

    if (editingSk) {
      onUpdateSk({
        ...editingSk,
        code: form.code,
        number: form.number,
        title: form.title,
        category: form.category,
        date: form.date,
        signedBy: form.signedBy,
        fileSize: form.fileSize,
        summary: form.summary,
        totalMembers: parsedMemberList.length,
        members: parsedMemberList,
        fileName: form.fileName || editingSk.fileName,
      });
      showFeedback('success', `Surat Keputusan "${form.title}" berhasil diperbarui.`);
    } else {
      onAddSk({
        id: `sk-${Date.now()}`,
        code: form.code,
        number: form.number,
        title: form.title,
        category: form.category,
        date: form.date,
        signedBy: form.signedBy,
        fileSize: form.fileSize,
        summary: form.summary,
        totalMembers: parsedMemberList.length,
        members: parsedMemberList,
        fileName: form.fileName || `${form.code}.pdf`,
      });
      showFeedback('success', `Surat Keputusan baru "${form.title}" berhasil ditambahkan.`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string, title: string) => {
    if (window.confirm(`Hapus Surat Keputusan "${title}"?`)) {
      onDeleteSk(id);
      showFeedback('success', `SK "${title}" telah dihapus.`);
    }
  };

  // Upload SK File inside modal or quick upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetSkId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    if (targetSkId) {
      const existing = skList.find((s) => s.id === targetSkId);
      if (existing) {
        onUpdateSk({
          ...existing,
          fileName: file.name,
          fileSize: sizeStr,
        });
        showFeedback('success', `Berkas ${file.name} (${sizeStr}) berhasil diunggah untuk ${existing.title}.`);
      }
    } else {
      setForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: sizeStr,
      }));
      showFeedback('success', `Berkas ${file.name} dipilih (${sizeStr}).`);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-700 font-semibold text-xs uppercase tracking-wider">
            <Scroll className="w-4 h-4" />
            <span>Legalitas & Surat Keputusan Sekolah</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Manajemen SK Kurikulum (TPMPS, TPK, KP, SK KBM)
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Admin dapat mengedit nomor SK, mengunggah draf/file sah PDF, mengubah susunan tim, dan menghapus dokumen SK.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah SK Baru</span>
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

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul SK, nomor, atau kode..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* SK List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSk.map((sk) => (
          <div
            key={sk.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[10px] font-black uppercase tracking-wider">
                  {sk.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{sk.number}</span>
              </div>

              <h4 className="font-extrabold text-slate-900 text-base leading-snug">{sk.title}</h4>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{sk.summary}</p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Ditetapkan: <strong>{sk.date}</strong></span>
                  <span>Penandatangan: <strong>{sk.signedBy}</strong></span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                  <span>Jumlah Personil Tim: <strong>{sk.totalMembers} orang</strong></span>
                  <span className="text-emerald-700 font-bold">
                    Berkas: {sk.fileName || `${sk.code}.pdf`} ({sk.fileSize})
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Berkas SK</span>
                <input
                  type="file"
                  accept=".pdf, .docx, .doc"
                  onChange={(e) => handleFileUpload(e, sk.id)}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(sk)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit SK"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(sk.id, sk.title)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Hapus SK"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit SK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">
                {editingSk ? 'Edit Dokumen SK Kurikulum' : 'Tambah SK Kurikulum Baru'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori SK</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SK KBM">SK KBM & Pembagian Tugas</option>
                    <option value="TPMPS">SK Tim Penjaminan Mutu (TPMPS)</option>
                    <option value="TPK">SK Tim Pengembang Kurikulum (TPK)</option>
                    <option value="KP">SK Komite Pembelajaran (KP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Dokumen</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. SK-KBM-2024"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Surat Keputusan Resmi</label>
                <input
                  type="text"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  placeholder="e.g. 421.3 / 218 / 2024"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Lengkap SK</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. SK Pembagian Tugas KBM Guru dan Tenaga Kependidikan"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Ditetapkan</label>
                  <input
                    type="text"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    placeholder="e.g. 15 Juli 2024"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pejabat Pengesah</label>
                  <input
                    type="text"
                    value={form.signedBy}
                    onChange={(e) => setForm({ ...form, signedBy: e.target.value })}
                    placeholder="e.g. H. Sudarmanto, M.Pd."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ringkasan / Konsideran SK</label>
                <textarea
                  rows={2}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Penjelasan pokok isi keputusan..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Susunan Anggota Tim / Lampiran Penugasan
                  <span className="text-slate-400 font-normal ml-1">(Format: Jabatan: Nama (NIP), 1 baris per personil)</span>
                </label>
                <textarea
                  rows={4}
                  value={form.membersStr}
                  onChange={(e) => setForm({ ...form, membersStr: e.target.value })}
                  placeholder="Penanggung Jawab: H. Sudarmanto, M.Pd. (196803201995121002)&#10;Ketua: Supriyanto, S.Pd., M.Si. (197804152006041012)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Upload file inside modal */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Berkas Dokumen SK (PDF / Word)</span>
                  <span className="text-[11px] text-slate-500">
                    {form.fileName ? `Terlampir: ${form.fileName} (${form.fileSize})` : 'Belum ada berkas terlampir'}
                  </span>
                </div>
                <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
                  <span>Pilih Berkas</span>
                  <input type="file" accept=".pdf, .docx, .doc" onChange={(e) => handleFileUpload(e)} className="hidden" />
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
                  {editingSk ? 'Simpan Perubahan' : 'Tambah SK'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
