import React from 'react';
import { motion } from 'framer-motion';
import { Truck, RotateCcw, AlertCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Shipping() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-3 block font-semibold">
          Kundeinfo
        </span>
        <h1 className="font-headline-xl text-headline-xl text-onyx mb-6">
          Frakt og retur
        </h1>
        <p className="font-body-lg text-body-lg text-secondary leading-relaxed">
          Vi ønsker at handelen din hos His Kingdom Designs skal være så enkel og trygg som overhodet mulig. Her finner du all informasjon du trenger angående leveringstider, fraktpriser og returprosesser.
        </p>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Shipping details */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 md:p-12 shadow-sm space-y-6">
          <div className="flex items-center gap-4 text-terracotta mb-4">
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center">
              <Truck size={24} />
            </div>
            <h2 className="font-headline-lg text-headline-lg text-onyx text-2xl font-bold">Levering & Frakt</h2>
          </div>
          
          <p className="font-body-md text-secondary leading-relaxed">
            Alle våre varer sendes direkte fra vårt lager i Mandal. Vi pakker og klargjør bestillingen din raskt slik at du får varene dine i postkassen uten unødvendig ventetid.
          </p>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="font-label-md text-onyx font-bold">Fraktpris (Ordre over 800 kr)</span>
              <span className="font-label-md text-terracotta font-bold">Gratis frakt</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="font-body-md text-secondary">Standardfrakt (Ordre under 800 kr)</span>
              <span className="font-label-md text-onyx">49 kr</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="font-body-md text-secondary">Behandlingstid på lageret</span>
              <span className="font-label-md text-onyx">Innen 24 timer</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-body-md text-secondary">Leveringstid (Helthjem / Posten)</span>
              <span className="font-label-md text-onyx">2 - 4 virkedager</span>
            </div>
          </div>
          
          <div className="bg-parchment p-4 rounded-xl border border-outline-variant/30 flex gap-3 text-secondary text-sm">
            <AlertCircle size={18} className="text-terracotta shrink-0 mt-0.5" />
            <p>Vi sender pakken med sporingsnummer slik at du kan følge forsendelsen hele veien fram til leveringsstedet.</p>
          </div>
        </div>

        {/* Return details */}
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 md:p-12 shadow-sm space-y-6">
          <div className="flex items-center gap-4 text-terracotta mb-4">
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center">
              <RotateCcw size={24} />
            </div>
            <h2 className="font-headline-lg text-headline-lg text-onyx text-2xl font-bold">Enkel Retur & Kjøpsvilkår</h2>
          </div>
          
          <p className="font-body-md text-secondary leading-relaxed">
            Vi ønsker at du skal være 100% fornøyd med kjøpet ditt. Derfor tilbyr vi utvidet åpent kjøp og en helt ukomplisert returprosess dersom produktene ikke passer eller står til forventningene.
          </p>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-onyx flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <div>
                <h4 className="font-label-md text-onyx font-bold">30 dagers åpent kjøp</h4>
                <p className="font-body-sm text-secondary">Du har full rett til å angre eller bytte i 30 dager etter mottatt vare.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-onyx flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <div>
                <h4 className="font-label-md text-onyx font-bold">Fyll ut returskjema</h4>
                <p className="font-body-sm text-secondary">Bruk returseddelen som fulgte med i pakken, eller kontakt oss på e-post for å få tilsendt en ny på sekunder.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-onyx flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <div>
                <h4 className="font-label-md text-onyx font-bold">Rask tilbakebetaling</h4>
                <p className="font-body-sm text-secondary">Så snart vi har mottatt og registrert returen, tilbakebetaler vi pengene via samme betalingsmåte (Vipps/kort) innen 3-5 dager.</p>
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
          <h3 className="font-headline-md text-headline-md text-white">Har du spørsmål om en pågående levering?</h3>
          <p className="font-body-md text-parchment/70">
            Vårt kundeserviceteam hjelper deg gjerne. Ta kontakt på <strong className="text-white">kontakt@hiskingdom.no</strong>, eller start en samtale med vår AI-assistent nede i høyre hjørne.
          </p>
          <div className="pt-2">
            <Link 
              to="/products"
              className="bg-terracotta text-white px-8 py-4 rounded-xl font-label-md hover:bg-opacity-90 transition-all inline-block active:scale-95 font-bold shadow-md"
            >
              Fortsett å handle
            </Link>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
