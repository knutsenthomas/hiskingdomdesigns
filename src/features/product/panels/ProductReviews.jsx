import React from "react";
import CmsText from "@/components/CmsText";
import { motion } from "framer-motion";

export default function ProductReviews({
  averageRating,
  handleReviewSubmit,
  isLoadingReviews,
  isSubmittingReview,
  language,
  product,
  ratingDistribution,
  reviewBody,
  reviewName,
  reviewRating,
  reviewSubmitError,
  reviewSubmitSuccess,
  reviewTitle,
  reviewsList,
  setReviewBody,
  setReviewName,
  setReviewRating,
  setReviewTitle,
  setShowReviewForm,
  showReviewForm,
  t,
}) {
  return (
    <section
      id="reviews-section"
      className="mt-20 border-t border-outline-variant/30 pt-16"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <CmsText
            slug="product-reviews-heading"
            fallback={t("product.reviews")}
            as="h2"
            className="font-headline-lg text-2xl md:text-3xl text-[#1B4965] font-bold"
          />
          <p className="text-secondary font-body-md text-sm mt-1">
            {t("product.reviewsSub", { name: product.name })}
          </p>
        </div>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-terracotta text-white hover:brightness-105 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm"
        >
          {showReviewForm
            ? language === "es"
              ? "Cerrar formulario"
              : language === "en"
                ? "Close form"
                : "Lukk skjema"
            : t("product.reviewFormTitle")}
        </button>
      </div>

      {/* Review Submission Form - Stacked layout to avoid Chrome jitter */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-10 p-6 bg-slate-50 border border-outline-variant/30 rounded-xl max-w-xl shadow-sm"
        >
          <h3 className="font-headline-md text-lg text-onyx mb-4 font-bold">
            {t("product.reviewFormTitle")}
          </h3>
          <form onSubmit={handleReviewSubmit} className="block space-y-4">
            <div className="block">
              <label className="block text-xs font-semibold text-secondary mb-1">
                {t("product.reviewNamePlaceholder")}
              </label>
              <input
                type="text"
                required
                placeholder={
                  language === "es"
                    ? "Ej. Juan Pérez"
                    : language === "en"
                      ? "E.g. John Doe"
                      : "F.eks. Ola Nordmann"
                }
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                disabled={isSubmittingReview}
                style={{
                  transform: "translateZ(0) !important",
                  backfaceVisibility: "hidden !important",
                }}
                className="block w-full bg-white border border-outline rounded-lg px-3 py-2 text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>

            <div className="block">
              <label className="block text-xs font-semibold text-secondary mb-1">
                {language === "es"
                  ? "Tu valoración (1-5 estrellas)"
                  : language === "en"
                    ? "Your rating (1-5 stars)"
                    : "Din vurdering (1-5 stjerner)"}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="text-amber-500 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{
                        fontVariationSettings:
                          star <= reviewRating
                            ? "'FILL' 1, 'wght' 400"
                            : "'FILL' 0, 'wght' 400",
                      }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="block">
              <label className="block text-xs font-semibold text-secondary mb-1">
                {language === "es"
                  ? "Título"
                  : language === "en"
                    ? "Title"
                    : "Overskrift"}
              </label>
              <input
                type="text"
                required
                placeholder={
                  language === "es"
                    ? "Resume tu experiencia..."
                    : language === "en"
                      ? "Summarize your experience..."
                      : "Oppsummer din opplevelse..."
                }
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                disabled={isSubmittingReview}
                style={{
                  transform: "translateZ(0) !important",
                  backfaceVisibility: "hidden !important",
                }}
                className="block w-full bg-white border border-outline rounded-lg px-3 py-2 text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
            </div>

            <div className="block">
              <label className="block text-xs font-semibold text-secondary mb-1">
                {language === "es"
                  ? "Opinión"
                  : language === "en"
                    ? "Review"
                    : "Omtale"}
              </label>
              <textarea
                required
                rows={4}
                placeholder={
                  language === "es"
                    ? "Cuéntanos qué te parece la calidad..."
                    : language === "en"
                      ? "Tell us what you think about the quality..."
                      : "Fortell oss hva du syns om kvaliteten..."
                }
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                disabled={isSubmittingReview}
                style={{
                  transform: "translateZ(0) !important",
                  backfaceVisibility: "hidden !important",
                }}
                className="block w-full bg-white border border-outline rounded-lg px-3 py-2 text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="block w-full bg-terracotta text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all shadow-md"
            >
              {isSubmittingReview
                ? t("product.reviewSubmitting")
                : t("product.reviewSubmitBtn")}
            </button>

            {reviewSubmitError && (
              <p className="text-[11px] text-red-600 font-semibold mt-1 text-center">
                {reviewSubmitError}
              </p>
            )}
          </form>
        </motion.div>
      )}

      {reviewSubmitSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 font-medium">
          {t("product.reviewSuccess")}
        </div>
      )}

      {/* Reviews Summary Dashboard */}
      {reviewsList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm mb-10">
          {/* Left Block: Average Rating */}
          <div className="md:col-span-4 text-center md:border-r border-slate-100 md:pr-8">
            <p className="text-5xl font-extrabold text-[#1B4965] mb-2">
              {averageRating}
            </p>
            <div className="flex justify-center text-amber-500 mb-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-lg"
                  style={{
                    fontVariationSettings:
                      i < Math.round(averageRating)
                        ? "'FILL' 1, 'wght' 400"
                        : "'FILL' 0, 'wght' 400",
                  }}
                >
                  star
                </span>
              ))}
            </div>
            <p className="text-xs text-secondary font-medium uppercase tracking-wider">
              {language === "es"
                ? "Basado en"
                : language === "en"
                  ? "Based on"
                  : "Basert på"}{" "}
              {reviewsList.length}{" "}
              {reviewsList.length === 1
                ? t("product.review")
                : t("product.reviewsPlural")}
            </p>
          </div>

          {/* Right Block: Star Distribution */}
          <div className="md:col-span-8 space-y-2.5">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage =
                reviewsList.length > 0 ? (count / reviewsList.length) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-secondary w-12 text-right">
                    {rating}{" "}
                    {language === "es"
                      ? "estrellas"
                      : language === "en"
                        ? "stars"
                        : "stjerner"}
                  </span>
                  <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-secondary w-8 font-medium">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review list */}
      {isLoadingReviews ? (
        <div className="py-10 text-center text-secondary font-semibold text-sm">
          {language === "es"
            ? "Obteniendo opiniones..."
            : language === "en"
              ? "Fetching reviews..."
              : "Henter omtaler..."}
        </div>
      ) : reviewsList.length === 0 ? (
        <div className="py-12 text-center text-secondary bg-slate-50/55 rounded-xl border border-dashed border-outline-variant/40">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">
            rate_review
          </span>
          <p className="font-semibold text-sm">{t("product.noReviews")}</p>
          <p className="text-xs text-secondary/75 mt-0.5">
            {language === "es"
              ? "¡Sé el primero en compartir tu opinión sobre este producto!"
              : language === "en"
                ? "Be the first to share your opinion about this product!"
                : "Vær den første til å dele din mening om dette produktet!"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviewsList.map((rev) => (
            <div
              key={rev._id}
              className="p-6 bg-white rounded-2xl border border-outline-variant/20 shadow-sm space-y-3"
            >
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-sm"
                        style={{
                          fontVariationSettings:
                            i < (rev.content?.rating || 5)
                              ? "'FILL' 1, 'wght' 400"
                              : "'FILL' 0, 'wght' 400",
                        }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <h4 className="font-bold text-sm text-onyx">
                    {rev.content?.title}
                  </h4>
                </div>
                <span className="text-[11px] text-secondary font-medium">
                  {(() => {
                    try {
                      const d = new Date(rev._createdDate || Date.now());
                      if (!isNaN(d.getTime())) {
                        const rawDate = d.toLocaleDateString(
                          language === "es"
                            ? "es-ES"
                            : language === "en"
                              ? "en-US"
                              : "no-NO",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        );
                        const parts = rawDate.split(" ");
                        if (parts.length >= 2) {
                          parts[1] =
                            parts[1].charAt(0).toUpperCase() +
                            parts[1].slice(1);
                        }
                        return parts.join(" ");
                      }
                    } catch (e) {}
                    return language === "es"
                      ? "Opinión reciente"
                      : language === "en"
                        ? "Recent review"
                        : "Nylig omtale";
                  })()}
                </span>
              </div>

              {/* Review Body */}
              <p className="text-xs text-secondary leading-relaxed font-body-md">
                {rev.content?.body}
              </p>

              {/* Review Author */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold select-none">
                <span className="material-symbols-outlined text-sm">
                  person
                </span>
                <span>
                  {language === "es"
                    ? "Escrito por"
                    : language === "en"
                      ? "Written by"
                      : "Skrevet av"}{" "}
                  {rev.author?.authorName || "Anonym"}
                </span>
                {rev.verified && (
                  <span className="text-[9px] uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                    {language === "es"
                      ? "Comprador Verificado"
                      : language === "en"
                        ? "Verified Buyer"
                        : "Verifisert Kjøper"}
                  </span>
                )}
              </div>

              {/* Admin Reply */}
              {rev.reply && (
                <div className="mt-4 p-4 bg-slate-50 border-l-2 border-terracotta rounded-r-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-terracotta font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-xs">
                      storefront
                    </span>
                    <span>
                      {language === "es"
                        ? "Respuesta de His Kingdom Designs"
                        : language === "en"
                          ? "Reply from His Kingdom Designs"
                          : "Svar fra His Kingdom Designs"}
                    </span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed font-body-md italic">
                    "{rev.reply.body}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
