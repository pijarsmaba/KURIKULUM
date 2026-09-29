import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  FileUp,
  Save,
  Eye,
  Sparkles,
  Paperclip
} from 'lucide-react';
import { KospDocumentInfo, KospChapter } from '../../../types';

interface AdminKospTabProps {
  kospData: KospDocumentInfo;
  onUpdateKospDocument: (info: KospDocumentInfo) => void;
  onAddKospChapter: (chapter: KospChapter) => void;
  onUpdateKospChapter: (chapter: KospChapter) => void;
  onDeleteKospChapter: (id: string) => void;
  onOpenDocument?: (title: string, category: string, content?: string) => void;
}

export const AdminKospTab: React.FC<AdminKospTabProps> = ({
  kospData,
  onUpdateKospDocument,
  onAddKospChapter,
  onUpdateKospChapter,
  onDeleteKospChapter,
  onOpenDocument,
}) => {
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // General KOSP Form
  const [title, setTitle] = useState(kospData.title);
  const [subtitle, setSubtitle] = useState(kospData.subtitle);
  const [skPengesahan, setSkPengesahan] = useState(kospData.skPengesahan);
  const [lastUpdated, setLastUpdated] = useState(kospData.lastUpdated);

  // Chapter Modal
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<KospChapter | null>(null);
  const [chapterForm, setChapterForm] = useState<{
    no: string;
    title: string;
    pages: string;
    desc: string;
    fileName?: string;
  }>({
    no: 'BAB VI',
    title: '',
    pages: 'Halaman 146 - 180',
    desc: '',
    fileName: '',
  });

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSaveGeneralInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: KospDocumentInfo = {
      ...kospData,
      title: title.trim(),
      subtitle: subtitle.trim(),
      skPengesahan: skPengesahan.trim(),
      lastUpdated: lastUpdated.trim(),
    };
    onUpdateKospDocument(updated);
    showFeedback('success', 'Informasi utama KOSP berhasil disimpan.');
  };

  // Upload Master KOSP PDF
  const handleUploadMasterKosp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    const updated: KospDocumentInfo = {
      ...kospData,
      fileName: file.name,
      fileSize: sizeStr,
      lastUpdated: today,
    };
    onUpdateKospDocument(updated);
    setLastUpdated(today);
    showFeedback('success', `Master Dokumen KOSP ${file.name} (${sizeStr}) berhasil diunggah.`);
    e.target.value = '';
  };

  // Chapter CRUD
  const handleOpenAddChapter = () => {
    setEditingChapter(null);
    setChapterForm({
      no: `LAMPIRAN ${kospData.chapters.length + 1}`,
      title: '',
      pages: 'Halaman 150 - 170',
      desc: '',
      fileName: '',
    });
    setIsChapterModalOpen(true);
  };

  const handleOpenEditChapter = (ch: KospChapter) => {
    setEditingChapter(ch);
    setChapterForm({
      no: ch.no,
      title: ch.title,
      pages: ch.pages,
      desc: ch.desc,
      fileName: ch.fileName || '',
    });
    setIsChapterModalOpen(true);
  };

  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterForm.title.trim()) {
      showFeedback('error', 'Judul Bab / Lampiran wajib diisi!');
      return;
    }

    if (editingChapter) {
      onUpdateKospChapter({
        ...editingChapter,
        ...chapterForm,
      });
      showFeedback('success', `Bab ${chapterForm.no} berhasil diperbarui.`);
    } else {
      onAddKospChapter({
        id: `kosp-ch-${Date.now()}`,
        ...chapterForm,
      });
      showFeedback('success', `Bab / Lampiran baru ${chapterForm.no} berhasil ditambahkan.`);
    }
    setIsChapterModalOpen(false);
  };

  const handleDeleteChapterClick = (id: string, title: string) => {
    if (window.confirm(`Hapus ${title}?`)) {
      onDeleteKospChapter(id);
      showFeedback('success', `${title} telah dihapus.`);
    }
  };

  const handleUploadChapterFile = (e: React.ChangeEvent<HTMLInputElement>, chapterId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (chapterId) {
      const existing = kospData.chapters.find((c) => c.id === chapterId);
      if (existing) {
        onUpdateKospChapter({
          ...existing,
          fileName: file.name,
        });
        showFeedback('success', `Berkas ${file.name} berhasil dilampirkan ke ${existing.no}.`);
      }
    } else {
      setChapterForm((prev) => ({ ...prev, fileName: file.name }));
      showFeedback('success', `Berkas ${file.name} dipilih.`);
    }
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Kurikulum Operasional Satuan Pendidikan</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Manajemen Dokumen KOSP Kurikulum Merdeka
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Admin dapat mengunggah master dokumen KOSP (PDF), mengedit Bab I - V, serta menambah lampiran resmi sekolah.
          </p>
        </div>

        <button
          onClick={handleOpenAddChapter}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Bab / Lampiran</span>
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

      {/* General KOSP Info & Master File Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Info Umum */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Identitas & SK Pengesahan KOSP</span>
            </h4>
          </div>

          <form onSubmit={handleSaveGeneralInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Judul Dokumen KOSP</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sub Judul / Tema Khas SMABA</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor SK Pengesahan</label>
                <input
                  type="text"
                  value={skPengesahan}
                  onChange={(e) => setSkPengesahan(e.target.value)}
                  placeholder="e.g. No. 421.3 / 219 / 2024"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Berlaku / Pengesahan</label>
                <input
                  type="text"
                  value={lastUpdated}
                  onChange={(e) => setLastUpdated(e.target.value)}
                  placeholder="e.g. 15 Juli 2024"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Identitas KOSP</span>
              </button>
            </div>
          </form>
        </div>

        {/* Master PDF Upload Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <Upload className="w-4 h-4" />
              <span>Master Berkas KOSP Lengkap</span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-base mt-1">Upload Master File KOSP (PDF)</h4>
            <p className="text-slate-500 text-xs mt-1">
              File master KOSP lengkap yang telah disahkan oleh Kepala Sekolah dan Cabang Dinas Wilayah III.
            </p>
          </div>

          <div className="p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 flex flex-col items-center justify-center text-center space-y-2">
            <FileUp className="w-8 h-8 text-blue-600" />
            <div className="text-xs font-bold text-slate-800">
              {kospData.fileName || 'Belum ada berkas PDF terunggah'}
            </div>
            {kospData.fileSize && (
              <span className="text-[11px] text-slate-500">Ukuran: {kospData.fileSize}</span>
            )}
            <label className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-xs">
              <span>Ganti / Upload PDF</span>
              <input type="file" accept=".pdf, .docx, .doc" onChange={handleUploadMasterKosp} className="hidden" />
            </label>
          </div>

          {onOpenDocument && (
            <button
              onClick={() =>
                onOpenDocument(
                  kospData.title,
                  'KOSP Master',
                  `DOKUMEN MASTER KOSP SMA NEGERI 1 BATANGAN\n${kospData.subtitle}\n\nSK Pengesahan: ${kospData.skPengesahan}\nTanggal Berlaku: ${kospData.lastUpdated}\nBerkas Master: ${kospData.fileName || 'KOSP_SMABA.pdf'}\n\nBAB-BAB TERDAFTAR:\n${kospData.chapters.map((c) => `- ${c.no}: ${c.title} (${c.pages})`).join('\n')}`
                )
              }
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Dokumen KOSP</span>
            </button>
          )}
        </div>
      </div>

      {/* Chapters Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="font-extrabold text-slate-800 text-xs sm:text-sm">
            Daftar Bab & Lampiran KOSP SMABA ({kospData.chapters.length} Bab)
          </div>
          <div className="text-xs text-slate-400">
            Perubahan langsung tersinkron ke halaman KOSP bagi guru dan tamu
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {kospData.chapters.map((ch) => (
            <div key={ch.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-extrabold">
                    {ch.no}
                  </span>
                  <span className="font-bold text-slate-900 text-sm sm:text-base">{ch.title}</span>
                  <span className="text-xs text-slate-400 font-mono">({ch.pages})</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ch.desc}</p>
                {ch.fileName && (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold pt-1">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Lampiran: {ch.fileName}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <label className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors" title="Unggah Berkas Bab">
                  <Upload className="w-4 h-4" />
                  <input type="file" onChange={(e) => handleUploadChapterFile(e, ch.id)} className="hidden" />
                </label>

                <button
                  onClick={() => handleOpenEditChapter(ch)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Bab"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteChapterClick(ch.id, `${ch.no}: ${ch.title}`)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Hapus Bab"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add / Edit Chapter */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">
                {editingChapter ? 'Edit Bab / Lampiran KOSP' : 'Tambah Bab / Lampiran KOSP Baru'}
              </h4>
              <button onClick={() => setIsChapterModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChapter} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Bab / Label</label>
                  <input
                    type="text"
                    value={chapterForm.no}
                    onChange={(e) => setChapterForm({ ...chapterForm, no: e.target.value })}
                    placeholder="e.g. BAB I atau LAMPIRAN 1"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cakupan Halaman</label>
                  <input
                    type="text"
                    value={chapterForm.pages}
                    onChange={(e) => setChapterForm({ ...chapterForm, pages: e.target.value })}
                    placeholder="e.g. Halaman 1 - 24"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Bab / Lampiran</label>
                <input
                  type="text"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  placeholder="e.g. Karakteristik Satuan Pendidikan"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi & Ruang Lingkup</label>
                <textarea
                  rows={3}
                  value={chapterForm.desc}
                  onChange={(e) => setChapterForm({ ...chapterForm, desc: e.target.value })}
                  placeholder="Rincian bahasan bab KOSP..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Upload Chapter File */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Lampiran Berkas Bab (PDF / Word)</span>
                  <span className="text-[11px] text-slate-500">
                    {chapterForm.fileName ? `Terlampir: ${chapterForm.fileName}` : 'Belum ada berkas terlampir'}
                  </span>
                </div>
                <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
                  <span>Pilih Berkas</span>
                  <input type="file" onChange={(e) => handleUploadChapterFile(e)} className="hidden" />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChapterModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md"
                >
                  {editingChapter ? 'Simpan Perubahan' : 'Tambah Bab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
