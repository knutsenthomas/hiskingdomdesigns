import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, Settings, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CmsVisualToggle() {
  const { member, isAdminEditing, setIsAdminEditing, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMinimized, setIsMinimized] = React.useState(() => {
    return localStorage.getItem('hkm-cms-minimized') === 'true';
  });
  const [editableCount, setEditableCount] = React.useState(0);

  // Authorized Admin emails
  const ADMIN_EMAILS = [
    'knutsenthomas@gmail.com',
    'thomas@tk-design.no',
    'thomas@hiskingdomministry.no',
    'thomas@hiskingdomministry',
    'hildekarin@gmail.com',
    'hildekarin@hiskingdomministry.no'
  ];

  const ADMIN_MEMBER_IDS = [
    '18cf516e-0caa-430c-9bb5-6150854fcd6f' // Thomas Knutsen
  ];

  // Helper to extract email from Wix member
  const getMemberEmail = (m) => {
    if (!m) return '';
    if (m.loginEmail) return m.loginEmail;
    const cdEmails = m.contactDetails?.emails || [];
    if (cdEmails[0]) return typeof cdEmails[0] === 'object' ? cdEmails[0].email : cdEmails[0];
    const cEmails = m.contact?.emails || [];
    if (cEmails[0]) return typeof cEmails[0] === 'object' ? cEmails[0].email : cEmails[0];
    return m.contactDetails?.email || m.contact?.email || '';
  };

  const cleanEmail = getMemberEmail(member).toLowerCase();
  const localRole = (localStorage.getItem('hkm-user-role') || '').toLowerCase();
  const isCmsAuthorized = localStorage.getItem('hkm-cms-authorized') === 'true';
  const isDevelopment = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local')
  );

  // Check URL params (?edit=1, ?cms=1, ?admin=1, ?admin=true)
  const isUrlAdmin = React.useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      return params.get('edit') === '1' || params.get('edit') === 'true' ||
             params.get('cms') === '1' || params.get('cms') === 'true' ||
             params.get('admin') === '1' || params.get('admin') === 'true';
    } catch {
      return false;
    }
  }, [location.search]);

  // Strict admin check: Authorized admin accounts, local role, localhost dev, saved authorization, or query param
  const isAdminUser = Boolean(
    ADMIN_EMAILS.includes(cleanEmail) ||
    ADMIN_MEMBER_IDS.includes(member?._id) ||
    localRole === 'admin' ||
    localRole === 'superadmin' ||
    isCmsAuthorized ||
    isDevelopment ||
    isUrlAdmin
  );

  // If opened with ?edit=1 or ?cms=1 or ?admin=true, activate editing mode and remember authorization
  React.useEffect(() => {
    if (isAdminUser && isUrlAdmin) {
      localStorage.setItem('hkm-cms-authorized', 'true');
      setIsAdminEditing(true);
      showToast("Visuell redigeringsmodus aktivert!");
    }
  }, [isAdminUser, isUrlAdmin, setIsAdminEditing, showToast]);

  // Keyboard shortcut (Cmd/Ctrl + Shift + E) & custom event listener
  React.useEffect(() => {
    if (!isAdminUser) return;

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        localStorage.setItem('hkm-cms-authorized', 'true');
        setIsAdminEditing(prev => {
          const next = !prev;
          showToast(next ? "Visuell CMS-redigering aktivert (Snarvei)!" : "Visuell redigering avsluttet.");
          return next;
        });
      }
    };

    const handleCustomToggle = () => {
      localStorage.setItem('hkm-cms-authorized', 'true');
      setIsAdminEditing(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hkm-toggle-cms', handleCustomToggle);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hkm-toggle-cms', handleCustomToggle);
    };
  }, [isAdminUser, setIsAdminEditing, showToast]);

  // Dynamically count editable fields on current page
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const count = document.querySelectorAll('[data-cms-slug]').length;
      setEditableCount(count);
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname, isAdminEditing]);

  // Don't display floating visual editor inside administrative backend
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (!isAdminUser || isAdminRoute) {
    return null;
  }

  const handleToggle = () => {
    const nextState = !isAdminEditing;
    setIsAdminEditing(nextState);
    if (nextState) {
      showToast("Visuell CMS-redigering aktivert! Klikk på en tekst for å redigere.");
    } else {
      showToast("Visuell redigering avsluttet. Alle endringer er lagret.");
    }
  };

  return (
    <div className="cms-visual-toggle-container fixed bottom-24 right-4 z-[95] font-sans pointer-events-auto">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              setIsMinimized(false);
              localStorage.setItem('hkm-cms-minimized', 'false');
            }}
            className="relative flex items-center justify-center h-12 w-12 rounded-full bg-onyx/95 hover:bg-onyx text-white border border-white/20 shadow-xl hover:shadow-2xl transition-all active:scale-[0.94] group cursor-pointer"
            title="Vis CMS Editor (Cmd+Shift+E)"
            style={{ transform: 'translateZ(0)' }}
          >
            <Edit3 size={20} className="group-hover:rotate-12 transition-transform" />
            {isAdminEditing && (
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-terracotta border border-white"></span>
              </span>
            )}
          </motion.button>
        ) : (
          <motion.div 
            key="expanded"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="flex items-center gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/60 p-2.5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all"
            style={{ transform: 'translateZ(0)' }}
          >
            {/* State indicator circle */}
            <div className="relative flex h-3 w-3 pl-2">
              {isAdminEditing ? (
                <>
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-terracotta opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-terracotta"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-300"></span>
              )}
            </div>

            <div className="flex flex-col text-left pr-1 min-w-[120px]">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">CMS Editor</span>
                {editableCount > 0 && (
                  <span className="text-[9px] font-mono font-bold text-terracotta bg-terracotta/10 px-1 rounded">
                    {editableCount} felt
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-onyx leading-tight mt-0.5">
                {isAdminEditing ? 'Visuell Modus: PÅ' : 'Visuell Modus: AV'}
              </span>
            </div>

            {/* Toggle switch button */}
            <button
              onClick={handleToggle}
              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.96] cursor-pointer ${
                isAdminEditing
                  ? 'bg-terracotta text-white hover:bg-terracotta/90 shadow-terracotta/25'
                  : 'bg-onyx text-white hover:bg-[#2a313d]'
              }`}
            >
              {isAdminEditing ? (
                <>
                  <Check size={13} />
                  <span>Fullfør</span>
                </>
              ) : (
                <>
                  <Edit3 size={13} />
                  <span>Rediger</span>
                </>
              )}
            </button>

            {/* Shortcut to full admin */}
            <button
              onClick={() => {
                navigate('/admin');
                showToast("Åpner Admin-panelet...");
              }}
              className="p-1.5 text-slate-400 hover:text-onyx hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              title="Åpne Admin-panel"
            >
              <Settings size={15} />
            </button>

            {/* Minimize button */}
            <button
              onClick={() => {
                setIsMinimized(true);
                localStorage.setItem('hkm-cms-minimized', 'true');
                showToast("CMS Editor minimert. Klikk på ikonet for å maksimere igjen.");
              }}
              className="p-1.5 text-slate-400 hover:text-terracotta hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              title="Minimer CMS-panelet"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
