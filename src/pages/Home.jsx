import React, { useEffect, useState, useMemo } from 'react';
import { wixClient } from '@/lib/wix';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle, Award, BookOpen, Users } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import CmsText from '@/components/CmsText';
import useMeta from '@/hooks/useMeta';
import { getOptimizedWixImageUrl } from '@/lib/media';
import { useLanguage } from '@/contexts/LanguageContext';

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
    key: 'klaer',
    title: 'Klær',
    titleSlug: 'category-title-klaer',
    descSlug: 'category-desc-klaer',
    fallbackDesc: 'Moderne t-skjorter og hettegensere med budskap.',
    path: 'Klær',
    image: 'https://static.wixstatic.com/media/db4f96_b5ef7d88759f4cd5b3dd5ff78f8dfc18~mv2.png'
  },
  klistermerker: {
    key: 'klistermerker',
    title: 'Klistermerker',
    titleSlug: 'category-title-klistermerker',
    descSlug: 'category-desc-klistermerker',
    fallbackDesc: 'Små påminnelser i hverdagen.',
    path: 'Klistermerker',
    image: 'https://static.wixstatic.com/media/3a1544_fd343ead0a094799aac08e7f17391ce5~mv2.jpg'
  },
  plakater: {
    key: 'plakater',
    title: 'Plakater',
    titleSlug: 'category-title-plakater',
    descSlug: 'category-desc-plakater',
    fallbackDesc: 'Dekorer hjemmet ditt med håp.',
    path: 'Plakater',
    image: 'https://static.wixstatic.com/media/db4f96_57d27b5e08a14d3997613b8347488719~mv2.png'
  },
  totebag: {
    key: 'totebag',
    title: 'Handlenett',
    titleSlug: 'category-title-totebag',
    descSlug: 'category-desc-totebag',
    fallbackDesc: 'Bærekraftige nett med inspirasjon.',
    path: 'totebag',
    image: 'https://static.wixstatic.com/media/db4f96_2811fd2828c44989805355a5de7f69a2~mv2.png'
  },
  caps: {
    key: 'caps',
    title: 'Hatter & Caps',
    titleSlug: 'category-title-caps',
    descSlug: 'category-desc-caps',
    fallbackDesc: 'Tøffe caps med stilrene detaljer.',
    path: 'caps',
    image: 'https://static.wixstatic.com/media/db4f96_d199592e63bf4e9e9040add0ceb0b586~mv2.png'
  },
  kopper: {
    key: 'kopper',
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
  const { t, translateProduct, language, formatPrice } = useLanguage();

  useMeta(
    t('home.metaTitle'),
    t('home.metaDesc')
  );

  const { products, isLoadingProducts } = useApp();
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 96; // Offset to clear fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

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

  const [heroSlide, setHeroSlide] = useState(0);

  // Category translation helper
  const getCategoryTranslation = (category) => {
    const mappings = {
      klaer: { title: t('category.clothing'), desc: t('category.clothing.desc') },
      klistermerker: { title: t('category.stickers'), desc: t('category.stickers.desc') },
      plakater: { title: t('category.posters'), desc: t('category.posters.desc') },
      totebag: { title: t('category.totebags'), desc: t('category.totebags.desc') },
      caps: { title: t('category.caps'), desc: t('category.caps.desc') },
      kopper: { title: t('category.mugs'), desc: t('category.mugs.desc') }
    };
    return mappings[category.key] || { title: category.title, desc: category.fallbackDesc };
  };

  // Testimonials translation helper
  const getTranslatedTestimonial = (item) => {
    if (language === 'no') return item;
    
    const esReviews = {
      'e1ba5a6c-d6b3-45d2-a543-15fb5147cdf8': {
        title: '¡Excelente versículo bíblico!',
        body: 'Me gusta que el versículo bíblico esté tanto en la espalda como en el frente con letra pequeña. El texto me recuerda dejar que el Espíritu Santo guíe mi vida. La impresión es grande y hermosa en la espalda.'
      },
      'de6ba802-88fc-4182-a35c-318f6e6db083': {
        title: '¡Excelente impresión!',
        body: 'La camiseta es de buen tamaño y la tela es excelente. Me gustó mucho la impresión y me encanta el color azul de la camiseta.'
      },
      'd70acda0-1f5c-444c-87cf-c073f8d41f3a': {
        title: 'Camiseta femenina y hermosa',
        body: 'Diseño muy elegante y la impresión fue sorprendentemente suave. Estoy muy satisfecha. Compré la camiseta blanca talla M. Genial que sea una camiseta entallada para mujer.'
      }
    };
    
    const enReviews = {
      'e1ba5a6c-d6b3-45d2-a543-15fb5147cdf8': {
        title: 'Great Bible Verse!',
        body: 'I like that the Bible verse is printed both on the back and in small font on the front. The text reminds me to let the Holy Spirit guide my life. The print is large and nice on the back.'
      },
      'de6ba802-88fc-4182-a35c-318f6e6db083': {
        title: 'Great Print!',
        body: 'The t-shirt is true to size and the fabric is good. I really liked the print and love the blue color of the shirt.'
      },
      'd70acda0-1f5c-444c-87cf-c073f8d41f3a': {
        title: 'Feminine and Lovely T-shirt',
        body: 'Very stylish design and the print was surprisingly soft on the t-shirt. I am very satisfied. Bought a white t-shirt size M.'
      }
    };

    const translationSet = language === 'es' ? esReviews : enReviews;
    if (translationSet[item._id]) {
      return {
        ...item,
        content: {
          ...item.content,
          title: translationSet[item._id].title,
          body: translationSet[item._id].body
        }
      };
    }
    return item;
  };

  // Plan translation helper
  const getTranslatedPlan = (plan) => {
    if (language === 'no') return plan;
    if (plan._id === 'mock-plan-1') {
      return {
        ...plan,
        name: language === 'es' ? 'Club de Pegatinas' : 'Sticker Club',
        description: language === 'es' ? 'Recibe 5 pegatinas únicas y alentadoras en tu buzón cada mes.' : 'Get 5 unique and encouraging stickers straight to your mailbox every month.',
        benefits: language === 'es' 
          ? ['5 pegatinas únicas al mes', 'Diseños exclusivos', 'Compromiso de 1 mes (mín. 2 paquetes)']
          : ['5 unique stickers/mo', 'Exclusive designs', '1-month commitment (min. 2 packs)']
      };
    }
    if (plan._id === 'mock-plan-2') {
      return {
        ...plan,
        name: language === 'es' ? 'Taza y Calidez' : 'Mug & Cozy',
        description: language === 'es' ? 'Cada mes te enviamos una taza nueva con un mensaje de fe y café/té.' : 'Every month we send you a brand new mug with a faith message and coffee/tea.',
        benefits: language === 'es'
          ? ['1 taza premium al mes', 'Café o té seleccionado', 'Compromiso de 1 mes (mín. 2 paquetes)']
          : ['1 premium mug/mo', 'Selected coffee or tea', '1-month commitment (min. 2 packs)']
      };
    }
    return plan;
  };

  // Dynamic Hero Slides combining brand content and the newest products
  const slides = useMemo(() => {
    const defaultSlides = [
      {
        image: '/hero_fashion.png',
        title: t('home.slide1.title'),
        desc: t('home.slide1.desc'),
        ctaText: t('home.slide1.cta'),
        ctaAction: () => navigate('/products'),
        isProduct: false
      },
      {
        image: 'https://static.wixstatic.com/media/db4f96_57d27b5e08a14d3997613b8347488719~mv2.png',
        title: t('home.slide2.title'),
        desc: t('home.slide2.desc'),
        ctaText: t('home.slide2.cta'),
        ctaAction: () => navigate('/products'),
        isProduct: false
      }
    ];

    if (products && products.length > 0) {
      // Products are fetched sorted descending by createdDate, so the first products are the newest
      const newestProducts = products.slice(0, 2);
      const productSlides = newestProducts.map(p => {
        const translatedP = translateProduct(p);
        const displayName = translatedP.name ? translatedP.name.split('|')[0].trim() : 'Nytt produkt';
        const plainDesc = translatedP.description ? translatedP.description.replace(/<[^>]*>/g, '') : '';
        return {
          image: translatedP.image,
          title: `${t('home.newArrival')}${displayName}`,
          desc: plainDesc ? (plainDesc.length > 150 ? plainDesc.substring(0, 150) + '...' : plainDesc) : 'Oppdag vårt nyeste tilskudd i butikken nå!',
          ctaText: t('home.slideProduct.cta'),
          ctaAction: () => navigate(`/product/${translatedP.id}`),
          isProduct: true,
          productId: translatedP.id
        };
      });

      return [defaultSlides[0], ...productSlides, defaultSlides[1]];
    }

    return defaultSlides;
  }, [products, navigate, t, translateProduct]);

  useEffect(() => {
    if (heroSlide >= slides.length) {
      setHeroSlide(0);
    }
  }, [slides.length, heroSlide]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

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
      const msg = language === 'es' 
        ? `¡Gracias por tu interés en el plan de suscripción "${getTranslatedPlan(plan).name}"! Como esta es una tienda de prueba, esta función de suscripción está actualmente en modo de demostración.`
        : language === 'en'
        ? `Thank you for your interest in the "${getTranslatedPlan(plan).name}" subscription plan! As this is a test store, this subscription feature is currently in demo mode.`
        : `Takk for din interesse i abonnementsplanen "${plan.name}"! Siden dette er en testbutikk, er denne abonnementsfunksjonen for øyeblikket i demomodus.`;
      alert(msg);
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
      const errMsg = language === 'es'
        ? 'Ocurrió un error al crear la suscripción. Por favor, inténtalo de nuevo.'
        : language === 'en'
        ? 'An error occurred while creating the subscription. Please try again.'
        : 'Det oppstod en feil ved opprettelse av abonnement. Vennligst prøv igjen.';
      alert(errMsg);
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
      setNewsletterError(t('home.newsletter.error'));
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
        '1 mnd bindingstid (min. 2 pakker)'
      ],
      popular: true
    }
  ];

  // Filter out bestsellers and translate them dynamically
  const bestsellers = products.filter(p => p.isBestseller).map(p => translateProduct(p));

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

  const currentSlide = slides[heroSlide] || slides[0] || {};

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
          {slides.map((slide, idx) => (
            <motion.div
              key={slide.image + idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: heroSlide === idx ? 1 : 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                alt={`Hero faith slide ${idx + 1}`} 
                className="w-full h-full object-cover" 
                src={slide.image}
              />
            </motion.div>
          ))}
          {/* Cinema gradient overlay for extreme readability and visual depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-onyx/85 via-onyx/40 to-transparent"></div>
        </div>
        <div className="relative z-10 px-8 sm:px-12 md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto w-full">
          <motion.div
            key={heroSlide}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl text-white"
          >
            <button 
              onClick={() => scrollToSection('manedspakker')}
              className="hidden md:inline-flex items-center gap-2 bg-terracotta/25 hover:bg-terracotta/40 backdrop-blur-md border border-white/10 text-parchment px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse select-none cursor-pointer transition-colors active:scale-95"
            >
              <span>✨</span>
              <span>{t('home.newMonthlyPacks')}</span>
            </button>
            {currentSlide.isProduct ? (
              <h1 className="font-headline-xl font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[48px] mb-6 drop-shadow-md leading-tight">
                {currentSlide.title}
              </h1>
            ) : (
              <CmsText 
                slug={heroSlide === 0 ? "home-hero-title" : "home-hero-title-2"} 
                fallback={currentSlide.title || "Bær troen med stolthet"} 
                as="h1" 
                className="font-headline-xl font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[48px] mb-6 drop-shadow-md leading-tight"
              />
            )}
            {currentSlide.isProduct ? (
              <p className="font-body-lg text-body-lg mb-10 text-white/90 leading-relaxed line-clamp-3">
                {currentSlide.desc}
              </p>
            ) : (
              <CmsText 
                slug={heroSlide === 0 ? "home-hero-desc" : "home-hero-desc-2"} 
                fallback={currentSlide.desc || "Inspirerende design skapt for å dele Guds ord gjennom moderne mote."} 
                as="p" 
                className="font-body-lg text-body-lg mb-10 text-white/90 leading-relaxed"
              />
            )}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={currentSlide.ctaAction}
                className="group bg-terracotta hover:bg-[#bd4f2a] text-white px-8 py-4 rounded font-label-md text-label-md transition-all active:scale-[0.98] hover:scale-[1.02] hover:shadow-xl duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{currentSlide.ctaText}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-8 sm:left-12 md:left-margin-desktop z-20 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                heroSlide === idx ? 'w-8 bg-terracotta' : 'w-2 bg-white/50 hover:bg-white'
              }`}
              title={`Gå til lysbilde ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-white border-b border-outline-variant/30 py-6 reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-center md:text-left">
            <span className="material-symbols-outlined text-terracotta text-3xl shrink-0">local_shipping</span>
            <div className="min-w-0">
              <CmsText slug="home-benefits-title-1" fallback={t('home.benefits.freeShipping')} as="p" className="font-label-md text-label-md text-onyx leading-normal" />
              <CmsText slug="home-benefits-desc-1" fallback={t('home.benefits.fastDelivery')} as="p" className="text-label-sm text-secondary leading-normal mt-1" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-center md:text-left">
            <span className="material-symbols-outlined text-terracotta text-3xl shrink-0">assignment_return</span>
            <div className="min-w-0">
              <CmsText slug="home-benefits-title-2" fallback={t('home.benefits.returnPolicy')} as="p" className="font-label-md text-label-md text-onyx leading-normal" />
              <CmsText slug="home-benefits-desc-2" fallback={t('home.benefits.easyReturn')} as="p" className="text-label-sm text-secondary leading-normal mt-1" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-center md:text-left">
            <span className="material-symbols-outlined text-terracotta text-3xl shrink-0">package</span>
            <div className="min-w-0">
              <CmsText slug="home-benefits-title-3" fallback={t('home.benefits.secureDelivery')} as="p" className="font-label-md text-label-md text-onyx leading-normal" />
              <CmsText slug="home-benefits-desc-3" fallback={t('home.benefits.deliveryTime')} as="p" className="text-label-sm text-secondary leading-normal mt-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories (Bento Grid) */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto py-section-gap reveal-on-scroll">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <CmsText slug="home-categories-badge" fallback={t('nav.categories')} as="span" className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-2 block font-semibold" />
            <CmsText slug="home-categories-title" fallback={t('nav.promo_title')} as="h2" className="font-headline-lg text-2xl md:text-headline-lg font-bold text-onyx" />
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="text-terracotta font-label-md text-label-md flex items-center gap-2 hover:underline underline-offset-4 font-bold group cursor-pointer"
          >
            {t('home.categories.allBtn')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Large Card */}
          <div 
            onClick={() => navigate(`/category/${currentSet.large.path}`)}
            className="md:col-span-8 group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md cursor-pointer aspect-[16/10] md:aspect-auto md:h-[500px]"
          >
            <img 
              alt={`${getCategoryTranslation(currentSet.large).title} collection`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              src={getOptimizedWixImageUrl(currentSet.large.image, 800, 500)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-onyx/75 to-transparent flex flex-col justify-end p-8">
              <CmsText slug={currentSet.large.titleSlug} fallback={getCategoryTranslation(currentSet.large).title} as="h3" className="text-white font-headline-md text-headline-md mb-2" />
              <CmsText slug={currentSet.large.descSlug} fallback={getCategoryTranslation(currentSet.large).desc} as="p" className="text-white/80 font-body-md text-body-md mb-4 max-w-sm" />
              <span className="w-fit bg-white text-onyx px-5 py-2.5 rounded font-label-md text-label-md group-hover:bg-terracotta group-hover:text-white transition-colors duration-300">
                {t('home.categories.shopNow')}
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
                alt={`${getCategoryTranslation(currentSet.small1).title} category`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src={getOptimizedWixImageUrl(currentSet.small1.image, 600, 400)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/75 to-transparent flex flex-col justify-end p-6">
                <CmsText slug={currentSet.small1.titleSlug} fallback={getCategoryTranslation(currentSet.small1).title} as="h3" className="text-white font-headline-md text-headline-md" />
                <CmsText slug={currentSet.small1.descSlug} fallback={getCategoryTranslation(currentSet.small1).desc} as="p" className="text-white/70 text-label-sm mt-1" />
              </div>
            </div>
            
            {/* Small Card 2 */}
            <div 
              onClick={() => navigate(`/category/${currentSet.small2.path}`)}
              className="h-60 md:h-[238px] group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <img 
                alt={`${getCategoryTranslation(currentSet.small2).title} category`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src={getOptimizedWixImageUrl(currentSet.small2.image, 600, 400)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/75 to-transparent flex flex-col justify-end p-6">
                <CmsText slug={currentSet.small2.titleSlug} fallback={getCategoryTranslation(currentSet.small2).title} as="h3" className="text-white font-headline-md text-headline-md" />
                <CmsText slug={currentSet.small2.descSlug} fallback={getCategoryTranslation(currentSet.small2).desc} as="p" className="text-white/70 text-label-sm mt-1" />
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
            fallback={t('home.bestsellers.title')} 
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
            fallback={t('home.testimonials.title')}
            as="h2"
            className="font-headline-lg text-2xl md:text-headline-lg font-bold text-center mb-12 text-onyx block"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {(testimonialsList.length > 0 ? testimonialsList : MOCK_TESTIMONIALS).map((item) => {
              const translatedItem = getTranslatedTestimonial(item);
              return (
                <div 
                  key={translatedItem._id} 
                  className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-md transition-all duration-300"
                >
                  <div>
                    <div className="flex text-terracotta mb-4">
                      {[...Array(translatedItem.content?.rating || 5)].map((_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                      ))}
                    </div>
                    {translatedItem.content?.title && (
                      <h4 className="font-bold text-sm text-onyx mb-2">{translatedItem.content.title}</h4>
                    )}
                    <p className="font-body-md text-body-md italic mb-6 text-onyx/80 leading-relaxed">
                      {translatedItem.content?.body}
                    </p>
                  </div>
                  <p className="font-label-md text-label-md text-onyx font-bold">
                    - {translatedItem.author?.authorName || 'Anonym'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subscription Packages */}
      <section id="manedspakker" className="bg-white py-section-gap overflow-hidden reveal-on-scroll scroll-mt-24">
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
              fallback={t('home.subscription.badge')} 
              as="span" 
              className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-4 block font-semibold"
            />
            <CmsText 
              slug="home-subscription-title" 
              fallback={t('home.subscription.title')} 
              as="h2" 
              className="font-headline-xl text-2xl md:text-3xl lg:text-[40px] mb-4 text-onyx font-extrabold"
              style={{ lineHeight: '1.2' }}
            />
            <CmsText
              slug="home-subscription-desc"
              fallback={t('home.subscription.desc')}
              as="p"
              className="font-body-md text-body-md mb-8 text-secondary leading-relaxed"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {(plansList.length > 0 ? plansList : MOCK_PLANS).map((p) => {
                const plan = getTranslatedPlan(p);
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
                        {t('home.subscription.popular')}
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
                          {formatPrice(priceVal)}
                        </span>
                        <span className="text-secondary text-[10px]">
                          /{isRecurring ? t('home.subscription.month') : t('home.subscription.oneTime')}
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
                          <span>{t('home.subscription.loading')}</span>
                        </>
                      ) : (
                        t('home.subscription.subscribe')
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
      <section id="historie" className="py-section-gap bg-parchment reveal-on-scroll scroll-mt-24">
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto text-center">
          <div className="max-w-[800px] mx-auto mb-12">
            <div className="w-20 h-20 mb-8 flex items-center justify-center mx-auto overflow-hidden">
              <img src="/logo-hkm.png" alt="His Kingdom Designs Logo" className="w-full h-full object-contain" />
            </div>
            <CmsText 
              slug="home-about-title" 
              fallback={t('home.about.title')} 
              as="h2" 
              className="font-headline-lg text-2xl md:text-headline-lg font-bold mb-6 text-onyx"
            />
            <CmsText 
              slug="home-about-desc" 
              fallback={t('home.about.desc')} 
              as="p" 
              className="font-body-lg text-body-lg text-secondary leading-relaxed"
            />
            <div className="mt-8 flex justify-center">
              <Link 
                to="/team" 
                className="inline-flex items-center gap-2 bg-[#1B4965] hover:bg-[#1B4965]/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-[0.98] hover:shadow-md"
              >
                <span>{t('home.about.linkText')}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-1 hover:border-terracotta/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
                <Award size={24} />
              </div>
              <CmsText slug="home-value-title-1" fallback={t('home.values.quality.title')} as="h4" className="font-headline-md text-onyx mb-2 font-bold text-lg" />
              <CmsText slug="home-value-desc-1" fallback={t('home.values.quality.desc')} as="p" className="text-label-sm text-secondary leading-relaxed opacity-80" />
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-1 hover:border-terracotta/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
                <BookOpen size={24} />
              </div>
              <CmsText slug="home-value-title-2" fallback={t('home.values.message.title')} as="h4" className="font-headline-md text-onyx mb-2 font-bold text-lg" />
              <CmsText slug="home-value-desc-2" fallback={t('home.values.message.desc')} as="p" className="text-label-sm text-secondary leading-relaxed opacity-80" />
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-1 hover:border-terracotta/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta mb-4">
                <Users size={24} />
              </div>
              <CmsText slug="home-value-title-3" fallback={t('home.values.community.title')} as="h4" className="font-headline-md text-onyx mb-2 font-bold text-lg" />
              <CmsText slug="home-value-desc-3" fallback={t('home.values.community.desc')} as="p" className="text-label-sm text-secondary leading-relaxed opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <section className="py-section-gap bg-white reveal-on-scroll">
        <div className="px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto">
          <div className="text-center mb-12">
            <CmsText slug="home-instagram-title" fallback={t('home.instagram.title')} as="h2" className="font-headline-lg text-2xl md:text-headline-lg font-bold mb-4 text-onyx block" />
            <CmsText slug="home-instagram-desc" fallback={t('home.instagram.desc')} as="p" className="text-secondary font-body-md" />
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
              fallback={t('home.newsletter.title')}
              as="h2"
              className="font-headline-lg text-2xl md:text-headline-lg font-bold text-parchment mb-4 block"
            />
            <CmsText
              slug="home-newsletter-desc"
              fallback={t('home.newsletter.desc')}
              as="p"
              className="font-body-md text-body-md text-parchment/70 mb-10"
            />
            <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center">
              <input 
                className="bg-white/10 border border-white/20 text-white px-6 py-4 rounded-lg focus:outline-none focus:border-terracotta transition-colors placeholder:text-white/40 w-full sm:max-w-md disabled:opacity-50" 
                placeholder={t('home.newsletter.emailPlaceholder')} 
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
                {newsletterLoading ? t('home.newsletter.sending') : t('home.newsletter.subscribeBtn')}
              </button>
            </form>
            {newsletterSubscribed && (
              <p className="text-green-400 text-xs mt-3 animate-pulse">{t('home.newsletter.success')}</p>
            )}
            {newsletterError && (
              <p className="text-red-400 text-xs mt-3">{newsletterError}</p>
            )}
            <CmsText slug="home-newsletter-privacy" fallback={t('home.newsletter.privacy')} as="p" className="text-label-sm text-parchment/40 mt-4" />
          </div>
        </div>
      </section>
    </motion.div>
  );
}
