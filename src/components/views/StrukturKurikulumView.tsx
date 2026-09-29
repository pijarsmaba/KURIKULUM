import React, { useState } from 'react';
import { Layers, Download, Filter, HelpCircle, Check, Info } from 'lucide-react';
import { AcademicSettings, MapelStruktur } from '../../types';
import { INITIAL_STRUKTUR_DATA } from '../../data/mockData';

interface StrukturKurikulumViewProps {
  academicSettings?: AcademicSettings;
  strukturList?: MapelStruktur[];
}

export const StrukturKurikulumView: React.FC<StrukturKurikulumViewProps> = ({
  academicSettings,
  strukturList = INITIAL_STRUKTUR_DATA,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<'X' | 'XI' | 'XII'>('X');
  const activeYear = academicSettings?.academicYear || '2024/2025';
  const activeSemester = academicSettings?.semester || 'Genap';
  const activeCurriculum = academicSettings?.curriculumName || 'Kurikulum Merdeka';

  const currentData = strukturList.filter((item) => item.fase === selectedPhase);
  const totalIntra = currentData.reduce((acc, curr) => acc + curr.intra, 0);
  const totalP5 = currentData.reduce((acc, curr) => acc + curr.p5, 0);
  const totalAll = totalIntra + totalP5;
  const totalMingguan = currentData.reduce((acc, curr) => acc + curr.mingguan, 0);

  return (
    <div className="space-y-6">
      {/* Title & Phase Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            Alokasi Waktu Pembelajaran
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Struktur {activeCurriculum} SMABA
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Tahun Pelajaran {activeYear} (Semester {activeSemester}) • Berdasarkan Kepmendikbudristek No. 262/M/2022 dan KOSP SMAN 1 Batangan.
          </p>
        </div>

        {/* Phase Pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-center border border-slate-200">
          <button
            onClick={() => setSelectedPhase('X')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              selectedPhase === 'X'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kelas X (Fase E)
          </button>
          <button
            onClick={() => setSelectedPhase('XI')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              selectedPhase === 'XI'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kelas XI (Fase F)
          </button>
          <button
            onClick={() => setSelectedPhase('XII')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              selectedPhase === 'XII'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kelas XII (Fase F)
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
          <span className="text-xs text-blue-700 font-medium block">Total JP Intrakurikuler / Thn</span>
          <span className="text-2xl font-black text-blue-900">{totalIntra} JP</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
          <span className="text-xs text-emerald-700 font-medium block">Total JP Kokurikuler (P5) / Thn</span>
          <span className="text-2xl font-black text-emerald-900">{totalP5} JP</span>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-center">
          <span className="text-xs text-indigo-700 font-medium block">Total Beban Belajar / Thn</span>
          <span className="text-2xl font-black text-indigo-900">{totalAll} JP</span>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
          <span className="text-xs text-amber-700 font-medium block">Rata-rata Jam / Minggu</span>
          <span className="text-2xl font-black text-amber-900">{totalMingguan} JP / Minggu</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">
              Tabel Alokasi Jam Pelajaran - {selectedPhase === 'X' ? 'Fase E (Kelas X)' : `Fase F (Kelas ${selectedPhase})`}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            1 JP = 45 Menit • 36 Minggu Efektif per Tahun
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4 text-center">Intrakurikuler (JP/Tahun)</th>
                <th className="py-3 px-4 text-center">Projek P5 (JP/Tahun)</th>
                <th className="py-3 px-4 text-center">Total (JP/Tahun)</th>
                <th className="py-3 px-4 text-center">Beban / Pekan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.map((row) => (
                <tr key={row.no} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3 px-4 text-center text-slate-500 font-medium">{row.no}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {row.mapel}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-700 font-medium">{row.intra} JP</td>
                  <td className="py-3 px-4 text-center text-emerald-700 font-medium">
                    {row.p5 > 0 ? `${row.p5} JP` : '-'}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">{row.total} JP</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-xs">
                      {row.mingguan} JP
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-300">
                <td colSpan={2} className="py-3.5 px-4 text-right uppercase tracking-wider text-xs">
                  Total Alokasi Pembelajaran
                </td>
                <td className="py-3.5 px-4 text-center text-blue-800">{totalIntra} JP</td>
                <td className="py-3.5 px-4 text-center text-emerald-800">{totalP5} JP</td>
                <td className="py-3.5 px-4 text-center text-indigo-900">{totalAll} JP</td>
                <td className="py-3.5 px-4 text-center text-blue-900 font-extrabold">{totalMingguan} JP</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidance Note */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs sm:text-sm text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Ketentuan Khusus Fase F (Peminatan Mandiri SMABA):</span>
          <p className="text-blue-800/90 leading-relaxed text-xs">
            Siswa kelas XI dan XII memilih 4 s/d 5 mata pelajaran pilihan yang disesuaikan dengan minat bakat, rencana studi lanjut perguruan tinggi (SNBP/SNBT), serta kuota ketersediaan guru pengampu di SMAN 1 Batangan.
          </p>
        </div>
      </div>
    </div>
  );
};
