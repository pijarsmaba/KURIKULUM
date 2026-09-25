import React, { useState, useEffect } from 'react';
import { MenuKey, User as CurrentUser, PerangkatItem, UserRole, LoginPageConfig } from './types';
import {
  DEFAULT_LOGIN_PAGE_CONFIG,
  DEMO_USERS,
  INITIAL_PERANGKAT,
  TEACHER_PROGRESS_DATA,
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
    localStorage.setItem('smaba_login_config', JSON.stringify(loginConfig));
  }, [loginConfig]);

  // User Management Handlers (Admin)
  const handleAddUser = (newUser: CurrentUser) => {
    setUsersList((prev) => [newUser, ...prev]);
  };

  // Bulk Add / Import from Excel
  const handleBulkAddUsers = (newUsers: CurrentUser[], replaceAll?: boolean) => {
    if (replaceAll) {
      setUsersList(newUsers);
    } else {
      setUsersList((prev) => {
        const updatedMap = new Map<string, CurrentUser>();
        prev.forEach((u) => {
          const key = u.username?.toLowerCase() || u.nip || u.id;
          updatedMap.set(key, u);
        });
        newUsers.forEach((nu) => {
          const key = nu.username?.toLowerCase() || nu.nip || nu.id;
          updatedMap.set(key, nu);
        });
        return Array.from(updatedMap.values());
      });
    }
  };

  const handleUpdateUser = (updatedUser: CurrentUser) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    // If the currently logged in user was modified, sync session
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('smaba_auth_user', JSON.stringify(updatedUser));
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      handleLogout();
    }
  };

  const handleUpdateLoginConfig = (newConfig: LoginPageConfig) => {
    setLoginConfig(newConfig);
    localStorage.setItem('smaba_login_config', JSON.stringify(newConfig));
  };

  const handleAddNewPerangkat = (newItem: PerangkatItem) => {
    setPerangkatList([newItem, ...perangkatList]);
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentMenu === 'kosp' && (
          <KospView onOpenDocument={handleOpenDocument} />
        )}

        {currentMenu === 'struktur' && <StrukturKurikulumView />}

        {currentMenu === 'kaldik' && <KaldikView />}

        {currentMenu === 'jadwal' && (
          <JadwalView currentUser={currentUser} />
        )}

        {currentMenu === 'uraian' && <UraianKegiatanView />}

        {currentMenu === 'sk' && (
          <SkView onOpenDocument={handleOpenDocument} currentUser={currentUser} />
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
          />
        )}

        {currentMenu === 'data-guru' && (
          <DataGuruView
            currentUser={currentUser}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onNavigateToPerangkat={() => setCurrentMenu('perangkat')}
          />
        )}

        {currentMenu === 'situs' && <SitusKurikulumView />}

        {currentMenu === 'admin' && (
          <AdminView
            currentUser={currentUser}
            onSwitchToAdmin={handleSwitchToAdmin}
            perangkatList={perangkatList}
            onUpdatePerangkatStatus={handleUpdatePerangkatStatus}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            onSignByPrincipal={handleSignByPrincipal}
            usersList={usersList}
            onAddUser={handleAddUser}
            onBulkAddUsers={handleBulkAddUsers}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            loginConfig={loginConfig}
            onUpdateLoginConfig={handleUpdateLoginConfig}
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
        teachersData={TEACHER_PROGRESS_DATA}
        perangkatData={perangkatList}
      />
    </div>
  );
}
