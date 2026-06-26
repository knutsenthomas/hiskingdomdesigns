import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, HelpCircle, FileText, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import useMeta from '@/hooks/useMeta';
import { db } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Cancellation() {
  const { t, localizedPath } = useLanguage();

  useMeta(
    t('cancellation.metaTitle') || 'Angre kjøp & Avbestilling',
    t('cancellation.desc') || 'Kanseller bestillingen din eller benytt deg av din angrerett.'
  );

  const [formData, setFormData] = useState({
    orderNumber: '',
    email: '',
    name: '',
    phone: '',
    comments: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setValidationError('');

    // Client-side validation
    if (!formData.orderNumber.trim() || !formData.email.trim() || !formData.name.trim()) {
      setValidationError(t('cancellation.validationError') || 'Vennligst fyll ut alle obligatoriske felt.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        orderId: formData.orderNumber.trim(),
        email: formData.email.trim().toLowerCase(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        comments: formData.comments.trim(),
        status: 'Mottatt',
        createdAt: new Date().toISOString()
      };

      // Add document to order_cancellations collection in Firebase Firestore
      await addDoc(collection(db, 'order_cancellations'), payload);
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Failed to submit cancellation request to Firestore:', err);
      setSubmitError(t('cancellation.error') || 'Det oppsto en feil ved sending. Vennligst prøv igjen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-3 block font-semibold">
          {t('footer.customerService') || 'Kundeservice'}
        </span>
        <h1 className="font-headline-xl text-3xl md:text-headline-xl font-bold text-onyx mb-6">
          {t('cancellation.title') || 'Angre kjøp & Avbestilling'}
        </h1>
        <p className="font-body-lg text-body-lg text-secondary leading-relaxed">
          {t('cancellation.desc') ||
            'Fyll ut dette skjemaet for å benytte deg av din angrerett eller avbestille en ordre. Forespørselen vil bli registrert og behandlet så raskt som mulig.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 shadow-sm space-y-6">
            <h3 className="font-headline-sm text-lg font-bold text-onyx flex items-center gap-3">
              <ShieldCheck className="text-terracotta" size={24} />
              <span>Dine rettigheter</span>
            </h3>

            <div className="space-y-4 font-body-md text-body-md text-secondary leading-relaxed">
              <div className="flex gap-3">
                <div className="mt-1 text-terracotta font-bold">•</div>
                <p>
                  <strong>14 dagers angrerett:</strong> Som forbruker har du lovfestet angrerett i 14 dager fra du mottar varen, i henhold til angrerettloven.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 text-terracotta font-bold">•</div>
                <p>
                  <strong>Avbestilling før produksjon:</strong> Hvis ordren din ikke har gått to trykk ennå, kan vi kansellere den kostnadsfritt og refundere hele beløpet med en gang.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="mt-1 text-terracotta font-bold">•</div>
                <p>
                  <strong>Rask refusjon:</strong> Når forespørselen er godkjent, utbetales pengene direkte tilbake til samme betalingsmiddel som du brukte ved kjøpet (f.eks. Vipps eller kort).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant/30 p-8 shadow-sm space-y-4">
            <h4 className="font-headline-xs text-md font-semibold text-onyx flex items-center gap-2">
              <HelpCircle className="text-terracotta" size={20} />
              <span>Trenger du hjelp?</span>
            </h4>
            <p className="font-body-md text-body-md text-secondary leading-relaxed">
              Dersom du har spørsmål angående en pågående retur eller ønsker å snakke med oss, ta gjerne kontakt på <strong>post@hiskingdomministry.no</strong> eller bruk chat-widgeten nederst til høyre.
            </p>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-outline-variant/30 p-8 md:p-12 shadow-sm">
          <AnimatePresence mode="wait">
            {!submitSuccess ? (
              <motion.form
                key="cancellation-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-2 pb-4 border-b border-outline-variant/30">
                  <FileText className="text-terracotta" size={22} />
                  <h3 className="font-headline-sm text-lg font-bold text-onyx">Opprett forespørsel</h3>
                </div>

                {validationError && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-body-md text-body-md">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {submitError && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-body-md text-body-md">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block font-label-md text-label-md text-onyx font-bold">
                    {t('cancellation.name') || 'Fullt navn'} <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-colors font-body-md text-body-md"
                    placeholder="F.eks. Ola Nordmann"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block font-label-md text-label-md text-onyx font-bold">
                    {t('cancellation.email') || 'E-postadresse'} <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-colors font-body-md text-body-md"
                    placeholder="ola.nordmann@example.no"
                  />
                </div>

                {/* Order Number */}
                <div className="space-y-2">
                  <label htmlFor="orderNumber" className="block font-label-md text-label-md text-onyx font-bold">
                    {t('cancellation.orderNumber') || 'Ordrenummer'} <span className="text-terracotta">*</span>
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    name="orderNumber"
                    required
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-colors font-body-md text-body-md"
                    placeholder="F.eks. 10045"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block font-label-md text-label-md text-onyx font-bold">
                    {t('cancellation.phone') || 'Telefonnummer (valgfritt)'}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-colors font-body-md text-body-md"
                    placeholder="8-sifret nummer"
                  />
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <label htmlFor="comments" className="block font-label-md text-label-md text-onyx font-bold">
                    {t('cancellation.comments') || 'Utfyllende kommentar eller årsak (valgfritt)'}
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    rows={4}
                    value={formData.comments}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-colors font-body-md text-body-md resize-y"
                    placeholder="Skriv gjerne hvorfor du ønsker å avbestille, eller spesifiser om det gjelder hele eller deler av ordren..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-[#1B4965] hover:bg-[#1B4965]/90 text-white rounded-xl font-label-md text-label-md font-bold transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                      <span>{t('cancellation.submitting') || 'Sender...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>{t('cancellation.submit') || 'Send avbestilling / angrerett-forespørsel'}</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="cancellation-success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-3">
                  <h3 className="font-headline-md text-xl md:text-headline-md font-bold text-onyx">
                    {t('cancellation.successTitle') || 'Kanselleringsforespørsel mottatt!'}
                  </h3>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed max-w-md mx-auto">
                    {t('cancellation.successDesc') ||
                      'Takk. Din forespørsel er registrert og lagret i vårt system. Vi vil behandle den og refundere beløpet i henhold til kjøpsbetingelsene så snart som mulig.'}
                  </p>
                </div>
                <div className="pt-4 border-t border-outline-variant/30 flex justify-center gap-4">
                  <Link
                    to={localizedPath('/')}
                    className="py-3 px-6 bg-slate-50 hover:bg-slate-100 text-onyx rounded-xl font-label-md text-label-md font-semibold border border-outline-variant/40 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {t('cancellation.backToHome') || 'Til forsiden'}
                  </Link>
                  <Link
                    to={localizedPath('/products')}
                    className="py-3 px-6 bg-[#1B4965] hover:bg-[#1B4965]/90 text-white rounded-xl font-label-md text-label-md font-semibold transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {t('cart.continueShopping') || 'Fortsett å handle'}
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.main>
  );
}
