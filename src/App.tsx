import React, { useState, useEffect } from 'react';
import {
  MenuKey,
  User as CurrentUser,
  PerangkatItem,
  UserRole,
  LoginPageConfig,
  Announcement,
  AcademicSettings,
  ScheduleItem,
  PiketItem,
  KaldikEvent,
  RmeRow,
  MapelStruktur,
  SchoolSK,
  TeacherProgress,
  KospDocumentInfo,
  KospChapter
} from './types';
import {
  DEFAULT_LOGIN_PAGE_CONFIG,
  DEFAULT_ACADEMIC_SETTINGS,
  INITIAL_ANNOUNCEMENTS,
  DEMO_USERS,
  INITIAL_PERANGKAT,
  TEACHER_PROGRESS_DATA,
  INITIAL_SCHEDULES,
  INITIAL_PIKET,
  INITIAL_KALDIK_EVENTS,
  INITIAL_RME_DATA,
  INITIAL_STRUKTUR_DATA,
  SCHOOL_SKS,
  INITIAL_KOSP_DOCUMENT
} from './data/mockData';
import { HomeMenuCard } from './components/HomeMenuCard';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { initGoogleAuth } from './services/googleAuth';
import { User as FirebaseUser } from 'firebase/auth';

// Views
import { KospView } from './components/views/KospView';
import { StrukturKurikulumView } from './components/views/StrukturKurikulumView';
import { KaldikView } from './components/views/KaldikView';
import { JadwalView } from './components/views/JadwalView';
import { UraianKegiatanView } from './components/views/UraianKegiatanView';
import { SkView } from './components/views/SkView';
import { PerangkatAjarView } from './components/views/PerangkatAjarView';
import { DataGuruView } from './components/views/DataGuruView';
import { SitusKurikulumView } from './components/views/SitusKurikulumView';
import { AdminView } from './components/views/AdminView';

export default function App() {
  const [currentMenu, setCurrentMenu] = useState<MenuKey | null>(null);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);

  // Persistent User Management Database
  const [usersList, setUsersList] = useState<CurrentUser[]>(() => {
    const saved = localStorage.getItem('smaba_users_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_USERS;
      }
    }
    return DEMO_USERS;
  });

  // Current active authenticated user session (Requires Login with Username & Password)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const savedAuth = localStorage.getItem('smaba_auth_user');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        // Verify user still exists in current user list
        const existing = usersList.find((u) => u.id === parsed.id || u.username === parsed.username);
        return existing || parsed;
      } catch (e) {
        return null;
      }
    }
    return null; // Not logged in by default, user must enter username & password
  });

  // If no user is logged in, show Login Page first!
  const [isLoginPage, setIsLoginPage] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('smaba_auth_user');
    return !savedAuth;
  });

  // Persistent Login Page Customization Config (with uploaded logos and custom text)
  const [loginConfig, setLoginConfig] = useState<LoginPageConfig>(() => {
    const saved = localStorage.getItem('smaba_login_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_LOGIN_PAGE_CONFIG;
      }
    }
    return DEFAULT_LOGIN_PAGE_CONFIG;
  });

  // Persistent Academic Settings (Konfigurasi Kurikulum)
  const [academicSettings, setAcademicSettings] = useState<AcademicSettings>(() => {
    const saved = localStorage.getItem('smaba_academic_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ACADEMIC_SETTINGS;
      }
    }
    return DEFAULT_ACADEMIC_SETTINGS;
  });

  // Persistent Announcements (Siaran Pengumuman)
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('smaba_announcements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ANNOUNCEMENTS;
      }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  const [perangkatList, setPerangkatList] = useState<PerangkatItem[]>(() => {
    const saved = localStorage.getItem('smaba_perangkat_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PERANGKAT;
      }
    }
    return INITIAL_PERANGKAT;
  });

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    category?: string;
    content?: string;
  }>({
    isOpen: false,
    title: '',
    category: '',
    content: '',
  });

  // Initialize Firebase Auth listener for Google Sheets OAuth
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem('smaba_perangkat_list', JSON.stringify(perangkatList));
  }, [perangkatList]);

  useEffect(() => {
    localStorage.setItem('smaba_users_list', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    try {
      localStorage.setItem('smaba_login_config', JSON.stringify(loginConfig));
    } catch (e) {
      console.warn('Error saving login config to storage:', e);
    }
  }, [loginConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('smaba_academic_settings', JSON.stringify(academicSettings));
    } catch (e) {
      console.warn('Error saving academic settings to storage:', e);
    }
  }, [academicSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('smaba_announcements', JSON.stringify(announcements));
    } catch (e) {
      console.warn('Error saving announcements to storage:', e);
    }
  }, [announcements]);

  // Persistent Schedules & Piket
  const [schedulesList, setSchedulesList] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('smaba_schedules_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_SCHEDULES; }
    }
    return INITIAL_SCHEDULES;
  });

  const [piketList, setPiketList] = useState<PiketItem[]>(() => {
    const saved = localStorage.getItem('smaba_piket_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_PIKET; }
    }
    return INITIAL_PIKET;
  });

  // Persistent Kaldik & RME
  const [kaldikEventsList, setKaldikEventsList] = useState<KaldikEvent[]>(() => {
    const saved = localStorage.getItem('smaba_kaldik_events');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_KALDIK_EVENTS; }
    }
    return INITIAL_KALDIK_EVENTS;
  });

  const [rmeList, setRmeList] = useState<RmeRow[]>(() => {
    const saved = localStorage.getItem('smaba_rme_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_RME_DATA; }
    }
    return INITIAL_RME_DATA;
  });

  // Persistent Struktur Kurikulum
  const [strukturList, setStrukturList] = useState<MapelStruktur[]>(() => {
    const saved = localStorage.getItem('smaba_struktur_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_STRUKTUR_DATA; }
    }
    return INITIAL_STRUKTUR_DATA;
  });

  // Persistent School SK
  const [skList, setSkList] = useState<SchoolSK[]>(() => {
    const saved = localStorage.getItem('smaba_sk_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return SCHOOL_SKS; }
    }
    return SCHOOL_SKS;
  });

  // Persistent Teacher Progress Data
  const [teachersProgressList, setTeachersProgressList] = useState<TeacherProgress[]>(() => {
    const saved = localStorage.getItem('smaba_teachers_progress');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return TEACHER_PROGRESS_DATA; }
    }
    return TEACHER_PROGRESS_DATA;
  });

  // Persistent KOSP Document & Chapters
  const [kospData, setKospData] = useState<KospDocumentInfo>(() => {
    const saved = localStorage.getItem('smaba_kosp_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_KOSP_DOCUMENT; }
    }
    return INITIAL_KOSP_DOCUMENT;
  });

  useEffect(() => {
    localStorage.setItem('smaba_schedules_list', JSON.stringify(schedulesList));
  }, [schedulesList]);

  useEffect(() => {
    localStorage.setItem('smaba_piket_list', JSON.stringify(piketList));
  }, [piketList]);

  useEffect(() => {
    localStorage.setItem('smaba_kaldik_events', JSON.stringify(kaldikEventsList));
  }, [kaldikEventsList]);

  useEffect(() => {
    localStorage.setItem('smaba_rme_list', JSON.stringify(rmeList));
  }, [rmeList]);

  useEffect(() => {
    localStorage.setItem('smaba_struktur_list', JSON.stringify(strukturList));
  }, [strukturList]);

  useEffect(() => {
    localStorage.setItem('smaba_sk_list', JSON.stringify(skList));
  }, [skList]);

  useEffect(() => {
    localStorage.setItem('smaba_teachers_progress', JSON.stringify(teachersProgressList));
  }, [teachersProgressList]);

  useEffect(() => {
    localStorage.setItem('smaba_kosp_data', JSON.stringify(kospData));
  }, [kospData]);

  // User Management Handlers (Admin)
  const handleAddUser = (newUser: CurrentUser) => {
    setUsersList((prev) => {
      const updated = [newUser, ...prev];
      try {
        localStorage.setItem('smaba_users_list', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving users to storage:', e);
      }
      return updated;
    });
  };

  // Bulk Add / Import from Excel
  const handleBulkAddUsers = (newUsers: CurrentUser[], replaceAll?: boolean) => {
    setUsersList((prev) => {
      let updated: CurrentUser[];
      if (replaceAll) {
        updated = newUsers;
      } else {
        const updatedMap = new Map<string, CurrentUser>();
        prev.forEach((u) => {
          const key = u.username?.toLowerCase() || u.nip || u.id;
          updatedMap.set(key, u);
        });
        newUsers.forEach((nu) => {
          const key = nu.username?.toLowerCase() || nu.nip || nu.id;
          updatedMap.set(key, nu);
        });
        updated = Array.from(updatedMap.values());
      }
      try {
        localStorage.setItem('smaba_users_list', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving users to storage:', e);
      }
      return updated;
    });
  };

  const handleUpdateUser = (updatedUser: CurrentUser) => {
    setUsersList((prev) => {
      const updated = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      try {
        localStorage.setItem('smaba_users_list', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving users to storage:', e);
      }
      return updated;
    });
    // If the currently logged in user was modified, sync session
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('smaba_auth_user', JSON.stringify(updatedUser));
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsersList((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      try {
        localStorage.setItem('smaba_users_list', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving users to storage:', e);
      }
      return updated;
    });
    if (currentUser?.id === userId) {
      handleLogout();
    }
  };

  const handleUpdateLoginConfig = (newConfig: LoginPageConfig) => {
    setLoginConfig(newConfig);
    try {
      localStorage.setItem('smaba_login_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Error saving login config to storage:', e);
    }
  };

  const handleUpdateAcademicSettings = (newSettings: AcademicSettings) => {
    setAcademicSettings(newSettings);
    try {
      localStorage.setItem('smaba_academic_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Error saving academic settings to storage:', e);
    }
  };

  const handleAddAnnouncement = (newAnc: Announcement) => {
    setAnnouncements((prev) => {
      const updated = [newAnc, ...prev];
      try {
        localStorage.setItem('smaba_announcements', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving announcements to storage:', e);
      }
      return updated;
    });
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem('smaba_announcements', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving announcements to storage:', e);
      }
      return updated;
    });
  };

  const handleAddNewPerangkat = (newItem: PerangkatItem) => {
    setPerangkatList((prev) => [newItem, ...prev]);
  };

  const handleUpdatePerangkat = (updated: PerangkatItem) => {
    setPerangkatList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePerangkat = (id: string) => {
    setPerangkatList((prev) => prev.filter((p) => p.id !== id));
  };

  // Schedule & Piket Handlers
  const handleAddSchedule = (item: ScheduleItem) => {
    setSchedulesList((prev) => [item, ...prev]);
  };

  const handleUpdateSchedule = (item: ScheduleItem) => {
    setSchedulesList((prev) => prev.map((s) => (s.id === item.id ? item : s)));
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedulesList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleBulkAddSchedules = (items: ScheduleItem[], replaceMode?: boolean) => {
    if (replaceMode) {
      setSchedulesList(items);
    } else {
      setSchedulesList((prev) => [...items, ...prev]);
    }
  };

  const handleAddPiket = (item: PiketItem) => {
    setPiketList((prev) => [item, ...prev]);
  };

  const handleUpdatePiket = (item: PiketItem) => {
    setPiketList((prev) => prev.map((p) => (p.id === item.id ? item : p)));
  };

  const handleDeletePiket = (id: string) => {
    setPiketList((prev) => prev.filter((p) => p.id !== id));
  };

  // Kaldik & RME Handlers
  const handleAddKaldikEvent = (event: KaldikEvent) => {
    setKaldikEventsList((prev) => [event, ...prev]);
  };

  const handleUpdateKaldikEvent = (event: KaldikEvent) => {
    setKaldikEventsList((prev) => prev.map((e) => (e.id === event.id ? event : e)));
  };

  const handleDeleteKaldikEvent = (id: string) => {
    setKaldikEventsList((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddRmeRow = (row: RmeRow) => {
    setRmeList((prev) => [...prev, row]);
  };

  const handleUpdateRmeRow = (row: RmeRow) => {
    setRmeList((prev) => prev.map((r) => (r.id === row.id ? row : r)));
  };

  const handleDeleteRmeRow = (id: string) => {
    setRmeList((prev) => prev.filter((r) => r.id !== id));
  };

  // Struktur Kurikulum Handlers
  const handleAddMapelStruktur = (item: MapelStruktur) => {
    setStrukturList((prev) => [...prev, item]);
  };

  const handleUpdateMapelStruktur = (item: MapelStruktur) => {
    setStrukturList((prev) => prev.map((s) => (s.id === item.id ? item : s)));
  };

  const handleDeleteMapelStruktur = (id: string) => {
    setStrukturList((prev) => prev.filter((s) => s.id !== id));
  };

  // SK Kurikulum Handlers
  const handleAddSk = (sk: SchoolSK) => {
    setSkList((prev) => [sk, ...prev]);
  };

  const handleUpdateSk = (sk: SchoolSK) => {
    setSkList((prev) => prev.map((s) => (s.id === sk.id ? sk : s)));
  };

  const handleDeleteSk = (id: string) => {
    setSkList((prev) => prev.filter((s) => s.id !== id));
  };

  // Teacher Progress Handlers
  const handleAddTeacherProgress = (item: TeacherProgress) => {
    setTeachersProgressList((prev) => [item, ...prev]);
  };

  const handleUpdateTeacherProgress = (item: TeacherProgress) => {
    setTeachersProgressList((prev) => prev.map((t) => (t.id === item.id ? item : t)));
  };

  const handleDeleteTeacherProgress = (id: string) => {
    setTeachersProgressList((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTeacherChecklist = (
    teacherId: string,
    itemKey: keyof TeacherProgress['checklist']
  ) => {
    setTeachersProgressList((prev) =>
      prev.map((t) => {
        if (t.id === teacherId) {
          const updatedChecklist = {
            ...t.checklist,
            [itemKey]: !t.checklist[itemKey],
          };
          const total = Object.keys(updatedChecklist).length;
          const completed = Object.values(updatedChecklist).filter(Boolean).length;
          const percentage = Math.round((completed / total) * 100);
          let status: 'Lengkap' | 'Proses' | 'Belum' = 'Proses';
          if (percentage === 100) status = 'Lengkap';
          else if (percentage === 0) status = 'Belum';

          return {
            ...t,
            checklist: updatedChecklist,
            percentage,
            status,
            lastUpdated: 'Baru saja',
          };
        }
        return t;
      })
    );
  };

  // KOSP Handlers
  const handleUpdateKospDocument = (info: KospDocumentInfo) => {
    setKospData(info);
  };

  const handleAddKospChapter = (chapter: KospChapter) => {
    setKospData((prev) => ({
      ...prev,
      chapters: [...prev.chapters, chapter],
    }));
  };

  const handleUpdateKospChapter = (chapter: KospChapter) => {
    setKospData((prev) => ({
      ...prev,
      chapters: prev.chapters.map((c) => (c.id === chapter.id ? chapter : c)),
    }));
  };

  const handleDeleteKospChapter = (id: string) => {
    setKospData((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((c) => c.id !== id),
    }));
  };

  const handleUpdatePerangkatStatus = (
    id: string,
    status: 'Disetujui' | 'Perlu Revisi',
    revisionNotes?: string
  ) => {
    setPerangkatList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              revisionNotes: revisionNotes !== undefined ? revisionNotes : item.revisionNotes,
            }
          : item
      )
    );
  };

  const handleSignByPrincipal = (id: string, notes?: string) => {
    const today = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    setPerangkatList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Disetujui',
              signedByPrincipal: true,
              signedDate: today,
              revisionNotes: notes ? `Supervisi Klinis Kepsek: ${notes}` : item.revisionNotes,
            }
          : item
      )
    );
  };

  const handleOpenDocument = (title: string, category: string, content?: string) => {
    setPreviewModal({
      isOpen: true,
      title,
      category,
      content,
    });
  };

  const handleCloseDocument = () => {
    setPreviewModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Authentication Handlers
  const handleLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem('smaba_auth_user', JSON.stringify(user));
    setIsLoginPage(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('smaba_auth_user');
    setIsLoginPage(true);
  };

  const handleSwitchToAdmin = () => {
    const adminUser = usersList.find((u) => u.role === 'admin') || DEMO_USERS[1];
    setCurrentUser(adminUser);
    localStorage.setItem('smaba_auth_user', JSON.stringify(adminUser));
  };

  const handleSwitchUserRole = (role: UserRole) => {
    const found = usersList.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('smaba_auth_user', JSON.stringify(found));
    } else {
      setIsLoginPage(true);
    }
  };

  const handleGoogleAuthSuccess = (user: FirebaseUser, token: string) => {
    setGoogleUser(user);
    setGoogleToken(token);
  };

  const handleGoogleLogout = () => {
    setGoogleUser(null);
    setGoogleToken(null);
  };

  // If Login Page is Active (Required to enter with Username & Password)
  if (isLoginPage) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBackToHome={() => setIsLoginPage(false)}
        onGoogleAuthSuccess={handleGoogleAuthSuccess}
        usersList={usersList}
        loginConfig={loginConfig}
        onUpdateLoginConfig={handleUpdateLoginConfig}
      />
    );
  }

  // If Home Menu Card is Active (Default when no menu selected)
  if (currentMenu === null) {
    return (
      <>
        <HomeMenuCard
          onSelectMenu={(key) => setCurrentMenu(key)}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginPage(true)}
          onLogout={handleLogout}
          googleUser={googleUser}
          onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          onSwitchUserRole={handleSwitchUserRole}
          onSelectDemoUser={(user) => {
            setCurrentUser(user);
            localStorage.setItem('smaba_auth_user', JSON.stringify(user));
          }}
          academicSettings={academicSettings}
          announcements={announcements}
        />

        <DocumentPreviewModal
          isOpen={previewModal.isOpen}
          onClose={handleCloseDocument}
          title={previewModal.title}
          category={previewModal.category}
          content={previewModal.content}
        />

        <GoogleSheetsSyncModal
          isOpen={isSheetsModalOpen}
          onClose={() => setIsSheetsModalOpen(false)}
          googleUser={googleUser}
          googleToken={googleToken}
          onGoogleAuthSuccess={handleGoogleAuthSuccess}
          onGoogleLogout={handleGoogleLogout}
          teachersData={TEACHER_PROGRESS_DATA}
          perangkatData={perangkatList}
        />
      </>
    );
  }

  // When a menu is clicked, show dedicated view with navbar
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentMenu={currentMenu}
        onGoHome={() => setCurrentMenu(null)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginPage(true)}
        onLogout={handleLogout}
        googleUser={googleUser}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onSwitchUserRole={handleSwitchUserRole}
        academicSettings={academicSettings}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentMenu === 'kosp' && (
          <KospView
            onOpenDocument={handleOpenDocument}
            academicSettings={academicSettings}
            kospData={kospData}
          />
        )}

        {currentMenu === 'struktur' && (
          <StrukturKurikulumView
            academicSettings={academicSettings}
            strukturList={strukturList}
          />
        )}

        {currentMenu === 'kaldik' && (
          <KaldikView
            academicSettings={academicSettings}
            eventsList={kaldikEventsList}
            rmeList={rmeList}
          />
        )}

        {currentMenu === 'jadwal' && (
          <JadwalView
            currentUser={currentUser}
            academicSettings={academicSettings}
            schedulesList={schedulesList}
            piketList={piketList}
          />
        )}

        {currentMenu === 'uraian' && <UraianKegiatanView academicSettings={academicSettings} />}

        {currentMenu === 'sk' && (
          <SkView
            onOpenDocument={handleOpenDocument}
            currentUser={currentUser}
            academicSettings={academicSettings}
            skList={skList}
          />
        )}

        {currentMenu === 'perangkat' && (
          <PerangkatAjarView
            currentUser={currentUser}
            items={perangkatList}
            onAddNewItem={handleAddNewPerangkat}
            onOpenDocument={handleOpenDocument}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onUpdatePerangkatStatus={handleUpdatePerangkatStatus}
            onSignByPrincipal={handleSignByPrincipal}
            academicSettings={academicSettings}
          />
        )}

        {currentMenu === 'data-guru' && (
          <DataGuruView
            currentUser={currentUser}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onNavigateToPerangkat={() => setCurrentMenu('perangkat')}
            academicSettings={academicSettings}
            teachersData={teachersProgressList}
            onToggleChecklist={handleToggleTeacherChecklist}
          />
        )}

        {currentMenu === 'situs' && <SitusKurikulumView academicSettings={academicSettings} />}

        {currentMenu === 'admin' && (
          <AdminView
            currentUser={currentUser}
            onSwitchToAdmin={handleSwitchToAdmin}
            perangkatList={perangkatList}
            onAddPerangkat={handleAddNewPerangkat}
            onUpdatePerangkat={handleUpdatePerangkat}
            onDeletePerangkat={handleDeletePerangkat}
            onUpdatePerangkatStatus={handleUpdatePerangkatStatus}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onSignByPrincipal={handleSignByPrincipal}
            onOpenDocument={handleOpenDocument}
            usersList={usersList}
            onAddUser={handleAddUser}
            onBulkAddUsers={handleBulkAddUsers}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            loginConfig={loginConfig}
            onUpdateLoginConfig={handleUpdateLoginConfig}
            academicSettings={academicSettings}
            onUpdateAcademicSettings={handleUpdateAcademicSettings}
            announcements={announcements}
            onAddAnnouncement={handleAddAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
            // Jadwal KBM & Piket
            schedulesList={schedulesList}
            onAddSchedule={handleAddSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onBulkAddSchedules={handleBulkAddSchedules}
            piketList={piketList}
            onAddPiket={handleAddPiket}
            onUpdatePiket={handleUpdatePiket}
            onDeletePiket={handleDeletePiket}
            // Kaldik & RME
            kaldikEventsList={kaldikEventsList}
            onAddKaldikEvent={handleAddKaldikEvent}
            onUpdateKaldikEvent={handleUpdateKaldikEvent}
            onDeleteKaldikEvent={handleDeleteKaldikEvent}
            rmeList={rmeList}
            onAddRmeRow={handleAddRmeRow}
            onUpdateRmeRow={handleUpdateRmeRow}
            onDeleteRmeRow={handleDeleteRmeRow}
            // Struktur Kurikulum
            strukturList={strukturList}
            onAddMapelStruktur={handleAddMapelStruktur}
            onUpdateMapelStruktur={handleUpdateMapelStruktur}
            onDeleteMapelStruktur={handleDeleteMapelStruktur}
            // SK Kurikulum
            skList={skList}
            onAddSk={handleAddSk}
            onUpdateSk={handleUpdateSk}
            onDeleteSk={handleDeleteSk}
            // Data Guru
            teachersProgressList={teachersProgressList}
            onAddTeacherProgress={handleAddTeacherProgress}
            onUpdateTeacherProgress={handleUpdateTeacherProgress}
            onDeleteTeacherProgress={handleDeleteTeacherProgress}
            onToggleTeacherChecklist={handleToggleTeacherChecklist}
            // KOSP
            kospData={kospData}
            onUpdateKospDocument={handleUpdateKospDocument}
            onAddKospChapter={handleAddKospChapter}
            onUpdateKospChapter={handleUpdateKospChapter}
            onDeleteKospChapter={handleDeleteKospChapter}
          />
        )}
      </main>

      {/* Universal Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewModal.isOpen}
        onClose={handleCloseDocument}
        title={previewModal.title}
        category={previewModal.category}
        content={previewModal.content}
      />

      {/* Google Sheets Sync Modal */}
      <GoogleSheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        googleUser={googleUser}
        googleToken={googleToken}
        onGoogleAuthSuccess={handleGoogleAuthSuccess}
        onGoogleLogout={handleGoogleLogout}
        teachersData={teachersProgressList}
        perangkatData={perangkatList}
      />
    </div>
  );
}
