import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  Link,
  ShieldCheck,
  UserCheck,
  LogOut,
  Sparkles
} from 'lucide-react';
import { signInWithGoogle, logoutGoogle } from '../services/googleAuth';
import {
  createPijarSpreadsheet,
  syncTeachersToSheet,
  syncPerangkatToSheet,
  getSpreadsheetDetails,
  SpreadsheetInfo,
} from '../services/googleSheets';
import { TeacherProgress, PerangkatItem } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: FirebaseUser | null;
  googleToken: string | null;
  onGoogleAuthSuccess: (user: FirebaseUser, token: string) => void;
  onGoogleLogout: () => void;
  teachersData: TeacherProgress[];
  perangkatData: PerangkatItem[];
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  googleToken,
  onGoogleAuthSuccess,
  onGoogleLogout,
  teachersData,
  perangkatData,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeSpreadsheet, setActiveSpreadsheet] = useState<SpreadsheetInfo | null>(() => {
    const saved = localStorage.getItem('pijar_smaba_active_sheet');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [inputSheetId, setInputSheetId] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res) {
        onGoogleAuthSuccess(res.user, res.accessToken);
        setStatusMessage({
          type: 'success',
          text: `Berhasil terhubung dengan Google Account: ${res.user.email}`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal masuk dengan Google. Pastikan popup tidak diblokir browser.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    onGoogleLogout();
    setStatusMessage({ type: 'success', text: 'Telah keluar dari akun Google.' });
  };

  const handleCreateNewSheet = async () => {
    if (!googleToken) {
      setStatusMessage({ type: 'error', text: 'Silakan masuk dengan akun Google terlebih dahulu.' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Buat Spreadsheet Baru di Google Drive?',
      description:
        'Aplikasi akan membuat spreadsheet baru bernama "PIJAR SMABA - Portal Kurikulum Terpadu" di Google Drive akun Anda lengkap dengan sheet data guru dan perangkat ajar.',
      onConfirm: async () => {
        setConfirmDialog(null);
        setLoadingAction('create');
        setStatusMessage(null);
        try {
          const sheet = await createPijarSpreadsheet(googleToken);
          setActiveSpreadsheet(sheet);
          localStorage.setItem('pijar_smaba_active_sheet', JSON.stringify(sheet));

          // Auto sync both data
          await syncTeachersToSheet(googleToken, sheet.spreadsheetId, teachersData);
          await syncPerangkatToSheet(googleToken, sheet.spreadsheetId, perangkatData);

          setStatusMessage({
            type: 'success',
            text: `Spreadsheet baru berhasil dibuat dan disinkronkan dengan data PIJAR SMABA!`,
          });
        } catch (err: any) {
          console.error(err);
          setStatusMessage({
            type: 'error',
            text: err.message || 'Gagal membuat Google Spreadsheet baru.',
          });
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };

  const handleConnectExisting = async () => {
    if (!googleToken) {
      setStatusMessage({ type: 'error', text: 'Silakan masuk dengan Google terlebih dahulu.' });
      return;
    }
    if (!inputSheetId.trim()) {
      setStatusMessage({ type: 'error', text: 'Masukkan Google Spreadsheet ID atau URL yang valid.' });
      return;
    }

    // Extract ID if full URL pasted
    let cleanId = inputSheetId.trim();
    const urlMatch = cleanId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch) {
      cleanId = urlMatch[1];
    }

    setLoadingAction('connect');
    setStatusMessage(null);
    try {
      const details = await getSpreadsheetDetails(googleToken, cleanId);
      setActiveSpreadsheet(details);
      localStorage.setItem('pijar_smaba_active_sheet', JSON.stringify(details));
      setInputSheetId('');
      setStatusMessage({
        type: 'success',
        text: `Berhasil terhubung ke spreadsheet: "${details.title}"`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menghubungkan spreadsheet. Periksa ID dan izin akses.',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSyncTeachers = () => {
    if (!googleToken || !activeSpreadsheet) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Sinkronkan Data Guru ke Google Sheets?',
      description: `Tindakan ini akan memperbarui dan menimpa isi lembar kerja "Rekap_Data_Guru" di spreadsheet "${activeSpreadsheet.title}" dengan data terbaru dari 54 dewan guru SMAN 1 Batangan.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setLoadingAction('sync-teachers');
        setStatusMessage(null);
        try {
          await syncTeachersToSheet(googleToken, activeSpreadsheet.spreadsheetId, teachersData);
          setStatusMessage({
            type: 'success',
            text: `Data rekapitulasi ${teachersData.length} guru berhasil disinkronkan ke Google Sheets!`,
          });
        } catch (err: any) {
          console.error(err);
          setStatusMessage({
            type: 'error',
            text: err.message || 'Gagal sinkronisasi data guru.',
          });
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };

  const handleSyncPerangkat = () => {
    if (!googleToken || !activeSpreadsheet) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Sinkronkan Perangkat Ajar ke Google Sheets?',
      description: `Tindakan ini akan memperbarui dan menimpa isi lembar kerja "Perangkat_Ajar" di spreadsheet "${activeSpreadsheet.title}" dengan seluruh dokumen perangkat ajar terdaftar.`,
      onConfirm: async () => {
        setConfirmDialog(null);
        setLoadingAction('sync-perangkat');
        setStatusMessage(null);
        try {
          await syncPerangkatToSheet(googleToken, activeSpreadsheet.spreadsheetId, perangkatData);
          setStatusMessage({
            type: 'success',
            text: `Daftar ${perangkatData.length} perangkat ajar berhasil disinkronkan ke Google Sheets!`,
          });
        } catch (err: any) {
          console.error(err);
          setStatusMessage({
            type: 'error',
            text: err.message || 'Gagal sinkronisasi perangkat ajar.',
          });
        } finally {
          setLoadingAction(null);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl">
                Integrasi Google Sheets • PIJAR SMABA
              </h3>
              <p className="text-xs text-emerald-200">
                Pusat Informasi dan Jaringan Belajar SMAN 1 Batangan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Section 1: Google Account Connection */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              1. Status Autentikasi Google Workspace:
            </span>

            {googleUser && googleToken ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                    {googleUser.displayName?.charAt(0) || 'G'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{googleUser.displayName || 'Akun Google'}</div>
                    <div className="text-xs text-slate-500">{googleUser.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Terotorisasi Sheets
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors text-xs flex items-center gap-1"
                    title="Keluar dari Google"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  Hubungkan akun Google Anda untuk membaca dan menulis berkas kurikulum ke Google Sheets secara otomatis.
                </p>

                {/* Official Material Google Sign-in button */}
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-xs text-xs sm:text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors shrink-0 gap-2.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Active Spreadsheet */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              2. Google Spreadsheet Aktif:
            </span>

            {activeSpreadsheet ? (
              <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      {activeSpreadsheet.title}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      ID: {activeSpreadsheet.spreadsheetId}
                    </p>
                  </div>
                  <a
                    href={activeSpreadsheet.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <span>Buka di Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 font-semibold">Lembar Terdaftar:</span>
                  {activeSpreadsheet.sheets.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Sync Action Buttons */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleSyncTeachers}
                    disabled={loadingAction !== null}
                    className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'sync-teachers' ? 'animate-spin' : ''}`} />
                    <span>Sinkron Data Guru ({teachersData.length})</span>
                  </button>

                  <button
                    onClick={handleSyncPerangkat}
                    disabled={loadingAction !== null}
                    className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingAction === 'sync-perangkat' ? 'animate-spin' : ''}`} />
                    <span>Sinkron Perangkat Ajar ({perangkatData.length})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                  <p className="text-xs text-slate-600 font-medium">
                    Belum ada spreadsheet kurikulum yang dihubungkan. Anda dapat membuat file baru atau memasukkan ID file yang sudah ada.
                  </p>

                  <button
                    onClick={handleCreateNewSheet}
                    disabled={!googleToken || loadingAction !== null}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-all ${
                      googleToken
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{loadingAction === 'create' ? 'Membuat Spreadsheet...' : 'Buat Google Spreadsheet PIJAR Baru'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputSheetId}
                    onChange={(e) => setInputSheetId(e.target.value)}
                    placeholder="Atau tempel URL / ID Spreadsheet Google yang sudah ada..."
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleConnectExisting}
                    disabled={!googleToken || loadingAction !== null}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    {loadingAction === 'connect' ? 'Memeriksa...' : 'Hubungkan'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Google Sheets API v4 • Terlindungi OAuth 2.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Destructive / Mutating operations (Workspace Skill Mandate) */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h4 className="font-extrabold text-slate-900 text-base">{confirmDialog.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{confirmDialog.description}</p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold"
              >
                Batalkan
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Konfirmasi & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
