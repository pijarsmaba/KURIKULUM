import React, { useState } from 'react';
import { BookOpen, FileText, Download, CheckCircle, ChevronRight, School, Compass, Target, Users, Sparkles, Eye } from 'lucide-react';
import { SCHOOL_INFO } from '../../data/mockData';

interface KospViewProps {
  onOpenDocument: (title: string, category: string, content?: string) => void;
}

export const KospView: React.FC<KospViewProps> = ({ onOpenDocument }) => {
  const [activeTab, setActiveTab] = useState<'karakteristik' | 'visi-misi' | 'pengorganisasian' | 'bab'>('karakteristik');

  const chapters = [
    {
      no: 'BAB I',
      title: 'Karakteristik Satuan Pendidikan',
      pages: 'Halaman 1 - 24',
      desc: 'Analisis konteks lingkungan pesisir pantai & sentra garam Batangan Kab. Pati, peta sosiokultural siswa, dan kemitraan masyarakat.',
    },
    {
      no: 'BAB II',
      title: 'Visi, Misi, dan Tujuan Satuan Pendidikan',
      pages: 'Halaman 25 - 38',
      desc: 'Rumusan Visi SMABA Berkarakter, Berprestasi, Berwawasan Lingkungan, serta sasaran strategis jangka pendek & menengah.',
    },
    {
      no: 'BAB III',
      title: 'Pengorganisasian Pembelajaran',
      pages: 'Halaman 39 - 82',
      desc: 'Intrakurikuler (Fase E & F), Kokurikuler P5 (3 Tema Utama), Ekstrakurikuler Wajib Pramuka & Pilihan, serta Program Pembiasaan.',
    },
    {
      no: 'BAB IV',
      title: 'Perencanaan Pembelajaran & Asesmen',
      pages: 'Halaman 83 - 120',
      desc: 'Alur Tujuan Pembelajaran (ATP), Modul Ajar berdiferensiasi, Asesmen Diagnostik, Formatif, Sumatif (ASTS, ASAS, ASAT, ASAJ).',
    },
    {
      no: 'BAB V',
      title: 'Pendampingan, Evaluasi, dan Pengembangan Profesional',
      pages: 'Halaman 121 - 145',
      desc: 'Supervisi akademik Kepala Sekolah, Komunitas Belajar (Kombel) SMABA, evaluasi kurikulum berkala per semester.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Kurikulum Merdeka 2024/2025
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              KOSP SMA Negeri 1 Batangan
            </h2>
            <p className="text-blue-100/80 text-sm leading-relaxed">
              Kurikulum Operasional Satuan Pendidikan (KOSP) disusun sebagai panduan operasional pembelajaran yang berpusat pada murid, mengembangkan potensi kearifan lokal Pati, dan mewujudkan Profil Pelajar Pancasila.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-blue-200">
              <span>SK Pengesahan: No. 421.3/219/2024</span>
              <span>•</span>
              <span>Terakreditasi A (Unggul)</span>
              <span>•</span>
              <span>NPSN: 20339023</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() =>
                onOpenDocument(
                  'Dokumen KOSP SMA Negeri 1 Batangan Tahun Ajaran 2024/2025',
                  'KOSP Lengkap',
                  `DOKUMEN KOSP SMA NEGERI 1 BATANGAN\nTahun Ajaran: 2024/2025\n\nBAB I: KARAKTERISTIK SATUAN PENDIDIKAN\nSMA Negeri 1 Batangan terletak di jalur strategis Pantura Pati-Rembang. Karakteristik utama sekolah terletak pada kultur santun, agraris dan pesisir garam, serta komitmen mencetak generasi berprestasi.\n\nBAB II: VISI & MISI\nVisi: Terwujudnya Peserta Didik yang Berakhlak Mulia, Unggul dalam Prestasi, Mandiri, dan Berbudaya Lingkungan.\n\nBAB III: PENGORGANISASIAN PEMBELAJARAN\n- Fase E (Kelas X): 44 JP per minggu (termasuk 10 JP P5)\n- Fase F (Kelas XI & XII): 44 JP per minggu dengan 4 mata pelajaran pilihan peminatan.\n\nBAB IV: RENCANA PEMBELAJARAN & ASESMEN\nBerorientasi pada student-centered learning, pembelajaran berdiferensiasi, asesmen autentik, dan literasi digital sekolah.`
                )
              }
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25"
            >
              <Eye className="w-4 h-4" />
              Preview Dokumen KOSP
            </button>
            <button
              onClick={() =>
                onOpenDocument(
                  'Buku KOSP Resmi SMABA 2024-2025',
                  'Unduh PDF',
                  'Dokumen Master KOSP SMABA Versi Cetak telah disahkan oleh Cabang Dinas Pendidikan Wilayah III Provinsi Jawa Tengah.'
                )
              }
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              Unduh Versi Lengkap (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-sm">
        <button
          onClick={() => setActiveTab('karakteristik')}
          className={`py-2.5 px-4 font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'karakteristik'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Karakteristik SMABA
        </button>
        <button
          onClick={() => setActiveTab('visi-misi')}
          className={`py-2.5 px-4 font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'visi-misi'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Visi, Misi & Tujuan
        </button>
        <button
          onClick={() => setActiveTab('pengorganisasian')}
          className={`py-2.5 px-4 font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'pengorganisasian'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pengorganisasian Belajar
        </button>
        <button
          onClick={() => setActiveTab('bab')}
          className={`py-2.5 px-4 font-semibold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'bab'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Daftar Bab & Lampiran
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'karakteristik' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Kondisi Sosial Geografis</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Terletak di Kecamatan Batangan, Kabupaten Pati bagian timur. Berbatasan langsung dengan pesisir Laut Jawa dan jalur arteri Pantura. Memiliki lingkungan agraris tambak garam, perkebunan mangrove, dan perikanan yang kaya.
            </p>
            <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 font-medium border border-slate-100">
              📍 Keunggulan: Sentra garam nasional & konservasi pesisir Batangan.
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Profil Peserta Didik</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Siswa memiliki latar belakang religius, ulet, dan pekerja keras. Minat tinggi pada sains terapan, kewirausahaan lokal, seni tradisional daerah, olahraga atletik/voli, dan teknologi informasi.
            </p>
            <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 font-medium border border-slate-100">
              👥 Jumlah Siswa: 780+ siswa tersebar di 24 Rombel (X, XI, XII).
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Kekuatan Pendidik & Sarana</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Didukung 54 dewan guru bersertifikasi pendidik dan kualifikasi S1/S2, laboratorium IPA modern, Lab Komputer Multimedia, Perpustakaan terakreditasi, dan lapangan olahraga terpadu.
            </p>
            <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 font-medium border border-slate-100">
              💻 100% KBM tersambung internet pita lebar & platform digital.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'visi-misi' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Visi SMA Negeri 1 Batangan</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 italic">
              "Terwujudnya Generasi yang Berakhlak Mulia, Unggul dalam Prestasi, Mandiri, Berdaya Saing Global, dan Berbudaya Lingkungan"
            </h3>
            <p className="text-xs text-slate-500">Motto: SMABA Mantap, Berprestasi, dan Berkarakter</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                Misi Satuan Pendidikan
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Menanamkan nilai-nilai keimanan, ketaqwaan, dan budi pekerti luhur dalam keseharian sekolah.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Melaksanakan pembelajaran berdiferensiasi yang aktif, inovatif, kreatif, dan menyenangkan.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Mengembangkan bakat, minat, serta potensi akademik dan non-akademik siswa hingga berprestasi di tingkat provinsi/nasional.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Mengoptimalkan integrasi teknologi informasi dalam tata kelola kurikulum dan pembelajaran digital.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Mewujudkan sekolah adiwiyata berbudaya lingkungan bersih, asri, dan berkelanjutan.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Tujuan Strategis Kurikulum
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                  <span>100% siswa lulus dengan kompetensi literasi dan numerasi di atas rata-rata standar nasional.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                  <span>Peningkatan persentase lulusan yang diterima di Perguruan Tinggi Negeri (PTN) melalui SNBP dan SNBT minimal 25% tiap tahun.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                  <span>Terlaksananya 3 projek tema P5 yang menghasilkan portofolio nyata dan pameran karya siswa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</div>
                  <span>Seluruh dewan guru menguasai pemanfaatan media ajar interaktif dan kurikulum digital.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pengorganisasian' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Alur Pengorganisasian Pembelajaran</h3>
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">Tahun Ajaran 2024/2025</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-800">1. Intrakurikuler</span>
              <h4 className="font-bold text-slate-900 text-sm">Pembelajaran Mata Pelajaran</h4>
              <p className="text-xs text-slate-600">
                Fase E memuat 11 mata pelajaran wajib. Fase F memuat mata pelajaran umum dan 4-5 mata pelajaran pilihan peminatan (MIPA/IPS/Bahasa).
              </p>
              <div className="text-xs font-semibold text-blue-700 pt-1">Beban: 34 - 36 JP / Pekan</div>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">2. Kokurikuler (P5)</span>
              <h4 className="font-bold text-slate-900 text-sm">Projek Profil Pelajar Pancasila</h4>
              <p className="text-xs text-slate-600">
                Dilaksanakan sistem blok / reguler dengan tema: Kearifan Lokal (Pesisir & Budaya Pati), Gaya Hidup Berkelanjutan, dan Suara Demokrasi.
              </p>
              <div className="text-xs font-semibold text-emerald-700 pt-1">Beban: 8 - 10 JP / Pekan</div>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-800">3. Ekstrakurikuler</span>
              <h4 className="font-bold text-slate-900 text-sm">Pengembangan Minat & Bakat</h4>
              <p className="text-xs text-slate-600">
                Pramuka wajib, PMR, Paskibra, Karya Ilmiah Remaja (KIR), Rohis/Rokris, Futsal, Voli, Karawitan/Seni Tari, dan English Club SMABA.
              </p>
              <div className="text-xs font-semibold text-purple-700 pt-1">Jadwal: Jumat & Sabtu sore</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bab' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
            <span className="font-bold text-slate-800 text-sm">Sistematika Dokumen KOSP SMABA</span>
            <span className="text-xs text-slate-500">Total 5 Bab + 12 Lampiran Resmi</span>
          </div>
          {chapters.map((chap, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-blue-700 text-xs px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                    {chap.no}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{chap.title}</h4>
                </div>
                <p className="text-xs text-slate-600 max-w-xl">{chap.desc}</p>
                <span className="text-[11px] text-slate-400 font-medium">{chap.pages}</span>
              </div>
              <button
                onClick={() => onOpenDocument(`${chap.no}: ${chap.title}`, 'Bab KOSP', chap.desc)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-center"
              >
                <FileText className="w-3.5 h-3.5" />
                Baca Bab Ini
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
