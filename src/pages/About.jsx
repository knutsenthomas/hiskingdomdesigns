import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Shield, Compass } from 'lucide-react';
import CmsText from '@/components/CmsText';
import useMeta from '@/hooks/useMeta';

export default function About() {
  useMeta(
    "Om oss",
    "Lær mer om His Kingdom Ministry og His Kingdom Designs. Vi driver med undervisning, bønn og misjon med base i Lyngdal, og tilbyr kristne produkter."
  );

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <CmsText
          slug="about-badge"
          fallback="Hvem er vi"
          as="span"
          className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-3 block font-semibold"
        />
        <CmsText
          slug="about-title"
          fallback="His Kingdom Ministry & Designs"
          as="h1"
          className="font-headline-xl text-headline-xl text-onyx mb-6"
        />
        <p className="font-body-lg text-body-lg text-secondary leading-relaxed">
          <a 
            href="https://hiskingdomministry.no/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-terracotta hover:underline font-semibold transition-colors"
          >
            His Kingdom Ministry
          </a>{' '}
          er en kristen organisasjon med base i Lyngdal. Vi driver med undervisning, bønn og misjon, og ønsker å hjelpe folk å vokse i troen sin.
        </p>
      </div>

      {/* Narrative grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-28">
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-terracotta/10 rounded-full blur-3xl -z-10"></div>
          <img 
            alt="Vår tjeneste" 
            className="rounded-2xl shadow-xl w-full object-cover h-[450px]" 
            src="https://static.wixstatic.com/media/db4f96_2b25900fd882417e8fc88a62002ba11a~mv2.jpg/v1/fill/w_900,h_675,al_c,q_85,usm_0.66_1.00_0.01/FullSizeRender_edited_edited_edited_edited%20(1).jpg"
          />
        </div>
        <div className="space-y-6">
          <CmsText
            slug="about-narrative-title"
            fallback="Vårt fokus og arbeid"
            as="h2"
            className="font-headline-lg text-headline-lg text-onyx"
          />
          <CmsText
            slug="about-narrative-p1"
            fallback="Vi ønsker å inspirere og utruste troende til å leve et liv i nær relasjon med Jesus. Som en del av vår tjeneste produserer vi en ukentlig podcast med andakter som gir åndelig påfyll i hverdagen, og vi arrangerer regelmessig ulike samlinger, bønnemøter og oppbyggelige seminarer."
            as="p"
            className="font-body-md text-body-md text-secondary leading-relaxed"
          />
          <CmsText
            slug="about-narrative-p2"
            fallback="Gjennom nettbutikken His Kingdom Designs ønsker vi å tilby vakre, moderne og konkrete påminnelser om Guds ord som du kan bære med deg eller pynte hjemmet ditt med. Hvert eneste produkt er skapt for å starte gode samtaler og minne oss på Guds uendelige kjærlighet og løfter."
            as="p"
            className="font-body-md text-body-md text-secondary leading-relaxed"
          />
          <div className="pt-4">
            <Link 
              to="/products"
              className="inline-flex items-center gap-2 bg-terracotta text-white px-8 py-4 rounded-xl font-label-md text-label-md hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-lg"
            >
              <span>Se produktene våre</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-white rounded-3xl p-12 md:p-20 shadow-sm border border-outline-variant/30 mb-28">
        <CmsText
          slug="about-values-title"
          fallback="Vår Tjeneste"
          as="h2"
          className="font-headline-lg text-headline-lg text-onyx text-center mb-16"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
              <Heart size={28} />
            </div>
            <CmsText
              slug="about-value-title-1"
              fallback="Bønn & Forbønn"
              as="h3"
              className="font-headline-md text-onyx text-xl font-bold"
            />
            <CmsText
              slug="about-value-desc-1"
              fallback="Vi brenner for forbønn og profetisk tjeneste. Vi ønsker å se mennesker bli satt i frihet og få oppleve Guds helbredende kraft."
              as="p"
              className="font-body-md text-secondary leading-relaxed"
            />
          </div>
          
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
              <Shield size={28} />
            </div>
            <CmsText
              slug="about-value-title-2"
              fallback="Utrustning & Lære"
              as="h3"
              className="font-headline-md text-onyx text-xl font-bold"
            />
            <CmsText
              slug="about-value-desc-2"
              fallback="Gjennom seminarer, andakter og podcasten vår ønsker vi å gi sunn bibelsk undervisning som styrker din personlige vandring med Gud."
              as="p"
              className="font-body-md text-secondary leading-relaxed"
            />
          </div>

          <div className="space-y-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
              <Compass size={28} />
            </div>
            <CmsText
              slug="about-value-title-3"
              fallback="Kreativ Formidling"
              as="h3"
              className="font-headline-md text-onyx text-xl font-bold"
            />
            <CmsText
              slug="about-value-desc-3"
              fallback="Ved å forene estetisk vakkert design med troens budskap, skaper vi moderne t-skjorter, plakater og tilbehør som bærer Guds ord ut i hverdagen."
              as="p"
              className="font-body-md text-secondary leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* FAQ Banner */}
      <div className="bg-onyx rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <CmsText
            slug="about-faq-banner-title"
            fallback="Har du spørsmål om oss eller våre produkter?"
            as="h2"
            className="font-headline-lg text-headline-lg text-white"
          />
          <CmsText
            slug="about-faq-banner-desc"
            fallback="Vi har samlet svar på de vanligste spørsmålene angående frakt, materialer, og våre abonnementspakker."
            as="p"
            className="font-body-md text-parchment/70"
          />
          <div className="pt-2">
            <Link 
              to="/faq" 
              className="bg-white text-onyx px-8 py-4 rounded-xl font-label-md hover:bg-terracotta hover:text-white transition-all inline-block active:scale-95 font-bold shadow-md"
            >
              Les ofte stilte spørsmål
            </Link>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
