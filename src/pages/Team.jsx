import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Facebook, Instagram, Youtube } from 'lucide-react';
import CmsText from '@/components/CmsText';

const TEAM_MEMBERS = [
  {
    name: 'Hilde Karin Knutsen',
    role: 'Misjonær & Profetisk Forbeder',
    bio: 'Hilde Karin har reist som misjonær og profetisk forbeder i over halve livet sitt. Gjennom Bibelens prinsipper og Den Hellige Ånds ledelse hjelper hun deg å vokse i ditt personlige forhold to Jesus Kristus, og utruste deg til å bli alt det han har skapt deg til å være. Hun brenner for å se Guds verk manifestere seg gjennom mirakler, helbredelse og frelse.',
    slugRole: 'team-member-role-hilde',
    slugBio: 'team-member-bio-hilde',
    avatar: 'HKK',
    image: 'https://static.wixstatic.com/media/db4f96_f1a7f17d0fe846069396b87f38497068~mv2.jpg/v1/fill/w_300,h_400,al_c,q_80,usm_0.66_1.00_0.01/IMG_8972_edited%20(1).jpg',
    color: 'bg-terracotta/10 text-terracotta border-terracotta/20',
    socials: [
      { icon: <Instagram size={16} />, url: 'https://www.instagram.com/freedomisathand/', label: 'Instagram' },
      { icon: <Facebook size={16} />, url: 'https://www.facebook.com/hiskingdomministry777?locale=nb_NO', label: 'Facebook' },
      { icon: <Youtube size={16} />, url: 'https://www.youtube.com/@HisKingdomMinistry', label: 'YouTube' }
    ]
  },
  {
    name: 'Thomas Knutsen',
    role: 'Tilbedelsesleder & Teknisk Ansvarlig',
    bio: 'Thomas har vært tilbedelsesleder siden han var 15 år gammel og elsker å lede lovsang. Han har jobbet 15 år i samme kirke med alt fra barn, ungdom og lovsang til administrasjon. I His Kingdom Ministry har han ansvaret for alt det tekniske – fra nettsiden og butikken til redigering av videoer og podcaster.',
    slugRole: 'team-member-role-thomas',
    slugBio: 'team-member-bio-thomas',
    avatar: 'TK',
    image: 'https://static.wixstatic.com/media/db4f96_08185e402228443aa9f27b32ff3ada42~mv2.jpg/v1/fill/w_300,h_400,al_c,q_80,usm_0.66_1.00_0.01/IMG_0040_edited%20(1).jpg',
    color: 'bg-[#1B4965]/10 text-[#1B4965] border-[#1B4965]/20',
    socials: [
      { icon: <Instagram size={16} />, url: 'https://www.instagram.com/tkdesignandmusic/', label: 'Instagram' },
      { icon: <Facebook size={16} />, url: 'https://www.facebook.com/thomas.knutsen.75/?locale=nb_NO', label: 'Facebook' }
    ]
  }
];

export default function Team() {
  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <CmsText
          slug="team-badge"
          fallback="Folkene Bak"
          as="span"
          className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-3 block font-semibold"
        />
        <CmsText
          slug="team-title"
          fallback="Møt hjertene bak tjenesten"
          as="h1"
          className="font-headline-xl text-headline-xl text-onyx mb-6"
        />
        <CmsText
          slug="team-desc"
          fallback="Vi koblet sammen med en gang og er så velsignet at Gud forente livene våre sammen for å tjene Hans rike. Vi elsker å se liv bli forandret og mennesker vokse i troen."
          as="p"
          className="font-body-lg text-body-lg text-secondary leading-relaxed"
        />
      </div>

      {/* Team grid - centered columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto mb-24">
        {TEAM_MEMBERS.map((member, index) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-2xl border border-outline-variant/30 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              {/* Profile Image */}
              <div className="w-full aspect-[3/4] rounded-xl overflow-hidden mb-6 border border-outline-variant/20 shadow-inner bg-slate-50">
                <img 
                  alt={member.name} 
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-300" 
                  src={member.image}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <h3 className="font-headline-md text-onyx text-[21px] mb-1 font-bold">{member.name}</h3>
              <CmsText
                slug={member.slugRole}
                fallback={member.role}
                as="p"
                className="text-terracotta font-label-sm text-label-sm mb-4 font-semibold"
              />
              <CmsText
                slug={member.slugBio}
                fallback={member.bio}
                as="p"
                className="font-body-sm text-body-sm text-secondary leading-relaxed mb-6"
              />
            </div>
            {/* Social triggers */}
            <div className="flex gap-4 border-t border-slate-100 pt-4">
              <a href="mailto:post@hiskingdomministry.no" className="text-secondary hover:text-terracotta transition-colors" aria-label="E-post">
                <Mail size={16} />
              </a>
              {member.socials.map((soc) => (
                <a 
                  key={soc.url} 
                  href={soc.url} 
                  target="_blank" 
                  rel="noreferrer noopener" 
                  className="text-secondary hover:text-terracotta transition-colors" 
                  aria-label={soc.label}
                >
                  {soc.icon}
                </a>
              ))}
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
          <CmsText
            slug="team-base-title"
            fallback="Vår Base"
            as="h2"
            className="font-headline-lg text-headline-lg text-onyx"
          />
          <CmsText
            slug="team-base-desc"
            fallback="Vi holder til i hjertet av Mandal, i samlokaliserte kontorer sammen med Mandal Regnskapskontor. Her designer vi nye kolleksjoner for His Kingdom Designs, redigerer podcast-episoder og videoer for His Kingdom Ministry, og pakker alle forsendelser med kjærlighet og nøyaktighet."
            as="p"
            className="font-body-md text-secondary leading-relaxed"
          />
          <div className="text-label-sm text-secondary space-y-2">
            <p>
              <strong>Adresse: </strong>
              <CmsText
                slug="team-base-address"
                fallback="Store Elvegate 16, 4514 Mandal"
                as="span"
              />
            </p>
            <p>
              <strong>E-post: </strong>
              <CmsText
                slug="team-base-email"
                fallback="post@hiskingdomministry.no"
                as="span"
              />
            </p>
          </div>
        </div>
        <div className="md:w-1/2 w-full h-[300px] rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm relative bg-slate-50">
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
