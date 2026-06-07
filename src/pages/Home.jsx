import React, { useEffect, useState } from 'react';
import { wixClient } from '@/lib/wix';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle, Award, BookOpen, Users } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import CmsText from '@/components/CmsText';

const MOCK_TESTIMONIALS = [
  {
    _id: 'mock-1',
    author: { authorName: 'Maria H.' },
    content: {
      rating: 5,
      title: 'Fantastisk kvalitet',
      body: 'Fantastisk kvalitet på t-skjortene! De holder formen vask etter vask, og budskapet starter alltid gode samtaler.'
    }
  },
  {
    _id: 'mock-2',
    author: { authorName: 'Andreas T.' },
    content: {
      rating: 5,
      title: 'Kjempefine plakater',
      body: 'Plakatene er så fine! De gir stuen min en helt egen ro og påminnelse om Guds fred hver eneste dag.'
    }
  },
  {
    _id: 'mock-3',
    author: { authorName: 'Karoline S.' },
    content: {
      rating: 5,
      title: 'Lynrask levering',
      body: 'Lynrask levering! Bestilte på mandag og pakken var i postkassen allerede onsdag. Veldig fornøyd.'
    }
  }
];

const FALLBACK_INSTAGRAM_FEED = [
  {
    id: 'static-1',
    mediaUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLtrw2htgQN1zfVzg4whrup6DQAKIgwIMIDXOnBqjIb_uWyoDo7cvZSFG7RPfxA0EiNT-zxQlvXNeF_wF_ob4rS8zmsOQ5LjG3MFLos92W8pD3S_9JM7EYyv47SrZNaa5g-y8RGUtlnkEotsquLvK4r4MKjbWSzn7QX1I2SgvNZGLqpgg4Ej4uFhRydn8on9kF4jkL8VKypTr4JBriKZro3XG6oixkpA2hjyhExNEeywETxZIeEn4YfV',
    permalink: 'https://www.instagram.com/hiskingdomdesigns/'
  },
  {
    id: 'static-2',
    mediaUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLsptlMOGRGL00xzeOWps4PZ6d3y2hNxGVPcWSpkA2sum7nGSw26JQewmdHmP1lK0kID5Gs8iWSfGqljy4-RkrPzRhy5WyHj0U1ZUj2qOm9f2lpEvt0ea1BHItnefXFXuz0D6izjf-RXOZ4_GqAbgdaDiaP1fN2b3dR__V65k9nrCiFUIdo-AKNNNX3JX92ViMu42X2K3rReZAbME2itysslGYsBk9ZXL1k_JpWhjKEBsLhkDq5ggLa9',
    permalink: 'https://www.instagram.com/hiskingdomdesigns/'
  },
  {
    id: 'static-3',
    mediaUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLvJWfxlC8GKMXjf7zeiY1bbVVDq1a_ZX-nTKngBhdBwVlZ2WiV4ucv5hz6gZyDNTzMqpiGth48coynDj-4SKRbkeGROXThOokUqHOd6PFHcTcY96QJ1aJrs7uqwTiH5sHHMAD0P1T9_7SyoVOQnqSziTuoeEjsU48GG7-EVJ987E4ZYvBbvexby2s5Qoubzblv5lwneROe4M5vGuCHnG1KAVRZ2tuGEi0yIY1sqsU7w2pRWJKCI4tUR',
    permalink: 'https://www.instagram.com/hiskingdomdesigns/'
  },
  {
    id: 'static-4',
    mediaUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLtxy7b2t4ReBQEpdU-xdZ2kCnl2UpDNkd8DehvIkXz3cNrFYRvwDKpbTuAW4dcRyZSowggzen0ojoy3ZSbWMEc30-dDmJXHPFz7Q_9uJ8Rvx8tD1tK6YJXJSjDOmPpoeBDD-FiVZLzdsF8MC4nZLkaCqmGCRqatvFOz49FgBg3SeJnqtzMPyDHDEFFM91Xw0g3cHi5q8mo9KW-l87GESrBKRkPPZmfqZm5hvFOzLlXnlH5RhESATdJBjw',
    permalink: 'https://www.instagram.com/hiskingdomdesigns/'
  }
];

export default function Home() {
  const { products } = useApp();
  const navigate = useNavigate();

  const [plansList, setPlansList] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);

  // Newsletter States
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState('');

  // Instagram Feed State
  const [instagramFeed, setInstagramFeed] = useState(FALLBACK_INSTAGRAM_FEED);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await wixClient.plans.queryPublicPlans().limit(10).find();
        if (response.items && response.items.length > 0) {
          setPlansList(response.items);
        }
      } catch (err) {
        console.warn('Wix Pricing Plans API not available or app not installed. Using mock fallback plans.', err);
      } finally {
        setIsLoadingPlans(false);
      }
    }
    fetchPlans();
  }, []);

  useEffect(() => {
    async function fetchTestimonials() {
      setIsLoadingTestimonials(true);
      try {
        console.log("HKD Debug: Henter omtaler fra Wix Reviews API...");
        const response = await wixClient.reviews.queryReviews()
          .descending('_createdDate')
          .limit(10)
          .find();
        console.log("HKD Debug: Wix API respons:", response);
        if (response && response.items && response.items.length > 0) {
          console.log(`HKD Debug: Fant ${response.items.length} godkjente omtaler:`, response.items);
          setTestimonialsList(response.items.slice(0, 3));
        } else {
          console.log("HKD Debug: API-et returnerte 0 godkjente omtaler. Sjekk om de må godkjennes i Wix-dashbordet.");
        }
      } catch (err) {
        console.warn('HKD Debug: Wix Reviews API feilet. Bruker mock-data.', err);
      } finally {
        setIsLoadingTestimonials(false);
      }
    }
    fetchTestimonials();
  }, []);

  useEffect(() => {
    async function fetchInstagramFeed() {
      try {
        const res = await fetch('https://feeds.behold.so/KiCxnETuzZIThlNXvTNW');
        if (res.ok) {
          const data = await res.json();
          const posts = Array.isArray(data) ? data : (data && Array.isArray(data.posts) ? data.posts : []);
          if (posts.length > 0) {
            const mappedFeed = posts.slice(0, 4).map(item => ({
              id: item.id || Math.random().toString(),
              mediaUrl: item.sizes?.medium?.mediaUrl || item.mediaUrl,
              permalink: item.permalink || 'https://www.instagram.com/hiskingdomdesigns/'
            }));
            setInstagramFeed(mappedFeed);
          }
        }
      } catch (err) {
        console.warn('Klarte ikke å hente Instagram feed fra Behold.so. Bruker fallback-bilder.', err);
      }
    }
    fetchInstagramFeed();
  }, []);

  const handleSubscribe = async (plan) => {
    if (plan._id.startsWith('mock-')) {
      alert(`Takk for din interesse i abonnementsplanen "${plan.name}"! Siden dette er en testbutikk, er denne abonnementsfunksjonen for øyeblikket i demomodus.`);
      return;
    }
    
    try {
      const redirectSession = await wixClient.redirects.createRedirectSession({
        pricingPlanCheckout: {
          planId: plan._id,
        },
        callbacks: {
          postFlowUrl: window.location.origin,
          thankYouPageUrl: window.location.origin + '/profile'
        }
      });
      if (redirectSession && redirectSession.fullUrl) {
        window.location.href = redirectSession.fullUrl;
      }
    } catch (err) {
      console.error('Subscription redirect error:', err);
      alert('Det oppstod en feil ved opprettelse av abonnement. Vennligst prøv igjen.');
    }
  };

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    setNewsletterError('');
    try {
      await wixClient.contacts.appendOrCreateContact({
        emails: [{ email: newsletterEmail }]
      });
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    } catch (err) {
      console.error('Error subscribing email to Wix CRM from Home page:', err);
      setNewsletterError('Det oppstod en feil. Vennligst prøv igjen.');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const MOCK_PLANS = [
    {
      _id: 'mock-plan-1',
      name: 'Klistermerkeklubben',
      description: 'Få 5 unike og oppmuntrende klistermerker rett i postkassen hver måned.',
      price: { amount: '49', currency: 'kr' },
      recurring: true,
      benefits: [
        '5 unike klistermerker/mnd',
        'Gratis frakt inkludert',
        'Eksklusive design',
        'Avslutt når som helst'
      ]
    },
    {
      _id: 'mock-plan-2',
      name: 'Kopp & Kos',
      description: 'Hver måned sender vi deg en splitter ny kopp med tro-budskap og kaffe/te.',
      price: { amount: '199', currency: 'kr' },
      recurring: true,
      benefits: [
        '1 premium kopp/mnd',
        'Utvalgt kaffe eller te',
        'Gratis frakt inkludert',
        'Avslutt når som helst'
      ],
      popular: true
    }
  ];

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
        <div className="relative z-10 px-8 sm:px-12 md:px-margin-desktop max-w-max-width mx-auto w-full">
          <div className="max-w-2xl text-white">
            <CmsText 
              slug="home-hero-title" 
              fallback="Bær troen med stolthet" 
              as="h1" 
              className="font-headline-xl font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[48px] mb-6 drop-shadow-md"
            />
            <CmsText 
              slug="home-hero-desc" 
              fallback="Inspirerende design skapt for å dele Guds ord gjennom moderne mote og tilbehør. Oppdag vår nyeste kolleksjon i dag." 
              as="p" 
              className="font-body-lg text-body-lg mb-10 text-white/90 leading-relaxed"
            />
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
              <CmsText slug="home-benefits-title-1" fallback="Gratis frakt over 1500 kr" as="p" className="font-label-md text-label-md text-onyx" />
              <CmsText slug="home-benefits-desc-1" fallback="Rask levering til hele landet" as="p" className="text-label-sm text-secondary" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-center md:text-left">
            <span className="material-symbols-outlined text-terracotta text-3xl">assignment_return</span>
            <div>
              <CmsText slug="home-benefits-title-2" fallback="30 dagers åpent kjøp" as="p" className="font-label-md text-label-md text-onyx" />
              <CmsText slug="home-benefits-desc-2" fallback="Enkel retur hvis du ombestemmer deg" as="p" className="text-label-sm text-secondary" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-center md:text-left">
            <span className="material-symbols-outlined text-terracotta text-3xl">bolt</span>
            <div>
              <CmsText slug="home-benefits-title-3" fallback="Lynrask levering" as="p" className="font-label-md text-label-md text-onyx" />
              <CmsText slug="home-benefits-desc-3" fallback="Sendes fra vårt lager innen 24 timer" as="p" className="text-label-sm text-secondary" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories (Bento Grid) */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto py-section-gap reveal-on-scroll">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <CmsText slug="home-categories-badge" fallback="Kategorier" as="span" className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-2 block font-semibold" />
            <CmsText slug="home-categories-title" fallback="Utforsk vårt utvalg" as="h2" className="font-headline-lg text-2xl md:text-headline-lg text-onyx" />
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
              <CmsText slug="home-category-title-1" fallback="Klær" as="h3" className="text-white font-headline-md text-headline-md mb-2" />
              <CmsText slug="home-category-desc-1" fallback="Moderne t-skjorter og hettegensere med budskap." as="p" className="text-white/80 font-body-md text-body-md mb-4 max-w-sm" />
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
                <CmsText slug="home-category-title-2" fallback="Klistermerker" as="h3" className="text-white font-headline-md text-headline-md" />
                <CmsText slug="home-category-desc-2" fallback="Små påminnelser i hverdagen." as="p" className="text-white/70 text-label-sm mt-1" />
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
                <CmsText slug="home-category-title-3" fallback="Plakater" as="h3" className="text-white font-headline-md text-headline-md" />
                <CmsText slug="home-category-desc-3" fallback="Dekorer hjemmet ditt med håp." as="p" className="text-white/70 text-label-sm mt-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-white py-section-gap reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
          <CmsText 
            slug="home-bestsellers-title" 
            fallback="Våre bestselgere" 
            as="h2" 
            className="font-headline-lg text-2xl md:text-headline-lg text-center mb-12 md:mb-16 text-onyx block" 
          />
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
          <CmsText
            slug="home-testimonials-title"
            fallback="Kundeuttalelser"
            as="h2"
            className="font-headline-lg text-2xl md:text-headline-lg text-center mb-12 text-onyx block"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {(testimonialsList.length > 0 ? testimonialsList : MOCK_TESTIMONIALS).map((item) => (
              <div 
                key={item._id} 
                className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-all duration-300"
              >
                <div>
                  <div className="flex text-terracotta mb-4">
                    {[...Array(item.content?.rating || 5)].map((_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ))}
                  </div>
                  {item.content?.title && (
                    <h4 className="font-bold text-sm text-onyx mb-2">{item.content.title}</h4>
                  )}
                  <p className="font-body-md text-body-md italic mb-6 text-onyx/80 leading-relaxed">
                    {item.content?.body}
                  </p>
                </div>
                <p className="font-label-md text-label-md text-onyx font-bold">
                  - {item.author?.authorName || 'Anonym'}
                </p>
              </div>
            ))}
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
            <CmsText 
              slug="home-subscription-badge" 
              fallback="Månedspakker" 
              as="span" 
              className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-4 block font-semibold"
            />
            <CmsText 
              slug="home-subscription-title" 
              fallback="Litt hverdagskos rett i postkassen" 
              as="h2" 
              className="font-headline-xl text-2xl md:text-3xl lg:text-[40px] mb-4 text-onyx font-extrabold"
              style={{ lineHeight: '1.2' }}
            />
            <CmsText
              slug="home-subscription-desc"
              fallback="Velg mellom våre populære abonnementsløsninger som Kopp & Kos eller Klistermerkeklubben. Perfekt som en gave."
              as="p"
              className="font-body-md text-body-md mb-8 text-secondary leading-relaxed"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {(plansList.length > 0 ? plansList : MOCK_PLANS).map((plan) => {
                const planId = plan._id;
                const priceVal = plan.price?.amount || plan.pricing?.price?.value || '0';
                const currencyVal = plan.price?.currency || plan.pricing?.price?.currency || 'kr';
                const isRecurring = plan.recurring || plan.pricing?.planProductType === 'RECURRING' || planId.startsWith('mock-');
                const planBenefits = plan.benefits || plan.perks?.values || [];
                
                return (
                  <div 
                    key={planId}
                    className={`bg-white rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between shadow-sm relative ${
                      plan.popular ? 'border-terracotta ring-2 ring-terracotta/25' : 'border-outline-variant/60 hover:border-terracotta/35'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-4 bg-terracotta text-white text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                        Populær
                      </span>
                    )}
                    <div>
                      <h3 className="font-bold text-onyx text-base mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-secondary text-xs mb-4 leading-relaxed line-clamp-3">
                        {plan.description}
                      </p>
                      <div className="flex items-baseline gap-0.5 mb-4">
                        <span className="text-lg font-black text-terracotta">
                          {priceVal} {currencyVal}
                        </span>
                        <span className="text-secondary text-[10px]">
                          /{isRecurring ? 'mnd' : 'engang'}
                        </span>
                      </div>
                      
                      {planBenefits.length > 0 && (
                        <ul className="space-y-2 mb-6">
                          {planBenefits.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px] text-onyx/90">
                              <span className="material-symbols-outlined text-emerald-600 text-xs shrink-0 select-none">check_circle</span>
                              <span>{typeof b === 'string' ? b : (b.text || '')}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleSubscribe(plan)}
                      className={`w-full py-2.5 rounded-lg font-bold transition-all active:scale-[0.98] shadow-sm text-center text-xs ${
                        plan.popular 
                          ? 'bg-terracotta text-white hover:opacity-95' 
                          : 'bg-onyx text-white hover:bg-slate-800'
                      }`}
                    >
                      Abonner nå
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story & Values */}
      <section id="historie" className="py-section-gap bg-parchment reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-[800px] mx-auto text-center">
          <div className="w-20 h-20 mb-8 flex items-center justify-center mx-auto overflow-hidden">
            <img src="/logo-hkm.png" alt="His Kingdom Designs Logo" className="w-full h-full object-contain" />
          </div>
          <CmsText 
            slug="home-about-title" 
            fallback="Hva betyr His Kingdom Designs for oss?" 
            as="h2" 
            className="font-headline-lg text-2xl md:text-headline-lg mb-6 text-onyx"
          />
          <CmsText 
            slug="home-about-desc" 
            fallback="Vi tror på kraften i de små tingene. En t-skjorte som starter en samtale, et klistermerke som gir oppmuntring på en grå dag, eller en plakat som minner oss på Guds trofasthet i hjemmet. Vår misjon er å skape vakre, moderne produkter som bærer et evig budskap." 
            as="p" 
            className="font-body-lg text-body-lg text-secondary leading-relaxed mb-12"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-1 hover:border-terracotta/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
                <Award size={24} />
              </div>
              <CmsText slug="home-value-title-1" fallback="Kvalitet" as="h4" className="font-headline-md text-onyx mb-2 font-bold text-lg" />
              <CmsText slug="home-value-desc-1" fallback="Nøye utvalgte materialer for lang holdbarhet." as="p" className="text-label-sm text-secondary leading-relaxed opacity-80" />
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-1 hover:border-terracotta/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
                <BookOpen size={24} />
              </div>
              <CmsText slug="home-value-title-2" fallback="Budskap" as="h4" className="font-headline-md text-onyx mb-2 font-bold text-lg" />
              <CmsText slug="home-value-desc-2" fallback="Bibelsk forankret og moderne designet." as="p" className="text-label-sm text-secondary leading-relaxed opacity-80" />
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-1 hover:border-terracotta/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
                <Users size={24} />
              </div>
              <CmsText slug="home-value-title-3" fallback="Fellesskap" as="h4" className="font-headline-md text-onyx mb-2 font-bold text-lg" />
              <CmsText slug="home-value-desc-3" fallback="Bygget for å inspirere og dele troen." as="p" className="text-label-sm text-secondary leading-relaxed opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <section className="py-section-gap bg-white reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
          <div className="text-center mb-12">
            <CmsText slug="home-instagram-title" fallback="Følg oss på Instagram" as="h2" className="font-headline-lg text-2xl md:text-headline-lg mb-4 text-onyx block" />
            <CmsText slug="home-instagram-desc" fallback="Se hvordan våre kunder bærer sin tro @hiskingdomdesigns" as="p" className="text-secondary font-body-md" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {instagramFeed.map((item, index) => (
              <a 
                key={item.id}
                href={item.permalink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="aspect-square relative group overflow-hidden rounded-lg cursor-pointer block animate-fade-in"
              >
                <img 
                  alt={`Instagram feed ${index + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  src={item.mediaUrl}
                />
                <div className="absolute inset-0 bg-onyx/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">favorite</span>
                </div>
              </a>
            ))}
          </div>
          <div className="text-center">
            <a 
              href="https://www.instagram.com/hiskingdomdesigns/" 
              target="_blank"
              rel="noopener noreferrer"
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
            <CmsText
              slug="home-newsletter-title"
              fallback="Bli med i vårt fellesskap"
              as="h2"
              className="font-headline-lg text-2xl md:text-headline-lg text-parchment mb-4 block"
            />
            <CmsText
              slug="home-newsletter-desc"
              fallback="Meld deg på vårt nyhetsbrev for eksklusive tilbud, inspirerende ord og nyheter om nye kolleksjoner."
              as="p"
              className="font-body-md text-body-md text-parchment/70 mb-10"
            />
            <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center">
              <input 
                className="bg-white/10 border border-white/20 text-white px-6 py-4 rounded-lg focus:outline-none focus:border-terracotta transition-colors placeholder:text-white/40 w-full sm:max-w-md disabled:opacity-50" 
                placeholder="Din e-postadresse" 
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterLoading}
                required
              />
              <button 
                className="bg-terracotta hover:bg-primary-container text-white px-8 py-4 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap active:scale-95 disabled:opacity-50" 
                type="submit"
                disabled={newsletterLoading}
              >
                {newsletterLoading ? 'Sender...' : 'Meld meg på'}
              </button>
            </form>
            {newsletterSubscribed && (
              <p className="text-green-400 text-xs mt-3 animate-pulse">Takk! Du er nå påmeldt nyhetsbrevet.</p>
            )}
            {newsletterError && (
              <p className="text-red-400 text-xs mt-3">{newsletterError}</p>
            )}
            <CmsText slug="home-newsletter-privacy" fallback="Vi respekterer ditt personvern. Avmeld deg når som helst." as="p" className="text-label-sm text-parchment/40 mt-4" />
          </div>
        </div>
      </section>
    </motion.div>
  );
}
