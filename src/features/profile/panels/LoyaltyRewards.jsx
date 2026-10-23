import React from "react";

export default function LoyaltyRewards({
  displayName,
  handleRedeemReward,
  isLoadingLoyalty,
  language,
  loyaltyAccount,
  loyaltyHistory,
  loyaltyRewards,
  myCoupons,
  newlyRedeemedCoupon,
  redeemingRewardId,
  setNewlyRedeemedCoupon,
  t,
}) {
  return (
    <section className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 text-terracotta">
        <span className="material-symbols-outlined text-2xl select-none">
          stars
        </span>
        <h3 className="font-headline-md text-headline-md text-onyx text-xl font-bold">
          {t("profile.loyaltyPoints")}
        </h3>
      </div>

      {isLoadingLoyalty ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Newly Redeemed Coupon Success Banner */}
          {newlyRedeemedCoupon && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center space-y-3 relative overflow-hidden animate-fade-in">
              <button
                onClick={() => setNewlyRedeemedCoupon(null)}
                className="absolute top-3 right-3 text-secondary hover:text-onyx"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-onyx">
                  {t("profile.redeemSuccess")}
                </h4>
                <p className="text-xs text-secondary mt-1">
                  Kopier koden under og bruk den i kassen!
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 max-w-xs mx-auto bg-white border border-green-200 p-2.5 rounded-xl">
                <code className="text-sm font-bold text-green-700 select-all tracking-wider">
                  {newlyRedeemedCoupon.couponCode ||
                    newlyRedeemedCoupon.code ||
                    "KODE"}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      newlyRedeemedCoupon.couponCode ||
                        newlyRedeemedCoupon.code ||
                        "",
                    );
                    alert("Kopiert!");
                  }}
                  className="text-xs text-terracotta hover:underline font-bold"
                >
                  {t("profile.copyCoupon")}
                </button>
              </div>
            </div>
          )}

          {/* Loyalty Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#d17d39] to-[#bd4f2a] text-white rounded-2xl p-6 shadow-md md:p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-24" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-white/80 font-semibold">
                  {t("profile.loyaltyCard")}
                </span>
                <h4 className="text-xl font-bold mt-1 tracking-wide">
                  {displayName}
                </h4>
              </div>
              <span className="bg-white text-terracotta text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                {loyaltyAccount?.tier?.name || t("profile.loyaltyLevel")}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl md:text-5xl font-extrabold tracking-tight">
                {loyaltyAccount
                  ? loyaltyAccount.points?.summary?.balance || 0
                  : 0}
              </span>
              <span className="text-sm font-semibold text-white/80">
                {t("profile.pointsAvailable")}
              </span>
            </div>

            {/* Progress to next level */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-xs text-white/90">
                <span>{t("profile.pointsProgress")}</span>
                <span className="font-semibold">
                  {t("profile.pointsProgressValue", {
                    current: loyaltyAccount
                      ? loyaltyAccount.points?.summary?.balance || 0
                      : 0,
                    target: 300,
                  })}
                </span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((loyaltyAccount ? loyaltyAccount.points?.summary?.balance || 0 : 0) / 300) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Rewards Information & Wix Loyalty Rewards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-outline-variant/30 rounded-xl p-5 bg-slate-50/40">
              <h4 className="font-bold text-sm text-onyx mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-terracotta text-lg select-none">
                  local_activity
                </span>
                {t("profile.howToEarn")}
              </h4>
              <ul className="text-xs text-secondary space-y-2 pl-1">
                <li className="flex justify-between items-start gap-4">
                  <span className="shrink-0">{t("profile.earnBuy")}</span>
                  <strong className="text-onyx text-right">
                    {t("profile.earnBuyValue")}
                  </strong>
                </li>
                <li className="flex justify-between items-start gap-4">
                  <span className="shrink-0">{t("profile.earnRegister")}</span>
                  <strong className="text-onyx text-right">
                    {t("profile.earnRegisterValue")}
                  </strong>
                </li>
                <li className="flex justify-between items-start gap-4">
                  <span className="shrink-0">{t("profile.earnReview")}</span>
                  <strong className="text-onyx text-right">
                    {t("profile.earnReviewValue")}
                  </strong>
                </li>
              </ul>
            </div>

            <div className="border border-outline-variant/30 rounded-xl p-5 bg-slate-50/40 space-y-3">
              <h4 className="font-bold text-sm text-onyx mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-terracotta text-lg select-none">
                  redeem
                </span>
                {t("profile.howToUse")}
              </h4>

              {loyaltyRewards.length > 0 ? (
                <div className="space-y-3">
                  {loyaltyRewards.map((reward) => {
                    const balance = loyaltyAccount
                      ? loyaltyAccount.points?.summary?.balance || 0
                      : 0;
                    const canRedeem = balance >= reward.requiredPoints;
                    const isRedeeming = redeemingRewardId === reward._id;

                    return (
                      <div
                        key={reward._id}
                        className="flex justify-between items-center p-3 bg-white border border-outline-variant/10 rounded-xl"
                      >
                        <div className="pr-2">
                          <p className="font-semibold text-xs text-onyx leading-snug">
                            {reward.name}
                          </p>
                          <span className="text-[10px] text-terracotta font-semibold mt-0.5 block">
                            {t("profile.pointsNeeded", {
                              points: reward.requiredPoints,
                            })}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRedeemReward(reward._id)}
                          disabled={
                            !canRedeem ||
                            isRedeeming ||
                            redeemingRewardId !== null
                          }
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ${
                            canRedeem
                              ? "bg-terracotta text-white hover:brightness-110 active:scale-95"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          {isRedeeming ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                          ) : canRedeem ? (
                            t("profile.redeem")
                          ) : (
                            t("profile.insufficientPoints")
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-secondary/70 italic">
                  {t("profile.noRewards")}
                </p>
              )}
            </div>
          </div>

          {/* Redeemed Coupons List */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-onyx flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-terracotta text-lg select-none">
                confirmation_number
              </span>
              {t("profile.myCoupons")}
            </h4>

            {myCoupons.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myCoupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className="flex justify-between items-center p-4 border border-outline-variant/15 rounded-xl bg-amber-50/10"
                  >
                    <div>
                      <p className="font-bold text-xs text-onyx select-all tracking-wider">
                        {coupon.couponCode || coupon.code}
                      </p>
                      <span className="text-[10px] text-secondary/60 block mt-1">
                        {coupon.pointsCost} poeng •{" "}
                        {coupon.status === "UNUSED" ? "Ubrukt" : "Brukt"}
                      </span>
                    </div>
                    {coupon.status === "UNUSED" && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            coupon.couponCode || coupon.code || "",
                          );
                          alert("Kopiert!");
                        }}
                        className="text-[10px] font-bold text-terracotta hover:underline border border-terracotta/20 px-2.5 py-1.5 rounded-lg hover:bg-terracotta/5 transition-all shrink-0 ml-2"
                      >
                        {t("profile.copyCoupon")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-secondary/60 italic">
                {t("profile.noCoupons")}
              </p>
            )}
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-onyx flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-terracotta text-lg select-none">
                history
              </span>
              {t("profile.pointsHistory")}
            </h4>

            {loyaltyHistory.length > 0 ? (
              <div className="space-y-3">
                {loyaltyHistory.map((tx) => {
                  const isEarned = tx.pointsDelta > 0;
                  let date = t("profile.unknownDate") || "Ukjent dato";
                  if (tx._createdDate) {
                    try {
                      const d = new Date(tx._createdDate);
                      if (!isNaN(d.getTime())) {
                        const localeMap = {
                          no: "no-NO",
                          en: "en-US",
                          es: "es-ES",
                        };
                        date = d.toLocaleDateString(
                          localeMap[language] || "no-NO",
                        );
                      }
                    } catch (e) {}
                  }

                  let txDesc = tx.description;
                  if (tx.description === "Konto opprettet velkomstbonus") {
                    txDesc = t("profile.historyWelcome") || tx.description;
                  } else if (tx.description?.includes("Poeng tjent på ordre")) {
                    const orderMatch =
                      tx.description.match(/HK-\d+/)?.[0] || "";
                    txDesc =
                      t("profile.historyOrder", { orderId: orderMatch }) ||
                      tx.description;
                  }

                  return (
                    <div
                      key={tx._id}
                      className="flex justify-between items-center p-4 border border-outline-variant/15 rounded-xl bg-slate-50/10"
                    >
                      <div>
                        <p className="font-semibold text-sm text-onyx">
                          {txDesc ||
                            (isEarned
                              ? t("profile.pointsEarned")
                              : t("profile.pointsUsed"))}
                        </p>
                        <span className="text-[10px] text-secondary/60">
                          {date}
                        </span>
                      </div>
                      <span
                        className={`font-bold text-sm ${isEarned ? "text-green-600" : "text-red-500"}`}
                      >
                        {isEarned ? `+${tx.pointsDelta}` : tx.pointsDelta}{" "}
                        {t("profile.pointsAvailable")?.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-secondary/60 italic">
                Ingen poeng-transaksjoner registrert ennå.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
