import StoreOverview from "../features/admin/panels/StoreOverview";
import StoreSales from "../features/admin/panels/StoreSales";
import StoreCustomers from "../features/admin/panels/StoreCustomers";
import AbandonedCheckouts from "../features/admin/panels/AbandonedCheckouts";
import VisitorAnalytics from "../features/admin/panels/VisitorAnalytics";
import AffiliateApplications from "../features/admin/panels/AffiliateApplications";
import CustomerPreview from "../features/admin/panels/CustomerPreview";
import useMeta from "@/hooks/useMeta";
import { useApp } from "@/contexts/AppContext";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { wixClient } from "@/lib/wix";
import {
  query,
  collection,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { getParsedWixStats } from "../features/admin/lib/getParsedWixStats";
import { getParsedGaStats } from "../features/admin/lib/getParsedGaStats";
import {
  Activity,
  ShoppingBag,
  UserCheck,
  ShoppingCart,
  Globe,
  Users,
  Lock,
  Calendar,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  Check,
  Eye,
  Zap,
  MousePointerClick,
  Clock,
  ClipboardList,
  ChevronRight,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Share2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Admin() {
  useMeta(
    "Admin-panel - His Kingdom Designs",
    "Administrasjonspanel for His Kingdom Designs.",
  );

  const { showToast, isLoggedIn, member, products } = useApp();
  const navigate = useNavigate();
  const { localizedPath } = useLanguage();

  // Navigation tabs: 'overview' | 'sales' | 'visits' | 'affiliates'
  const [activeTab, setActiveTab] = useState("overview");

  // Affiliate applications states
  const [activeSubTab, setActiveSubTab] = useState("pending"); // 'pending' | 'approved'
  const [applications, setApplications] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  // Time filter: '7d' | '30d' | '90d' | '12m' | 'custom'
  const [timeRange, setTimeRange] = useState("30d");

  // Helper til å formatere dato som YYYY-MM-DD
  const formatYYYYMMDD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  // Tilpasset datointervall states
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatYYYYMMDD(d);
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return formatYYYYMMDD(new Date());
  });

  // Real Wix Stats States
  const [wixStats, setWixStats] = useState(null);
  const [wixLoading, setWixLoading] = useState(true);
  const [wixError, setWixError] = useState(null);

  // Real GA4 Stats States
  const [gaStats, setGaStats] = useState(null);
  const [gaLoading, setGaLoading] = useState(true);
  const [gaError, setGaError] = useState(null);
  const [gaSetupRequired, setGaSetupRequired] = useState(false);
  const [showGaAlert, setShowGaAlert] = useState(() => {
    return localStorage.getItem("hkm-dismissed-ga-alert") !== "true";
  });

  // Helper to safely extract email from Wix member object
  const getMemberEmail = (memberObj) => {
    if (!memberObj) return "";
    if (memberObj.loginEmail) return memberObj.loginEmail;

    const cdEmails = memberObj.contactDetails?.emails || [];
    if (cdEmails[0]) {
      return typeof cdEmails[0] === "object" ? cdEmails[0].email : cdEmails[0];
    }

    const cEmails = memberObj.contact?.emails || [];
    if (cEmails[0]) {
      return typeof cEmails[0] === "object" ? cEmails[0].email : cEmails[0];
    }

    if (memberObj.contactDetails?.email) return memberObj.contactDetails.email;
    if (memberObj.contact?.email) return memberObj.contact.email;

    return "";
  };

  const wixEmail = getMemberEmail(member).toLowerCase();
  const localRole = localStorage.getItem("hkm-user-role") || "";
  const ADMIN_EMAILS = [
    "knutsenthomas@gmail.com",
    "thomas@hiskingdomministry.no",
    "thomas@hiskingdomministry",
    "hildekarin@gmail.com",
    "hildekarin@hiskingdomministry.no",
    "thomas@tk-design.no",
  ];
  const ADMIN_MEMBER_IDS = [
    "18cf516e-0caa-430c-9bb5-6150854fcd6f", // Thomas Knutsen
  ];
  const isAdminUser =
    ADMIN_EMAILS.includes(wixEmail) ||
    ADMIN_MEMBER_IDS.includes(member?._id) ||
    localRole === "admin" ||
    localRole === "superadmin" ||
    window.location.search.includes("admin=true");

  const isAuthLoading = isLoggedIn && !member;

  // Scroll til toppen når aktiv fane endres
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Fetch Wix stats from serverless API
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAdminUser) {
      setWixLoading(false);
      return;
    }

    const fetchWixStats = async () => {
      setWixLoading(true);
      setWixError(null);
      try {
        const tokens = wixClient.auth?.getTokens?.();
        const accessToken = tokens?.accessToken?.value;
        const response = await fetch("/api/get-wix-stats", {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
        if (!response.ok) {
          throw new Error(
            `Klarte ikke å hente Wix-statistikk (status ${response.status})`,
          );
        }
        const data = await response.json();
        if (data.success === false) {
          throw new Error(data.error || "Ukjent feil fra Wix API");
        }
        setWixStats(data);
      } catch (err) {
        console.error("Failed to load Wix stats:", err);
        setWixError(err.message || String(err));
        showToast(
          "Feil ved henting av Wix-data: " + (err.message || String(err)),
        );
      } finally {
        setWixLoading(false);
      }
    };

    fetchWixStats();
  }, [isAdminUser, isAuthLoading, refreshKey]);

  // Fetch GA4 stats from serverless API
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAdminUser) {
      setGaLoading(false);
      return;
    }

    const fetchGaStats = async () => {
      setGaLoading(true);
      setGaError(null);
      setGaSetupRequired(false);
      try {
        let url = `/api/get-ga4-stats?range=${timeRange}`;
        if (timeRange === "custom") {
          url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
        }
        const tokens = wixClient.auth?.getTokens?.();
        const accessToken = tokens?.accessToken?.value;
        const response = await fetch(url, {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });
        if (!response.ok) {
          throw new Error(
            `Klarte ikke å hente Google Analytics-data (status ${response.status})`,
          );
        }
        const data = await response.json();
        if (data.success === false) {
          if (data.setupRequired) {
            setGaSetupRequired(true);
          }
          throw new Error(data.error || "Ukjent feil fra Google Analytics API");
        }
        setGaStats(data);
      } catch (err) {
        console.error("Failed to load GA4 stats:", err);
        setGaError(err.message || String(err));
      } finally {
        setGaLoading(false);
      }
    };

    fetchGaStats();
  }, [
    isAdminUser,
    isAuthLoading,
    timeRange,
    customStartDate,
    customEndDate,
    refreshKey,
  ]);

  // Fetch affiliate applications
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAdminUser) {
      setIsLoading(false);
      return;
    }

    const fetchApps = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "affiliate_applications"),
          where("status", "==", activeSubTab),
        );
        const querySnapshot = await getDocs(q);
        const apps = [];
        querySnapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() });
        });
        // Sort by applied date descending
        apps.sort(
          (a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0),
        );
        setApplications(apps);

        // Fetch counts for both pending and approved
        const pendingQuery = query(
          collection(db, "affiliate_applications"),
          where("status", "==", "pending"),
        );
        const pendingSnap = await getDocs(pendingQuery);
        setPendingCount(pendingSnap.size);

        const approvedQuery = query(
          collection(db, "affiliate_applications"),
          where("status", "==", "approved"),
        );
        const approvedSnap = await getDocs(approvedQuery);
        setApprovedCount(approvedSnap.size);
      } catch (err) {
        console.error("Kunne ikke hente søknader:", err);
        showToast(
          "Feil ved henting av søknader: " + (err.message || String(err)),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, [activeSubTab, isAdminUser, isAuthLoading, refreshKey]);

  const handleApprove = async (appId, appName) => {
    try {
      const docRef = doc(db, "affiliate_applications", appId);
      await updateDoc(docRef, { status: "approved" });
      showToast(`Søknaden til ${appName} ble godkjent!`);
      // Update local state instantly with animation
      setApplications((prev) => prev.filter((app) => app.id !== appId));
      setPendingCount((prev) => Math.max(0, prev - 1));
      setApprovedCount((prev) => prev + 1);

      // Update localStorage cached status if the user approved themselves
      if (appId === member?._id) {
        localStorage.setItem(`hkm-affiliate-status-${member._id}`, "approved");
      }
    } catch (err) {
      console.error("Feil ved godkjenning:", err);
      showToast("Kunne ikke godkjenne søknad: " + (err.message || String(err)));
    }
  };

  const handleReject = async (appId, appName) => {
    try {
      const docRef = doc(db, "affiliate_applications", appId);
      await deleteDoc(docRef);
      showToast(`Søknaden til ${appName} ble slettet/avvist.`);
      setApplications((prev) => prev.filter((app) => app.id !== appId));

      if (activeSubTab === "pending") {
        setPendingCount((prev) => Math.max(0, prev - 1));
      } else {
        setApprovedCount((prev) => Math.max(0, prev - 1));
      }

      if (appId === member?._id) {
        localStorage.removeItem(`hkm-affiliate-status-${member._id}`);
      }
    } catch (err) {
      console.error("Feil ved sletting:", err);
      showToast("Kunne ikke avvise søknad: " + (err.message || String(err)));
    }
  };

  const filteredApplications = applications.filter((app) => {
    const query = searchQuery.toLowerCase();
    return (
      (app.name || "").toLowerCase().includes(query) ||
      (app.email || "").toLowerCase().includes(query) ||
      (app.address || "").toLowerCase().includes(query) ||
      (app.socialMedia || "").toLowerCase().includes(query)
    );
  });

  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [abandonedSearchQuery, setAbandonedSearchQuery] = useState("");
  const [selectedCustomerModal, setSelectedCustomerModal] = useState(null);

  // Helper to find orders belonging to a customer
  const getCustomerOrders = (cust) => {
    if (!wixStats || !wixStats.orders) return [];
    const memberId = cust._id;
    const memberEmail = (
      cust.loginEmail ||
      cust.contact?.emails?.[0]?.email ||
      ""
    )
      .toLowerCase()
      .trim();
    return wixStats.orders
      .filter((o) => {
        const orderMemberId = o.buyerInfo?.memberId;
        const orderEmail = (o.buyerInfo?.email || "").toLowerCase().trim();
        if (memberId && orderMemberId && memberId === orderMemberId)
          return true;
        if (memberEmail && orderEmail && memberEmail === orderEmail)
          return true;
        return false;
      })
      .sort(
        (a, b) => new Date(b._createdDate || 0) - new Date(a._createdDate || 0),
      );
  };

  const filteredCustomers = (wixStats?.members || [])
    .filter((cust) => {
      const q = customerSearchQuery.toLowerCase().trim();
      if (!q) return true;
      const name =
        `${cust.contact?.firstName || ""} ${cust.contact?.lastName || ""}`.toLowerCase();
      const nickname = (cust.profile?.nickname || "").toLowerCase();
      const email = (
        cust.loginEmail ||
        cust.contact?.emails?.[0]?.email ||
        ""
      ).toLowerCase();
      const phone = (cust.contact?.phones?.[0] || "").toLowerCase();
      const city = (cust.contact?.addresses?.[0]?.city || "").toLowerCase();
      const addr = (
        cust.contact?.addresses?.[0]?.addressLine || ""
      ).toLowerCase();
      return (
        name.includes(q) ||
        nickname.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        city.includes(q) ||
        addr.includes(q)
      );
    })
    .sort(
      (a, b) => new Date(b._createdDate || 0) - new Date(a._createdDate || 0),
    );

  const activeWixStats = getParsedWixStats(
    wixStats,
    timeRange,
    customStartDate,
    customEndDate,
  );
  const activeGaStats = getParsedGaStats(gaStats, activeWixStats);

  // Helper to draw custom responsive SVG line path
  const generatePath = (dataArray, maxVal) => {
    if (!dataArray || dataArray.length === 0) return "";
    return dataArray.reduce((acc, val, i) => {
      const x = 20 + (i / (dataArray.length - 1)) * 460;
      const y = 175 - (val / (maxVal || 1)) * 140;
      return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }, "");
  };

  // Helper to draw custom responsive SVG area path
  const generateAreaPath = (dataArray, maxVal) => {
    if (!dataArray || dataArray.length === 0) return "";
    const linePath = generatePath(dataArray, maxVal);
    const startX = 20;
    const endX = 20 + 460;
    return `${linePath} L ${endX} 185 L ${startX} 185 Z`;
  };

  const maxSalesVal = Math.max(...activeWixStats.chartData.sales) || 1;
  const maxVisitsVal = Math.max(...activeGaStats.chartData) || 1;

  // Sidebar Menu Items Definition
  const menuItems = [
    { id: "overview", label: "Oversikt", icon: Activity },
    { id: "sales", label: "Salg (Wix)", icon: ShoppingBag },
    {
      id: "customers",
      label: "Kunder & Medlemmer",
      icon: UserCheck,
      badge:
        (wixStats?.members || []).length ||
        (wixStats?.totalContacts > 0 ? wixStats.totalContacts : null),
    },
    {
      id: "abandoned",
      label: "Forlatte kurver",
      icon: ShoppingCart,
      badge:
        (wixStats?.abandonedCheckouts || []).length > 0
          ? wixStats.abandonedCheckouts.length
          : null,
    },
    { id: "visits", label: "Besøk (Analytics)", icon: Globe },
    {
      id: "affiliates",
      label: "Affiliates",
      icon: Users,
      badge: pendingCount > 0 ? pendingCount : null,
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-28">
      {/* Page Title Header */}
      <div className="mb-8 flex justify-between items-center bg-white border border-outline-variant/30 rounded-2xl p-4 sm:p-6 shadow-sm gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1B4965]/10 text-[#1B4965] rounded-xl flex items-center justify-center shrink-0">
            <Lock size={20} />
          </div>
          <div className="text-left min-w-0">
            <h1 className="font-headline-md text-base sm:text-xl md:text-2xl font-bold text-onyx truncate sm:overflow-visible">
              Administrasjonskonsoll
            </h1>
            <p className="text-[10px] sm:text-xs text-secondary font-medium truncate sm:whitespace-normal">
              Overvåk butikkaktivitet, salgstall og affiliatesøknader.
            </p>
          </div>
        </div>

        <div>
          <Link
            to={localizedPath("/profile")}
            className="bg-slate-50 border border-outline-variant hover:bg-slate-100 text-secondary hover:text-onyx px-3.5 py-2 rounded-xl font-label-md text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>← Min profil</span>
          </Link>
        </div>
      </div>

      {/* HORIZONTAL TOP MENU BAR */}
      <div className="mb-6 bg-white border border-outline-variant/30 rounded-2xl p-3 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 text-left">
        <div
          className="flex gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-xs font-bold transition-all duration-300 cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-gradient-to-r from-[#d17d39] to-[#bd4f2a] text-white shadow-sm"
                    : "text-secondary hover:text-onyx hover:bg-slate-50"
                }`}
              >
                <IconComponent
                  size={16}
                  className={isActive ? "text-white" : "text-secondary"}
                />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isActive ? "bg-white text-[#d17d39]" : "bg-rose-500 text-white"}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Profile Snapshot */}
        <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-outline-variant/40 rounded-xl px-4 py-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#1B4965]/10 text-[#1B4965] border border-[#1B4965]/20 flex items-center justify-center font-bold text-xs shrink-0">
            {member?.contactDetails?.firstName
              ? member.contactDetails.firstName[0].toUpperCase()
              : "A"}
          </div>
          <div className="text-left overflow-hidden">
            <p className="text-xs font-bold text-onyx leading-tight truncate max-w-[120px]">
              {member?.contactDetails?.firstName
                ? `${member.contactDetails.firstName} ${member.contactDetails.lastName || ""}`
                : "Administrator"}
            </p>
            <p className="text-[9px] text-secondary leading-tight">
              Logget inn
            </p>
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 space-y-6">
        {/* Header Controls for Tab (Tidsfilter) */}
        {activeTab !== "affiliates" &&
          activeTab !== "customers" &&
          activeTab !== "abandoned" && (
            <div className="bg-white rounded-2xl border border-outline-variant/30 p-4 shadow-sm flex flex-col gap-4 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                    Periodefilter
                  </span>
                  <h2 className="text-sm font-bold text-onyx flex items-center gap-1.5 mt-0.5">
                    <Calendar size={14} className="text-[#1B4965]" />
                    Statistikk for{" "}
                    {timeRange === "today"
                      ? "i dag"
                      : timeRange === "yesterday"
                        ? "i går"
                        : timeRange === "7d"
                          ? "siste 7 dager"
                          : timeRange === "30d"
                            ? "siste 30 dager"
                            : timeRange === "90d"
                              ? "siste 90 dager"
                              : timeRange === "12m"
                                ? "siste 12 måneder"
                                : `tilpasset periode (${customStartDate ? new Date(customStartDate).toLocaleDateString("no-NO", { day: "numeric", month: "short" }) : ""} - ${customEndDate ? new Date(customEndDate).toLocaleDateString("no-NO", { day: "numeric", month: "short" }) : ""})`}
                  </h2>
                </div>

                <div
                  className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 w-full sm:w-auto justify-start overflow-x-auto whitespace-nowrap"
                  style={{
                    scrollbarWidth: "none",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {[
                    { id: "today", label: "I dag" },
                    { id: "yesterday", label: "I går" },
                    { id: "7d", label: "7 dager" },
                    { id: "30d", label: "30 dager" },
                    { id: "90d", label: "90 dager" },
                    { id: "12m", label: "12 mnd" },
                    { id: "custom", label: "Tilpasset" },
                  ].map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setTimeRange(range.id)}
                      className={`px-3 py-1.5 rounded-lg font-label-md text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        timeRange === range.id
                          ? "bg-[#d17d39] text-white shadow-sm"
                          : "text-secondary hover:text-onyx"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {timeRange === "custom" && (
                <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row gap-4 items-end animate-fadeIn">
                  <div className="w-full sm:w-auto flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Fra dato
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-onyx focus:outline-none focus:border-[#1B4965] focus:bg-white transition-colors w-full sm:w-44"
                    />
                  </div>
                  <div className="w-full sm:w-auto flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Til dato
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-onyx focus:outline-none focus:border-[#1B4965] focus:bg-white transition-colors w-full sm:w-44"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Render Active Tab */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + timeRange}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <StoreOverview
                {...{
                  activeGaStats,
                  activeWixStats,
                  generateAreaPath,
                  generatePath,
                  maxSalesVal,
                  maxVisitsVal,
                  wixError,
                  wixLoading,
                }}
              />
            )}

            {/* TAB 2: SALES (Wix) */}
            {activeTab === "sales" && (
              <StoreSales
                {...{ activeWixStats, maxSalesVal, wixError, wixLoading }}
              />
            )}

            {/* TAB: CUSTOMERS & MEMBERS */}
            {activeTab === "customers" && (
              <StoreCustomers
                {...{
                  customerSearchQuery,
                  filteredCustomers,
                  getCustomerOrders,
                  setCustomerSearchQuery,
                  setSelectedCustomerModal,
                  wixLoading,
                  wixStats,
                }}
              />
            )}

            {/* TAB: ABANDONED CARTS */}
            {activeTab === "abandoned" && (
              <AbandonedCheckouts
                {...{
                  abandonedSearchQuery,
                  setAbandonedSearchQuery,
                  wixLoading,
                  wixStats,
                }}
              />
            )}

            {/* TAB 3: VISITS (Google Analytics) */}
            {activeTab === "visits" && (
              <VisitorAnalytics
                {...{
                  activeGaStats,
                  activeWixStats,
                  gaError,
                  gaLoading,
                  gaSetupRequired,
                  gaStats,
                  generateAreaPath,
                  generatePath,
                  maxVisitsVal,
                  setShowGaAlert,
                  showGaAlert,
                  timeRange,
                }}
              />
            )}

            {/* TAB 4: AFFILIATES (Søknader) */}
            {activeTab === "affiliates" && (
              <AffiliateApplications
                {...{
                  activeSubTab,
                  approvedCount,
                  expandedId,
                  filteredApplications,
                  handleApprove,
                  handleReject,
                  isLoading,
                  pendingCount,
                  searchQuery,
                  setActiveSubTab,
                  setExpandedId,
                  setRefreshKey,
                  setSearchQuery,
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CUSTOMER PROFILE & ORDER PREVIEW MODAL */}
      <CustomerPreview
        {...{ selectedCustomerModal, setSelectedCustomerModal }}
      />
    </div>
  );
}
