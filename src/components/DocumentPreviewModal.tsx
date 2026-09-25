import React from 'react';
import { X, Download, Printer, FileText, CheckCircle, ExternalLink, Calendar, User, BookOpen } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category?: string;
  author?: string;
  date?: string;
  fileSize?: string;
  type?: 'kosp' | 'sk' | 'modul' | 'jadwal' | 'dokumen';
  content?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  category = 'Dokumen Kurikulum',
  author = 'SMA Negeri 1 Batangan',
  date = 'Januari 2025',
  fileSize = '2.4 MB',
  type = 'dokumen',
  content,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    // Simulate real file download
    const blob = new Blob([content || `Dokumen Resmi: ${title}\nSatuan Pendidikan: SMA Negeri 1 Batangan\nTahun Ajaran: 2024/2025\nStatus: Terverifikasi oleh Tim Penjamin Mutu`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[/\\?%*:|"<>]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {date}
                </span>
              </div>
              <h3 className="font-bold text-base sm:text-lg text-white line-clamp-1 mt-0.5">
                {title}
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              title="Cetak Dokumen"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              title="Unduh File"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Unduh ({fileSize})</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body / Simulated PDF Reader */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100 flex justify-center">
          <div className="bg-white shadow-md border border-slate-200 rounded-lg w-full max-w-3xl p-8 sm:p-12 text-slate-800 font-sans space-y-6">
            {/* School Header Kop Surat */}
            <div className="border-b-2 border-slate-900 pb-4 text-center relative">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-black text-lg">
                  SMABA
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-wider text-slate-700 uppercase">
                    Pemerintah Provinsi Jawa Tengah
                  </h4>
                  <h3 className="text-xs font-medium text-slate-600 uppercase">
                    Dinas Pendidikan dan Kebudayaan - Cabang Dinas Wilayah III
                  </h3>
                  <h2 className="text-lg font-black text-blue-950 uppercase tracking-wide">
                    SMA NEGERI 1 BATANGAN
                  </h2>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Jl. Raya Juwana - Batangan KM. 5, Batangan, Kab. Pati 59186 | NPSN: 20339023 | Akreditasi: A
              </p>
              <p className="text-xs text-slate-500">
                Laman: https://sman1batangan.sch.id | Pos-el: kurikulum@sman1batangan.sch.id
              </p>
            </div>

            {/* Document Title Banner */}
            <div className="text-center py-3 bg-slate-50 rounded-lg border border-slate-200">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 uppercase tracking-wide">
                {title}
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Tahun Ajaran 2024/2025 • Kurikulum Merdeka • SMAN 1 Batangan
              </p>
            </div>

            {/* Meta info block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-blue-50/60 rounded-lg text-xs border border-blue-100">
              <div>
                <span className="text-slate-500 block">Penyusun / Penanggung Jawab:</span>
                <span className="font-semibold text-slate-800">{author}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status Dokumen:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 inline" /> Terverifikasi
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Tanggal Terbit:</span>
                <span className="font-semibold text-slate-800">{date}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Ukuran File:</span>
                <span className="font-semibold text-slate-800">{fileSize} (PDF)</span>
              </div>
            </div>

            {/* Main Simulated Content */}
            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-4">
              {content ? (
                <div className="whitespace-pre-line text-sm text-slate-700">{content}</div>
              ) : (
                <>
                  <div>
                    <h4 className="font-bold text-slate-900 border-l-4 border-blue-600 pl-2 text-sm uppercase">
                      I. Pendahuluan dan Latar Belakang
                    </h4>
                    <p className="mt-2 text-sm text-justify">
                      Dokumen kurikulum ini dirancang dan disusun secara kolaboratif oleh Tim Pengembang Kurikulum serta Dewan Guru SMA Negeri 1 Batangan. Penyusunan berpedoman pada Keputusan Kepala BSKAP Kemendikbudristek tentang Standar Capaian Pembelajaran, panduan pengembangan KOSP, serta memperhatikan potensi kearifan lokal wilayah pesisir timur Kabupaten Pati.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 border-l-4 border-blue-600 pl-2 text-sm uppercase">
                      II. Karakteristik & Sasaran Profil Pelajar Pancasila
                    </h4>
                    <p className="mt-2 text-sm text-justify">
                      Implementasi pembelajaran di SMA Negeri 1 Batangan menitikberatkan pada pengembangan nalar kritis, kemandirian, dan gotong royong dengan memanfaatkan konteks sosial budaya lingkungan garam, tambak, maritim, dan agraris Batangan sebagai laboratorium kontekstual pembelajaran nyata.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 border-l-4 border-blue-600 pl-2 text-sm uppercase">
                      III. Rencana Pelaksanaan & Asesmen
                    </h4>
                    <p className="mt-2 text-sm text-justify">
                      Rancangan pembelajaran mencakup asesmen diagnostik, asesmen formatif berkala selama proses belajar mengajar (KBM), serta asesmen sumatif yang mengukur ketercapaian tujuan pembelajaran secara komprehensif, autentik, dan berkeadilan.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Validation Signature Block */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-700">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold">Waka Kurikulum SMAN 1 Batangan</p>
                <div className="h-14 flex items-center text-slate-400 italic text-[11px]">
                  [Tanda Tangan & Cap Digital]
                </div>
                <p className="font-bold underline text-slate-900">Supriyanto, S.Pd., M.Si.</p>
                <p>NIP. 197804152006041012</p>
              </div>

              <div className="text-right">
                <p>Batangan, {date}</p>
                <p className="font-bold">Kepala SMA Negeri 1 Batangan</p>
                <div className="h-14 flex items-center justify-end text-slate-400 italic text-[11px]">
                  [Tanda Tangan & Cap Sekolah]
                </div>
                <p className="font-bold underline text-slate-900">H. Sudarmanto, M.Pd.</p>
                <p>NIP. 196803201995121002</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Dokumen Resmi Terverifikasi SMAN 1 Batangan - Kurikulum Merdeka</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Dokumen Asli
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
