import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Check, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function CmsVisualToggle() {
  const { isAdminEditing, setIsAdminEditing, showToast, member, isLoggedIn } = useApp();
  const location = useLocation();
  const [isMinimized, setIsMinimized] = React.useState(() => {
    return localStorage.getItem('hkm-cms-minimized') === 'true';
  });

  const ADMIN_EMAILS = ['knutsenthomas@gmail.com', 'thomas@hiskingdomministry.no', 'thomas@hiskingdomministry', 'hildekarin@gmail.com', 'hildekarin@hiskingdomministry.no', 'thomas@tk-design.no'];

  // Helper to safely extract email from Wix member object
  const getMemberEmail = (memberObj) => {
    if (!memberObj) return '';
    if (memberObj.loginEmail) return memberObj.loginEmail;
    
    const cdEmails = memberObj.contactDetails?.emails || [];
    if (cdEmails[0]) {
      return typeof cdEmails[0] === 'object' ? cdEmails[0].email : cdEmails[0];
    }
    
    const cEmails = memberObj.contact?.emails || [];
    if (cEmails[0]) {
      return typeof cEmails[0] === 'object' ? cEmails[0].email : cEmails[0];
    }
    
    if (memberObj.contactDetails?.email) return memberObj.contactDetails.email;
    if (memberObj.contact?.email) return memberObj.contact.email;
    
    return '';
  };

  const wixEmail = getMemberEmail(member).toLowerCase();
  const localRole = localStorage.getItem('hkm-user-role') || '';
  const ADMIN_MEMBER_IDS = [
    '18cf516e-0caa-430c-9bb5-6150854fcd6f' // Thomas Knutsen
  ];

  // Authorize admin: admin emails, local storage roles, localhost dev server, or ?admin=true override
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isAdminUser = 
    ADMIN_EMAILS.includes(wixEmail) ||
    ADMIN_MEMBER_IDS.includes(member?._id) ||
    localRole === 'admin' ||
    localRole === 'superadmin' ||
    isDevelopment ||
    window.location.search.includes('admin=true');

  const isProfilePage = location.pathname === '/profile';

  if (!isAdminUser || (!isProfilePage && !isAdminEditing)) {
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
    <div className="cms-visual-toggle-container fixed bottom-32 right-4 z-[90] font-sans pointer-events-auto">
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
            className="relative flex items-center justify-center h-12 w-12 rounded-full bg-onyx/95 hover:bg-onyx text-white border border-white/20 shadow-xl hover:shadow-2xl transition-all active:scale-[0.94] group"
            title="Vis CMS Editor"
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
            className="flex items-center gap-3 bg-white/95 border border-outline-variant p-2.5 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
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
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">CMS Editor</span>
              <span className="text-xs font-bold text-onyx leading-tight mt-0.5">
                {isAdminEditing ? 'Visuell Modus: PÅ' : 'Visuell Modus: AV'}
              </span>
            </div>

            {/* Toggle switch button */}
            <button
              onClick={handleToggle}
              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.96] ${
                isAdminEditing
                  ? 'bg-terracotta text-white hover:bg-primary-container shadow-terracotta/25'
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
