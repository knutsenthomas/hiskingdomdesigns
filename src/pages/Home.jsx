import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';

export default function Home() {
  const { products } = useApp();
  const navigate = useNavigate();

  // Filter out bestsellers
  const bestsellers = products.filter(p => p.isBestseller);

  useEffect(() => {
    // Intersection Observer for reveal-on-scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.reveal-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="pt-20"
    >
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Hero faith fashion" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLvJWfxlC8GKMXjf7zeiY1bbVVDq1a_ZX-nTKngBhdBwVlZ2WiV4ucv5hz6gZyDNTzMqpiGth48coynDj-4SKRbkeGROXThOokUqHOd6PFHcTcY96QJ1aJrs7uqwTiH5sHHMAD0P1T9_7SyoVOQnqSziTuoeEjsU48GG7-EVJ987E4ZYvBbvexby2s5Qoubzblv5lwneROe4M5vGuCHnG1KAVRZ2tuGEi0yIY1sqsU7w2pRWJKCI4tUR"
          />
          <div className="absolute inset-0 bg-onyx/20"></div>
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full">
          <div className="max-w-2xl text-white">
            <h1 className="font-headline-xl font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[48px] mb-6 drop-shadow-md">
              Bær troen med stolthet
            </h1>
            <p className="font-body-lg text-body-lg mb-10 text-white/90 leading-relaxed">
              Inspirerende design skapt for å dele Guds ord gjennom moderne mote og tilbehør. Oppdag vår nyeste kolleksjon i dag.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/products')}
                className="bg-terracotta hover:bg-primary-container text-white px-8 py-4 rounded font-label-md text-label-md transition-all active:scale-[0.98] shadow-lg"
              >
                Se kolleksjonen
              </button>
              <a 
                href="#historie"
                className="bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white px-8 py-4 rounded font-label-md text-label-md transition-all text-center flex items-center justify-center"
              >
                Vår historie
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-white border-b border-outline-variant/30 py-6 reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center justify-center gap-4 text-center md:text-left">
            <span className="material-symbols-outlined text-terracotta text-3xl">local_shipping</span>
            <div>
              <p className="font-label-md text-label-md text-onyx">Gratis frakt over 800 kr</p>
              <p className="text-label-sm text-secondary">Rask levering til hele landet</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-center md:text-left">
            <span className="material-symbols-outlined text-terracotta text-3xl">assignment_return</span>
            <div>
              <p className="font-label-md text-label-md text-onyx">30 dagers åpent kjøp</p>
              <p className="text-label-sm text-secondary">Enkel retur hvis du ombestemmer deg</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-center md:text-left">
            <span className="material-symbols-outlined text-terracotta text-3xl">bolt</span>
            <div>
              <p className="font-label-md text-label-md text-onyx">Lynrask levering</p>
              <p className="text-label-sm text-secondary">Sendes fra vårt lager innen 24 timer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories (Bento Grid) */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto py-section-gap reveal-on-scroll">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <span className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-2 block font-semibold">Kategorier</span>
            <h2 className="font-headline-lg text-2xl md:text-headline-lg text-onyx">Utforsk vårt utvalg</h2>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="text-terracotta font-label-md text-label-md flex items-center gap-2 hover:underline underline-offset-4 font-bold"
          >
            Se alle kategorier <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Klær Category */}
          <div 
            onClick={() => navigate('/category/Klær')}
            className="md:col-span-8 group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md cursor-pointer aspect-[16/10] md:aspect-auto md:h-[500px]"
          >
            <img 
              alt="Clothing collection" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLv4J8V9jg3579mtqffcPAu_gt1Na1gEpE7X2qkAgryCvtPcOeh0ESfU5U4aLEjB0IMpT9kSdNoYM4An6sQBmkw6iHxUGd4sZ04mdGRPb-szj-DhKGq_ORxArSsY9NhLzzjNhzbqcLZTQdFBEFGTHxiyiAWfuVJ8xBYqPFNjDAHrpPJ_fVO4ypnMcsTbpOVVWijZb7ZpeYQO1ZnuBj9LwVcbOLKJh3vm-vSIveIXCSboeE06hSbr6aV2uw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-onyx/75 to-transparent flex flex-col justify-end p-8">
              <h3 className="text-white font-headline-md text-headline-md mb-2">Klær</h3>
              <p className="text-white/80 font-body-md text-body-md mb-4 max-w-sm">Moderne t-skjorter og hettegensere med budskap.</p>
              <span className="w-fit bg-white text-onyx px-5 py-2.5 rounded font-label-md text-label-md group-hover:bg-terracotta group-hover:text-white transition-colors duration-300">
                Handle nå
              </span>
            </div>
          </div>
          
          <div className="md:col-span-4 flex flex-col gap-gutter">
            {/* Klistermerker Category */}
            <div 
              onClick={() => navigate('/category/Klistermerker')}
              className="h-60 md:h-[238px] group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <img 
                alt="Stickers category" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLszihbNKwjOsKdnixf-5r35a6Xba2jlEmuqK6Ow72s8KEL52iJCXqZJrshr6YDlc03OqnuU4KZvmcKRaGwOX7Idbd9VsvxGhNJ8V30WGHf6RRHtzg7bw5ZarKCFYFpP05FYaleB_OCre6P4QrICKQyWws5x-mYsQlu2fhc91h9_obAeP-jeSREE2bDD9RVgwfg1vfpj_wKCPLkN1l4b9MD3SgYwtLtb9RddUykqMykJvv9U4mu43gvsDA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/75 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white font-headline-md text-headline-md">Klistermerker</h3>
                <p className="text-white/70 text-label-sm mt-1">Små påminnelser i hverdagen.</p>
              </div>
            </div>
            
            {/* Plakater Category */}
            <div 
              onClick={() => navigate('/category/Plakater')}
              className="h-60 md:h-[238px] group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <img 
                alt="Posters category" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLtA5Wejh-acQOMfMxekjYryt6bxtjj3vnr-WRJvzY5vPB0gWYTV9mJoqtNjHjtFyZPcmtR_fF0GMsqHzLPVYGOBg0qMTf_C8Rj7YN0RDf1ZwX_rSFomzQK9QWQq0ltc1SoqaU2ypKQxUpP2lV2pf2pQr8TGwhinfhzYJPNkBsj_P3q-ZWaT4JUhewinEQk-4_kudEyuJVr0OaMoKbJ0yZs9bnfn3r6yMcOt7st5zMBV4hYqOQBydQk6wA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/75 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white font-headline-md text-headline-md">Plakater</h3>
                <p className="text-white/70 text-label-sm mt-1">Dekorer hjemmet ditt med håp.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-white py-section-gap reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
          <h2 className="font-headline-lg text-2xl md:text-headline-lg text-center mb-12 md:mb-16 text-onyx">
            Våre bestselgere
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-gutter">
            {bestsellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-parchment py-section-gap overflow-hidden reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
          <h2 className="font-headline-lg text-2xl md:text-headline-lg text-center mb-12 text-onyx">
            Kundeuttalelser
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex text-terracotta mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <p className="font-body-md text-body-md italic mb-6 text-onyx/80">
                  "Fantastisk kvalitet på t-skjortene! De holder formen vask etter vask, og budskapet starter alltid gode samtaler."
                </p>
              </div>
              <p className="font-label-md text-label-md text-onyx font-bold">- Maria H.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex text-terracotta mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <p className="font-body-md text-body-md italic mb-6 text-onyx/80">
                  "Plakatene er så fine! De gir stuen min en helt egen ro og påminnelse om Guds fred hver eneste dag."
                </p>
              </div>
              <p className="font-label-md text-label-md text-onyx font-bold">- Andreas T.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div>
                <div className="flex text-terracotta mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                </div>
                <p className="font-body-md text-body-md italic mb-6 text-onyx/80">
                  "Lynrask levering! Bestilte på mandag og pakken var i postkassen allerede onsdag. Veldig fornøyd."
                </p>
              </div>
              <p className="font-label-md text-label-md text-onyx font-bold">- Karoline S.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Packages */}
      <section className="bg-white py-section-gap overflow-hidden reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-terracotta/10 rounded-full blur-3xl"></div>
            <img 
              alt="Monthly package showcase" 
              className="relative z-10 rounded-2xl shadow-xl w-full object-cover h-[450px]" 
              src="https://lh3.googleusercontent.com/aida/AP1WRLtaeP4sbiCpFCqqDrZM7VDSEFGDx5q6wvELtmzRkL4O1HG902BpXIXDtecwZReiKpp-UgpIHkjOWvq8yzu8qEt6SvlAkjZ1oBkeQtagiDSzjZ18kiIIVaalaitHrlYF1fcL6qa7GeO46hDwUCNSfexKWg-_AI19gVlUYsZG9iiz8S3OwEjOn7hbYxl9ttJm-hfpTyrh8T7SI91FQ8X8nEItcOjtz9Ib_DtFpBhEtay-_PrGrVMyDgrW4w"
            />
          </div>
          <div className="w-full lg:w-1/2">
            <span className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-4 block font-semibold">Månedspakker</span>
            <h2 className="font-headline-xl text-2xl md:text-3xl lg:text-[48px] mb-6 text-onyx" style={{ lineHeight: '1.2' }}>Litt hverdagskos rett i postkassen</h2>
            <p className="font-body-lg text-body-lg mb-8 text-secondary leading-relaxed">
              Velg mellom våre populære abonnementsløsninger som "Kopp &amp; Kos" eller "Klistermerkepakken". Perfekt som en gave til deg selv eller en du er glad i.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-terracotta shrink-0" />
                <span className="font-body-md text-onyx/80">Ingen bindingstid – avslutt når du vil</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-terracotta shrink-0" />
                <span className="font-body-md text-onyx/80">Eksklusive design kun for abonnenter</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle size={20} className="text-terracotta shrink-0" />
                <span className="font-body-md text-onyx/80">Gratis frakt på alle pakker</span>
              </li>
            </ul>
            <button className="bg-onyx text-white px-10 py-4 rounded-lg font-label-md text-label-md hover:bg-terracotta hover:scale-[1.02] transition-all shadow-lg active:scale-[0.98]">
              Se pakkene
            </button>
          </div>
        </div>
      </section>

      {/* Brand Story & Values */}
      <section id="historie" className="py-section-gap bg-parchment reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-[800px] mx-auto text-center">
          <div className="inline-block p-4 rounded-full bg-white mb-8 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-terracotta">church</span>
          </div>
          <h2 className="font-headline-lg text-2xl md:text-headline-lg mb-6 text-onyx">Hva betyr His Kingdom for oss?</h2>
          <p className="font-body-lg text-body-lg text-secondary leading-relaxed mb-12">
            Vi tror på kraften i de små tingene. En t-skjorte som starter en samtale, et klistermerke som gir oppmuntring på en grå dag, eller en plakat som minner oss på Guds trofasthet i hjemmet. Vår misjon er å skape vakre, moderne produkter som bærer et evig budskap.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30">
              <h4 className="font-headline-md text-onyx mb-2">Kvalitet</h4>
              <p className="text-label-sm text-secondary opacity-80">Nøye utvalgte materialer for lang holdbarhet.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30">
              <h4 className="font-headline-md text-onyx mb-2">Budskap</h4>
              <p className="text-label-sm text-secondary opacity-80">Bibelsk forankret og moderne designet.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30">
              <h4 className="font-headline-md text-onyx mb-2">Fellesskap</h4>
              <p className="text-label-sm text-secondary opacity-80">Bygget for å inspirere og dele troen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <section className="py-section-gap bg-white reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline-lg text-2xl md:text-headline-lg mb-4 text-onyx">Følg oss på Instagram</h2>
            <p className="text-secondary font-body-md">Se hvordan våre kunder bærer sin tro @hiskingdomdesigns</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="aspect-square relative group overflow-hidden rounded-lg cursor-pointer">
              <img 
                alt="Instagram feed 1" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLtrw2htgQN1zfVzg4whrup6DQAKIgwIMIDXOnBqjIb_uWyoDo7cvZSFG7RPfxA0EiNT-zxQlvXNeF_wF_ob4rS8zmsOQ5LjG3MFLos92W8pD3S_9JM7EYyv47SrZNaa5g-y8RGUtlnkEotsquLvK4r4MKjbWSzn7QX1I2SgvNZGLqpgg4Ej4uFhRydn8on9kF4jkL8VKypTr4JBriKZro3XG6oixkpA2hjyhExNEeywETxZIeEn4YfV"
              />
              <div className="absolute inset-0 bg-onyx/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">favorite</span>
              </div>
            </div>
            <div className="aspect-square relative group overflow-hidden rounded-lg cursor-pointer">
              <img 
                alt="Instagram feed 2" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLsptlMOGRGL00xzeOWps4PZ6d3y2hNxGVPcWSpkA2sum7nGSw26JQewmdHmP1lK0kID5Gs8iWSfGqljy4-RkrPzRhy5WyHj0U1ZUj2qOm9f2lpEvt0ea1BHItnefXFXuz0D6izjf-RXOZ4_GqAbgdaDiaP1fN2b3dR__V65k9nrCiFUIdo-AKNNNX3JX92ViMu42X2K3rReZAbME2itysslGYsBk9ZXL1k_JpWhjKEBsLhkDq5ggLa9"
              />
              <div className="absolute inset-0 bg-onyx/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">favorite</span>
              </div>
            </div>
            <div className="aspect-square relative group overflow-hidden rounded-lg cursor-pointer">
              <img 
                alt="Instagram feed 3" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLvJWfxlC8GKMXjf7zeiY1bbVVDq1a_ZX-nTKngBhdBwVlZ2WiV4ucv5hz6gZyDNTzMqpiGth48coynDj-4SKRbkeGROXThOokUqHOd6PFHcTcY96QJ1aJrs7uqwTiH5sHHMAD0P1T9_7SyoVOQnqSziTuoeEjsU48GG7-EVJ987E4ZYvBbvexby2s5Qoubzblv5lwneROe4M5vGuCHnG1KAVRZ2tuGEi0yIY1sqsU7w2pRWJKCI4tUR"
              />
              <div className="absolute inset-0 bg-onyx/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">favorite</span>
              </div>
            </div>
            <div className="aspect-square relative group overflow-hidden rounded-lg cursor-pointer">
              <img 
                alt="Instagram feed 4" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                src="https://lh3.googleusercontent.com/aida/AP1WRLtxy7b2t4ReBQEpdU-xdZ2kCnl2UpDNkd8DehvIkXz3cNrFYRvwDKpbTuAW4dcRyZSowggzen0ojoy3ZSbWMEc30-dDmJXHPFz7Q_9uJ8Rvx8tD1tK6YJXJSjDOmPpoeBDD-FiVZLzdsF8MC4nZLkaCqmGCRqatvFOz49FgBg3SeJnqtzMPyDHDEFFM91Xw0g3cHi5q8mo9KW-l87GESrBKRkPPZmfqZm5hvFOzLlXnlH5RhESATdJBjw"
              />
              <div className="absolute inset-0 bg-onyx/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">favorite</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <a 
              href="#" 
              className="inline-flex items-center gap-2 bg-onyx text-white px-8 py-4 rounded font-label-md text-label-md hover:bg-terracotta hover:scale-[1.02] transition-all"
            >
              @hiskingdomdesigns
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto mb-section-gap reveal-on-scroll">
        <div className="bg-onyx rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-terracotta/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-headline-lg text-2xl md:text-headline-lg text-parchment mb-4">
              Bli med i vårt fellesskap
            </h2>
            <p className="font-body-md text-body-md text-parchment/70 mb-10">
              Meld deg på vårt nyhetsbrev for eksklusive tilbud, inspirerende ord og nyheter om nye kolleksjoner.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 justify-center">
              <input 
                className="bg-white/10 border border-white/20 text-white px-6 py-4 rounded-lg focus:outline-none focus:border-terracotta transition-colors placeholder:text-white/40 w-full sm:max-w-md" 
                placeholder="Din e-postadresse" 
                type="email"
                required
              />
              <button 
                className="bg-terracotta hover:bg-primary-container text-white px-8 py-4 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap active:scale-95" 
                type="submit"
              >
                Meld meg på
              </button>
            </form>
            <p className="text-label-sm text-parchment/40 mt-4">Vi respekterer ditt personvern. Avmeld deg når som helst.</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
