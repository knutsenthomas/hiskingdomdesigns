import React from 'react';
import { motion } from 'framer-motion';
import { Truck, RotateCcw, AlertCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import CmsText from '@/components/CmsText';
import { useLanguage } from '@/contexts/LanguageContext';
import useMeta from '@/hooks/useMeta';

export default function Shipping() {
  const { t, formatPrice } = useLanguage();

  useMeta(
    t('shipping.metaTitle'),
    t('shipping.metaDesc')
  );

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <CmsText
          slug="shipping-badge"
          fallback="Kundeinfo"
          as="span"
          className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-3 block font-semibold"
        />
        <CmsText
          slug="shipping-title"
          fallback="Frakt og retur"
          as="h1"
          className="font-headline-xl text-3xl md:text-headline-xl font-bold text-onyx mb-6"
        />
        <CmsText
          slug="shipping-desc"
          fallback="Vi ønsker at handelen din hos His Kingdom Designs skal være så enkel og trygg som overhodet mulig. Her finner du all informasjon du trenger angående leveringstider, fraktpriser og returprosesser."
          as="p"
          className="font-body-lg text-body-lg text-secondary leading-relaxed"
        />
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Shipping details */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 md:p-12 shadow-sm space-y-6">
          <div className="flex items-center gap-4 text-terracotta mb-4">
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center">
              <Truck size={24} />
            </div>
            <CmsText
              slug="shipping-details-title"
              fallback="Levering & Frakt"
              as="h2"
              className="font-headline-lg text-headline-lg text-onyx text-2xl font-bold"
            />
          </div>
          
          <CmsText
            slug="shipping-details-desc"
            fallback="Vi sender ordrer direkte til kunden. Normal leveringstid i Norge er ca. 2 uker (Produksjonstid og frakt) avhengig av hvor i landet du bor. Du mottar en e-post med sporingsnummer så snart pakken din er sendt."
            as="p"
            className="font-body-md text-secondary leading-relaxed"
          />

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <CmsText
                slug="shipping-row-title-2"
                fallback="Standardfrakt"
                as="span"
                className="font-label-md text-onyx font-bold"
              />
              <CmsText
                slug="shipping-row-val-2"
                fallback="Fra 39 kr (vektbasert)"
                as="span"
                replaceObj={{ '{amount}': formatPrice(39) }}
                className="font-label-md text-onyx"
              />
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <CmsText
                slug="shipping-row-title-3"
                fallback="Klargjøring & produksjonstid"
                as="span"
                className="font-body-md text-secondary"
              />
              <CmsText
                slug="shipping-row-val-3"
                fallback="1-2 uker"
                as="span"
                className="font-label-md text-onyx"
              />
            </div>
            <div className="flex justify-between pb-2">
              <CmsText
                slug="shipping-row-title-4"
                fallback="Normal leveringstid (Norge)"
                as="span"
                className="font-body-md text-secondary"
              />
              <CmsText
                slug="shipping-row-val-4"
                fallback="ca. 2 uker (total tid)"
                as="span"
                className="font-label-md text-onyx"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-2">
            <div className="space-y-3">
              <CmsText
                slug="shipping-europe-title"
                fallback="Frakt til Europa"
                as="h3"
                className="font-label-md text-onyx font-bold text-xs uppercase tracking-wider text-terracotta"
              />
              <div className="space-y-2 text-sm text-secondary">
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                  <span className="whitespace-nowrap">0 - 0.25 kg:</span>
                  <span className="font-semibold text-onyx">{formatPrice(79)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                  <span className="whitespace-nowrap">0.25 - 1.5 kg:</span>
                  <span className="font-semibold text-onyx">{formatPrice(129)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                  <span className="whitespace-nowrap">1.5 - 3.0 kg:</span>
                  <span className="font-semibold text-onyx">{formatPrice(199)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                  <span className="whitespace-nowrap">3.0 - 5.0 kg:</span>
                  <span className="font-semibold text-onyx">{formatPrice(249)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <CmsText
                slug="shipping-usa-title"
                fallback="Frakt til USA"
                as="h3"
                className="font-label-md text-onyx font-bold text-xs uppercase tracking-wider text-terracotta"
              />
              <div className="space-y-2 text-sm text-secondary">
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                  <span className="whitespace-nowrap">0 - 0.41 kg:</span>
                  <span className="font-semibold text-onyx">{formatPrice(99)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                  <span className="whitespace-nowrap">0.41 - 2.5 kg:</span>
                  <span className="font-semibold text-onyx">{formatPrice(149)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                  <span className="whitespace-nowrap">2.5 - 5.0 kg:</span>
                  <span className="font-semibold text-onyx">{formatPrice(249)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <CmsText
                slug="shipping-world-title"
                fallback="Resten av verden"
                as="h3"
                className="font-label-md text-onyx font-bold text-xs uppercase tracking-wider text-terracotta"
              />
              <div className="space-y-2 text-sm text-secondary">
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                  <span className="whitespace-nowrap">0 - 0.49 kg:</span>
                  <span className="font-semibold text-onyx">{formatPrice(99)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                  <span className="whitespace-nowrap">0.49 - 2.0 kg:</span>
                  <span className="font-semibold text-onyx">{formatPrice(199)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                  <span className="whitespace-nowrap">2.0 - 5.0 kg:</span>
                  <span className="font-semibold text-onyx">{formatPrice(299)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/50 pb-1.5">
                  <span className="whitespace-nowrap">5.0 - 10.0 kg:</span>
                  <span className="font-semibold text-onyx">{formatPrice(499)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-parchment p-4 rounded-xl border border-outline-variant/30 flex gap-3 text-secondary text-sm">
            <AlertCircle size={18} className="text-terracotta shrink-0 mt-0.5" />
            <CmsText
              slug="shipping-details-alert"
              fallback="Vi sender pakken med sporingsnummer slik at du kan følge forsendelsen hele veien fram til leveringsstedet."
              as="p"
            />
          </div>
        </div>

        {/* Return details */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 md:p-12 shadow-sm space-y-6">
          <div className="flex items-center gap-4 text-terracotta mb-4">
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center">
              <RotateCcw size={24} />
            </div>
            <CmsText
              slug="shipping-returns-title"
              fallback="Enkel retur & kjøpsvilkår"
              as="h2"
              className="font-headline-lg text-headline-lg text-onyx text-2xl font-bold"
            />
          </div>
          
          <CmsText
            slug="shipping-returns-desc"
            fallback="Vi ønsker at du skal være 100% fornøyd med kjøpet ditt. Derfor tilbyr vi en helt ukomplisert returprosess i tråd med angreretten dersom produktene ikke passer eller står til forventningene."
            as="p"
            className="font-body-md text-secondary leading-relaxed"
          />

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-onyx flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <div>
                <CmsText
                  slug="shipping-return-step-title-1"
                  fallback="14 dagers angrerett"
                  as="h4"
                  className="font-label-md text-onyx font-bold"
                />
                <CmsText
                  slug="shipping-return-step-desc-1"
                  fallback="Du har i henhold til angrerettsloven full rett til å angre eller bytte i 14 dager etter mottatt vare."
                  as="p"
                  className="font-body-sm text-secondary"
                />
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-onyx flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <div>
                <CmsText
                  slug="shipping-return-step-title-2"
                  fallback="Fyll ut returskjema"
                  as="h4"
                  className="font-label-md text-onyx font-bold"
                />
                <CmsText
                  slug="shipping-return-step-desc-2"
                  fallback="Bruk returseddelen som fulgte med i pakken, eller kontakt oss på e-post for å få tilsendt en ny på sekunder."
                  as="p"
                  className="font-body-sm text-secondary"
                />
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-onyx flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <div>
                <CmsText
                  slug="shipping-return-step-title-3"
                  fallback="Rask tilbakebetaling"
                  as="h4"
                  className="font-label-md text-onyx font-bold"
                />
                <CmsText
                  slug="shipping-return-step-desc-3"
                  fallback="Så snart vi har mottatt og registrert returen, tilbakebetaler vi pengene via samme betalingsmåte (Vipps/kort) innen 3-5 dager."
                  as="p"
                  className="font-body-sm text-secondary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support section */}
      <div className="bg-onyx rounded-3xl p-12 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-terracotta/10 rounded-full blur-[100px] -ml-32 -mt-32"></div>
        <div className="relative z-10 max-w-xl mx-auto space-y-6">
          <HelpCircle size={36} className="text-terracotta mx-auto mb-2" />
          <CmsText
            slug="shipping-support-title"
            fallback="Har du spørsmål om en pågående levering?"
            as="h3"
            className="font-headline-md text-headline-md text-white font-bold"
          />
          <CmsText
            slug="shipping-support-desc"
            fallback="Vårt kundeserviceteam hjelper deg gjerne. Ta kontakt på post@hiskingdomministry.no, eller start en samtale med vår AI-assistent nede i høyre hjørne."
            as="p"
            className="font-body-md text-parchment/70 animate-none"
          />
          <div className="pt-2">
            <Link 
              to="/products"
              className="bg-terracotta text-white px-8 py-4 rounded-xl font-label-md hover:bg-opacity-90 transition-all inline-block active:scale-95 font-bold shadow-md"
            >
              {t('shipping.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
