import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Lock, FileText } from 'lucide-react';

export default function Privacy() {
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
        <span className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-3 block font-semibold">
          Juridisk
        </span>
        <h1 className="font-headline-xl text-headline-xl text-onyx mb-6">
          Personvernerklæring
        </h1>
        <p className="font-body-lg text-body-lg text-secondary leading-relaxed">
          Ditt personvern er ekstremt viktig for oss. Denne erklæringen beskriver hvordan His Kingdom Designs samler inn, behandler og beskytter dine personopplysninger i tråd med personopplysningsloven (GDPR).
        </p>
      </div>

      {/* Narrative block */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 md:p-12 shadow-sm space-y-8 text-secondary font-body-md leading-relaxed">
        
        {/* Section 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <Eye size={20} />
            <h2 className="font-headline-md text-onyx text-xl font-bold">1. Hvilke opplysninger samler vi inn?</h2>
          </div>
          <p>
            For å kunne ekspedere og levere ordrene dine samler vi inn følgende opplysninger når du foretar et kjøp i nettbutikken vår:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Navn og etternavn</li>
            <li>Leveringsadresse og postnummer/poststed</li>
            <li>E-postadresse (for ordrebekreftelser og fraktstatus)</li>
            <li>Telefonnummer (for varsling om levering)</li>
            <li>Kjøpshistorikk og valgte produkter</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <Lock size={20} />
            <h2 className="font-headline-md text-onyx text-xl font-bold">2. Hva brukes opplysningene til?</h2>
          </div>
          <p>
            Dine opplysninger behandles kun for legitime forretningsformål knyttet til din rolle som kunde hos oss:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gjennomføring og leveranse av din bestilling.</li>
            <li>Håndtering av eventuelle returer, bytter eller reklamasjoner.</li>
            <li>Kommunikasjon vedrørende kundeservice og ordrespørsmål.</li>
            <li>Utsendelse av nyhetsbrev, forutsatt at du aktivt har samtykket til dette.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <ShieldCheck size={20} />
            <h2 className="font-headline-md text-onyx text-xl font-bold">3. Betalingssikkerhet</h2>
          </div>
          <p>
            Betalinger på våre nettsider gjøres via sertifiserte og fullstendig krypterte betalingsløsninger (Vipps og anerkjente kortinnløsere). His Kingdom Designs lagrer aldri dine kredittkortdetaljer eller sensitive bankopplysninger på våre egne servere.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-terracotta">
            <FileText size={20} />
            <h2 className="font-headline-md text-onyx text-xl font-bold">4. Cookies (Informasjonskapsler)</h2>
          </div>
          <p>
            Vi bruker informasjonskapsler for å huske hvilke varer du har lagt i handlekurven din, analysere trafikken via Google Analytics (hvis du samtykker til det), og forbedre din generelle brukeropplevelse i nettbutikken. Du kan når som helst administrere dine innstillinger for informasjonskapsler nederst på siden.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4 border-t border-slate-100 pt-6">
          <h2 className="font-headline-md text-onyx text-xl font-bold">5. Dine rettigheter</h2>
          <p>
            Du har full rett til å kreve innsyn i hvilke opplysninger vi har lagret om deg. Du kan også kreve at vi korrigerer feilaktige opplysninger, eller ber om at alle dine personopplysninger slettes fra våre systemer, så fremt vi ikke er lovpålagt å oppbevare dem i henhold til bokføringsloven.
          </p>
          <p className="pt-2">
            For spørsmål angående ditt personvern eller innsynsbegjæringer, ta kontakt med oss på <strong className="text-terracotta">kontakt@hiskingdom.no</strong>.
          </p>
        </section>
      </div>
      
      <div className="text-center text-xs text-secondary/60 mt-8">
        Sist oppdatert: 6. juni 2026
      </div>
    </motion.main>
  );
}
