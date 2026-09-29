import React, { useState } from 'react';
import { Calendar, Clock, BarChart3, AlertCircle, FileSpreadsheet, CheckCircle2, ChevronRight } from 'lucide-react';
import { AcademicSettings, KaldikEvent, RmeRow } from '../../types';
import { INITIAL_KALDIK_EVENTS, INITIAL_RME_DATA } from '../../data/mockData';

interface KaldikViewProps {
  academicSettings?: AcademicSettings;
  eventsList?: KaldikEvent[];
  rmeList?: RmeRow[];
}

export const KaldikView: React.FC<KaldikViewProps> = ({
  academicSettings,
  eventsList = INITIAL_KALDIK_EVENTS,
  rmeList = INITIAL_RME_DATA,
}) => {
  const [subTab, setSubTab] = useState<'kaldik' | 'rme' | 'rjm'>('kaldik');
  const activeYear = academicSettings?.academicYear || '2024/2025';
  const activeSemester = academicSettings?.semester || 'Genap';
  const activeMaxJp = academicSettings?.maxJp || '40';

  const isGanjil = activeSemester === 'Ganjil';

  // Filter events matching activeSemester or 'Semua'
  const kaldikEvents = eventsList.filter(
    (ev) => ev.semester === activeSemester || ev.semester === 'Semua'
  );

  // Filter RME matching activeSemester
  const rmeData = rmeList.filter((row) => row.semester === activeSemester);

  const totalMinggu = rmeData.reduce((acc, c) => acc + c.jmlMinggu, 0);
  const totalTdkEfektif = rmeData.reduce((acc, c) => acc + c.tdkEfektif, 0);
  const totalEfektif = rmeData.reduce((acc, c) => acc + c.efektif, 0);

  const rjmSummary = [
    { range: '24 - 28 JP', jmlGuru: 32, label: 'Beban Standar Ideal (Linier Sertifikasi)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { range: '29 - 34 JP', jmlGuru: 16, label: 'Beban Penuh + Tugas Tambahan (Wali Kelas / Lab)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { range: '35 - 40 JP', jmlGuru: 6, label: 'Beban Maksimal + Pembina Ekstrakurikuler', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-sm bg-white p-2 rounded-xl border">
        <button
          onClick={() => setSubTab('kaldik')}
          className={`py-2 px-4 rounded-lg font-bold transition-all flex items-center gap-2 ${
            subTab === 'kaldik'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Kalender Pendidikan (Kaldik)
        </button>
        <button
          onClick={() => setSubTab('rme')}
          className={`py-2 px-4 rounded-lg font-bold transition-all flex items-center gap-2 ${
            subTab === 'rme'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          Rincian Minggu Efektif (RME)
        </button>
        <button
          onClick={() => setSubTab('rjm')}
          className={`py-2 px-4 rounded-lg font-bold transition-all flex items-center gap-2 ${
            subTab === 'rjm'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Rincian Jam Mengajar (RJM)
        </button>
      </div>

      {/* KALDIK VIEW */}
      {subTab === 'kaldik' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Agenda Kalender Pendidikan Semester {activeSemester}</h3>
              <p className="text-xs text-slate-500">Tahun Ajaran {activeYear} • Dinas Pendidikan & Kebudayaan Provinsi Jawa Tengah</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> KBM</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Asesmen</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Kegiatan</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Libur</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {kaldikEvents.map((item, idx) => {
              const badgeColors: Record<string, string> = {
                kbm: 'bg-blue-50 text-blue-700 border-blue-200',
                asesmen: 'bg-amber-50 text-amber-700 border-amber-200',
                kegiatan: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                libur: 'bg-rose-50 text-rose-700 border-rose-200',
              };

              return (
                <div key={idx} className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{item.event}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.date}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase shrink-0 ${badgeColors[item.type]}`}>
                    {item.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RME VIEW */}
      {subTab === 'rme' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <span className="text-xs text-blue-700 font-semibold uppercase">Total Jumlah Minggu</span>
              <div className="text-3xl font-black text-blue-900 mt-1">{totalMinggu} Minggu</div>
              <span className="text-xs text-slate-500">Januari - Juni 2025</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
              <span className="text-xs text-rose-700 font-semibold uppercase">Minggu Tidak Efektif</span>
              <div className="text-3xl font-black text-rose-900 mt-1">{totalTdkEfektif} Minggu</div>
              <span className="text-xs text-slate-500">Asesmen, Libur Idul Fitri, Rapor</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <span className="text-xs text-emerald-700 font-semibold uppercase">Minggu Efektif KBM</span>
              <div className="text-3xl font-black text-emerald-900 mt-1">{totalEfektif} Minggu</div>
              <span className="text-xs text-slate-500">Total Jam Efektif: {totalEfektif * 44} JP</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-sm">
              Rincian Analisis Minggu Efektif (RME) Semester Genap
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Bulan</th>
                    <th className="py-3 px-4 text-center">Jml Minggu</th>
                    <th className="py-3 px-4 text-center">Tdk Efektif</th>
                    <th className="py-3 px-4 text-center">Minggu Efektif</th>
                    <th className="py-3 px-4">Keterangan / Agenda Utama</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rmeData.map((row) => (
                    <tr key={row.no} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-center text-slate-500">{row.no}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{row.bulan}</td>
                      <td className="py-3 px-4 text-center font-semibold">{row.jmlMinggu}</td>
                      <td className="py-3 px-4 text-center text-rose-600 font-semibold">{row.tdkEfektif}</td>
                      <td className="py-3 px-4 text-center text-emerald-700 font-bold">{row.efektif}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{row.ket}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-3 px-4 text-right uppercase text-xs">Total Semester Genap</td>
                    <td className="py-3 px-4 text-center text-blue-900">{totalMinggu}</td>
                    <td className="py-3 px-4 text-center text-rose-700">{totalTdkEfektif}</td>
                    <td className="py-3 px-4 text-center text-emerald-800">{totalEfektif} Minggu</td>
                    <td className="py-3 px-4 text-xs text-slate-700 font-semibold">Siap digunakan untuk Prota & Promes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RJM VIEW */}
      {subTab === 'rjm' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Rekapitulasi Jam Mengajar (RJM) Dewan Guru SMAN 1 Batangan
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm">
              Distribusi beban mengajar sesuai dengan Permendikbudristek No. 15 Tahun 2018 tentang Pemenuhan Beban Kerja Guru, Kepala Sekolah, dan Pengawas Sekolah (24 - 40 Jam Tatap Muka per Pekan).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {rjmSummary.map((item, idx) => (
              <div key={idx} className={`p-4 rounded-xl border ${item.color} space-y-1`}>
                <div className="text-2xl font-black">{item.jmlGuru} Guru</div>
                <div className="text-sm font-bold">{item.range}</div>
                <div className="text-xs opacity-90">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Seluruh 54 Guru SMAN 1 Batangan telah memenuhi batas minimal 24 JP/minggu.</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> 100% Valid Simpatika / Dapodik
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
