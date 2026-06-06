import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Package, LogOut, Lock, Mail, Key, ShieldCheck, Heart } from 'lucide-react';

export default function Profile() {
  // Simulating authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loginTab, setLoginTab] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Mock User Data
  const userData = {
    name: 'Christian Mandal',
    email: 'christian@mandalregnskap.no',
    phone: '987 65 432',
    address: 'Store Elvegate 16, 4514 Mandal',
    memberSince: 'Marts 2025',
    orders: [
      { id: 'HK-9821', date: '02.05.2026', total: 648, status: 'Levert', items: 'Salme 23 Plakat (M), Herren velsigne deg T-skjorte (L)' },
      { id: 'HK-9710', date: '14.03.2026', total: 249, status: 'Levert', items: 'Tro Håp Kjærlighet Armbånd' }
    ],
    subscriptions: [
      { name: 'Kopp & Kos Månedspakke', price: 299, status: 'Aktiv', nextShipment: '10.06.2026' }
    ]
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="max-w-md mx-auto px-margin-mobile md:px-margin-desktop py-28"
      >
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-outline-variant/30">
          {/* Tabs header */}
          <div className="flex border-b border-slate-100 mb-8">
            <button 
              onClick={() => setLoginTab('login')}
              className={`flex-1 pb-4 text-center font-label-md text-label-md transition-all ${
                loginTab === 'login' ? 'border-b-2 border-terracotta text-terracotta font-bold' : 'text-secondary hover:text-onyx'
              }`}
            >
              Logg inn
            </button>
            <button 
              onClick={() => setLoginTab('register')}
              className={`flex-1 pb-4 text-center font-label-md text-label-md transition-all ${
                loginTab === 'register' ? 'border-b-2 border-terracotta text-terracotta font-bold' : 'text-secondary hover:text-onyx'
              }`}
            >
              Registrer deg
            </button>
          </div>

          {loginTab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-headline-md text-headline-md text-onyx mb-2">Velkommen tilbake</h2>
                <p className="font-body-sm text-body-sm text-secondary">Logg inn for å se ordrene dine og administrere abonnementer.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-onyx uppercase mb-2">E-postadresse</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@epost.no"
                    className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta text-onyx" 
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/40" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-onyx uppercase">Passord</label>
                  <a href="#" className="text-xs text-terracotta hover:underline">Glemt passord?</a>
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta text-onyx" 
                  />
                  <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/40" />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-terracotta text-white py-4 rounded-xl font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md mt-8 uppercase tracking-wider text-sm font-bold"
              >
                Logg inn
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-headline-md text-headline-md text-onyx mb-2">Opprett konto</h2>
                <p className="font-body-sm text-body-sm text-secondary">Bli en del av His Kingdom Designs fellesskapet i dag.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-onyx uppercase mb-2">Fullt navn</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required 
                    placeholder="Christian Mandal"
                    className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta text-onyx" 
                  />
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/40" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-onyx uppercase mb-2">E-postadresse</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required 
                    placeholder="din@epost.no"
                    className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta text-onyx" 
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/40" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-onyx uppercase mb-2">Velg passord</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required 
                    placeholder="Min. 8 tegn"
                    className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta text-onyx" 
                  />
                  <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/40" />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-terracotta text-white py-4 rounded-xl font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md mt-8 uppercase tracking-wider text-sm font-bold"
              >
                Opprett konto
              </button>
            </form>
          )}

          {/* Social login mock */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-4">
            <span className="text-xs text-secondary/50 uppercase tracking-wider block">Eller fortsett med</span>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsLoggedIn(true)}
                className="flex-1 border border-outline-variant rounded-xl py-3 text-xs font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-onyx"
              >
                <span>Google</span>
              </button>
              <button 
                onClick={() => setIsLoggedIn(true)}
                className="flex-1 border border-outline-variant rounded-xl py-3 text-xs font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-onyx"
              >
                <span>Vipps</span>
              </button>
            </div>
          </div>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left column - Account overview */}
        <aside className="w-full lg:w-80 bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm flex flex-col items-center text-center lg:text-left lg:items-start shrink-0">
          <div className="w-20 h-20 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-2xl mb-4">
            {userData.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h2 className="font-headline-md text-headline-md text-onyx mb-1">{userData.name}</h2>
          <p className="text-secondary font-body-sm mb-6">{userData.email}</p>
          
          <div className="w-full h-px bg-slate-100 my-4" />

          <div className="space-y-4 w-full text-left font-body-sm text-secondary">
            <div>
              <span className="text-xs font-semibold text-onyx uppercase block mb-1">Telefon</span>
              <span>{userData.phone}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-onyx uppercase block mb-1">Standardadresse</span>
              <span className="block leading-relaxed">{userData.address}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-onyx uppercase block mb-1">Medlem siden</span>
              <span>{userData.memberSince}</span>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 my-6" />

          {/* Simulate logout */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-outline hover:border-terracotta hover:text-terracotta text-onyx py-3 rounded-xl font-label-md text-label-md transition-all active:scale-95"
          >
            <LogOut size={16} />
            <span>Logg ut</span>
          </button>
        </aside>

        {/* Right column - Dashboard Details */}
        <div className="flex-grow w-full space-y-8">
          
          {/* Order history */}
          <section className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-terracotta">
              <ShoppingBag size={22} />
              <h3 className="font-headline-md text-headline-md text-onyx text-xl font-bold">Ordrehistorikk</h3>
            </div>

            {userData.orders.length > 0 ? (
              <div className="space-y-4">
                {userData.orders.map(order => (
                  <div key={order.id} className="border border-outline-variant/30 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-outline transition-colors bg-slate-50/20">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-label-md text-onyx font-bold">{order.id}</span>
                        <span className="text-xs text-secondary/60">• {order.date}</span>
                      </div>
                      <p className="font-body-sm text-secondary line-clamp-1">{order.items}</p>
                    </div>
                    <div className="flex items-center gap-6 self-stretch md:self-auto justify-between border-t md:border-none border-slate-100 pt-3 md:pt-0">
                      <div>
                        <span className="text-xs text-secondary block">Totalpris</span>
                        <span className="font-label-md text-onyx font-bold">{order.total} kr</span>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary font-body-md">Du har ikke lagt inn noen bestillinger ennå.</p>
            )}
          </section>

          {/* Subscriptions */}
          <section className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-terracotta">
              <Package size={22} />
              <h3 className="font-headline-md text-headline-md text-onyx text-xl font-bold">Dine Månedspakker</h3>
            </div>

            {userData.subscriptions.length > 0 ? (
              <div className="space-y-4">
                {userData.subscriptions.map(sub => (
                  <div key={sub.name} className="border border-outline-variant/30 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/20">
                    <div>
                      <h4 className="font-label-md text-onyx font-bold mb-1">{sub.name}</h4>
                      <p className="text-xs text-secondary">
                        Neste sending: <strong className="text-onyx">{sub.nextShipment}</strong> (fraktes gratis)
                      </p>
                    </div>
                    <div className="flex items-center gap-6 self-stretch md:self-auto justify-between border-t md:border-none border-slate-100 pt-3 md:pt-0">
                      <div>
                        <span className="text-xs text-secondary block">Månedspris</span>
                        <span className="font-label-md text-terracotta font-bold">{sub.price} kr/mnd</span>
                      </div>
                      <button className="bg-onyx text-white hover:bg-terracotta hover:scale-[1.02] text-xs px-4 py-2.5 rounded-lg font-bold transition-all active:scale-[0.98]">
                        Administrer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary font-body-md">Du abonnerer ikke på noen månedspakker for øyeblikket.</p>
            )}
          </section>
        </div>
      </div>
    </motion.main>
  );
}
