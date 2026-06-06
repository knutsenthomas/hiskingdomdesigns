import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Globe } from 'lucide-react';

const TEAM_MEMBERS = [
  {
    name: 'Thomas Knutsen',
    role: 'Grunnlegger & Daglig Leder',
    bio: 'Thomas har over 15 års erfaring innen regnskap og forretningsutvikling. Han brenner for å kombinere strukturert regnskapsarbeid med kreativ nyskaping.',
    avatar: 'TK',
    color: 'bg-terracotta/10 text-terracotta border-terracotta/20',
  },
  {
    name: 'Helene Berg',
    role: 'Sjefdesigner & Kreativ leder',
    bio: 'Helene er utdannet innen grafisk design og visuell kommunikasjon. Det er hun som står bak de moderne, trosbaserte motivene og plakatdesignene våre.',
    avatar: 'HB',
    color: 'bg-[#1B4965]/10 text-[#1B4965] border-[#1B4965]/20',
  },
  {
    name: 'Jonas Stendal',
    role: 'Logistikk & Kundeservice',
    bio: 'Jonas sørger for at ordrene dine pakkes nøyaktig og sendes lynraskt fra vårt lager i Mandal. Han er også din primærkontakt for spørsmål om leveringer.',
    avatar: 'JS',
    color: 'bg-green-600/10 text-green-700 border-green-600/20',
  },
  {
    name: 'Camilla Hansen',
    role: 'Markedsansvarlig & Sosiale Medier',
    bio: 'Camilla styrer våre fellesskap på Instagram og Facebook, og er bindeleddet mellom His Kingdom Designs og våre engasjerte kunder over hele landet.',
    avatar: 'CH',
    color: 'bg-amber-600/10 text-amber-700 border-amber-600/20',
  }
];

export default function Team() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <span className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-3 block font-semibold">
          Folkene Bak
        </span>
        <h1 className="font-headline-xl text-headline-xl text-onyx mb-6">
          Møt vårt team
        </h1>
        <p className="font-body-lg text-body-lg text-secondary leading-relaxed">
          Vi er en engasjert gjeng lokalisert i Mandal som jobber hver dag for å levere produkter av ypperste klasse – fra designbordet og helt hjem til postkassen din.
        </p>
      </div>

      {/* Team grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {TEAM_MEMBERS.map((member, index) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-2xl border border-outline-variant/30 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Profile Avatar Graphics */}
              <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center font-bold text-2xl mb-6 mx-auto md:mx-0 ${member.color}`}>
                {member.avatar}
              </div>
              <h3 className="font-headline-md text-onyx text-[19px] mb-1 font-bold text-center md:text-left">{member.name}</h3>
              <p className="text-terracotta font-label-sm text-label-sm mb-4 font-semibold text-center md:text-left">{member.role}</p>
              <p className="font-body-sm text-body-sm text-secondary leading-relaxed mb-6 text-center md:text-left">
                {member.bio}
              </p>
            </div>
            {/* Social triggers */}
            <div className="flex gap-4 border-t border-slate-100 pt-4 justify-center md:justify-start">
              <a href="#" className="text-secondary hover:text-terracotta transition-colors" aria-label="E-post">
                <Mail size={16} />
              </a>
              <a href="#" className="text-secondary hover:text-terracotta transition-colors" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
              <a href="#" className="text-secondary hover:text-terracotta transition-colors" aria-label="Nettsted">
                <Globe size={16} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mandal office details block */}
      <div className="bg-parchment border border-outline-variant/40 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 space-y-6">
          <span className="material-symbols-outlined text-4xl text-terracotta bg-white p-4 rounded-2xl shadow-sm">
            location_on
          </span>
          <h2 className="font-headline-lg text-headline-lg text-onyx">Vårt Hovedkontor i Mandal</h2>
          <p className="font-body-md text-secondary leading-relaxed">
            Vi holder til i hjertet av Mandal, i samlokaliserte kontorer sammen med Mandal Regnskapskontor. Her designer vi nye kolleksjoner, administrerer nettbutikken og pakker alle forsendelser med kjærlighet og nøyaktighet.
          </p>
          <div className="text-label-sm text-secondary space-y-2">
            <p><strong>Adresse:</strong> Store Elvegate 16, 4514 Mandal</p>
            <p><strong>E-post:</strong> kontakt@hiskingdom.no</p>
          </div>
        </div>
        <div className="md:w-1/2 w-full h-[300px] rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm relative">
          <img 
            alt="Mandal kontor" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLv4J8V9jg3579mtqffcPAu_gt1Na1gEpE7X2qkAgryCvtPcOeh0ESfU5U4aLEjB0IMpT9kSdNoYM4An6sQBmkw6iHxUGd4sZ04mdGRPb-szj-DhKGq_ORxArSsY9NhLzzjNhzbqcLZTQdFBEFGTHxiyiAWfuVJ8xBYqPFNjDAHrpPJ_fVO4ypnMcsTbpOVVWijZb7ZpeYQO1ZnuBj9LwVcbOLKJh3vm-vSIveIXCSboeE06hSbr6aV2uw"
          />
        </div>
      </div>
    </motion.main>
  );
}
