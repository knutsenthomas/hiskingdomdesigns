import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CreditCard, ShoppingBag, Truck, RefreshCw, AlertCircle } from 'lucide-react';
import CmsText from '@/components/CmsText';

export default function Betingelser() {
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
          slug="terms-badge"
          fallback="Juridisk"
          as="span"
          className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-3 block font-semibold"
        />
        <CmsText
          slug="terms-title"
          fallback="Kjøpsbetingelser"
          as="h1"
          className="font-headline-xl text-headline-xl text-onyx mb-6"
        />
        <CmsText
          slug="terms-desc"
          fallback="Disse kjøpsbetingelsene gjelder for alt salg av varer fra His Kingdom Designs til forbrukere. Betingelsene utgjør sammen med din bestilling det samlede avtalegrunnlaget for kjøpet."
          as="p"
          className="font-body-lg text-body-lg text-secondary leading-relaxed"
        />
      </div>

      {/* Narrative block */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 md:p-12 shadow-sm space-y-8 text-secondary font-body-md leading-relaxed">
        
        {/* Section 1: Partene */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <FileText size={20} />
            <CmsText
              slug="terms-section-title-1"
              fallback="1. Partene"
              as="h2"
              className="font-headline-md text-onyx text-xl font-bold"
            />
          </div>
          <CmsText
            slug="terms-section-desc-1"
            fallback="Selger er His Kingdom Ministry / His Kingdom Designs. Kjøper er den forbrukeren som foretar bestillingen i nettbutikken."
            as="p"
          />
        </section>

        {/* Section 2: Priser og betaling */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <CreditCard size={20} />
            <CmsText
              slug="terms-section-title-2"
              fallback="2. Priser og betaling"
              as="h2"
              className="font-headline-md text-onyx text-xl font-bold"
            />
          </div>
          <CmsText
            slug="terms-section-desc-2"
            fallback="Alle oppgitte priser i nettbutikken er inkludert merverdiavgift (MVA). Eventuelle fraktkostnader vil fremkomme i handlekurven før bestillingen fullføres. Du kan betale trygt med Vipps eller betalingskort (Visa, Mastercard) via vår integrerte og sikre Wix betalingsløsning."
            as="p"
          />
        </section>

        {/* Section 3: Avtaleinngåelse og bestilling */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <ShoppingBag size={20} />
            <CmsText
              slug="terms-section-title-3"
              fallback="3. Avtaleinngåelse"
              as="h2"
              className="font-headline-md text-onyx text-xl font-bold"
            />
          </div>
          <CmsText
            slug="terms-section-desc-3"
            fallback="Avtalen er bindende for begge parter når bestillingen din er registrert i våre systemer. Vi sender en ordrebekreftelse til oppgitt e-postadresse så snart kjøpet er godkjent."
            as="p"
          />
        </section>

        {/* Section 4: Levering og frakt */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <Truck size={20} />
            <CmsText
              slug="terms-section-title-4"
              fallback="4. Levering og frakt"
              as="h2"
              className="font-headline-md text-onyx text-xl font-bold"
            />
          </div>
          <CmsText
            slug="terms-section-desc-4"
            fallback="Vi pakker og sender vanligvis ordren din i løpet av 1-3 virkedager. Normal leveringstid med Posten/Bring er 2-5 virkedager, avhengig av hvor i landet du bor. Risikoen for varen går over på deg når du har mottatt pakken."
            as="p"
          />
        </section>

        {/* Section 5: Angrerett */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <RefreshCw size={20} />
            <CmsText
              slug="terms-section-title-5"
              fallback="5. Angrerett (14 dagers åpent kjøp)"
              as="h2"
              className="font-headline-md text-onyx text-xl font-bold"
            />
          </div>
          <CmsText
            slug="terms-section-desc-5"
            fallback="I henhold til angrerettsloven har du 14 dagers angrerett fra den dagen du mottar varen. For å benytte angreretten må varen returneres i ubrukt og original stand. Du må selv dekke returportoen med mindre annet er avtalt."
            as="p"
          />
        </section>

        {/* Section 6: Reklamasjon */}
        <section className="space-y-4 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-3 text-terracotta">
            <AlertCircle size={20} />
            <CmsText
              slug="terms-section-title-6"
              fallback="6. Reklamasjon og mangler"
              as="h2"
              className="font-headline-md text-onyx text-xl font-bold"
            />
          </div>
          <CmsText
            slug="terms-section-desc-6"
            fallback="Dersom varen har en mangel eller det har oppstått en feil under transport, må du ta kontakt med oss så snart som mulig (innen rimelig tid) slik at vi kan ordne erstatning eller refusjon i henhold til forbrukerkjøpsloven."
            as="p"
          />
          <p className="pt-2">
            Ved returer, feil eller spørsmål knyttet til bestillinger, ta kontakt på <CmsText slug="terms-support-email" fallback="kontakt@hiskingdomdesigns.no" as="strong" className="text-terracotta" />.
          </p>
        </section>
      </div>
      
      <div className="text-center text-xs text-secondary/60 mt-8">
        Sist oppdatert: <CmsText slug="terms-updated" fallback="7. juni 2026" as="span" />
      </div>
    </motion.main>
  );
}
