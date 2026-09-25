import React, { useState } from 'react';
import {
  Monitor,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Bell,
  Check,
  X,
  FileSpreadsheet,
  Download,
  Filter,
  User,
  ShieldCheck,
  Award,
  ChevronRight,
  ArrowUpRight,
  FileText,
  Printer
} from 'lucide-react';
import { TEACHER_PROGRESS_DATA } from '../../data/mockData';
import { TeacherProgress, User as CurrentUser, UserRole } from '../../types';

interface DataGuruViewProps {
  currentUser?: CurrentUser | null;
  onOpenSheetsModal?: () => void;
  onNavigateToPerangkat?: () => void;
}

export const DataGuruView: React.FC<DataGuruViewProps> = ({
  currentUser,
  onOpenSheetsModal,
  onNavigateToPerangkat,
}) => {
  const currentRole: UserRole = currentUser?.role || 'guru';

  const [data, setData] = useState<TeacherProgress[]>(TEACHER_PROGRESS_DATA);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Lengkap' | 'Proses' | 'Belum'>('Semua');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [isSignedByKepsek, setIsSignedByKepsek] = useState(false);

  // Identify teacher's personal record
  const myRecord = data.find(
    (t) =>
      t.nip === currentUser?.nip ||
      t.name.toLowerCase().includes(currentUser?.name.toLowerCase().split(',')[0] || 'siti')
  ) || data[0]; // Dra. Hj. Siti Rahayu, M.Pd.

  const totalTeachers = 54;
  const completeTeachers = data.filter((d) => d.completionPercentage === 100).length + 32;
  const inProgressTeachers = data.filter((d) => d.completionPercentage > 0 && d.completionPercentage < 100).length + 6;
  const notStartedTeachers = totalTeachers - completeTeachers - inProgressTeachers;
  const overallPercentage = Math.round(((completeTeachers * 1.0 + inProgressTeachers * 0.6) / totalTeachers) * 100);

  const filtered = data.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      item.nip.includes(search);
    const matchStatus = statusFilter === 'Semua' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSendReminder = (teacherName: string) => {
    setNotificationMsg(`Pengingat otomatis via WhatsApp & Notifikasi PIJAR telah terkirim kepada ${teacherName}.`);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 3500);
  };

  const handleSendBroadcastReminder = () => {
    setNotificationMsg(`Notifikasi broadcast pengingat kelengkapan administrasi telah dikirim ke seluruh dewan guru yang belum 100% lengkap.`);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 3500);
  };

  const handleToggleChecklist = (teacherId: string, itemKey: keyof TeacherProgress['checklist']) => {
    if (currentRole !== 'admin') return;

    setData((prev) =>
      prev.map((t) => {
        if (t.id === teacherId) {
          const updatedChecklist = { ...t.checklist, [itemKey]: !t.checklist[itemKey] };
          const countTrue = Object.values(updatedChecklist).filter(Boolean).length;
          const percentage = countTrue * 20;
          return {
            ...t,
            checklist: updatedChecklist,
            completionPercentage: percentage,
            status: percentage === 100 ? 'Lengkap' : percentage > 0 ? 'Proses' : 'Belum',
            lastUpdated: 'Hari ini',
          };
        }
        return t;
      })
    );
  };

  const handleSignAuditByKepsek = () => {
    setIsSignedByKepsek(true);
    setNotificationMsg('Laporan Audit Kepatuhan Administrasi Guru resmi disahkan oleh Kepala Sekolah (H. Sudarmanto, M.Pd.)');
    setTimeout(() => {
      setNotificationMsg(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <Monitor className="w-3.5 h-3.5" />
            <span>
              {currentRole === 'guru'
                ? 'Status Kelengkapan Berkas Guru'
                : currentRole === 'admin'
                ? 'Monitoring & Kontrol Administrasi Guru'
                : currentRole === 'kepsek'
                ? 'Audit Kepatuhan & Penjaminan Mutu TPMPS'
                : 'Monitoring Administrasi Pembelajaran'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentRole === 'guru'
              ? 'Status Kelengkapan Dokumen Saya'
              : currentRole === 'kepsek'
              ? 'Audit Kepatuhan & Kinerja Dewan Guru'
              : 'Data Guru yang sdh Unggah Perangkat Ajar'}
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
            {currentRole === 'guru'
              ? 'Pantau progres keterisian 5 dokumen wajib Kurikulum Merdeka Anda: CP, TP & ATP, Modul Ajar, Prota & Promes, serta Instrumen Asesmen.'
              : currentRole === 'kepsek'
              ? 'Laporan kepatuhan dan audit keterisian dokumen kurikulum 54 dewan guru SMAN 1 Batangan untuk evaluasi penjaminan mutu internal (TPMPS).'
              : 'Rekapitulasi keterisian dokumen administrasi Kurikulum Merdeka semester berjalan di SMAN 1 Batangan. Pantau progres, validasi dan kirim pengingat.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          {onOpenSheetsModal && (
            <button
              onClick={onOpenSheetsModal}
              className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md border border-emerald-400/40"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Sinkron Google Sheets</span>
            </button>
          )}

          {currentRole === 'admin' && (
            <button
              onClick={handleSendBroadcastReminder}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/30"
            >
              <Bell className="w-4 h-4" />
              <span>Kirim Pengingat WA</span>
            </button>
          )}

          {currentRole === 'kepsek' && (
            <button
              onClick={handleSignAuditByKepsek}
              className={`px-4 py-2.5 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                isSignedByKepsek
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{isSignedByKepsek ? 'Telah Disahkan Kepsek' : 'Sahkan Audit TPMPS'}</span>
            </button>
          )}
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* SPECIAL VIEW FOR GURU: PERSONAL CHECKLIST CARD */}
      {currentRole === 'guru' && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-blue-200 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                SR
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Guru Pengampu Aktif
                </span>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {myRecord.name}
                </h3>
                <p className="text-xs text-slate-500">
                  NIP: {myRecord.nip} • Mapel: {myRecord.subject} (Beban: {myRecord.totalTeachingHours} JP)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 self-start sm:self-center">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Keterisian Berkas</span>
                <span className="text-xl font-black text-blue-600">80% Lengkap</span>
              </div>
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-300">
                4 / 5
              </div>
            </div>
          </div>

          {/* 5 Mandatory Document Checkpoints */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daftar 5 Dokumen Administrasi Wajib:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {/* 1. CP */}
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-xs text-emerald-800">1. CP</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] font-bold text-slate-800">Capaian Pembelajaran</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">✓ Terpenuhi & Sah</div>
              </div>

              {/* 2. ATP */}
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-xs text-emerald-800">2. ATP</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] font-bold text-slate-800">Alur Tujuan Belajar</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">✓ Terpenuhi & Sah</div>
              </div>

              {/* 3. Modul Ajar */}
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-xs text-emerald-800">3. Modul</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] font-bold text-slate-800">Modul Ajar / RPP</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">✓ Terpenuhi & Sah</div>
              </div>

              {/* 4. Prota & Promes */}
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-xs text-emerald-800">4. Prota</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[11px] font-bold text-slate-800">Prota & Promes</div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">✓ Terpenuhi & Sah</div>
              </div>

              {/* 5. Asesmen - Needs Revision */}
              <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-300 ring-1 ring-amber-300 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-xs text-amber-900">5. Asesmen</span>
                  <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" />
                </div>
                <div className="text-[11px] font-bold text-slate-800">Kisi & Asesmen</div>
                <div className="text-[10px] text-amber-800 font-extrabold mt-1">⚠️ Perlu Revisi</div>
              </div>
            </div>
          </div>

          {/* Action Callout */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Tindakan Diperlukan: Berkas Asesmen Bahasa Indonesia Perlu Dilengkapi</span>
              </span>
              <p className="text-[11px] text-amber-800">
                Tim kurikulum meminta penambahan rubrik asesmen formatif Profil Pelajar Pancasila pada lampiran.
              </p>
            </div>
            {onNavigateToPerangkat && (
              <button
                onClick={onNavigateToPerangkat}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
              >
                <span>Buka Perangkat Ajar & Unggah Ulang</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards (Overview stats) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-xs text-slate-500 font-semibold block uppercase">Total Dewan Guru</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalTeachers} Guru</span>
          <span className="text-[11px] text-slate-400">Tercatat Aktif di Dapodik</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-xs text-emerald-700 font-semibold block uppercase">Sudah Lengkap 100%</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-900">{completeTeachers} Guru</span>
          <span className="text-[11px] text-emerald-600 font-medium">5 Checklist Terpenuhi</span>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-xs text-blue-700 font-semibold block uppercase">Sedang Melengkapi</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-900">{inProgressTeachers} Guru</span>
          <span className="text-[11px] text-blue-600 font-medium">Progres 20% - 80%</span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl shadow-sm text-center">
          <span className="text-xs text-amber-700 font-semibold block uppercase">Rasio Kepatuhan</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-900">{overallPercentage}%</span>
          <div className="w-full bg-amber-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-amber-600 h-full rounded-full" style={{ width: `${overallPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama guru, NIP, atau mata pelajaran..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1">Status:</span>
          {(['Semua', 'Lengkap', 'Proses', 'Belum'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table of 54 Teachers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              Rekapitulasi Keterisian Administrasi Dewan Guru ({filtered.length} Ditampilkan)
            </span>
            {currentRole === 'admin' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Mode Interaktif: Klik kotak CP/ATP/Modul untuk mengubah status
              </span>
            )}
          </div>
          {isSignedByKepsek && (
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Telah Disahkan Kepala Sekolah</span>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap & NIP</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4 text-center">Checklist Administrasi (5 Item)</th>
                <th className="py-3 px-4 text-center">Progres</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((teacher, idx) => (
                <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{teacher.name}</span>
                      {teacher.nip === currentUser?.nip && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          Anda
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">NIP: {teacher.nip}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {teacher.subject}
                    <div className="text-[11px] text-slate-400 font-normal">
                      Beban: {teacher.totalTeachingHours} JP • {teacher.classAssigned.join(', ')}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* CP */}
                      <button
                        type="button"
                        onClick={() => handleToggleChecklist(teacher.id, 'cp')}
                        disabled={currentRole !== 'admin'}
                        title={`Capaian Pembelajaran (CP) - ${teacher.checklist.cp ? 'Lengkap' : 'Belum'}${currentRole === 'admin' ? ' (Klik untuk toggle)' : ''}`}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all ${
                          teacher.checklist.cp
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-700 border border-rose-300'
                        } ${currentRole === 'admin' ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                      >
                        CP
                      </button>

                      {/* ATP */}
                      <button
                        type="button"
                        onClick={() => handleToggleChecklist(teacher.id, 'atp')}
                        disabled={currentRole !== 'admin'}
                        title={`Alur Tujuan Pembelajaran (ATP) - ${teacher.checklist.atp ? 'Lengkap' : 'Belum'}${currentRole === 'admin' ? ' (Klik untuk toggle)' : ''}`}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all ${
                          teacher.checklist.atp
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-700 border border-rose-300'
                        } ${currentRole === 'admin' ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                      >
                        ATP
                      </button>

                      {/* Modul Ajar */}
                      <button
                        type="button"
                        onClick={() => handleToggleChecklist(teacher.id, 'modulAjar')}
                        disabled={currentRole !== 'admin'}
                        title={`Modul Ajar - ${teacher.checklist.modulAjar ? 'Lengkap' : 'Belum'}${currentRole === 'admin' ? ' (Klik untuk toggle)' : ''}`}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all ${
                          teacher.checklist.modulAjar
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-700 border border-rose-300'
                        } ${currentRole === 'admin' ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                      >
                        MA
                      </button>

                      {/* Prota Promes */}
                      <button
                        type="button"
                        onClick={() => handleToggleChecklist(teacher.id, 'protaPromes')}
                        disabled={currentRole !== 'admin'}
                        title={`Program Tahunan & Semester - ${teacher.checklist.protaPromes ? 'Lengkap' : 'Belum'}${currentRole === 'admin' ? ' (Klik untuk toggle)' : ''}`}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all ${
                          teacher.checklist.protaPromes
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-700 border border-rose-300'
                        } ${currentRole === 'admin' ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                      >
                        PR
                      </button>

                      {/* Asesmen */}
                      <button
                        type="button"
                        onClick={() => handleToggleChecklist(teacher.id, 'asesmen')}
                        disabled={currentRole !== 'admin'}
                        title={`Kisi-kisi & Asesmen - ${teacher.checklist.asesmen ? 'Lengkap' : 'Belum'}${currentRole === 'admin' ? ' (Klik untuk toggle)' : ''}`}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all ${
                          teacher.checklist.asesmen
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-700 border border-rose-300'
                        } ${currentRole === 'admin' ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                      >
                        AS
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-12 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            teacher.completionPercentage === 100
                              ? 'bg-emerald-500'
                              : teacher.completionPercentage >= 60
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${teacher.completionPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{teacher.completionPercentage}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        teacher.status === 'Lengkap'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : teacher.status === 'Proses'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {teacher.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {teacher.status !== 'Lengkap' ? (
                      <button
                        onClick={() => handleSendReminder(teacher.name)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
                        title="Kirim Notifikasi Pengingat"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-bold text-xs inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Lengkap</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
