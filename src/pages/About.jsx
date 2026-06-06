import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, Shield, Compass } from 'lucide-react';

export default function About() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-3 block font-semibold">
          Vår Historie
        </span>
        <h1 className="font-headline-xl text-headline-xl text-onyx mb-6">
          Å bringe troen inn i det moderne hjemmet
        </h1>
        <p className="font-body-lg text-body-lg text-secondary leading-relaxed">
          His Kingdom Designs ble etablert med et ønske om å kombinere moderne skandinavisk estetikk med dype, kristne verdier. Vi tror på kraften i de synlige påminnelsene i hverdagen.
        </p>
      </div>

      {/* Narrative grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-28">
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-terracotta/10 rounded-full blur-3xl -z-10"></div>
          <img 
            alt="Vår visjon" 
            className="rounded-2xl shadow-xl w-full object-cover h-[450px]" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLvJWfxlC8GKMXjf7zeiY1bbVVDq1a_ZX-nTKngBhdBwVlZ2WiV4ucv5hz6gZyDNTzMqpiGth48coynDj-4SKRbkeGROXThOokUqHOd6PFHcTcY96QJ1aJrs7uqwTiH5sHHMAD0P1T9_7SyoVOQnqSziTuoeEjsU48GG7-EVJ987E4ZYvBbvexby2s5Qoubzblv5lwneROe4M5vGuCHnG1KAVRZ2tuGEi0yIY1sqsU7w2pRWJKCI4tUR"
          />
        </div>
        <div className="space-y-6">
          <h2 className="font-headline-lg text-headline-lg text-onyx">Hvorfor vi startet</h2>
          <p className="font-body-md text-body-md text-secondary leading-relaxed">
            I en travel og støyende verden er det lett å miste fokus på det som betyr mest. Vi ønsket å skape produkter som ikke bare ser flotte ut, men som bærer et meningsfullt budskap. Hvert plagg, bilde og tilbehør vi designer er ment å være en samtalestarter, en oppmuntring eller en daglig påminnelse om Guds løfter.
          </p>
          <p className="font-body-md text-body-md text-secondary leading-relaxed">
            Gjennom kompromissløs kvalitet på råmaterialer og et minimalistisk, tidsriktig formspråk, ønsker vi å tilby trosbaserte produkter som du stolt kan bruke og dekorere hjemmet ditt med.
          </p>
          <div className="pt-4">
            <Link 
              to="/products"
              className="inline-flex items-center gap-2 bg-terracotta text-white px-8 py-4 rounded-xl font-label-md text-label-md hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-lg"
            >
              <span>Utforsk kolleksjonen</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-white rounded-3xl p-12 md:p-20 shadow-sm border border-outline-variant/30 mb-28">
        <h2 className="font-headline-lg text-headline-lg text-onyx text-center mb-16">Våre Kjerneverdier</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
              <Heart size={28} />
            </div>
            <h3 className="font-headline-md text-onyx text-xl">Kjærlighet & Misjon</h3>
            <p className="font-body-md text-secondary leading-relaxed">
              Vi brenner for å spre det gode budskap om Guds rike. En del av vårt overskudd går direkte til misjonsarbeid og veldedige kristne formål.
            </p>
          </div>
          
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
              <Shield size={28} />
            </div>
            <h3 className="font-headline-md text-onyx text-xl">Ekte Kvalitet</h3>
            <p className="font-body-md text-secondary leading-relaxed">
              Fra økologisk bomull til tykt, syrefritt kunstpapir. Vi inngår ingen kompromisser når det gjelder produktenes holdbarhet og finish.
            </p>
          </div>

          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
              <Compass size={28} />
            </div>
            <h3 className="font-headline-md text-onyx text-xl">Moderne Design</h3>
            <p className="font-body-md text-secondary leading-relaxed">
              Vi skaper tidsriktig mote og interiør som naturlig passer inn i det skandinaviske hjemmet, uten å miste det bibelske fundamentet.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Banner */}
      <div className="bg-onyx rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="font-headline-lg text-headline-lg text-white">Har du spørsmål om oss eller produktene?</h2>
          <p className="font-body-md text-parchment/70">
            Vi har samlet svar på de vanligste spørsmålene angående frakt, materialer, og våre abonnementspakker.
          </p>
          <div className="pt-2">
            <Link 
              to="/faq" 
              className="bg-white text-onyx px-8 py-4 rounded-xl font-label-md hover:bg-terracotta hover:text-white transition-all inline-block active:scale-95 font-bold shadow-md"
            >
              Les Ofte Stilte Spørsmål
            </Link>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
