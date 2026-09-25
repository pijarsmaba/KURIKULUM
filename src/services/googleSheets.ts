import { TeacherProgress, PerangkatItem } from '../types';

export interface SpreadsheetInfo {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheets: string[];
}

/**
 * Creates a brand new Google Spreadsheet in the user's Google Drive
 * pre-populated with PIJAR SMABA Curriculum sheets
 */
export async function createPijarSpreadsheet(
  accessToken: string,
  title: string = 'PIJAR SMABA - Portal Kurikulum Terpadu'
): Promise<SpreadsheetInfo> {
  const payload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Rekap_Data_Guru',
          gridProperties: { rowCount: 100, columnCount: 10 },
        },
      },
      {
        properties: {
          title: 'Perangkat_Ajar',
          gridProperties: { rowCount: 200, columnCount: 10 },
        },
      },
      {
        properties: {
          title: 'Informasi_Sekolah',
          gridProperties: { rowCount: 50, columnCount: 5 },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal membuat Google Spreadsheet (HTTP ${response.status})`
    );
  }

  const data = await response.json();

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || title,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    sheets: data.sheets?.map((s: any) => s.properties?.title) || [],
  };
}

/**
 * Sync / Write Teacher Progress Data into Google Sheets
 */
export async function syncTeachersToSheet(
  accessToken: string,
  spreadsheetId: string,
  teachers: TeacherProgress[]
): Promise<void> {
  const header = [
    'No',
    'Nama Lengkap Guru',
    'NIP',
    'Mata Pelajaran',
    'Kelas / Rombel',
    'Beban JP',
    'CP',
    'ATP',
    'Modul Ajar',
    'Prota & Promes',
    'Asesmen',
    'Persentase Kelengkapan',
    'Status Kepatuhan',
  ];

  const rows = teachers.map((t, idx) => [
    idx + 1,
    t.name,
    `'${t.nip}`, // Prefix with single quote to preserve leading zeros in Sheets
    t.subject,
    t.classAssigned.join(', '),
    `${t.totalTeachingHours} JP`,
    t.checklist.cp ? 'LENGKAP' : 'BELUM',
    t.checklist.atp ? 'LENGKAP' : 'BELUM',
    t.checklist.modulAjar ? 'LENGKAP' : 'BELUM',
    t.checklist.protaPromes ? 'LENGKAP' : 'BELUM',
    t.checklist.asesmen ? 'LENGKAP' : 'BELUM',
    `${t.completionPercentage}%`,
    t.status,
  ]);

  const values = [header, ...rows];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Rekap_Data_Guru!A1?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'Rekap_Data_Guru!A1',
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal menyimpan data guru ke Google Sheets (HTTP ${response.status})`
    );
  }
}

/**
 * Sync / Write Teaching Devices (Perangkat Ajar) into Google Sheets
 */
export async function syncPerangkatToSheet(
  accessToken: string,
  spreadsheetId: string,
  items: PerangkatItem[]
): Promise<void> {
  const header = [
    'ID Dokumen',
    'Judul Perangkat Ajar',
    'Mata Pelajaran',
    'Fase',
    'Kelas',
    'Jenis Dokumen',
    'Nama Guru Pengampu',
    'NIP',
    'Ukuran File',
    'Format',
    'Tanggal Unggah',
    'Status Validasi',
  ];

  const rows = items.map((item) => [
    item.id,
    item.title,
    item.subject,
    item.phase,
    `Kelas ${item.grade}`,
    item.category,
    item.teacherName,
    `'${item.teacherNip}`,
    item.fileSize,
    item.fileType.toUpperCase(),
    item.uploadDate,
    item.status,
  ]);

  const values = [header, ...rows];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Perangkat_Ajar!A1?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'Perangkat_Ajar!A1',
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal menulis perangkat ajar ke Google Sheets (HTTP ${response.status})`
    );
  }
}

/**
 * Fetch spreadsheet metadata to check if spreadsheetId is valid
 */
export async function getSpreadsheetDetails(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetInfo> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Spreadsheet tidak ditemukan atau tidak memiliki izin akses (HTTP ${response.status})`
    );
  }

  const data = await response.json();

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Spreadsheet Tanpa Judul',
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    sheets: data.sheets?.map((s: any) => s.properties?.title) || [],
  };
}

/**
 * Read raw values from a range
 */
export async function readSheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Gagal membaca range ${range}`);
  }

  const data = await response.json();
  return data.values || [];
}
