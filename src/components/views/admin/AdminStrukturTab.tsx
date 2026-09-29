import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  FileUp,
  Search,
  BookOpen
} from 'lucide-react';
import { MapelStruktur } from '../../../types';

interface AdminStrukturTabProps {
  strukturList: MapelStruktur[];
  onAddMapelStruktur: (item: MapelStruktur) => void;
  onUpdateMapelStruktur: (item: MapelStruktur) => void;
  onDeleteMapelStruktur: (id: string) => void;
}

export const AdminStrukturTab: React.FC<AdminStrukturTabProps> = ({
  strukturList,
  onAddMapelStruktur,
  onUpdateMapelStruktur,
  onDeleteMapelStruktur,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<'X' | 'XI' | 'XII'>('X');
  const [search, setSearch] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Uploaded document state
  const [uploadedStrukturFile, setUploadedStrukturFile] = useState<{ name: string; size: string; date: string } | null>(() => {
    const saved = localStorage.getItem('smaba_struktur_uploaded_doc');
    return saved ? JSON.parse(saved) : { name: 'Struktur_Kurikulum_Merdeka_SMABA_2024_2025.pdf', size: '1.9 MB', date: '10 Juli 2024' };
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MapelStruktur | null>(null);
  const [form, setForm] = useState<{
    fase: 'X' | 'XI' | 'XII';
    mapel: string;
    intra: number;
    p5: number;
    mingguan: number;
    kategori: string;
  }>({
    fase: 'X',
    mapel: '',
    intra: 72,
    p5: 36,
    mingguan: 3,
    kategori: 'Umum',
  });

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const filteredItems = strukturList.filter((item) => {
    const matchFase = item.fase === selectedPhase;
    const matchSearch = item.mapel.toLowerCase().includes(search.toLowerCase());
    return matchFase && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      fase: selectedPhase,
      mapel: '',
      intra: 72,
      p5: 36,
      mingguan: 3,
      kategori: 'Umum',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MapelStruktur) => {
    setEditingItem(item);
    setForm({
      fase: item.fase,
      mapel: item.mapel,
      intra: item.intra,
      p5: item.p5,
      mingguan: item.mingguan,
      kategori: item.kategori || 'Umum',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mapel.trim()) {
      showFeedback('error', 'Nama mata pelajaran wajib diisi!');
      return;
    }

    const total = form.intra + form.p5;

    if (editingItem) {
      onUpdateMapelStruktur({
        ...editingItem,
        ...form,
        total,
      });
      showFeedback('success', `Mata pelajaran ${form.mapel} Fase ${form.fase} berhasil diperbarui.`);
    } else {
      const nextNo = strukturList.filter((s) => s.fase === form.fase).length + 1;
      onAddMapelStruktur({
        id: `str-${form.fase.toLowerCase()}-${Date.now()}`,
        no: nextNo,
        ...form,
        total,
      });
      showFeedback('success', `Mata pelajaran baru ${form.mapel} Fase ${form.fase} berhasil ditambahkan.`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id: string, mapel: string, fase: string) => {
    if (window.confirm(`Hapus mata pelajaran ${mapel} dari Fase ${fase}?`)) {
      onDeleteMapelStruktur(id);
      showFeedback('success', `Mata pelajaran ${mapel} telah dihapus.`);
    }
  };

  // Upload file lampiran struktur
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const info = { name: file.name, size: sizeStr, date: today };

    setUploadedStrukturFile(info);
    localStorage.setItem('smaba_struktur_uploaded_doc', JSON.stringify(info));
    showFeedback('success', `Berkas SK Struktur Kurikulum ${file.name} berhasil diunggah.`);
    e.target.value = '';
  };

  const totalIntra = filteredItems.reduce((acc, curr) => acc + curr.intra, 0);
  const totalP5 = filteredItems.reduce((acc, curr) => acc + curr.p5, 0);
  const totalAll = totalIntra + totalP5;
  const totalMingguan = filteredItems.reduce((acc, curr) => acc + curr.mingguan, 0);

  return (
    <div className="space-y-6">
      {/* Header and Phase Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Alokasi Jam Belajar & Struktur Kurikulum</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Manajemen Struktur Kurikulum Merdeka
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Admin dapat mengedit alokasi jam intrakurikuler dan kokurikuler P5 untuk Kelas X (Fase E), Kelas XI & XII (Fase F).
          </p>
        </div>

        {/* Phase Pills */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl self-start sm:self-center gap-1 border border-slate-200">
          <button
            onClick={() => setSelectedPhase('X')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedPhase === 'X' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fase E (Kelas X)
          </button>
          <button
            onClick={() => setSelectedPhase('XI')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedPhase === 'XI' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fase F (Kelas XI)
          </button>
          <button
            onClick={() => setSelectedPhase('XII')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              selectedPhase === 'XII' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fase F (Kelas XII)
          </button>
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

      {/* Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Cari mata pelajaran Fase ${selectedPhase}...`}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Unggah Lampiran SK</span>
            <input type="file" accept=".pdf, .docx, .xlsx" onChange={handleUploadFile} className="hidden" />
          </label>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mata Pelajaran</span>
          </button>
        </div>
      </div>

      {/* Uploaded File Banner */}
      {uploadedStrukturFile && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-blue-950">Berkas Terlampir: {uploadedStrukturFile.name}</span>
            <span className="text-blue-700">({uploadedStrukturFile.size})</span>
          </div>
          <span className="text-xs text-blue-600 font-medium">Diunggah: {uploadedStrukturFile.date}</span>
        </div>
      )}

      {/* Table Struktur Kurikulum */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-3 text-center w-28">Intrakurikuler (JP/Thn)</th>
                <th className="py-3 px-3 text-center w-28">Kokurikuler P5 (JP/Thn)</th>
                <th className="py-3 px-3 text-center w-24">Total JP / Thn</th>
                <th className="py-3 px-3 text-center w-28">Alokasi / Pekan</th>
                <th className="py-3 px-3 text-center w-24">Kategori</th>
                <th className="py-3 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada mata pelajaran di Fase {selectedPhase}.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.mapel}</td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-700">{item.intra} JP</td>
                    <td className="py-3 px-3 text-center font-semibold text-blue-600">{item.p5} JP</td>
                    <td className="py-3 px-3 text-center font-extrabold text-slate-900 bg-slate-50/60">
                      {item.total} JP
                    </td>
                    <td className="py-3 px-3 text-center font-black text-emerald-700 bg-emerald-50/40">
                      {item.mingguan} JP
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {item.kategori || 'Umum'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Mapel"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id, item.mapel, item.fase)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Mapel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredItems.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-black text-slate-900 text-xs sm:text-sm">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-right uppercase tracking-wider">
                    Total Beban Belajar Fase {selectedPhase}:
                  </td>
                  <td className="py-3 px-3 text-center text-slate-800">{totalIntra} JP</td>
                  <td className="py-3 px-3 text-center text-blue-700">{totalP5} JP</td>
                  <td className="py-3 px-3 text-center text-slate-900 bg-slate-200/50">{totalAll} JP</td>
                  <td className="py-3 px-3 text-center text-emerald-800 bg-emerald-100/60">
                    {totalMingguan} JP / Minggu
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Mapel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">
                {editingItem ? `Edit Mapel Fase ${form.fase}` : `Tambah Mapel Fase ${form.fase}`}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fase / Jenjang</label>
                  <select
                    value={form.fase}
                    onChange={(e) => setForm({ ...form, fase: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="X">Kelas X (Fase E)</option>
                    <option value="XI">Kelas XI (Fase F)</option>
                    <option value="XII">Kelas XII (Fase F)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Umum">Umum (Wajib)</option>
                    <option value="Pilihan">Mata Pelajaran Pilihan</option>
                    <option value="Mulok">Muatan Lokal</option>
                    <option value="BK">Bimbingan Konseling</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  value={form.mapel}
                  onChange={(e) => setForm({ ...form, mapel: e.target.value })}
                  placeholder="e.g. Bahasa Indonesia / Fisika (IPA)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Intrakurikuler (JP/Thn)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.intra}
                    onChange={(e) => setForm({ ...form, intra: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Projek P5 (JP/Thn)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.p5}
                    onChange={(e) => setForm({ ...form, p5: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alokasi Mingguan (JP)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={form.mingguan}
                    onChange={(e) => setForm({ ...form, mingguan: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800">Total Tahunan (Auto): </span>
                <span className="font-extrabold text-blue-700">{form.intra + form.p5} JP / Tahun</span>
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
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
