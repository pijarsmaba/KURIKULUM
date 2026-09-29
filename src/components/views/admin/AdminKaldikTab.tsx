import React, { useState } from 'react';
import {
  Calendar,
  Clock,
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
  Search
} from 'lucide-react';
import { KaldikEvent, RmeRow } from '../../../types';

interface AdminKaldikTabProps {
  kaldikEventsList: KaldikEvent[];
  onAddKaldikEvent: (event: KaldikEvent) => void;
  onUpdateKaldikEvent: (event: KaldikEvent) => void;
  onDeleteKaldikEvent: (id: string) => void;
  rmeList: RmeRow[];
  onAddRmeRow: (row: RmeRow) => void;
  onUpdateRmeRow: (row: RmeRow) => void;
  onDeleteRmeRow: (id: string) => void;
}

export const AdminKaldikTab: React.FC<AdminKaldikTabProps> = ({
  kaldikEventsList,
  onAddKaldikEvent,
  onUpdateKaldikEvent,
  onDeleteKaldikEvent,
  rmeList,
  onAddRmeRow,
  onUpdateRmeRow,
  onDeleteRmeRow,
}) => {
  const [subTab, setSubTab] = useState<'events' | 'rme' | 'upload'>('events');
  const [selectedSemester, setSelectedSemester] = useState<'Semua' | 'Genap' | 'Ganjil'>('Semua');
  const [searchEvent, setSearchEvent] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Uploaded Kaldik document state
  const [uploadedKaldikFile, setUploadedKaldikFile] = useState<{ name: string; size: string; date: string } | null>(() => {
    const saved = localStorage.getItem('smaba_kaldik_uploaded_doc');
    return saved ? JSON.parse(saved) : { name: 'Kaldik_SMAN_1_Batangan_2024_2025.pdf', size: '2.4 MB', date: '06 Januari 2025' };
  });

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<KaldikEvent | null>(null);
  const [eventForm, setEventForm] = useState<{
    date: string;
    event: string;
    type: 'kbm' | 'libur' | 'asesmen' | 'kegiatan' | 'minggu';
    semester: 'Ganjil' | 'Genap' | 'Semua';
  }>({
    date: '',
    event: '',
    type: 'kegiatan',
    semester: 'Genap',
  });

  // RME modal state
  const [isRmeModalOpen, setIsRmeModalOpen] = useState(false);
  const [editingRme, setEditingRme] = useState<RmeRow | null>(null);
  const [rmeForm, setRmeForm] = useState<{
    bulan: string;
    jmlMinggu: number;
    tdkEfektif: number;
    efektif: number;
    ket: string;
    semester: 'Ganjil' | 'Genap';
  }>({
    bulan: '',
    jmlMinggu: 4,
    tdkEfektif: 0,
    efektif: 4,
    ket: '',
    semester: 'Genap',
  });

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Filter events
  const filteredEvents = kaldikEventsList.filter((ev) => {
    const matchSearch = ev.event.toLowerCase().includes(searchEvent.toLowerCase()) || ev.date.toLowerCase().includes(searchEvent.toLowerCase());
    const matchSem = selectedSemester === 'Semua' || ev.semester === selectedSemester || ev.semester === 'Semua';
    return matchSearch && matchSem;
  });

  // Filter RME
  const filteredRme = rmeList.filter((r) => selectedSemester === 'Semua' || r.semester === selectedSemester);

  // Open Event Modal
  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      date: '',
      event: '',
      type: 'kegiatan',
      semester: selectedSemester !== 'Semua' ? selectedSemester : 'Genap',
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (ev: KaldikEvent) => {
    setEditingEvent(ev);
    setEventForm({
      date: ev.date,
      event: ev.event,
      type: ev.type,
      semester: ev.semester,
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.date.trim() || !eventForm.event.trim()) {
      showFeedback('error', 'Tanggal dan nama agenda wajib diisi!');
      return;
    }

    if (editingEvent) {
      onUpdateKaldikEvent({
        ...editingEvent,
        ...eventForm,
      });
      showFeedback('success', 'Agenda kalender pendidikan berhasil diperbarui.');
    } else {
      onAddKaldikEvent({
        id: `kld-${Date.now()}`,
        ...eventForm,
      });
      showFeedback('success', 'Agenda kalender pendidikan baru berhasil ditambahkan.');
    }
    setIsEventModalOpen(false);
  };

  const handleDeleteEventClick = (id: string, name: string) => {
    if (window.confirm(`Hapus agenda: "${name}"?`)) {
      onDeleteKaldikEvent(id);
      showFeedback('success', 'Agenda telah dihapus.');
    }
  };

  // Open RME Modal
  const handleOpenAddRme = () => {
    setEditingRme(null);
    setRmeForm({
      bulan: '',
      jmlMinggu: 4,
      tdkEfektif: 0,
      efektif: 4,
      ket: '',
      semester: selectedSemester === 'Ganjil' ? 'Ganjil' : 'Genap',
    });
    setIsRmeModalOpen(true);
  };

  const handleOpenEditRme = (row: RmeRow) => {
    setEditingRme(row);
    setRmeForm({
      bulan: row.bulan,
      jmlMinggu: row.jmlMinggu,
      tdkEfektif: row.tdkEfektif,
      efektif: row.efektif,
      ket: row.ket,
      semester: row.semester,
    });
    setIsRmeModalOpen(true);
  };

  const handleSaveRme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rmeForm.bulan.trim()) {
      showFeedback('error', 'Nama bulan wajib diisi!');
      return;
    }

    if (editingRme) {
      onUpdateRmeRow({
        ...editingRme,
        ...rmeForm,
        efektif: Math.max(0, rmeForm.jmlMinggu - rmeForm.tdkEfektif),
      });
      showFeedback('success', `RME bulan ${rmeForm.bulan} berhasil diperbarui.`);
    } else {
      const nextNo = rmeList.filter((r) => r.semester === rmeForm.semester).length + 1;
      onAddRmeRow({
        id: `rme-${Date.now()}`,
        no: nextNo,
        ...rmeForm,
        efektif: Math.max(0, rmeForm.jmlMinggu - rmeForm.tdkEfektif),
      });
      showFeedback('success', `RME bulan ${rmeForm.bulan} berhasil ditambahkan.`);
    }
    setIsRmeModalOpen(false);
  };

  const handleDeleteRmeClick = (id: string, bulan: string) => {
    if (window.confirm(`Hapus baris RME bulan ${bulan}?`)) {
      onDeleteRmeRow(id);
      showFeedback('success', `Baris RME bulan ${bulan} telah dihapus.`);
    }
  };

  // Upload Kaldik File
  const handleUploadKaldikFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const info = { name: file.name, size: sizeStr, date: today };

    setUploadedKaldikFile(info);
    localStorage.setItem('smaba_kaldik_uploaded_doc', JSON.stringify(info));
    showFeedback('success', `Berkas master Kaldik ${file.name} (${sizeStr}) berhasil diunggah.`);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header and Sub Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Kelola Kaldik & RME</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Manajemen Kalender Pendidikan & Rencana Minggu Efektif
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Kelola agenda kegiatan sekolah, jadwal asesmen, libur semester, dan rincian alokasi pekan efektif KBM.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl self-start sm:self-center gap-1 border border-slate-200">
          <button
            onClick={() => setSubTab('events')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'events' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agenda Kaldik ({kaldikEventsList.length})
          </button>
          <button
            onClick={() => setSubTab('rme')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'rme' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tabel RME ({rmeList.length})
          </button>
          <button
            onClick={() => setSubTab('upload')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'upload' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload Berkas PDF
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

      {/* SUB TAB 1: AGENDA KALDIK */}
      {subTab === 'events' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchEvent}
                  onChange={(e) => setSearchEvent(e.target.value)}
                  placeholder="Cari agenda atau tanggal..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua">Semua Semester</option>
                <option value="Genap">Semester Genap</option>
                <option value="Ganjil">Semester Ganjil</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddEvent}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Agenda Kaldik</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-44">Rentang Tanggal</th>
                    <th className="py-3 px-4">Uraian Kegiatan / Agenda Sekolah</th>
                    <th className="py-3 px-3 text-center w-28">Kategori</th>
                    <th className="py-3 px-3 text-center w-24">Semester</th>
                    <th className="py-3 px-4 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Tidak ada agenda kaldik yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">{ev.date}</td>
                        <td className="py-3 px-4 text-slate-800 font-medium">{ev.event}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              ev.type === 'kbm'
                                ? 'bg-blue-100 text-blue-800'
                                : ev.type === 'libur'
                                ? 'bg-rose-100 text-rose-800'
                                : ev.type === 'asesmen'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {ev.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                            {ev.semester}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditEvent(ev)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Agenda"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEventClick(ev.id, ev.event)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Agenda"
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
        </div>
      )}

      {/* SUB TAB 2: TABEL RME */}
      {subTab === 'rme' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="text-xs sm:text-sm text-slate-600">
              Rencana Minggu Efektif (RME) menentukan jumlah jam belajar tatap muka per semester yang menjadi acuan Prota & Promes guru.
            </div>
            <button
              onClick={handleOpenAddRme}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Baris RME</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">No</th>
                    <th className="py-3 px-4">Bulan</th>
                    <th className="py-3 px-3 text-center w-28">Jml Minggu</th>
                    <th className="py-3 px-3 text-center w-28">Tdk Efektif</th>
                    <th className="py-3 px-3 text-center w-28">Minggu Efektif</th>
                    <th className="py-3 px-4">Keterangan Kegiatan</th>
                    <th className="py-3 px-3 text-center w-24">Semester</th>
                    <th className="py-3 px-4 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRme.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Belum ada data RME.
                      </td>
                    </tr>
                  ) : (
                    filteredRme.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{row.bulan}</td>
                        <td className="py-3 px-3 text-center font-semibold text-slate-700">{row.jmlMinggu}</td>
                        <td className="py-3 px-3 text-center font-semibold text-rose-600">{row.tdkEfektif}</td>
                        <td className="py-3 px-3 text-center font-extrabold text-emerald-700 bg-emerald-50/50">
                          {row.efektif}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{row.ket}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                            {row.semester}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditRme(row)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit RME"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRmeClick(row.id, row.bulan)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus RME"
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
        </div>
      )}

      {/* SUB TAB 3: UPLOAD MASTER KALDIK DOKUMEN */}
      {subTab === 'upload' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">Unggah Master Dokumen Kalender Pendidikan</h4>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Unggah file PDF atau spreadsheet resmi Kaldik yang telah ditandatangani Kepala Sekolah dan Cabdin Wilayah III.
            </p>
          </div>

          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-3 transition-colors">
            <FileUp className="w-10 h-10 text-blue-600" />
            <div>
              <span className="text-sm font-bold text-slate-800 block">Pilih Berkas Kaldik (PDF / Excel)</span>
              <span className="text-xs text-slate-400">Ukuran maksimal disarankan 10MB</span>
            </div>
            <label className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer shadow-md transition-all">
              <span>Pilih File Dari Komputer</span>
              <input
                type="file"
                accept=".pdf, .xlsx, .xls"
                onChange={handleUploadKaldikFile}
                className="hidden"
              />
            </label>
          </div>

          {uploadedKaldikFile && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                <div>
                  <div className="text-sm font-extrabold text-emerald-950">{uploadedKaldikFile.name}</div>
                  <div className="text-xs text-emerald-700">
                    Ukuran: {uploadedKaldikFile.size} • Diperbarui: {uploadedKaldikFile.date}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full">
                Dokumen Aktif
              </span>
            </div>
          )}
        </div>
      )}

      {/* Modal Add / Edit Event */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">
                {editingEvent ? 'Edit Agenda Kaldik' : 'Tambah Agenda Kaldik Baru'}
              </h4>
              <button onClick={() => setIsEventModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rentang Tanggal</label>
                <input
                  type="text"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  placeholder="e.g. 03 - 08 Maret 2025"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Uraian Kegiatan / Agenda</label>
                <input
                  type="text"
                  value={eventForm.event}
                  onChange={(e) => setEventForm({ ...eventForm, event: e.target.value })}
                  placeholder="e.g. Asesmen Sumatif Tengah Semester (ASTS) Genap"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Kegiatan</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="kegiatan">Kegiatan Sekolah</option>
                    <option value="kbm">KBM Awal/Efektif</option>
                    <option value="asesmen">Asesmen / Ujian</option>
                    <option value="libur">Hari Libur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={eventForm.semester}
                    onChange={(e) => setEventForm({ ...eventForm, semester: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Genap">Semester Genap</option>
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Semua">Semua Semester</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit RME */}
      {isRmeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">
                {editingRme ? 'Edit Baris RME' : 'Tambah Baris RME Baru'}
              </h4>
              <button onClick={() => setIsRmeModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRme} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bulan & Tahun</label>
                  <input
                    type="text"
                    value={rmeForm.bulan}
                    onChange={(e) => setRmeForm({ ...rmeForm, bulan: e.target.value })}
                    placeholder="e.g. Juli 2025"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={rmeForm.semester}
                    onChange={(e) => setRmeForm({ ...rmeForm, semester: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Genap">Semester Genap</option>
                    <option value="Ganjil">Semester Ganjil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jml Minggu</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={rmeForm.jmlMinggu}
                    onChange={(e) => setRmeForm({ ...rmeForm, jmlMinggu: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tdk Efektif</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={rmeForm.tdkEfektif}
                    onChange={(e) => setRmeForm({ ...rmeForm, tdkEfektif: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Efektif (Auto)</label>
                  <input
                    type="number"
                    readOnly
                    value={Math.max(0, rmeForm.jmlMinggu - rmeForm.tdkEfektif)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-slate-100 text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Kegiatan</label>
                <input
                  type="text"
                  value={rmeForm.ket}
                  onChange={(e) => setRmeForm({ ...rmeForm, ket: e.target.value })}
                  placeholder="e.g. Awal KBM, Try Out Kelas XII, Libur Idul Fitri"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRmeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md"
                >
                  Simpan RME
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
