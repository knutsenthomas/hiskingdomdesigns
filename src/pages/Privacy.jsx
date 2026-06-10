import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Lock, FileText } from 'lucide-react';
import CmsText from '@/components/CmsText';
import { useLanguage } from '@/contexts/LanguageContext';
import useMeta from '@/hooks/useMeta';

export default function Privacy() {
  const { t } = useLanguage();

  useMeta(
    t('privacy.metaTitle'),
    t('privacy.metaDesc')
  );

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      {/* Title */}
      <div className="text-center mb-16">
        <CmsText
          slug="privacy-badge"
          fallback="Juridisk"
          as="span"
          className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-3 block font-semibold"
        />
        <CmsText
          slug="privacy-title"
          fallback="Personvernerklæring"
          as="h1"
          className="font-headline-xl text-3xl md:text-headline-xl text-onyx mb-6"
        />
        <CmsText
          slug="privacy-desc"
          fallback="Ditt personvern er ekstremt viktig for oss. Denne erklæringen beskriver hvordan His Kingdom Designs samler inn, behandler og beskytter dine personopplysninger i tråd med personopplysningsloven (GDPR)."
          as="p"
          className="font-body-lg text-body-lg text-secondary leading-relaxed"
        />
      </div>

      {/* Narrative block */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 md:p-12 shadow-sm space-y-8 text-secondary font-body-md leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <Eye size={20} />
            <CmsText
              slug="privacy-section-title-1"
              fallback="1. Hvilke opplysninger samler vi inn?"
              as="h2"
              className="font-headline-md text-onyx text-xl font-bold"
            />
          </div>
          <CmsText
            slug="privacy-section-desc-1"
            fallback="For å kunne ekspedere og levere ordrene dine samler vi inn følgende opplysninger når du foretar et kjøp i nettbutikken vår:"
            as="p"
          />
          <ul className="list-disc pl-5 space-y-1">
            <li><CmsText slug="privacy-list-1-item-1" fallback="Navn og etternavn" as="span" /></li>
            <li><CmsText slug="privacy-list-1-item-2" fallback="Leveringsadresse og postnummer/poststed" as="span" /></li>
            <li><CmsText slug="privacy-list-1-item-3" fallback="E-postadresse (for ordrebekreftelser og fraktstatus)" as="span" /></li>
            <li><CmsText slug="privacy-list-1-item-4" fallback="Telefonnummer (for varsling om levering)" as="span" /></li>
            <li><CmsText slug="privacy-list-1-item-5" fallback="Kjøpshistorikk og valgte produkter" as="span" /></li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <Lock size={20} />
            <CmsText
              slug="privacy-section-title-2"
              fallback="2. Hva brukes opplysningene til?"
              as="h2"
              className="font-headline-md text-onyx text-xl font-bold"
            />
          </div>
          <CmsText
            slug="privacy-section-desc-2"
            fallback="Dine opplysninger behandles kun for legitime forretningsformål knyttet to din rolle som kunde hos oss:"
            as="p"
          />
          <ul className="list-disc pl-5 space-y-1">
            <li><CmsText slug="privacy-list-2-item-1" fallback="Gjennomføring og leveranse av din bestilling." as="span" /></li>
            <li><CmsText slug="privacy-list-2-item-2" fallback="Håndtering av eventuelle returer, bytter eller reklamasjoner." as="span" /></li>
            <li><CmsText slug="privacy-list-2-item-3" fallback="Kommunikasjon vedrørende kundeservice og ordrespørsmål." as="span" /></li>
            <li><CmsText slug="privacy-list-2-item-4" fallback="Utsendelse av nyhetsbrev, forutsatt at du aktivt har samtykket to dette." as="span" /></li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <ShieldCheck size={20} />
            <CmsText
              slug="privacy-section-title-3"
              fallback="3. Betalingssikkerhet"
              as="h2"
              className="font-headline-md text-onyx text-xl font-bold"
            />
          </div>
          <CmsText
            slug="privacy-section-desc-3"
            fallback="Betalinger på våre nettsider gjøres via sertifiserte og fullstendig krypterte betalingsløsninger (Vipps og anerkjente kortinnløsere). His Kingdom Designs lagrer aldri dine kredittkortdetaljer eller sensitive bankopplysninger på våre egne servere."
            as="p"
          />
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <FileText size={20} />
            <CmsText
              slug="privacy-section-title-4"
              fallback="4. Cookies (Informasjonskapsler)"
              as="h2"
              className="font-headline-md text-onyx text-xl font-bold"
            />
          </div>
          <CmsText
            slug="privacy-section-desc-4"
            fallback="Vi bruker informasjonskapsler for å huske hvilke varer du har lagt i handlekurven din, analysere trafikken via Google Analytics (hvis du samtykker to det), og forbedre din generelle brukeropplevelse i nettbutikken. Du kan når som helst administrere dine innstillinger for informasjonskapsler nederst på siden."
            as="p"
          />
        </section>

        {/* Section 5 */}
        <section className="space-y-4 border-t border-slate-100 pt-6">
          <CmsText
            slug="privacy-section-title-5"
            fallback="5. Dine rettigheter"
            as="h2"
            className="font-headline-md text-onyx text-xl font-bold"
          />
          <CmsText
            slug="privacy-section-desc-5"
            fallback="Du har full rett til å kreve innsyn i hvilke opplysninger vi har lagret om deg. Du kan også kreve at vi korrigerer feilaktige opplysninger, eller ber om at alle dine personopplysninger slettes fra våre systemer, så fremt vi ikke er lovpålagt å oppbevare dem i henhold til bokføringsloven."
            as="p"
          />
          <p className="pt-2">
            {t('privacy.supportTextBefore')}<CmsText slug="privacy-section-support" fallback="post@hiskingdomministry.no" as="strong" className="text-terracotta" />{t('privacy.supportTextAfter')}
          </p>
        </section>
      </div>
      
      <div className="text-center text-xs text-secondary/60 mt-8">
        {t('general.lastUpdated')}: <CmsText slug="privacy-updated" fallback="6. juni 2026" as="span" />
      </div>
    </motion.main>
  );
}
