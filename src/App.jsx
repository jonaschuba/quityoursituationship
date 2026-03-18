import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

function useCounter(target, duration = 1600) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.unobserve(el)
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setValue(Math.floor(target * eased))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])
  return [ref, value]
}

// ── Modal steps ──────────────────────────────────────────────
const MODAL_STEPS = [
  {
    emoji: '💌',
    title: 'Du bist einen Schritt entfernt.',
    text: 'Wir matchen dich gerade mit deinem perfekten Terminator',
    btn: 'Suche läuft…',
    loading: true,
    showDots: true,
  },
  {
    emoji: '🎯',
    title: 'Match gefunden.',
    text: 'Jana, 27 — Zertifizierte Closure Specialist. 847 erfolgreiche Terminierungen. 4,97 ★. Heute verfügbar.',
    btn: 'Buchung bestätigen →',
  },
  {
    emoji: '✅',
    title: 'Buchung bestätigt.',
    text: 'Spaß. Das hier ist eine Witz-Website. Aber wir hoffen, du hast etwas gespürt. Geh schreib die Nachricht selbst — du schaffst das. 💪',
    btn: 'Schließen (und es tun)',
    close: true,
  },
]

function Modal({ open, onClose }) {
  const [step, setStep] = useState(0)
  const s = MODAL_STEPS[step]

  useEffect(() => {
    if (!open) return
    setStep(0)
    const t = setTimeout(() => setStep(1), 1900)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            initial={{ y: 20, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-5xl mb-4">{s.emoji}</div>
                <h3 className="font-display text-2xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  {s.text}{s.showDots && <span className="loading-dots" />}
                </p>
                <button
                  onClick={() => s.close ? onClose() : setStep(st => st + 1)}
                  disabled={!!s.loading}
                  className="w-full py-3 rounded-lg font-semibold text-sm text-white bg-accent hover:bg-accent-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {s.btn}
                </button>
                {!s.close && (
                  <button onClick={onClose} className="mt-3 text-xs text-muted underline">
                    Abbrechen
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── FAQ Item ─────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-card transition-colors"
      >
        <span className="font-medium text-sm">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-lg text-light flex-shrink-0"
        >+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-muted leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Pricing Card ─────────────────────────────────────────────
function PricingCard({ plan, price, period, desc, features, featured, onBook }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }}
      className={`rounded-2xl p-7 flex flex-col transition-shadow ${
        featured
          ? 'bg-dark text-white border border-dark'
          : 'bg-white border border-border'
      }`}
    >
      {featured && (
        <span className="inline-block mb-4 px-3 py-1 bg-accent text-white text-xs font-semibold uppercase tracking-wider rounded-full w-fit">
          Beliebteste Wahl
        </span>
      )}
      <div className={`text-xs font-semibold uppercase tracking-widest mb-2 ${featured ? 'text-white/40' : 'text-muted'}`}>
        {plan}
      </div>
      <div className="font-display text-5xl font-semibold leading-none tracking-tight mb-1">{price}</div>
      <div className={`text-xs mb-4 ${featured ? 'text-white/40' : 'text-muted'}`}>{period}</div>
      <p className={`text-sm leading-relaxed mb-4 ${featured ? 'text-white/55' : 'text-muted'}`}>{desc}</p>
      <div className={`h-px mb-4 ${featured ? 'bg-white/10' : 'bg-border'}`} />
      <ul className="flex-1 space-y-2 mb-6">
        {features.map(f => (
          <li key={f} className={`flex items-start gap-2 text-sm ${featured ? 'text-white/55' : 'text-muted'}`}>
            <span className={featured ? 'text-emerald-400' : 'text-accent'}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onBook}
        className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
          featured
            ? 'bg-accent hover:bg-accent-dark text-white'
            : 'border border-border hover:border-dark bg-transparent text-dark hover:bg-card'
        }`}
      >
        {featured ? 'Jetzt buchen' : 'Loslegen'}
      </button>
    </motion.div>
  )
}

// ── Testimonial Card ─────────────────────────────────────────
function TestCard({ emoji, text, name, city, stars }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      className="bg-white border border-border rounded-2xl p-6 flex flex-col transition-shadow"
    >
      <div className="text-amber-400 text-sm mb-3">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</div>
      <p className="text-sm leading-relaxed italic text-dark flex-1 mb-4">{text}</p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-base flex-shrink-0">
          {emoji}
        </div>
        <div>
          <div className="text-xs font-semibold">{name}</div>
          <div className="text-xs text-muted">{city}</div>
        </div>
      </div>
    </motion.div>
  )
}

// ── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [counterRef, counterVal] = useCounter(12847)

  const openModal = () => {
    setModalOpen(true)
    document.body.style.overflow = 'hidden'
  }
  const closeModal = () => {
    setModalOpen(false)
    document.body.style.overflow = ''
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Modal open={modalOpen} onClose={closeModal} />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-40 border-b border-border" style={{ background: 'rgba(250,250,248,0.88)', backdropFilter: 'blur(14px)' }}>
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <a href="#" className="font-display text-lg font-semibold tracking-tight whitespace-nowrap">
            Quit Your <span className="text-accent">Situationship</span>
          </a>
          <div className="flex items-center gap-2">
            <a href="#how" className="hidden sm:block text-sm font-medium text-muted hover:text-dark transition-colors px-3 py-1.5 rounded-md hover:bg-card">
              Wie es geht
            </a>
            <a href="#pricing" className="hidden sm:block text-sm font-medium text-muted hover:text-dark transition-colors px-3 py-1.5 rounded-md hover:bg-card">
              Preise
            </a>
            <button
              onClick={openModal}
              className="text-sm font-medium text-white bg-dark hover:bg-accent transition-colors px-4 py-2 rounded-md whitespace-nowrap"
            >
              Jetzt buchen →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-5 pt-20 pb-16 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-light border border-accent/20 rounded-full text-xs font-semibold text-accent mb-7">
              <span className="badge-dot w-1.5 h-1.5 bg-accent rounded-full" />
              Jetzt in deiner Stadt verfügbar — wahrscheinlich
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="font-display font-medium leading-none tracking-tight mb-5"
            style={{ fontSize: 'clamp(54px, 10vw, 96px)' }}
          >
            Break up.<br />
            <em className="italic text-accent">On demand.</em>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-muted max-w-lg mx-auto mb-8 leading-relaxed font-light"
            style={{ fontSize: 'clamp(15px, 2.2vw, 18px)' }}
          >
            Der erste professionelle Situationship-Terminierungsservice der Welt.
            Wie Uber, aber für deine emotionale Nichtverfügbarkeit. Weil "wir müssen reden"
            nicht von dir kommen muss.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <motion.button
              onClick={openModal}
              whileHover={{ y: -1, boxShadow: '0 8px 28px rgba(232,52,26,0.34)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-7 py-3.5 bg-accent hover:bg-accent-dark text-white font-semibold text-sm rounded-lg transition-colors"
              style={{ boxShadow: '0 4px 20px rgba(232,52,26,0.28)' }}
            >
              Terminator buchen →
            </motion.button>
            <a
              href="#how"
              className="w-full sm:w-auto px-6 py-3.5 border border-border hover:border-light bg-transparent text-dark text-sm font-medium rounded-lg transition-colors text-center hover:bg-card"
            >
              Wie es funktioniert
            </a>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-14 pt-10 border-t border-border"
        >
          {[
            { refProp: counterRef, val: counterVal.toLocaleString('de-DE'), label: 'Situationships beendet', raw: true },
            { val: '4,9 ★', label: 'Durchschnittsbewertung' },
            { val: '<24h', label: 'Reaktionszeit' },
            { val: '98 %', label: 'Clean-Break-Rate' },
          ].map(({ refProp, val, label, raw }) => (
            <div key={label} className="text-center">
              <div ref={refProp} className="font-display font-semibold leading-none tracking-tight" style={{ fontSize: 'clamp(28px, 5vw, 40px)' }}>
                {val}
              </div>
              <div className="text-xs text-muted mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="bg-white border-y border-border py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="mb-12"
          >
            <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[1.8px] text-accent mb-2">Ablauf</motion.div>
            <motion.h2 variants={fadeUp} className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(30px, 5vw, 50px)', lineHeight: 1.1 }}>
              Drei Schritte.<br />Null peinliche Texte.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted text-sm mt-3 max-w-sm leading-relaxed">
              Optimierter Prozess, maximale Closure, minimaler emotionaler Aufwand deinerseits.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-3 border border-border rounded-2xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border"
          >
            {[
              { num: '01', icon: '📋', title: 'Terminator buchen', desc: 'Fülle unser kurzes Intake-Formular aus. Name, Dauer eurer "Sache", gewünschter Vibe — von sanft bis effizient.' },
              { num: '02', icon: '📞', title: 'Wir erledigen es', desc: 'Unsere zertifizierten Profis nehmen in deinem Namen Kontakt auf. Per Text, Anruf — oder bei Premium persönlich im neutralen Café.' },
              { num: '03', icon: '🕊️', title: 'Weitermachen. Ernsthaft.', desc: 'Du erhältst Abschlussbericht, Closure-Zusammenfassung und kuratierte Spotify-Playlist. Du bist frei.' },
            ].map(({ num, icon, title, desc }) => (
              <motion.div
                key={num}
                variants={fadeUp}
                className="bg-white p-8 group"
              >
                <div className="font-display font-light text-6xl text-border leading-none mb-5 group-hover:text-accent-light transition-colors duration-300">
                  {num}
                </div>
                <div className="text-2xl mb-3">{icon}</div>
                <div className="font-semibold text-base mb-2">{title}</div>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="mb-12"
          >
            <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[1.8px] text-accent mb-2">Preise</motion.div>
            <motion.h2 variants={fadeUp} className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(30px, 5vw, 50px)', lineHeight: 1.1 }}>
              Investiere in deine Freiheit.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted text-sm mt-3 leading-relaxed">Transparente Preise. Keine versteckten Gefühle.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <PricingCard
              plan="Starter"
              price="0 €"
              period="einmalig"
              desc="Für alle, die einen sanften Schubs brauchen, aber selbst noch tippen können."
              features={['KI-generierte Trennungstext-Vorlage', 'Ghosting-Risikobewertung', '1× "Du verdienst Besseres"-Pep-Talk', 'Community-Forum-Zugang']}
              onBook={openModal}
            />
            <PricingCard
              plan="The Gentle Letdown"
              price="29 €"
              period="pro Situationship"
              desc="Wir übernehmen alles. Du musst danach nur noch blockieren."
              features={['Menschlich zugestellter Text oder Anruf', 'Maßgeschneidertes Trennungsskript', 'Antwort-Management (wir handhaben die Replies)', 'Closure-Abschlussbericht', 'Kuratierte Healing-Playlist']}
              featured
              onBook={openModal}
            />
            <PricingCard
              plan="Full Closure"
              price="99 €"
              period="pro Situationship"
              desc="Das White-Glove-Erlebnis. Persönlich. Neutrales Café. Blumen inklusive."
              features={['Persönliches Trennungsgespräch', 'Zertifizierter Closure Specialist™', 'Optional: dein Hoodie wird zurückgeholt', '30-Tage Kein-Rückfall-Garantie*', 'Priorität 24/7-Support']}
              onBook={openModal}
            />
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-card border-y border-border py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="mb-12"
          >
            <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[1.8px] text-accent mb-2">Bewertungen</motion.div>
            <motion.h2 variants={fadeUp} className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(30px, 5vw, 50px)', lineHeight: 1.1 }}>
              Die haben's geschafft.<br />Du auch.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <TestCard
              emoji="😮‍💨"
              stars={5}
              text='"Ich war 11 Monate lang in "da läuft was" mit diesem Typen. ELF. Unser Terminator hat es in 4 Minuten erledigt. Ich hab geweint, dann war mir sofort besser. 10/10."'
              name="Sophie M."
              city="München"
            />
            <TestCard
              emoji="🧍"
              stars={5}
              text='"Sie hat 8 Monate lang "lass es locker bleiben" gesagt. Das Full Closure Package hat mir mein Vintage-Crewneck zurückgeholt UND ein formelles Anerkennungsschreiben. Jeden Cent wert."'
              name="Jonas K."
              city="Hamburg"
            />
            <TestCard
              emoji="💀"
              stars={4}
              text='"Einen Stern abgezogen weil ich insgeheim gehofft hatte, er würde kämpfen. Hat er nicht. Aber das war genau die Closure, die ich brauchte. Die Playlist ist auch richtig gut."'
              name="Lea W."
              city="Berlin"
            />
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="mb-12"
          >
            <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[1.8px] text-accent mb-2">FAQ</motion.div>
            <motion.h2 variants={fadeUp} className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(30px, 5vw, 50px)', lineHeight: 1.1 }}>
              Gute Fragen.<br />Ernsthafte Antworten.*
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted text-sm mt-3">*"Ernsthaft" ist relativ.</motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="border border-border rounded-2xl overflow-hidden bg-white"
          >
            {[
              { q: 'Ist das legal?', a: 'Absolut. Eine Situationship zu beenden ist nicht nur legal, sondern wird aktiv von Therapeuten, deiner besten Freundin und deiner Mutter empfohlen, die ständig fragt warum du niemanden "Richtiges" datest.' },
              { q: 'Was wenn die Person die Trennung nicht akzeptiert?', a: 'Unsere Terminatoren sind in De-Eskalation und Grenzsetzung geschult. In seltenen Fällen eskalieren wir zu unserem Senior Closure Strategist. In jedem Fall: Die Situationship wird beendet.' },
              { q: 'Was deckt die "Kein-Rückfall-Garantie" ab?', a: 'Wenn du sie/ihn innerhalb von 30 Tagen anschreibst, erinnern wir dich per knallharter Notification an alles, was du uns im Intake-Formular erzählt hast. Brutal, aber fair.' },
              { q: 'Kann ich eine Rückerstattung bekommen wenn ich\'s mir anders überlege?', a: 'Nein. Das ist irgendwie der Punkt.' },
              { q: 'Seid ihr international verfügbar?', a: 'Situationships kennen keine Grenzen — wir auch nicht. Wir sind aktuell in 47 Städten in Europa und Nordamerika aktiv, mit "Es ist kompliziert"-Zonen, die quartalsweise expandieren.' },
            ].map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-dark py-20 px-5 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="max-w-md mx-auto"
        >
          <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[1.8px] text-white/35 mb-3">Bereit?</motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display font-medium text-white tracking-tight mb-3"
            style={{ fontSize: 'clamp(30px, 5vw, 50px)', lineHeight: 1.1 }}
          >
            Du verdienst etwas{' '}
            <em className="italic text-accent">wirklich Definiertes.</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/45 text-sm leading-relaxed mb-8">
            Hör auf, halb im Leben von jemand anderem zu existieren. Buch heute deinen Terminator.
          </motion.p>
          <motion.button
            variants={fadeUp}
            onClick={openModal}
            whileHover={{ y: -1, boxShadow: '0 8px 28px rgba(232,52,26,0.4)' }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3.5 bg-accent hover:bg-accent-dark text-white font-semibold text-sm rounded-lg transition-colors"
          >
            Jetzt beenden. →
          </motion.button>
          <p className="text-white/20 text-xs mt-5">
            *Keine echten Beziehungen wurden bei der Erstellung dieser Website verletzt.
          </p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-dark border-t border-white/5 px-5 py-7">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="font-display text-sm font-semibold text-white/60">Quit Your Situationship™</span>
          <span className="text-xs text-white/25 sm:text-center flex-1">© 2025 QYS GmbH. Kein echtes Unternehmen. Leider.</span>
          <div className="flex gap-4">
            {['Datenschutz', 'AGB', 'Emotionaler Support'].map(l => (
              <a key={l} href="#" className="text-xs text-white/25 hover:text-white/60 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
