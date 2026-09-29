import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Shield,
  FileSpreadsheet,
  X,
  FileUp,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ScheduleItem, PiketItem } from '../../../types';

interface AdminJadwalTabProps {
  schedulesList: ScheduleItem[];
  onAddSchedule: (item: ScheduleItem) => void;
  onUpdateSchedule: (item: ScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
  onBulkAddSchedules?: (items: ScheduleItem[], replaceMode?: boolean) => void;
  piketList: PiketItem[];
  onAddPiket: (item: PiketItem) => void;
  onUpdatePiket: (item: PiketItem) => void;
  onDeletePiket: (id: string) => void;
}

export const AdminJadwalTab: React.FC<AdminJadwalTabProps> = ({
  schedulesList,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onBulkAddSchedules,
  piketList,
  onAddPiket,
  onUpdatePiket,
  onDeletePiket,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'kbm' | 'piket'>('kbm');
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [selectedDay, setSelectedDay] = useState<string>('Semua');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states for Jadwal KBM
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    hari: 'Senin',
    kelas: 'X-1',
    jam: '1 - 2',
    waktu: '07.30 - 09.00',
    mapel: '',
    guru: '',
    ruang: 'R. 101',
  });

  // Modal states for Piket
  const [isPiketModalOpen, setIsPiketModalOpen] = useState(false);
  const [editingPiket, setEditingPiket] = useState<PiketItem | null>(null);
  const [piketForm, setPiketForm] = useState({
    hari: 'Senin',
    koordinator: '',
    anggotaStr: '',
    tugasUtama: '',
  });

  const classOptions = Array.from(new Set(schedulesList.map((s) => s.kelas))).filter(Boolean);
  const allClasses = classOptions.length > 0 ? classOptions : ['X-1', 'X-2', 'X-3', 'X-4', 'XI-1', 'XI-2', 'XI-3', 'XII-1', 'XII-2', 'XII-3'];
  const dayOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Filter schedules
  const filteredSchedules = schedulesList.filter((item) => {
    const matchSearch =
      item.mapel.toLowerCase().includes(search.toLowerCase()) ||
      item.guru.toLowerCase().includes(search.toLowerCase()) ||
      item.ruang.toLowerCase().includes(search.toLowerCase());
    const matchClass = selectedClass === 'Semua' || item.kelas === selectedClass;
    const matchDay = selectedDay === 'Semua' || item.hari === selectedDay;
    return matchSearch && matchClass && matchDay;
  });

  // Open Add Schedule Modal
  const handleOpenAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleForm({
      hari: 'Senin',
      kelas: selectedClass !== 'Semua' ? selectedClass : 'X-1',
      jam: '1 - 2',
      waktu: '07.30 - 09.00',
      mapel: '',
      guru: '',
      ruang: 'R. 101',
    });
    setIsScheduleModalOpen(true);
  };

  // Open Edit Schedule Modal
  const handleOpenEditSchedule = (item: ScheduleItem) => {
    setEditingSchedule(item);
    setScheduleForm({
      hari: item.hari,
      kelas: item.kelas,
      jam: item.jam,
      waktu: item.waktu,
      mapel: item.mapel,
      guru: item.guru,
      ruang: item.ruang,
    });
    setIsScheduleModalOpen(true);
  };

  // Save Schedule (Add or Edit)
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.mapel.trim() || !scheduleForm.guru.trim()) {
      showFeedback('error', 'Mata pelajaran dan nama guru wajib diisi!');
      return;
    }

    if (editingSchedule) {
      const updated: ScheduleItem = {
        ...editingSchedule,
        ...scheduleForm,
      };
      onUpdateSchedule(updated);
      showFeedback('success', `Jadwal ${scheduleForm.mapel} kelas ${scheduleForm.kelas} berhasil diperbarui.`);
    } else {
      const newItem: ScheduleItem = {
        id: `sch-${Date.now()}`,
        ...scheduleForm,
      };
      onAddSchedule(newItem);
      showFeedback('success', `Jadwal baru ${scheduleForm.mapel} kelas ${scheduleForm.kelas} berhasil ditambahkan.`);
    }
    setIsScheduleModalOpen(false);
  };

  // Delete Schedule
  const handleDeleteScheduleClick = (id: string, mapel: string, kelas: string) => {
    if (window.confirm(`Hapus jadwal ${mapel} kelas ${kelas}?`)) {
      onDeleteSchedule(id);
      showFeedback('success', `Jadwal ${mapel} kelas ${kelas} telah dihapus.`);
    }
  };

  // Open Add Piket Modal
  const handleOpenAddPiket = () => {
    setEditingPiket(null);
    setPiketForm({
      hari: 'Senin',
      koordinator: '',
      anggotaStr: '',
      tugasUtama: '',
    });
    setIsPiketModalOpen(true);
  };

  // Open Edit Piket Modal
  const handleOpenEditPiket = (item: PiketItem) => {
    setEditingPiket(item);
    setPiketForm({
      hari: item.hari,
      koordinator: item.koordinator,
      anggotaStr: item.anggota.join(', '),
      tugasUtama: item.tugasUtama,
    });
    setIsPiketModalOpen(true);
  };

  // Save Piket
  const handleSavePiket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!piketForm.koordinator.trim() || !piketForm.tugasUtama.trim()) {
      showFeedback('error', 'Koordinator dan tugas utama wajib diisi!');
      return;
    }

    const anggotaList = piketForm.anggotaStr
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    if (editingPiket) {
      const updated: PiketItem = {
        ...editingPiket,
        hari: piketForm.hari,
        koordinator: piketForm.koordinator,
        anggota: anggotaList,
        tugasUtama: piketForm.tugasUtama,
      };
      onUpdatePiket(updated);
      showFeedback('success', `Jadwal piket hari ${piketForm.hari} berhasil diperbarui.`);
    } else {
      const newItem: PiketItem = {
        id: `pkt-${Date.now()}`,
        hari: piketForm.hari,
        koordinator: piketForm.koordinator,
        anggota: anggotaList,
        tugasUtama: piketForm.tugasUtama,
      };
      onAddPiket(newItem);
      showFeedback('success', `Jadwal piket baru hari ${piketForm.hari} berhasil ditambahkan.`);
    }
    setIsPiketModalOpen(false);
  };

  // Delete Piket
  const handleDeletePiketClick = (id: string, hari: string) => {
    if (window.confirm(`Hapus jadwal piket hari ${hari}?`)) {
      onDeletePiket(id);
      showFeedback('success', `Jadwal piket hari ${hari} telah dihapus.`);
    }
  };

  // Upload Excel Jadwal
  const handleUploadExcelJadwal = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          showFeedback('error', 'File Excel kosong atau format tidak sesuai.');
          return;
        }

        const parsedItems: ScheduleItem[] = rawJson.map((row, idx) => ({
          id: `sch-up-${Date.now()}-${idx}`,
          hari: row['Hari'] || row['hari'] || 'Senin',
          kelas: row['Kelas'] || row['kelas'] || 'X-1',
          jam: String(row['Jam Ke'] || row['Jam'] || row['jam'] || `${idx + 1}`),
          waktu: row['Waktu'] || row['waktu'] || '07.30 - 09.00',
          mapel: row['Mata Pelajaran'] || row['Mapel'] || row['mapel'] || 'Mapel',
          guru: row['Guru Pengampu'] || row['Guru'] || row['guru'] || 'Guru',
          ruang: row['Ruang'] || row['ruang'] || 'R. 101',
        }));

        if (onBulkAddSchedules) {
          onBulkAddSchedules(parsedItems, false);
        } else {
          parsedItems.forEach((item) => onAddSchedule(item));
        }

        showFeedback('success', `Berhasil mengimpor ${parsedItems.length} jadwal KBM dari file ${file.name}.`);
      } catch (err) {
        showFeedback('error', 'Gagal memproses file Excel jadwal. Periksa format kolom.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Download Excel Jadwal Template
  const handleDownloadTemplate = () => {
    const templateData = [
      { Hari: 'Senin', Kelas: 'X-1', 'Jam Ke': '1 - 2', Waktu: '07.30 - 09.00', 'Mata Pelajaran': 'Pendidikan Agama Islam', 'Guru Pengampu': 'Ahmad Faiz, S.Pd.I.', Ruang: 'R. 101' },
      { Hari: 'Senin', Kelas: 'X-1', 'Jam Ke': '3 - 4', Waktu: '09.00 - 10.30', 'Mata Pelajaran': 'Bahasa Indonesia', 'Guru Pengampu': 'Dra. Hj. Siti Rahayu, M.Pd.', Ruang: 'R. 101' },
      { Hari: 'Selasa', Kelas: 'X-1', 'Jam Ke': '1 - 3', Waktu: '07.15 - 09.30', 'Mata Pelajaran': 'Fisika (IPA)', 'Guru Pengampu': 'Supriyanto, S.Pd., M.Si.', Ruang: 'Lab Fisika' },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 28 }, { wch: 28 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jadwal_KBM');
    XLSX.writeFile(wb, 'Template_Jadwal_KBM_SMABA.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Header and Sub Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 font-semibold text-xs uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" />
            <span>Kelola Jadwal Belajar & Piket</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            Manajemen Jadwal KBM & Piket Harian
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Admin dapat menambah, mengedit, menghapus, atau mengunggah jadwal kelas dan jadwal piket guru secara instan.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl self-start sm:self-center gap-1 border border-slate-200">
          <button
            onClick={() => setActiveSubTab('kbm')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'kbm'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jadwal KBM ({schedulesList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('piket')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'piket'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jadwal Piket ({piketList.length})
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

      {/* SUB TAB 1: JADWAL KBM */}
      {activeSubTab === 'kbm' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari mapel, guru, ruang..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter Kelas */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua">Semua Kelas</option>
                {allClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>

              {/* Filter Hari */}
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua">Semua Hari</option>
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
              <label className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload Excel</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleUploadExcelJadwal}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
                title="Unduh Format Excel"
              >
                <Download className="w-4 h-4" />
                <span>Format Excel</span>
              </button>

              <button
                onClick={handleOpenAddSchedule}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jadwal</span>
              </button>
            </div>
          </div>

          {/* Table Jadwal KBM */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="font-extrabold text-slate-800 text-xs sm:text-sm">
                Daftar Jadwal ({filteredSchedules.length} Item Ditampilkan)
              </div>
              <div className="text-xs text-slate-400">
                Tersimpan di local storage & langsung tersinkron ke menu Jadwal
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">Hari</th>
                    <th className="py-3 px-3 text-center">Kelas</th>
                    <th className="py-3 px-3 text-center">Jam Ke</th>
                    <th className="py-3 px-3">Waktu</th>
                    <th className="py-3 px-3.5">Mata Pelajaran</th>
                    <th className="py-3 px-3.5">Guru Pengampu</th>
                    <th className="py-3 px-3 text-center">Ruang</th>
                    <th className="py-3 px-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Tidak ada data jadwal yang sesuai filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredSchedules.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3.5 font-bold text-slate-800">{row.hari}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold">
                            {row.kelas}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-600">{row.jam}</td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-xs">{row.waktu}</td>
                        <td className="py-3 px-3.5 font-semibold text-slate-900">{row.mapel}</td>
                        <td className="py-3 px-3.5 text-slate-700">{row.guru}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                            {row.ruang}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditSchedule(row)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Jadwal"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteScheduleClick(row.id, row.mapel, row.kelas)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Jadwal"
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

      {/* SUB TAB 2: JADWAL PIKET */}
      {activeSubTab === 'piket' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="text-xs sm:text-sm text-slate-600">
              Kelola daftar guru piket harian untuk monitoring ketertiban sekolah dan penanganan siswa dispensasi.
            </div>
            <button
              onClick={handleOpenAddPiket}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal Piket</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {piketList.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-lg font-black text-xs uppercase">
                      Hari {item.hari}
                    </span>
                    <span className="text-xs text-slate-400">• Koordinator:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditPiket(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Piket"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePiketClick(item.id, item.hari)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Piket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{item.koordinator}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    <strong className="text-slate-700">Anggota Piket:</strong> {item.anggota.join(', ')}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong className="text-slate-800 block mb-0.5">Tugas Utama:</strong>
                  {item.tugasUtama}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add / Edit Schedule */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">
                {editingSchedule ? 'Edit Jadwal KBM' : 'Tambah Jadwal KBM Baru'}
              </h4>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hari</label>
                  <select
                    value={scheduleForm.hari}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, hari: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {dayOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    value={scheduleForm.kelas}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, kelas: e.target.value })}
                    placeholder="e.g. X-1"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Ke</label>
                  <input
                    type="text"
                    value={scheduleForm.jam}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, jam: e.target.value })}
                    placeholder="e.g. 1 - 2 atau 0"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Waktu</label>
                  <input
                    type="text"
                    value={scheduleForm.waktu}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, waktu: e.target.value })}
                    placeholder="e.g. 07.30 - 09.00"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran / Agenda</label>
                <input
                  type="text"
                  value={scheduleForm.mapel}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, mapel: e.target.value })}
                  placeholder="e.g. Matematika Umum / Fisika (IPA)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Guru Pengampu</label>
                <input
                  type="text"
                  value={scheduleForm.guru}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, guru: e.target.value })}
                  placeholder="e.g. Bambang Triyono, S.Pd."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ruang / Lokasi</label>
                <input
                  type="text"
                  value={scheduleForm.ruang}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, ruang: e.target.value })}
                  placeholder="e.g. R. 101 / Lab Komputer 1"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md"
                >
                  {editingSchedule ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Piket */}
      {isPiketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base">
                {editingPiket ? 'Edit Jadwal Piket' : 'Tambah Jadwal Piket Baru'}
              </h4>
              <button
                onClick={() => setIsPiketModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePiket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hari</label>
                <select
                  value={piketForm.hari}
                  onChange={(e) => setPiketForm({ ...piketForm, hari: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {dayOptions.map((d) => (
                    <option key={d} value={d}>
                      Hari {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Koordinator Piket</label>
                <input
                  type="text"
                  value={piketForm.koordinator}
                  onChange={(e) => setPiketForm({ ...piketForm, koordinator: e.target.value })}
                  placeholder="e.g. Dra. Hj. Siti Rahayu, M.Pd."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Anggota Piket (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={piketForm.anggotaStr}
                  onChange={(e) => setPiketForm({ ...piketForm, anggotaStr: e.target.value })}
                  placeholder="e.g. Bambang Triyono, S.Pd., Ahmad Faiz, S.Pd.I., Farida Arisanti, S.Pd."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tugas Utama Piket</label>
                <textarea
                  rows={3}
                  value={piketForm.tugasUtama}
                  onChange={(e) => setPiketForm({ ...piketForm, tugasUtama: e.target.value })}
                  placeholder="Deskripsi penugasan dan fokus pengawasan..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPiketModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md"
                >
                  {editingPiket ? 'Simpan Perubahan' : 'Tambah Piket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
