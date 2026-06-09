import React, { useEffect, useState } from 'react';
import { wixClient } from '@/lib/wix';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle, Award, BookOpen, Users } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { motion } from 'framer-motion';
import CmsText from '@/components/CmsText';
import useMeta from '@/hooks/useMeta';
import { getOptimizedWixImageUrl } from '@/lib/media';

const MOCK_TESTIMONIALS = [
  {
    _id: 'e1ba5a6c-d6b3-45d2-a543-15fb5147cdf8',
    author: { authorName: 'Anne' },
    content: {
      rating: 5,
      title: 'Flott bibelvers!',
      body: 'Jeg liker at bibelverset står både på baksiden og med liten skrift på framsiden. Teksten minner meg om å la Den Hellige Ånd lede livet mitt. Trykket er stort og fint på ryggen og vitner til folk rundt også, om å la seg lede av Gud.'
    }
  },
  {
    _id: 'de6ba802-88fc-4182-a35c-318f6e6db083',
    author: { authorName: 'Anne' },
    content: {
      rating: 5,
      title: 'Flott trykk!',
      body: 'Tskjorten er god i størrelsen og stoffet er bra. Jeg likte veldig godt trykket og elsker den blå fargen på skjorten.'
    }
  },
  {
    _id: 'd70acda0-1f5c-444c-87cf-c073f8d41f3a',
    author: { authorName: 'Kari' },
    content: {
      rating: 5,
      title: 'Feminin og nydelig Tskjorte',
      body: 'Veldig stilig design og trykket var overraskende mykt på Tskjorten. Jeg er kjempefornøyd. Kjøpte hvit Tskjorte str. M. Fint at det var dametskjorte med bittelita innsving i livet.'
    }
  }
];

const FALLBACK_INSTAGRAM_FEED = [
  {
    id: 'static-1',
    mediaUrl: 'https://static.wixstatic.com/media/3a1544_d9eda13558a74f0c830528cb6343abaf~mv2.jpg',
    permalink: 'https://www.instagram.com/hiskingdomdesigns/'
  },
  {
    id: 'static-2',
    mediaUrl: 'https://static.wixstatic.com/media/3a1544_d760f5c5d9b7434a952083743952289e~mv2.png',
    permalink: 'https://www.instagram.com/hiskingdomdesigns/'
  },
  {
    id: 'static-3',
    mediaUrl: 'https://static.wixstatic.com/media/3a1544_2fe129ac03f54a1b9f0130d434f0db6c~mv2.jpg',
    permalink: 'https://www.instagram.com/hiskingdomdesigns/'
  },
  {
    id: 'static-4',
    mediaUrl: 'https://static.wixstatic.com/media/db4f96_8726b83da7be4e0da66aaf61e610ea67~mv2.png',
    permalink: 'https://www.instagram.com/hiskingdomdesigns/'
  }
];

const CATEGORIES = {
  klaer: {
    title: 'Klær',
    titleSlug: 'category-title-klaer',
    descSlug: 'category-desc-klaer',
    fallbackDesc: 'Moderne t-skjorter og hettegensere med budskap.',
    path: 'Klær',
    image: 'https://static.wixstatic.com/media/db4f96_b5ef7d88759f4cd5b3dd5ff78f8dfc18~mv2.png'
  },
  klistermerker: {
    title: 'Klistermerker',
    titleSlug: 'category-title-klistermerker',
    descSlug: 'category-desc-klistermerker',
    fallbackDesc: 'Små påminnelser i hverdagen.',
    path: 'Klistermerker',
    image: 'https://static.wixstatic.com/media/3a1544_fd343ead0a094799aac08e7f17391ce5~mv2.jpg'
  },
  plakater: {
    title: 'Plakater',
    titleSlug: 'category-title-plakater',
    descSlug: 'category-desc-plakater',
    fallbackDesc: 'Dekorer hjemmet ditt med håp.',
    path: 'Plakater',
    image: 'https://static.wixstatic.com/media/db4f96_57d27b5e08a14d3997613b8347488719~mv2.png'
  },
  totebag: {
    title: 'Handlenett',
    titleSlug: 'category-title-totebag',
    descSlug: 'category-desc-totebag',
    fallbackDesc: 'Bærekraftige nett med inspirasjon.',
    path: 'totebag',
    image: 'https://static.wixstatic.com/media/db4f96_2811fd2828c44989805355a5de7f69a2~mv2.png'
  },
  caps: {
    title: 'Hatter & Caps',
    titleSlug: 'category-title-caps',
    descSlug: 'category-desc-caps',
    fallbackDesc: 'Tøffe caps med stilrene detaljer.',
    path: 'caps',
    image: 'https://static.wixstatic.com/media/db4f96_d199592e63bf4e9e9040add0ceb0b586~mv2.png'
  },
  kopper: {
    title: 'Kopper & Flasker',
    titleSlug: 'category-title-kopper',
    descSlug: 'category-desc-kopper',
    fallbackDesc: 'Bibelvers til din morgenkaffe.',
    path: 'cups-bottles',
    image: 'https://static.wixstatic.com/media/db4f96_7ed719f8e0954fd78693f7b0b29a127b~mv2.png'
  }
};

const CATEGORY_SETS = [
  // Sunday (0)
  { large: CATEGORIES.klaer, small1: CATEGORIES.klistermerker, small2: CATEGORIES.plakater },
  // Monday (1)
  { large: CATEGORIES.plakater, small1: CATEGORIES.totebag, small2: CATEGORIES.klistermerker },
  // Tuesday (2)
  { large: CATEGORIES.klaer, small1: CATEGORIES.caps, small2: CATEGORIES.kopper },
  // Wednesday (3)
  { large: CATEGORIES.klistermerker, small1: CATEGORIES.plakater, small2: CATEGORIES.totebag },
  // Thursday (4)
  { large: CATEGORIES.plakater, small1: CATEGORIES.caps, small2: CATEGORIES.kopper },
  // Friday (5)
  { large: CATEGORIES.klaer, small1: CATEGORIES.totebag, small2: CATEGORIES.klistermerker },
  // Saturday (6)
  { large: CATEGORIES.kopper, small1: CATEGORIES.caps, small2: CATEGORIES.plakater }
];

export default function Home() {
  useMeta(
    "Hjem",
    "His Kingdom Designs tilbyr lekre kristne motiver på t-skjorter, hoodies, caps og plakater. Finn dine favorittbibelvers trykket på premium materialer."
  );

  const { products, isLoadingProducts } = useApp();
  const navigate = useNavigate();

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  const currentSet = CATEGORY_SETS[dayOfWeek];

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

  // Loading state for plan checkout redirect
  const [subscribingId, setSubscribingId] = useState(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await wixClient.plans.queryPublicPlans().limit(10).find();
        const items = response.items || response._items;
        if (items && items.length > 0) {
          setPlansList(items);
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
          // Filter to only include approved reviews with body text
          const approvedReviews = response.items.filter(item => 
            (!item.moderation || item.moderation.moderationStatus === 'APPROVED') && 
            item.content?.body
          );
          console.log(`HKD Debug: Fant ${approvedReviews.length} godkjente omtaler:`, approvedReviews);
          if (approvedReviews.length > 0) {
            setTestimonialsList(approvedReviews.slice(0, 3));
          } else {
            setTestimonialsList(MOCK_TESTIMONIALS);
          }
        } else {
          console.log("HKD Debug: API-et returnerte 0 godkjente omtaler. Sjekk om de må godkjennes i Wix-dashbordet.");
          setTestimonialsList(MOCK_TESTIMONIALS);
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

  // Reset subscribing state if user navigates back to Home page
  useEffect(() => {
    const handlePageShow = () => {
      setSubscribingId(null);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const handleSubscribe = async (plan) => {
    if (plan._id.startsWith('mock-')) {
      alert(`Takk for din interesse i abonnementsplanen "${plan.name}"! Siden dette er en testbutikk, er denne abonnementsfunksjonen for øyeblikket i demomodus.`);
      return;
    }
    setSubscribingId(plan._id);
    try {
      const redirectSession = await wixClient.redirects.createRedirectSession({
        paidPlansCheckout: {
          planId: plan._id,
        },
        callbacks: {
          postFlowUrl: window.location.origin,
          thankYouPageUrl: window.location.origin + '/profile'
        }
      });
      const redirectUrl = redirectSession.fullUrl || redirectSession.redirectSession?.fullUrl;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        setSubscribingId(null);
      }
    } catch (err) {
      console.error('Subscription redirect error:', err);
      alert('Det oppstod en feil ved opprettelse av abonnement. Vennligst prøv igjen.');
      setSubscribingId(null);
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
        '1 mnd bindingstid (min. 2 pakker)'
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
        '1 mnd bindingstid (min. 2 pakker)'
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
            src="/hero_fashion.png"
          />
          <div className="absolute inset-0 bg-onyx/20"></div>
        </div>
        <div className="relative z-10 px-8 sm:px-12 md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto w-full">
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
                className="bg-terracotta hover:bg-primary-container text-white px-8 py-4 rounded font-label-md text-label-md transition-all active:scale-[0.98] hover:scale-[1.02] hover:shadow-xl duration-300 shadow-lg cursor-pointer"
              >
                Se kolleksjonen
              </button>
              <a 
                href="#historie"
                className="bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white px-8 py-4 rounded font-label-md text-label-md transition-all text-center flex items-center justify-center hover:scale-[1.02] duration-300"
              >
                Vår historie
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-white border-b border-outline-variant/30 py-6 reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-center md:text-left">
            <span className="material-symbols-outlined text-terracotta text-3xl shrink-0">local_shipping</span>
            <div className="min-w-0">
              <CmsText slug="home-benefits-title-1" fallback="Gratis frakt over 1500 kr" as="p" className="font-label-md text-label-md text-onyx leading-normal" />
              <CmsText slug="home-benefits-desc-1" fallback="Rask levering til hele landet" as="p" className="text-label-sm text-secondary leading-normal mt-1" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-center md:text-left">
            <span className="material-symbols-outlined text-terracotta text-3xl shrink-0">assignment_return</span>
            <div className="min-w-0">
              <CmsText slug="home-benefits-title-2" fallback="14 dagers angrerett" as="p" className="font-label-md text-label-md text-onyx leading-normal" />
              <CmsText slug="home-benefits-desc-2" fallback="Enkel retur hvis du ombestemmer deg" as="p" className="text-label-sm text-secondary leading-normal mt-1" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-center md:text-left">
            <span className="material-symbols-outlined text-terracotta text-3xl shrink-0">package</span>
            <div className="min-w-0">
              <CmsText slug="home-benefits-title-3" fallback="Trygg levering" as="p" className="font-label-md text-label-md text-onyx leading-normal" />
              <CmsText slug="home-benefits-desc-3" fallback="Normal leveringstid: ca. 2 uker" as="p" className="text-label-sm text-secondary leading-normal mt-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories (Bento Grid) */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto py-section-gap reveal-on-scroll">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <CmsText slug="home-categories-badge" fallback="Kategorier" as="span" className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-2 block font-semibold" />
            <CmsText slug="home-categories-title" fallback="Utforsk vårt utvalg" as="h2" className="font-headline-lg text-2xl md:text-headline-lg font-bold text-onyx" />
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="text-terracotta font-label-md text-label-md flex items-center gap-2 hover:underline underline-offset-4 font-bold group cursor-pointer"
          >
            Se alle kategorier <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Large Card */}
          <div 
            onClick={() => navigate(`/category/${currentSet.large.path}`)}
            className="md:col-span-8 group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md cursor-pointer aspect-[16/10] md:aspect-auto md:h-[500px]"
          >
            <img 
              alt={`${currentSet.large.title} collection`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src={getOptimizedWixImageUrl(currentSet.large.image, 800, 500)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-onyx/75 to-transparent flex flex-col justify-end p-8">
              <CmsText slug={currentSet.large.titleSlug} fallback={currentSet.large.title} as="h3" className="text-white font-headline-md text-headline-md mb-2" />
              <CmsText slug={currentSet.large.descSlug} fallback={currentSet.large.fallbackDesc} as="p" className="text-white/80 font-body-md text-body-md mb-4 max-w-sm" />
              <span className="w-fit bg-white text-onyx px-5 py-2.5 rounded font-label-md text-label-md group-hover:bg-terracotta group-hover:text-white transition-colors duration-300">
                Handle nå
              </span>
            </div>
          </div>
          
          <div className="md:col-span-4 flex flex-col gap-gutter">
            {/* Small Card 1 */}
            <div 
              onClick={() => navigate(`/category/${currentSet.small1.path}`)}
              className="h-60 md:h-[238px] group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <img 
                alt={`${currentSet.small1.title} category`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src={getOptimizedWixImageUrl(currentSet.small1.image, 600, 400)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/75 to-transparent flex flex-col justify-end p-6">
                <CmsText slug={currentSet.small1.titleSlug} fallback={currentSet.small1.title} as="h3" className="text-white font-headline-md text-headline-md" />
                <CmsText slug={currentSet.small1.descSlug} fallback={currentSet.small1.fallbackDesc} as="p" className="text-white/70 text-label-sm mt-1" />
              </div>
            </div>
            
            {/* Small Card 2 */}
            <div 
              onClick={() => navigate(`/category/${currentSet.small2.path}`)}
              className="h-60 md:h-[238px] group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <img 
                alt={`${currentSet.small2.title} category`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src={getOptimizedWixImageUrl(currentSet.small2.image, 600, 400)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/75 to-transparent flex flex-col justify-end p-6">
                <CmsText slug={currentSet.small2.titleSlug} fallback={currentSet.small2.title} as="h3" className="text-white font-headline-md text-headline-md" />
                <CmsText slug={currentSet.small2.descSlug} fallback={currentSet.small2.fallbackDesc} as="p" className="text-white/70 text-label-sm mt-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-white py-section-gap reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto">
          <CmsText 
            slug="home-bestsellers-title" 
            fallback="Våre bestselgere" 
            as="h2" 
            className="font-headline-lg text-2xl md:text-headline-lg font-bold text-center mb-12 md:mb-16 text-onyx block" 
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
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto">
          <CmsText
            slug="home-testimonials-title"
            fallback="Kundeuttalelser"
            as="h2"
            className="font-headline-lg text-2xl md:text-headline-lg font-bold text-center mb-12 text-onyx block"
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
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-terracotta/10 rounded-full blur-3xl"></div>
            <img 
              alt="Monthly package showcase" 
              className="relative z-10 rounded-2xl shadow-xl w-full object-cover h-[450px]" 
              src="https://static.wixstatic.com/media/db4f96_347a150a309040d4b72d07b052456337~mv2.png"
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
                      disabled={subscribingId !== null}
                      className={`w-full py-2.5 rounded-lg font-bold transition-all active:scale-[0.98] shadow-sm text-center text-xs flex items-center justify-center gap-2 ${
                        plan.popular 
                          ? 'bg-terracotta text-white hover:opacity-95' 
                          : 'bg-onyx text-white hover:bg-slate-800'
                      } ${subscribingId !== null ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {subscribingId === planId ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Vennligst vent...</span>
                        </>
                      ) : (
                        'Abonner nå'
                      )}
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
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto text-center">
          <div className="max-w-[800px] mx-auto mb-12">
            <div className="w-20 h-20 mb-8 flex items-center justify-center mx-auto overflow-hidden">
              <img src="/logo-hkm.png" alt="His Kingdom Designs Logo" className="w-full h-full object-contain" />
            </div>
            <CmsText 
              slug="home-about-title" 
              fallback="Hva betyr His Kingdom Designs for oss?" 
              as="h2" 
              className="font-headline-lg text-2xl md:text-headline-lg font-bold mb-6 text-onyx"
            />
            <CmsText 
              slug="home-about-desc" 
              fallback="Vi tror på kraften i de små tingene. En t-skjorte som starter en samtale, et klistermerke som gir oppmuntring på en grå dag, eller en plakat som minner oss på Guds trofasthet i hjemmet. Vår misjon er å skape vakre, moderne produkter som bærer et evig budskap." 
              as="p" 
              className="font-body-lg text-body-lg text-secondary leading-relaxed"
            />
          </div>
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
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto">
          <div className="text-center mb-12">
            <CmsText slug="home-instagram-title" fallback="Følg oss på Instagram" as="h2" className="font-headline-lg text-2xl md:text-headline-lg font-bold mb-4 text-onyx block" />
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
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto mb-section-gap reveal-on-scroll">
        <div className="bg-onyx rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-terracotta/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <CmsText
              slug="home-newsletter-title"
              fallback="Bli med i vårt fellesskap"
              as="h2"
              className="font-headline-lg text-2xl md:text-headline-lg font-bold text-parchment mb-4 block"
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
