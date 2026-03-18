import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'

// ── Animation variants ────────────────────────────────────────
const ease = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease },
  }),
}

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
}

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease } },
}

const stagger = { visible: { transition: { staggerChildren: 0.1 } } }
const staggerFast = { visible: { transition: { staggerChildren: 0.07 } } }

const vp = { once: true, margin: '-60px' }

// ── Counter hook ──────────────────────────────────────────────
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
        setValue(Math.floor(target * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])
  return [ref, value]
}

// ── Modal ─────────────────────────────────────────────────────
const MODAL_STEPS = [
  { emoji: '💌', title: 'Du bist einen Schritt entfernt.', text: 'Wir matchen dich gerade mit deinem perfekten Terminator', btn: 'Suche läuft…', loading: true, showDots: true },
  { emoji: '🎯', title: 'Match gefunden.', text: 'Jana, 27 — Zertifizierte Closure Specialist. 847 erfolgreiche Terminierungen. 4,97 ★. Heute verfügbar.', btn: 'Buchung bestätigen →' },
  { emoji: '✅', title: 'Buchung bestätigt.', text: 'Spaß. Das hier ist eine Witz-Website. Aber wir hoffen, du hast etwas gespürt. Geh schreib die Nachricht selbst — du schaffst das. 💪', btn: 'Schließen (und es tun)', close: true },
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
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            initial={{ y: 24, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.28, ease }}
          >
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
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
                {!s.close && <button onClick={onClose} className="mt-3 text-xs text-muted underline block mx-auto">Abbrechen</button>}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Marquee strip ─────────────────────────────────────────────
const TICKER_ITEMS = ['Das Gespräch führen', 'Endlich Klarheit', 'Kein Ghosting', 'Kein Drama', 'Sauber raus', 'Ohne schlechtes Gewissen', 'Ehrlich sein', 'Endlich weitermachen']

function Marquee() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="overflow-hidden border-y border-border bg-dark py-3 select-none">
      <motion.div
        className="flex gap-0 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
      >
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-6 text-sm font-medium text-white/60">
            {item}
            <span className="text-accent font-bold">✕</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ── FAQ ───────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-card transition-colors">
        <span className="font-medium text-sm">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }} className="text-lg text-light flex-shrink-0">+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
            <p className="px-6 pb-5 text-sm text-muted leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Pricing Card ──────────────────────────────────────────────
function PricingCard({ plan, price, period, desc, features, featured, onBook }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, boxShadow: featured ? '0 20px 60px rgba(232,52,26,0.25)' : '0 16px 48px rgba(0,0,0,0.12)' }}
      className={`rounded-2xl p-7 flex flex-col ${featured ? 'bg-dark text-white border border-dark' : 'bg-white border border-border'}`}
    >
      {featured && <span className="inline-block mb-4 px-3 py-1 bg-accent text-white text-xs font-semibold uppercase tracking-wider rounded-full w-fit">Beliebteste Wahl</span>}
      <div className={`text-xs font-semibold uppercase tracking-widest mb-2 ${featured ? 'text-white/40' : 'text-muted'}`}>{plan}</div>
      <div className="font-display text-5xl font-semibold leading-none tracking-tight mb-1">{price}</div>
      <div className={`text-xs mb-4 ${featured ? 'text-white/40' : 'text-muted'}`}>{period}</div>
      <p className={`text-sm leading-relaxed mb-4 ${featured ? 'text-white/55' : 'text-muted'}`}>{desc}</p>
      <div className={`h-px mb-4 ${featured ? 'bg-white/10' : 'bg-border'}`} />
      <ul className="flex-1 space-y-2 mb-6">
        {features.map(f => (
          <li key={f} className={`flex items-start gap-2 text-sm ${featured ? 'text-white/55' : 'text-muted'}`}>
            <span className={featured ? 'text-emerald-400' : 'text-accent'}>✓</span>{f}
          </li>
        ))}
      </ul>
      <button onClick={onBook} className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${featured ? 'bg-accent hover:bg-accent-dark text-white' : 'border border-border hover:border-dark bg-transparent text-dark hover:bg-card'}`}>
        {featured ? 'Jetzt buchen' : 'Loslegen'}
      </button>
    </motion.div>
  )
}

// ── Testimonial ───────────────────────────────────────────────
function TestCard({ emoji, text, name, city, stars }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.09)' }} className="bg-white border border-border rounded-2xl p-6 flex flex-col">
      <div className="text-amber-400 text-sm mb-3">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</div>
      <p className="text-sm leading-relaxed italic text-dark flex-1 mb-4">{text}</p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-base flex-shrink-0">{emoji}</div>
        <div>
          <div className="text-xs font-semibold">{name}</div>
          <div className="text-xs text-muted">{city}</div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Big Statement Section ─────────────────────────────────────
function BigStatement({ onBook }) {
  return (
    <section className="py-24 px-5 bg-accent overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={stagger}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8"
        >
          <motion.h2
            variants={slideLeft}
            className="font-display font-medium text-white leading-none tracking-tight"
            style={{ fontSize: 'clamp(52px, 10vw, 112px)' }}
          >
            Schluss.<br />Jetzt.
          </motion.h2>
          <motion.div variants={slideRight} className="flex flex-col gap-4 sm:text-right">
            <p className="text-white/75 text-base leading-relaxed max-w-xs">
              Du willst kein Drama. Du willst kein "wir müssen reden". Du willst einfach, dass es vorbei ist — ohne dass du derjenige sein musst, der es sagt.
            </p>
            <motion.button
              onClick={onBook}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3.5 bg-white text-accent font-bold text-sm rounded-lg self-start sm:self-end"
            >
              Jetzt buchen →
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ── MAIN ─────────────────────────────────────────────────────
export default function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [counterRef, counterVal] = useCounter(12847)

  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const openModal = () => { setModalOpen(true); document.body.style.overflow = 'hidden' }
  const closeModal = () => { setModalOpen(false); document.body.style.overflow = '' }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Modal open={modalOpen} onClose={closeModal} />

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-border" style={{ background: 'rgba(250,250,248,0.9)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <a href="#" className="font-display text-lg font-semibold tracking-tight whitespace-nowrap">
            Quit Your <span className="text-accent">Situationship</span>
          </a>
          <div className="flex items-center gap-2">
            <a href="#how" className="hidden sm:block text-sm font-medium text-muted hover:text-dark transition-colors px-3 py-1.5 rounded-md hover:bg-card">Wie es geht</a>
            <a href="#pricing" className="hidden sm:block text-sm font-medium text-muted hover:text-dark transition-colors px-3 py-1.5 rounded-md hover:bg-card">Preise</a>
            <button onClick={openModal} className="text-sm font-semibold text-white bg-accent hover:bg-accent-dark transition-colors px-4 py-2 rounded-md whitespace-nowrap">
              Jetzt buchen →
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} className="relative max-w-5xl mx-auto px-5 pt-20 pb-20 text-center overflow-hidden">
        {/* bg accent blob */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, #E8341A 0%, transparent 70%)' }} />
        </div>

        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ y: heroY, opacity: heroOpacity }}>
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-light border border-accent/20 rounded-full text-xs font-semibold text-accent mb-8">
              <span className="badge-dot w-1.5 h-1.5 bg-accent rounded-full" />
              Für alle, die "das Gespräch" seit Wochen vor sich herschieben
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} className="font-display font-medium leading-none tracking-tight mb-6" style={{ fontSize: 'clamp(58px, 11vw, 104px)' }}>
            Break up.<br />
            <em className="italic text-accent">On demand.</em>
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} className="text-muted max-w-md mx-auto mb-9 leading-relaxed font-light" style={{ fontSize: 'clamp(15px, 2.2vw, 18px)' }}>
            Du magst's locker — aber sie bald nicht mehr. Du weißt's.
            Wir führen das Gespräch, das du seit Wochen vor dir herschiebst.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              onClick={openModal}
              whileHover={{ y: -2, boxShadow: '0 10px 32px rgba(232,52,26,0.38)' }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto px-8 py-4 bg-accent hover:bg-accent-dark text-white font-bold text-sm rounded-lg transition-colors"
              style={{ boxShadow: '0 4px 20px rgba(232,52,26,0.28)' }}
            >
              Terminator buchen →
            </motion.button>
            <a href="#how" className="w-full sm:w-auto px-6 py-4 border border-border hover:border-light bg-transparent text-dark text-sm font-medium rounded-lg transition-colors text-center hover:bg-card">
              Wie es funktioniert
            </a>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 mt-16 pt-10 border-t border-border"
        >
          {[
            { refProp: counterRef, val: `${counterVal.toLocaleString('de-DE')}`, label: 'Situationships beendet' },
            { val: '4,9 ★', label: 'Durchschnittsbewertung' },
            { val: '<24h', label: 'Reaktionszeit' },
            { val: '98 %', label: 'Clean-Break-Rate' },
          ].map(({ refProp, val, label }) => (
            <div key={label} className="text-center">
              <div ref={refProp} className="font-display font-semibold leading-none tracking-tight" style={{ fontSize: 'clamp(30px, 5vw, 42px)' }}>{val}</div>
              <div className="text-xs text-muted mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* MARQUEE */}
      <Marquee />

      {/* HOW IT WORKS */}
      <section id="how" className="bg-white border-b border-border py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="mb-14">
            <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[1.8px] text-accent mb-3">Ablauf</motion.div>
            <motion.h2 variants={slideLeft} className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.05 }}>
              Drei Schritte.<br />Null peinliche Texte.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted text-sm mt-4 max-w-xs leading-relaxed">
              Maximale Closure, minimaler emotionaler Aufwand.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={vp} variants={staggerFast}
            className="grid grid-cols-1 sm:grid-cols-3 border border-border rounded-2xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-border"
          >
            {[
              { num: '01', icon: '📋', title: 'Situation beschreiben', desc: 'Wie lange läuft das schon? Wie ernst ist es bei ihr? Was willst du sagen — oder eben nicht sagen? Wir hören zu.' },
              { num: '02', icon: '📞', title: 'Wir führen das Gespräch', desc: 'Ein echter Mensch klärt das in deinem Namen. Klar, ruhig, ohne Drama. Kein "wir müssen reden", kein Ghosting — einfach Klarheit.' },
              { num: '03', icon: '🕊️', title: 'Du bist raus. Sauber.', desc: 'Keine offenen Fragen, kein schlechtes Gewissen. Du bekommst einen kurzen Bericht — und kannst endlich wieder schlafen.' },
            ].map(({ num, icon, title, desc }) => (
              <motion.div key={num} variants={scaleIn} className="bg-white p-8 group">
                <div className="font-display font-light leading-none mb-6 transition-colors duration-300 text-border group-hover:text-accent/20" style={{ fontSize: '72px' }}>{num}</div>
                <div className="text-2xl mb-3">{icon}</div>
                <div className="font-semibold text-base mb-2">{title}</div>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BIG STATEMENT */}
      <BigStatement onBook={openModal} />

      {/* PRICING */}
      <section id="pricing" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="mb-14">
            <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[1.8px] text-accent mb-3">Preise</motion.div>
            <motion.h2 variants={slideLeft} className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.05 }}>
              Investiere in<br />deine Freiheit.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted text-sm mt-4">Transparente Preise. Keine versteckten Gefühle.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PricingCard plan="Starter" price="0 €" period="einmalig"
              desc="Für alle, die einen sanften Schubs brauchen, aber selbst noch tippen können."
              features={['KI-generierte Trennungstext-Vorlage', 'Ghosting-Risikobewertung', '1× "Du verdienst Besseres"-Pep-Talk', 'Community-Forum-Zugang']}
              onBook={openModal} />
            <PricingCard plan="The Gentle Letdown" price="29 €" period="pro Situationship"
              desc="Wir übernehmen alles. Du musst danach nur noch blockieren."
              features={['Menschlich zugestellter Text oder Anruf', 'Maßgeschneidertes Trennungsskript', 'Antwort-Management (wir handhaben die Replies)', 'Closure-Abschlussbericht', 'Kuratierte Healing-Playlist']}
              featured onBook={openModal} />
            <PricingCard plan="Full Closure" price="99 €" period="pro Situationship"
              desc="Das White-Glove-Erlebnis. Persönlich. Neutrales Café. Blumen inklusive."
              features={['Persönliches Trennungsgespräch', 'Zertifizierter Closure Specialist™', 'Optional: dein Hoodie wird zurückgeholt', '30-Tage Kein-Rückfall-Garantie*', 'Priorität 24/7-Support']}
              onBook={openModal} />
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-card border-y border-border py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="mb-14">
            <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[1.8px] text-accent mb-3">Bewertungen</motion.div>
            <motion.h2 variants={slideLeft} className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.05 }}>
              Die haben's geschafft.<br />Du auch.
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TestCard emoji="😮‍💨" stars={5}
              text='"Ich hab das Gespräch 4 Monate lang vor mir hergeschoben. Jedes Mal wenn sie mich was gefragt hat, hab ich rumgeeiert. Die haben das in einem Anruf gelöst. Ich hätte früher buchen sollen."'
              name="Moritz B." city="München" />
            <TestCard emoji="🧍" stars={5}
              text={`"Sie wollte was Ernstes, ich wollte locker bleiben — und ich hab's einfach laufen lassen. Das ist unfair. QYS hat das für mich gerade gerückt, ohne dass ich ein Arschloch sein musste."`}
              name="Jonas K." city="Hamburg" />
            <TestCard emoji="💀" stars={4}
              text='"Einen Stern abgezogen weil ich insgeheim gehofft hatte, es regelt sich von selbst. Tut es nicht. Tut es nie. Vier Sterne weil die Playlist wirklich gut ist."'
              name="Lea W." city="Berlin" />
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="mb-14">
            <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[1.8px] text-accent mb-3">FAQ</motion.div>
            <motion.h2 variants={slideLeft} className="font-display font-medium tracking-tight" style={{ fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.05 }}>
              Gute Fragen.<br />Ernsthafte Antworten.*
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted text-sm mt-4">*"Ernsthaft" ist relativ.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={scaleIn} className="border border-border rounded-2xl overflow-hidden bg-white">
            {[
              { q: 'Bin ich ein schlechter Mensch dafür?', a: 'Nein. Gefühle entwickeln sich unterschiedlich schnell — das ist menschlich. Was unfair wäre: es weiter laufen zu lassen, ohne Klarheit zu schaffen. Genau das verhindern wir.' },
              { q: 'Was wenn ich selbst gar nicht genau weiß, was ich will?', a: 'Dann bist du genau richtig hier. Im Intake-Gespräch helfen wir dir, das zu sortieren. Manchmal braucht man einfach jemanden, der die richtigen Fragen stellt.' },
              { q: 'Was wenn sie die Sache ganz anders eingeschätzt hat?', a: 'Kommt vor. Deswegen sind unsere Profis ausgebildet, sensibel und klar zugleich zu sein. Kein Drama, keine Vorwürfe — einfach ehrliche Kommunikation.' },
              { q: "Kann ich eine Rückerstattung bekommen wenn ich's mir anders überlege?", a: 'Nein. Das ist irgendwie der Punkt.' },
              { q: 'Ist das nicht feige?', a: 'Feige wäre es, einfach zu ghosten. Du wählst aktiv Klarheit — nur mit Unterstützung. Das ist erwachsener als die meisten Alternativen.' },
            ].map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-dark py-28 px-5 text-center overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, #E8341A 0%, transparent 70%)' }} />
        </div>
        <motion.div initial="hidden" whileInView="visible" viewport={vp} variants={stagger} className="max-w-lg mx-auto relative">
          <motion.div variants={fadeUp} className="text-xs font-semibold uppercase tracking-[1.8px] text-white/35 mb-4">Bereit?</motion.div>
          <motion.h2 variants={scaleIn} className="font-display font-medium text-white tracking-tight mb-4" style={{ fontSize: 'clamp(40px, 8vw, 80px)', lineHeight: 1.05 }}>
            Du verdienst<br />
            <em className="italic text-accent">wirklich Definiertes.</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/45 text-sm leading-relaxed mb-10">
            Irgendwann kommt das Gespräch sowieso.<br />Lass uns es für dich führen — bevor es noch komplizierter wird.
          </motion.p>
          <motion.button
            variants={fadeUp}
            onClick={openModal}
            whileHover={{ scale: 1.04, boxShadow: '0 10px 36px rgba(232,52,26,0.45)' }}
            whileTap={{ scale: 0.97 }}
            className="px-10 py-4 bg-accent hover:bg-accent-dark text-white font-bold text-base rounded-lg transition-colors"
          >
            Jetzt beenden. →
          </motion.button>
          <motion.p variants={fadeUp} className="text-white/20 text-xs mt-6">
            *Keine echten Beziehungen wurden bei der Erstellung dieser Website verletzt.
          </motion.p>
        </motion.div>
      </section>

      {/* FOOTER */}
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
