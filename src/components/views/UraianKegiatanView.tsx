import React, { useState } from 'react';
import { ClipboardList, Calendar, CheckCircle2, Clock, ArrowRight, Filter } from 'lucide-react';
import { CURRICULUM_ACTIVITIES } from '../../data/mockData';
import { CurriculumActivity } from '../../types';

export const UraianKegiatanView: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  const categories = ['Semua', 'Perencanaan', 'KBM', 'Asesmen', 'Pengembangan Guru', 'P5'];
  const statuses = ['Semua', 'Selesai', 'Sedang Berjalan', 'Mendatang'];

  const filtered = CURRICULUM_ACTIVITIES.filter((act) => {
    const matchCat = filterCategory === 'Semua' || act.category === filterCategory;
    const matchStat = filterStatus === 'Semua' || act.status === filterStatus;
    return matchCat && matchStat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider">
            <ClipboardList className="w-4 h-4" />
            Roadmap Operasional
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Uraian Kegiatan & Program Kerja Kurikulum
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Pelaksanaan agenda akademik tahunan Tim Kurikulum SMA Negeri 1 Batangan TA 2024/2025.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl text-xs font-semibold text-slate-700">
          <span>Total: {CURRICULUM_ACTIVITIES.length} Program</span>
          <span>•</span>
          <span className="text-emerald-700">5 Selesai</span>
          <span>•</span>
          <span className="text-blue-700">2 Aktif</span>
        </div>
      </div>

      {/* Filter controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1">Kategori:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 self-start md:self-center">
          <span className="text-xs font-bold text-slate-500 mr-1">Status:</span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {filtered.map((act) => {
          const statusStyles: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
            Selesai: {
              bg: 'bg-emerald-50',
              text: 'text-emerald-700',
              border: 'border-emerald-200',
              icon: <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />,
            },
            'Sedang Berjalan': {
              bg: 'bg-blue-50',
              text: 'text-blue-700',
              border: 'border-blue-200',
              icon: <Clock className="w-3.5 h-3.5 inline mr-1 text-blue-600 animate-spin" />,
            },
            Mendatang: {
              bg: 'bg-amber-50',
              text: 'text-amber-700',
              border: 'border-amber-200',
              icon: <Calendar className="w-3.5 h-3.5 inline mr-1 text-amber-600" />,
            },
          };

          const curStatus = statusStyles[act.status] || statusStyles['Mendatang'];

          return (
            <div
              key={act.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {act.category}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${curStatus.bg} ${curStatus.text} ${curStatus.border}`}>
                    {curStatus.icon} {act.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {act.dateRange}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {act.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {act.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Penanggung Jawab (PIC):</span>{' '}
                    <span className="font-semibold text-slate-800">{act.pic}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Target Output:</span>{' '}
                    <span className="font-semibold text-blue-700">{act.targetOutput}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
