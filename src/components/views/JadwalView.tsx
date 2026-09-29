import React, { useState } from 'react';
import {
  CalendarDays,
  Users,
  Shield,
  Clock,
  Search,
  Filter,
  Printer,
  Download,
  User,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { User as CurrentUser, UserRole, AcademicSettings, ScheduleItem, PiketItem } from '../../types';
import { INITIAL_SCHEDULES, INITIAL_PIKET } from '../../data/mockData';

interface JadwalViewProps {
  currentUser?: CurrentUser | null;
  academicSettings?: AcademicSettings;
  schedulesList?: ScheduleItem[];
  piketList?: PiketItem[];
}

export const JadwalView: React.FC<JadwalViewProps> = ({
  currentUser,
  academicSettings,
  schedulesList = INITIAL_SCHEDULES,
  piketList = INITIAL_PIKET,
}) => {
  const currentRole: UserRole = currentUser?.role || 'guru';
  const activeYear = academicSettings?.academicYear || '2024/2025';
  const activeSemester = academicSettings?.semester || 'Genap';
  const activeMaxJp = academicSettings?.maxJp || '40';

  const [activeTab, setActiveTab] = useState<'saya' | 'kelas' | 'guru' | 'piket'>(
    currentRole === 'guru' ? 'saya' : 'kelas'
  );
  const [selectedClass, setSelectedClass] = useState('X-1');
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [searchGuru, setSearchGuru] = useState('');

  // Extract distinct classes from schedulesList if available
  const dynamicClasses = Array.from(new Set(schedulesList.map((s) => s.kelas))).filter(Boolean);
  const classList = dynamicClasses.length > 0 ? dynamicClasses : ['X-1', 'X-2', 'X-3', 'X-4', 'XI-1', 'XI-2', 'XI-3', 'XII-1', 'XII-2', 'XII-3'];
  const dayList = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  // Dynamic filter for selected class and day
  const filteredScheduleItems = schedulesList.filter(
    (item) => item.kelas === selectedClass && item.hari === selectedDay
  );

  const piketSchedule = piketList;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 font-semibold text-xs uppercase tracking-wider">
            <CalendarDays className="w-4 h-4" />
            <span>Manajemen KBM & Distribusi Jam Mengajar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {currentRole === 'guru'
              ? 'Jadwal KBM & Piket Guru'
              : currentRole === 'kepsek'
              ? 'Evaluasi Beban Jam Mengajar Dewan Guru'
              : 'Jadwal Guru, Kelas, dan Piket Harian'}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Tahun Pelajaran {activeYear} Semester {activeSemester} • Beban Maksimal {activeMaxJp} JP/Pekan • SMA Negeri 1 Batangan
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl self-start sm:self-center">
          {currentRole === 'guru' && (
            <button
              onClick={() => setActiveTab('saya')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'saya'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Jadwal Saya</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('kelas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'kelas'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jadwal Kelas
          </button>
          <button
            onClick={() => setActiveTab('guru')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'guru'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jadwal 54 Guru
          </button>
          <button
            onClick={() => setActiveTab('piket')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'piket'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jadwal Piket
          </button>
        </div>
      </div>

      {/* TAB 1: JADWAL SAYA (GURU) */}
      {activeTab === 'saya' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                Jadwal Personal Guru
              </span>
              <h3 className="text-xl font-black">
                {currentUser?.name || 'Dra. Hj. Siti Rahayu, M.Pd.'}
              </h3>
              <p className="text-xs text-blue-200">
                Mata Pelajaran: {currentUser?.subject || 'Bahasa Indonesia'} • Total Beban: 28 JP / Minggu
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/20">
              <Shield className="w-6 h-6 text-amber-300" />
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-200 block">Jadwal Tugas Piket:</span>
                <span className="text-sm font-extrabold text-amber-300">Hari Senin (Koordinator)</span>
              </div>
            </div>
          </div>

          {/* Weekly teaching schedule for teacher */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              {
                hari: 'Senin',
                kelas: 'Kelas X-1',
                jam: '09.00 - 10.30 (Jam 3 - 4)',
                ruang: 'R. 101',
                topik: 'Menulis Teks Argumentasi',
                piket: true,
              },
              {
                hari: 'Selasa',
                kelas: 'Kelas X-2',
                jam: '07.15 - 08.45 (Jam 1 - 2)',
                ruang: 'R. 102',
                topik: 'Struktur Logika Paragraf',
                piket: false,
              },
              {
                hari: 'Rabu',
                kelas: 'Kelas XI-1',
                jam: '10.50 - 12.20 (Jam 5 - 6)',
                ruang: 'R. 201',
                topik: 'Karya Ilmiah & Kutipan Pustaka',
                piket: false,
              },
              {
                hari: 'Kamis',
                kelas: 'Kelas XI-2',
                jam: '13.00 - 14.30 (Jam 7 - 8)',
                ruang: 'R. 202',
                topik: 'Teknik Debat & Retorika',
                piket: false,
              },
              {
                hari: 'Jumat',
                kelas: 'Kelas X-3',
                jam: '07.15 - 08.45 (Jam 1 - 2)',
                ruang: 'R. 103',
                topik: 'Resensi Buku Sastra Pesisir',
                piket: false,
              },
            ].map((d) => (
              <div
                key={d.hari}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-extrabold text-sm text-slate-900">{d.hari}</span>
                  {d.piket && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      Piket
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-blue-600">{d.kelas}</div>
                  <div className="text-slate-600 text-[11px] font-mono">{d.jam}</div>
                  <div className="text-slate-500 text-[11px]">Ruang: {d.ruang}</div>
                  <div className="text-slate-700 text-[11px] pt-1 font-medium italic border-t border-slate-50">
                    "{d.topik}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: JADWAL KELAS */}
      {activeTab === 'kelas' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase mr-1">Kelas:</span>
              {classList.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedClass === c
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase mr-1">Hari:</span>
              {dayList.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedDay === d
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="font-bold text-slate-900 text-sm">
                Jadwal KBM Kelas {selectedClass} • Hari {selectedDay}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-16 text-center">Jam Ke</th>
                    <th className="py-3 px-4 w-32">Waktu</th>
                    <th className="py-3 px-4">Mata Pelajaran / Agenda</th>
                    <th className="py-3 px-4">Guru Pengampu</th>
                    <th className="py-3 px-4 text-center">Ruang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredScheduleItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs sm:text-sm">
                        Belum ada jadwal untuk kelas {selectedClass} pada hari {selectedDay}. Admin dapat menambahkannya di panel Admin.
                      </td>
                    </tr>
                  ) : (
                    filteredScheduleItems.map((row) => (
                      <tr
                        key={row.id}
                        className={
                          row.mapel.includes('Istirahat') || row.mapel.includes('Sholat')
                            ? 'bg-amber-50/50 text-amber-900 italic'
                            : row.jam === '0'
                            ? 'bg-blue-50/40 text-blue-950'
                            : 'hover:bg-slate-50'
                        }
                      >
                        <td className="py-3 px-4 text-center font-bold text-slate-600">{row.jam}</td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-600 font-medium">{row.waktu}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{row.mapel}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{row.guru}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-xs">
                            {row.ruang}
                          </span>
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

      {/* TAB 3: JADWAL GURU */}
      {activeTab === 'guru' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchGuru}
                onChange={(e) => setSearchGuru(e.target.value)}
                placeholder="Cari nama guru atau mata pelajaran..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-xs text-slate-500">Total 54 Guru Mengajar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                nama: 'Dra. Hj. Siti Rahayu, M.Pd.',
                mapel: 'Bahasa Indonesia',
                nip: '197508122002122001',
                beban: '28 JP',
                kelas: ['X-1', 'X-2', 'X-3', 'XI-1', 'XI-2'],
                piket: 'Senin',
              },
              {
                nama: 'Supriyanto, S.Pd., M.Si.',
                mapel: 'Fisika',
                nip: '197804152006041012',
                beban: '26 JP',
                kelas: ['XI-1', 'XI-2', 'XII-1', 'XII-2'],
                piket: 'Selasa',
              },
              {
                nama: 'Bambang Triyono, S.Pd.',
                mapel: 'Matematika',
                nip: '198205142009031004',
                beban: '28 JP',
                kelas: ['X-4', 'X-5', 'X-6', 'XI-3'],
                piket: 'Senin',
              },
              {
                nama: 'Nurul Hidayati, S.Si., M.Pd.',
                mapel: 'Kimia',
                nip: '198402182010012015',
                beban: '24 JP',
                kelas: ['XI-3', 'XI-4', 'XII-3', 'XII-4'],
                piket: 'Selasa',
              },
              {
                nama: 'Farida Arisanti, S.Pd.',
                mapel: 'Bahasa Inggris',
                nip: '198906232014022002',
                beban: '24 JP',
                kelas: ['XI-5', 'XI-6', 'XII-5'],
                piket: 'Senin',
              },
              {
                nama: 'Drs. Joko Prasetyo',
                mapel: 'Sosiologi',
                nip: '196911041998021003',
                beban: '26 JP',
                kelas: ['X-1', 'XI-4', 'XII-1', 'XII-2'],
                piket: 'Kamis',
              },
            ]
              .filter(
                (g) =>
                  g.nama.toLowerCase().includes(searchGuru.toLowerCase()) ||
                  g.mapel.toLowerCase().includes(searchGuru.toLowerCase())
              )
              .map((g) => (
                <div
                  key={g.nip}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{g.nama}</h4>
                      <p className="text-xs text-slate-500">{g.mapel} • NIP. {g.nip}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200">
                      {g.beban}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center justify-between border-t border-slate-100 pt-2">
                    <span>Kelas Ampu: <strong className="text-slate-800">{g.kelas.join(', ')}</strong></span>
                    <span>Piket: <strong className="text-slate-800">Hari {g.piket}</strong></span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: JADWAL PIKET */}
      {activeTab === 'piket' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {piketSchedule.map((p) => (
              <div
                key={p.hari}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-black text-slate-900 text-base">Piket Hari {p.hari}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">
                    4 Personil
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Koordinator:</span>
                    <span className="font-bold text-slate-800">{p.koordinator}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Anggota Piket:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {p.anggota.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                    {p.tugasUtama}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
