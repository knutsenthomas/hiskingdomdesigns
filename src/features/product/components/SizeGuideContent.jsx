import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import CmsText from "@/components/CmsText";

function SizeGuideContent({ defaultTab = "clothing" }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Tabs list */}
      <div className="flex border-b border-outline-variant/30 text-xs font-semibold select-none bg-slate-50">
        <button
          onClick={() => setActiveTab("clothing")}
          className={`flex-1 py-3.5 px-2 text-center transition-all text-[11px] sm:text-xs flex items-center justify-center gap-1.5 ${
            activeTab === "clothing"
              ? "bg-white text-terracotta font-bold border-b-2 border-terracotta"
              : "text-secondary hover:text-onyx hover:bg-slate-100/60"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <path d="M20.38 3.46 16 7.83V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3.83L3.62 3.46a2 2 0 0 0-2.82 2.82L7.64 13v7a2 2 0 0 0 2 2h4.72a2 2 0 0 0 2-2v-7l6.84-6.72a2 2 0 0 0-2.82-2.82z" />
          </svg>
          <span>
            <CmsText
              slug="product-sizeguide-clothing-tab"
              fallback={t("product.clothingTab")}
              as="span"
            />
          </span>
        </button>
        <button
          onClick={() => setActiveTab("caps")}
          className={`flex-1 py-3.5 px-2 text-center transition-all border-x border-outline-variant/20 text-[11px] sm:text-xs flex items-center justify-center gap-1.5 ${
            activeTab === "caps"
              ? "bg-white text-terracotta font-bold border-b-2 border-terracotta"
              : "text-secondary hover:text-onyx hover:bg-slate-100/60"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <path d="M4 17c0-6 4-10 9-10s9 4 9 10" />
            <path d="M12 17h10c1.5 0 2 1 2 2a1.5 1.5 0 0 1-1.5 1.5H10.5" />
            <circle cx="13" cy="7" r="1" fill="currentColor" />
            <path d="M13 7c-1 3-2 7-2 10" />
          </svg>
          <span>
            <CmsText
              slug="product-sizeguide-caps-tab"
              fallback={t("product.capsTab")}
              as="span"
            />
          </span>
        </button>
        <button
          onClick={() => setActiveTab("posters")}
          className={`flex-1 py-3.5 px-2 text-center transition-all text-[11px] sm:text-xs flex items-center justify-center gap-1.5 ${
            activeTab === "posters"
              ? "bg-white text-terracotta font-bold border-b-2 border-terracotta"
              : "text-secondary hover:text-onyx hover:bg-slate-100/60"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span>
            <CmsText
              slug="product-sizeguide-posters-tab"
              fallback={t("product.postersTab")}
              as="span"
            />
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-secondary custom-scrollbar flex-1">
        {activeTab === "clothing" && (
          <div className="space-y-4">
            <p className="italic">{t("product.clothingGuideDesc")}</p>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-onyx font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">{t("product.size")}</th>
                  <th className="py-2.5 px-3">Bredde (A)</th>
                  <th className="py-2.5 px-3">Lengde (B)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">S</td>
                  <td className="py-2.5 px-3">48 cm</td>
                  <td className="py-2.5 px-3">69 cm</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">M</td>
                  <td className="py-2.5 px-3">51 cm</td>
                  <td className="py-2.5 px-3">71 cm</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">L</td>
                  <td className="py-2.5 px-3">54 cm</td>
                  <td className="py-2.5 px-3">73 cm</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">XL</td>
                  <td className="py-2.5 px-3">57 cm</td>
                  <td className="py-2.5 px-3">75 cm</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">XXL</td>
                  <td className="py-2.5 px-3">60 cm</td>
                  <td className="py-2.5 px-3">77 cm</td>
                </tr>
              </tbody>
            </table>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
              <p className="font-semibold text-onyx mb-1 text-[10px] uppercase">
                {t("product.howToMeasure")}
              </p>
              <p>{t("product.widthMeasure")}</p>
              <p>{t("product.lengthMeasure")}</p>
            </div>
          </div>
        )}

        {activeTab === "caps" && (
          <div className="space-y-4">
            <p className="italic">{t("product.capsGuideDesc")}</p>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-onyx font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Hodeomkrets</th>
                  <th className="py-2.5 px-3">Justerbarhet</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">
                    Caps (Snapback / Justerbar)
                  </td>
                  <td className="py-2.5 px-3">54 – 60 cm</td>
                  <td className="py-2.5 px-3">
                    Spenne bak (Plast eller metall)
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">
                    Bøttehatt (Bucket hat)
                  </td>
                  <td className="py-2.5 px-3">56 – 58 cm</td>
                  <td className="py-2.5 px-3">
                    Fast omkrets (Fleksibelt bomullsstoff)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "posters" && (
          <div className="space-y-4">
            <p className="italic">{t("product.postersGuideDesc")}</p>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-onyx font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3">Dimensjoner (i cm)</th>
                  <th className="py-2.5 px-3">Papirtype</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">A4</td>
                  <td className="py-2.5 px-3">21.0 x 29.7 cm</td>
                  <td className="py-2.5 px-3">230g Matte Premium</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">A3</td>
                  <td className="py-2.5 px-3">29.7 x 42.0 cm</td>
                  <td className="py-2.5 px-3">230g Matte Premium</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">
                    30x40 cm
                  </td>
                  <td className="py-2.5 px-3">30.0 x 40.0 cm</td>
                  <td className="py-2.5 px-3">230g Matte Premium</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">
                    50x70 cm
                  </td>
                  <td className="py-2.5 px-3">50.0 x 70.0 cm</td>
                  <td className="py-2.5 px-3">230g Matte Premium</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export { SizeGuideContent };
