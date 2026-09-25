import React, { useState } from 'react';
import { Scroll, FileText, Download, CheckCircle, Users, Eye, Search, Award, CheckCircle2, User } from 'lucide-react';
import { SCHOOL_SKS } from '../../data/mockData';
import { SchoolSK, User as CurrentUser, UserRole } from '../../types';

interface SkViewProps {
  onOpenDocument: (title: string, category: string, content?: string) => void;
  currentUser?: CurrentUser | null;
}

export const SkView: React.FC<SkViewProps> = ({ onOpenDocument, currentUser }) => {
  const currentRole: UserRole = currentUser?.role || 'guru';

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activeSk, setActiveSk] = useState<SchoolSK>(SCHOOL_SKS[0]);
  const [signedSks, setSignedSks] = useState<Record<string, boolean>>({
    'sk-01': true,
    'sk-02': true,
    'sk-03': true,
    'sk-04': true,
  });

  const categories = ['Semua', 'TPMPS', 'TPK', 'KP', 'SK KBM'];

  const filtered = SCHOOL_SKS.filter((item) =>
    selectedCategory === 'Semua' ? true : item.category === selectedCategory
  );

  // Check if current user is member of active SK
  const userMemberRecord = activeSk.members.find(
    (m) =>
      m.nip === currentUser?.nip ||
      m.name.toLowerCase().includes(currentUser?.name.toLowerCase().split(',')[0] || 'siti')
  );

  const handleSignSk = (skId: string) => {
    setSignedSks((prev) => ({ ...prev, [skId]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-600 font-semibold text-xs uppercase tracking-wider">
            <Scroll className="w-4 h-4" />
            <span>Dokumen Legalitas & SK Penugasan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {currentRole === 'kepsek'
              ? 'Penetapan & Penandatanganan SK Sekolah'
              : currentRole === 'admin'
              ? 'Kelola SK Kurikulum (TPMPS, TPK, KP, SK KBM)'
              : 'SK TPMPS, TPK, KP, SK KBM GURU & TENDIK'}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Surat Keputusan Kepala SMA Negeri 1 Batangan tentang Penjaminan Mutu & Penugasan Mengajar TA 2024/2025.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 self-start sm:self-center">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === c
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: List of SKs & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SK List Left Column */}
        <div className="space-y-3 lg:col-span-1">
          {filtered.map((sk) => (
            <div
              key={sk.id}
              onClick={() => setActiveSk(sk)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                activeSk.id === sk.id
                  ? 'bg-violet-50/80 border-violet-400 shadow-md ring-1 ring-violet-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                  {sk.category}
                </span>
                <div className="flex items-center gap-1">
                  {signedSks[sk.id] && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                      <Award className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Sah</span>
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-medium">{sk.date}</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mt-2 leading-snug">
                {sk.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">No: {sk.number}</p>
            </div>
          ))}
        </div>

        {/* Selected SK Detail Right Column */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                  Surat Keputusan Resmi SMAN 1 Batangan
                </span>
                {signedSks[activeSk.id] ? (
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Telah Ditetapkan & Sah</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Draf SK
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                {activeSk.title}
              </h3>
              <p className="text-xs font-mono text-slate-600">Nomor: {activeSk.number}</p>
              <p className="text-xs text-slate-500">
                Ditetapkan di Batangan pada tanggal {activeSk.date} oleh Kepala Sekolah: {activeSk.signedBy}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {currentRole === 'kepsek' && !signedSks[activeSk.id] && (
                <button
                  onClick={() => handleSignSk(activeSk.id)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Award className="w-4 h-4" />
                  <span>Sahkan SK (Tanda Tangan Kepsek)</span>
                </button>
              )}

              <button
                onClick={() =>
                  onOpenDocument(
                    activeSk.title,
                    `SK ${activeSk.category}`,
                    `SURAT KEPUTUSAN KEPALA SMA NEGERI 1 BATANGAN\nNOMOR: ${activeSk.number}\n\nTENTANG:\n${activeSk.title.toUpperCase()}\nTAHUN AJARAN 2024/2025\n\nMEMUTUSKAN:\nMenetapkan susunan personalia pengurus dan anggota ${activeSk.category} SMAN 1 Batangan.\n\nRINCIAN TUGAS & SUSUNAN ANGGOTA:\n${activeSk.members
                      .map((m) => `- ${m.role}: ${m.name} (NIP. ${m.nip})`)
                      .join('\n')}\n\nDitetapkan di Batangan\nPada tanggal: ${activeSk.date}\nKepala SMA Negeri 1 Batangan\n\nH. Sudarmanto, M.Pd.`
                  )
                }
                className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Eye className="w-4 h-4" />
                Lihat Naskah SK
              </button>
            </div>
          </div>

          {/* Teacher Assignment Highlight if logged in user is a member */}
          {userMemberRecord && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="font-extrabold text-amber-950">
                    Penugasan Anda: {userMemberRecord.name}
                  </div>
                  <div className="text-amber-800 text-[11px]">
                    Tercantum resmi dalam SK ini dengan penugasan sebagai: <strong className="text-amber-950 font-bold">{userMemberRecord.role}</strong>.
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  onOpenDocument(
                    `Surat Tugas - ${userMemberRecord.name}`,
                    'Surat Tugas Mandiri',
                    `SURAT TUGAS RESMI SMAN 1 BATANGAN\nBerdasarkan SK No: ${activeSk.number}\n\nNama: ${userMemberRecord.name}\nNIP: ${userMemberRecord.nip}\nJabatan / Penugasan: ${userMemberRecord.role}\n\nDitugaskan untuk melaksanakan kewajiban sesuai Surat Keputusan Kepala SMA Negeri 1 Batangan TA 2024/2025.`
                  )
                }
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 shadow-xs"
              >
                Unduh Petikan SK
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Konsiderans & Ringkasan Keputusan:
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {activeSk.summary}
            </p>
          </div>

          {/* Members Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-violet-600" />
                Lampiran Susunan Personalia ({activeSk.members.length} Pejabat/Guru Inti):
              </h4>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3">Jabatan dalam Tim</th>
                    <th className="py-2.5 px-3">Nama Lengkap & Gelar</th>
                    <th className="py-2.5 px-3">NIP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeSk.members.map((m, idx) => {
                    const isCurrentUser =
                      m.nip === currentUser?.nip ||
                      m.name.toLowerCase().includes(currentUser?.name.toLowerCase().split(',')[0] || 'siti');

                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50 ${isCurrentUser ? 'bg-amber-50/60 font-bold' : ''}`}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-violet-900">{m.role}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {m.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                              Anda
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{m.nip}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
