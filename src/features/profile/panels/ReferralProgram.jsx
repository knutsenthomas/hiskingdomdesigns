import React from "react";

export default function ReferralProgram({
  affiliateAddress,
  affiliateEmail,
  affiliateError,
  affiliateMotivation,
  affiliateName,
  affiliateSocials,
  affiliateStatus,
  affiliateSuccess,
  copied,
  formatPrice,
  handleAdminApprove,
  handleAdminReject,
  handleAffiliateSubmit,
  handleCopyLink,
  isAdminUser,
  isSubmittingAffiliate,
  member,
  pendingApplications,
  setAffiliateAddress,
  setAffiliateEmail,
  setAffiliateMotivation,
  setAffiliateName,
  setAffiliateSocials,
  t,
}) {
  return (
    <section className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm space-y-8 animate-fade-in">
      <style>{`
                .affiliate-input {
                  transform: translateZ(0) !important;
                  backface-visibility: hidden !important;
                  display: block !important;
                  width: 100% !important;
                }
              `}</style>

      <div className="flex items-center gap-3 text-[#1B4965]">
        <span className="material-symbols-outlined text-2xl select-none">
          military_tech
        </span>
        <h3 className="font-headline-md text-headline-md text-onyx text-xl font-bold">
          {t("profile.affiliate")}
        </h3>
      </div>

      {/* Info text */}
      <div className="bg-[#1B4965]/5 border border-[#1B4965]/20 p-5 rounded-2xl text-secondary text-xs leading-relaxed flex items-start gap-3">
        <span className="material-symbols-outlined text-terracotta text-lg mt-0.5 select-none">
          info
        </span>
        <p className="font-semibold text-[#1B4965]">
          {t("profile.affiliateDesc")}
        </p>
      </div>

      {affiliateStatus === "none" && (
        <div className="space-y-6">
          <div className="border-t border-slate-100 pt-4">
            <h4 className="font-headline-sm text-onyx text-base font-bold mb-2">
              {t("profile.applyAffiliate")}
            </h4>
            <p className="text-xs text-secondary mb-6 leading-relaxed">
              {t("profile.applyAffiliateDesc")}
            </p>

            {affiliateSuccess && (
              <div className="mb-4 bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200 font-medium">
                {t("profile.affiliateSuccess")}
              </div>
            )}

            {affiliateError && (
              <div className="mb-4 bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 font-medium">
                {affiliateError}
              </div>
            )}

            <form
              onSubmit={handleAffiliateSubmit}
              className="space-y-5 max-w-xl"
            >
              <div className="block">
                <label className="block text-xs font-bold text-onyx uppercase tracking-wider mb-2">
                  {t("profile.name")}
                </label>
                <input
                  type="text"
                  required
                  value={affiliateName}
                  onChange={(e) => setAffiliateName(e.target.value)}
                  className="affiliate-input bg-white border border-outline rounded-xl px-4 py-3 text-xs text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div className="block">
                <label className="block text-xs font-bold text-onyx uppercase tracking-wider mb-2">
                  {t("profile.email")}
                </label>
                <input
                  type="email"
                  required
                  value={affiliateEmail}
                  onChange={(e) => setAffiliateEmail(e.target.value)}
                  className="affiliate-input bg-white border border-outline rounded-xl px-4 py-3 text-xs text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div className="block">
                <label className="block text-xs font-bold text-onyx uppercase tracking-wider mb-2">
                  {t("profile.address")}
                </label>
                <input
                  type="text"
                  required
                  value={affiliateAddress}
                  onChange={(e) => setAffiliateAddress(e.target.value)}
                  className="affiliate-input bg-white border border-outline rounded-xl px-4 py-3 text-xs text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div className="block">
                <label className="block text-xs font-bold text-onyx uppercase tracking-wider mb-2">
                  {t("profile.socials")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("profile.socialsPlaceholder")}
                  value={affiliateSocials}
                  onChange={(e) => setAffiliateSocials(e.target.value)}
                  className="affiliate-input bg-white border border-outline rounded-xl px-4 py-3 text-xs text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div className="block">
                <label className="block text-xs font-bold text-onyx uppercase tracking-wider mb-2">
                  {t("profile.motivation")}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={t("profile.motivationPlaceholder")}
                  value={affiliateMotivation}
                  onChange={(e) => setAffiliateMotivation(e.target.value)}
                  className="affiliate-input bg-white border border-outline rounded-xl px-4 py-3 text-xs text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingAffiliate}
                className="w-full bg-terracotta hover:bg-opacity-95 text-white py-3.5 rounded-xl font-label-md text-xs font-bold uppercase tracking-wider shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingAffiliate
                  ? t("profile.submitting")
                  : t("profile.submitApplication")}
              </button>
            </form>
          </div>
        </div>
      )}

      {affiliateStatus === "pending" && (
        <div className="space-y-6">
          <div className="border border-outline-variant/30 rounded-2xl p-8 bg-slate-50 text-center flex flex-col items-center space-y-4">
            <span className="material-symbols-outlined text-4xl text-amber-500 animate-pulse select-none">
              pending
            </span>
            <h4 className="font-headline-sm text-onyx text-base font-bold">
              {t("profile.affiliatePending")}
            </h4>
            <p className="text-xs text-secondary max-w-md leading-relaxed">
              {t("profile.affiliatePendingDesc")}
            </p>
          </div>
        </div>
      )}

      {affiliateStatus === "approved" && (
        <div className="space-y-8">
          {/* Approval Banner */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-xs flex items-center gap-3 font-semibold shadow-sm">
            <span className="material-symbols-outlined text-emerald-600 select-none">
              verified_user
            </span>
            <span>{t("profile.affiliateApproved")}</span>
          </div>

          {/* Share Card */}
          <div className="p-6 rounded-2xl border border-outline-variant/30 bg-[#1B4965]/5 space-y-4 shadow-sm text-left">
            <h4 className="font-bold text-xs text-[#1B4965] uppercase tracking-wider">
              {t("profile.affiliateLink")}
            </h4>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/?ref=${member?._id || "medlem"}`}
                className="flex-grow bg-white border border-outline-variant rounded-xl px-4 py-3 text-xs focus:outline-none text-onyx font-mono"
              />
              <button
                onClick={handleCopyLink}
                className={`sm:w-36 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-[#1B4965] text-white hover:opacity-95 active:scale-95"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {copied ? "check" : "content_copy"}
                </span>
                <span>
                  {copied ? t("profile.copied") : t("profile.copyLink")}
                </span>
              </button>
            </div>

            {/* Social Share Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mr-1">
                {t("profile.shareDirect")}
              </span>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(t("profile.shareWhatsAppText", { link: `${window.location.origin}/?ref=${member?._id || "medlem"}` }))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:brightness-105 shadow-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xs">chat</span>
                WhatsApp
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/?ref=${member?._id || "medlem"}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#1877F2] text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:brightness-105 shadow-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xs">share</span>
                Facebook
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent(t("profile.shareEmailSubject"))}&body=${encodeURIComponent(t("profile.shareEmailBody", { link: `${window.location.origin}/?ref=${member?._id || "medlem"}` }))}`}
                className="flex items-center gap-1.5 bg-slate-700 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:brightness-105 shadow-sm active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-xs">mail</span>
                E-post
              </a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            <h4 className="font-bold text-sm text-onyx flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-terracotta text-lg select-none">
                analytics
              </span>
              {t("profile.affiliateStats")}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-outline-variant/15 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">
                  {t("profile.clicksLink")}
                </span>
                <span className="text-2xl font-extrabold text-[#1B4965]">
                  0
                </span>
              </div>
              <div className="p-4 bg-slate-50 border border-outline-variant/15 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">
                  {t("profile.affiliateSales")}
                </span>
                <span className="text-2xl font-extrabold text-[#1B4965]">
                  0
                </span>
              </div>
              <div className="p-4 bg-slate-50 border border-outline-variant/15 rounded-2xl shadow-sm text-center">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">
                  {t("profile.bonusPaid")}
                </span>
                <span className="text-2xl font-extrabold text-green-600">
                  {formatPrice(0)}
                </span>
              </div>
            </div>

            {/* Sales history */}
            <div className="space-y-3">
              <h5 className="font-bold text-xs text-onyx">
                {t("profile.commissionHistory")}
              </h5>
              <div className="border border-outline-variant/20 rounded-2xl p-6 text-center bg-slate-50/50">
                <p className="text-xs text-secondary/70 italic">
                  Ingen provisjoner registrert ennå.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {isAdminUser && (
        <div className="border-t border-slate-100 pt-8 space-y-6">
          <h4 className="font-bold text-sm text-[#1B4965] flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-lg select-none">
              admin_panel_settings
            </span>
            {t("profile.adminTitle", { count: pendingApplications.length })}
          </h4>

          {pendingApplications.length === 0 ? (
            <p className="text-xs text-secondary italic">
              {t("profile.noPendingApps")}
            </p>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 border border-outline-variant/30 rounded-2xl bg-slate-50 space-y-3 text-xs"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-onyx text-sm">{app.name}</p>
                      <p className="text-secondary">{app.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAdminApprove(app.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                      >
                        {t("profile.approve")}
                      </button>
                      <button
                        onClick={() => handleAdminReject(app.id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer"
                      >
                        {t("profile.reject")}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-secondary">
                    <div>
                      <span className="font-bold text-onyx block mb-0.5">
                        {t("profile.address")}:
                      </span>
                      {app.address}
                    </div>
                    <div>
                      <span className="font-bold text-onyx block mb-0.5">
                        {t("profile.socialsLabel")}
                      </span>
                      {app.socialMedia}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="font-bold text-onyx block mb-1">
                      {t("profile.motivationLabel")}
                    </span>
                    <p className="text-secondary leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                      {app.motivation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
