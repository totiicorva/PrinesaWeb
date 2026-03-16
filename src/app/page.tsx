"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"

// ─── Data ────────────────────────────────────────────────────────────────────

const projects = [
  { title: "X Energy",                category: "2,559 views",  video: "/videos/reel01-compressed.mp4", videoHD: "/videos/optimized/reel01-opt.mp4" },
  { title: "Un artista peculiar",     category: "5.3M views",   video: "/videos/reel06-compressed.mp4", videoHD: "/videos/optimized/reel06-opt.mp4" },
  { title: "Celsux event 1",          category: "1,971 views",  video: "/videos/reel07-compressed.mp4", videoHD: "/videos/optimized/reel07-opt.mp4" },
  { title: "Motos electricas",        category: "620k views",   video: "/videos/reel03-compressed.mp4", videoHD: "/videos/optimized/reel03-opt.mp4" },
  { title: "Horfanato de asesinos",   category: "2.2M views",   video: "/videos/reel05-compressed.mp4", videoHD: "/videos/optimized/reel05-opt.mp4" },
  { title: "Celsux event 2",          category: "332 views",    video: "/videos/reel08-compressed.mp4", videoHD: "/videos/optimized/reel08-opt.mp4" },
  { title: "Seabin Project",          category: "4,424 views",  video: "/videos/reel02-compressed.mp4", videoHD: "/videos/optimized/reel02-opt.mp4" },
  { title: "Un pequeño cambio",       category: "5.9M views",   video: "/videos/reel04-compressed.mp4", videoHD: "/videos/optimized/reel04-opt.mp4" },
  { title: "Celsux event 3",          category: "587 views",    video: "/videos/reel09-compressed.mp4", videoHD: "/videos/optimized/reel09-opt.mp4" },
  { title: "El medico de otro mundo", category: "4.7M views",   video: "/videos/reel10-compressed.mp4", videoHD: "/videos/optimized/reel10-opt.mp4" },
  { title: "Cristales Solares",       category: "88.7k views",  video: "/videos/reel11-compressed.mp4", videoHD: "/videos/optimized/reel11-opt.mp4" },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type Project = (typeof projects)[0]

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useLockScroll(active: boolean) {
  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [active])
}

// ─── VideoModal ───────────────────────────────────────────────────────────────

function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [buffering, setBuffering] = useState(true)

  useLockScroll(true)

  // Cerrar con tecla Escape (desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Botón atrás del navegador cierra el modal en vez de la página
  useEffect(() => {
    history.pushState({ modal: true }, "")
    const onPop = () => onClose()
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [onClose])

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const handleCanPlay = () => {
      setBuffering(false)
      video.play().catch(() => {})
    }
    const handleWaiting = () => setBuffering(true)
    const handlePlaying = () => setBuffering(false)

    video.addEventListener("canplay", handleCanPlay, { once: true })
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("playing", handlePlaying)
    video.load()

    return () => {
      video.removeEventListener("canplay", handleCanPlay)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("playing", handlePlaying)
    }
  }, [src])

  const handleClose = useCallback(() => {
    ref.current?.pause()
    onClose()
  }, [onClose])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleClose}
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
    >
      <button
        onClick={handleClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full transition"
        style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <path d="M1 1l12 12M13 1L1 13" />
        </svg>
      </button>

      <motion.div
        className="relative h-[90vh] max-w-md aspect-[9/16] rounded-xl overflow-hidden bg-black"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {buffering && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <video
          ref={ref}
          src={src}
          className="relative z-10 h-full w-full"
          playsInline
          preload="auto"
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          controls
        />
      </motion.div>
    </motion.div>
  )
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  index,
  onPlay,
  modalOpen,
}: {
  project: Project
  index: number
  onPlay: (src: string) => void
  modalOpen: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current
        if (!video) return
        if (entry.isIntersecting && !modalOpen) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [modalOpen])

  // Pausa/reanuda los videos del carrusel cuando el modal abre o cierra
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (modalOpen) {
      video.pause()
    } else {
      video.play().catch(() => {})
    }
  }, [modalOpen])

  const handleMouseEnter = useCallback(() => {
    setHovered(true)
    if (!document.querySelector(`link[href="${project.videoHD}"]`)) {
      const link = document.createElement("link")
      link.rel = "prefetch"
      link.href = project.videoHD
      link.as = "video"
      document.head.appendChild(link)
    }
  }, [project.videoHD])

  return (
    <motion.div
      className="snap-center flex-shrink-0"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        ref={containerRef}
        className="relative group cursor-pointer"
        style={{ width: "clamp(240px, 22vw, 300px)" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onPlay(project.videoHD)}
      >
        <div className="rounded-lg overflow-hidden" style={{ aspectRatio: "9/16" }}>
          <video
            ref={videoRef}
            src={project.video}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <motion.div
          className="absolute inset-0 rounded-lg flex flex-col justify-end p-4"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" }}
          animate={{ opacity: hovered ? 1 : 0.6 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/50 flex-shrink-0"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              {project.category}
            </p>
          </div>
          <p className="text-white font-medium text-sm leading-tight">{project.title}</p>

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                <path d="M4 2.5l9 5.5-9 5.5V2.5z" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Carousel ────────────────────────────────────────────────────────────────

function Carousel({ onPlay, paused }: { onPlay: (src: string) => void; paused: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const pausedRef = useRef(false)
  const halfRef = useRef(0)
  const loopItems = useMemo(() => [...projects, ...projects], [])

  const runLoop = useCallback(() => {
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop)
      if (pausedRef.current || paused) return
      const el = trackRef.current
      if (!el || halfRef.current === 0) return
      el.scrollLeft += 0.7
      if (el.scrollLeft >= halfRef.current) {
        el.scrollLeft -= halfRef.current
      }
    }
    rafRef.current = requestAnimationFrame(loop)
  }, [paused])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const timer = setTimeout(() => {
      halfRef.current = el.scrollWidth / 2
      el.scrollLeft = halfRef.current
      runLoop()
    }, 100)

    return () => {
      clearTimeout(timer)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [runLoop])

  const nudge = (dir: number) => {
    const el = trackRef.current
    if (!el) return
    el.scrollLeft += dir * 320
    if (el.scrollLeft >= halfRef.current) el.scrollLeft -= halfRef.current
    if (el.scrollLeft < 0) el.scrollLeft += halfRef.current
  }

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-32 z-10"
        style={{ background: "linear-gradient(to right, #000, transparent)" }} />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-32 z-10"
        style={{ background: "linear-gradient(to left, #000, transparent)" }} />

      {[{ dir: -1, side: "left-4" }, { dir: 1, side: "right-4" }].map(({ dir, side }) => (
        <button
          key={dir}
          onClick={() => nudge(dir)}
          className={`absolute ${side} top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-white/20`}
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          aria-label={dir < 0 ? "Anterior" : "Siguiente"}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {dir < 0
              ? <path d="M9 2L4 7l5 5" />
              : <path d="M5 2l5 5-5 5" />}
          </svg>
        </button>
      ))}

      <div
        ref={trackRef}
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { pausedRef.current = false }}
        onTouchStart={() => { pausedRef.current = true }}
        onTouchEnd={() => { setTimeout(() => { pausedRef.current = false }, 1500) }}
        className="flex gap-4 overflow-x-auto px-16 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", touchAction: "pan-x" }}
      >
        {loopItems.map((project, i) => (
          <ProjectCard
            key={i}
            project={project}
            index={i % projects.length}
            onPlay={onPlay}
            modalOpen={paused}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 1200], ["0%", "30%"])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })

  return (
    <>
      <motion.div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: "linear-gradient(170deg, #000 0%, #111 40%, #1c1c1c 70%, #f0f0f0 100%)",
          backgroundSize: "100% 200%",
          backgroundPositionY: bgY,
        }}
      />

      <main className="relative min-h-screen flex flex-col text-white">

        {/* ── Nav ── */}
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-6">
          <span
            className="text-sm font-medium tracking-[0.25em] uppercase"
            style={{
              color: "#ffffff",
              backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0))",
              backgroundSize: "100% 1px",
              backgroundPosition: "0 100%",
              backgroundRepeat: "no-repeat",
              paddingBottom: "3px",
            }}
          >
            Prinesa
          </span>
          <nav className="flex items-center gap-8">
            <button
              onClick={() => scrollTo("contact")}
              className="text-xs tracking-[0.15em] uppercase transition-all duration-300 px-5 py-2.5 rounded-full font-medium"
              style={{ background: "white", color: "#000" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.85)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "white" }}
            >
              Contacto
            </button>
          </nav>
        </header>

        {/* ── Hero ── */}
        <section className="flex flex-col justify-center px-8 md:px-16 pt-28 pb-14 md:pt-36 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/30 mb-8">
              Estudio Creativo — Buenos Aires
            </p>
            <h1 className="font-bold leading-[0.95] tracking-tight max-w-4xl" style={{ fontSize: "clamp(2rem, 5.5vw, 5rem)" }}>
              Convertimos tus <br />
              <em className="not-italic text-white/35"> videos en reels </em><br />
               que la gente realmente mira.
            </h1>
            <p className="mt-6 text-white/40 text-sm md:text-base tracking-wide max-w-md">
              Edición y estrategia de contenido para creadores y marcas.
            </p>

            {/* Prueba de autoridad */}
            <motion.div
              className="mt-10 flex flex-wrap items-center gap-6 md:gap-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {[
                { value: "+5M", label: "Views generadas" },
                { value: "+500", label: "Reels editados" },
                { value: "Global", label: "Creadores y marcas" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-white font-bold text-xl md:text-2xl tracking-tight">{value}</span>
                  <span className="text-white/30 text-[10px] uppercase tracking-[0.2em] mt-0.5">{label}</span>
                </div>
              ))}
            </motion.div>

            <div className="mt-10 flex items-center gap-6">
              <button
                onClick={() => scrollTo("work")}
                className="text-sm tracking-widest uppercase text-white hover:text-white/60 transition flex items-center gap-3"
              >
                Ver proyectos
                <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M0 5h16M12 1l4 4-4 4" />
                </svg>
              </button>
            </div>
          </motion.div>
        </section>
        <section id="work" className="py-24">
          <div className="px-8 md:px-16 mb-12 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/30 mb-3">Selected work</p>
              <h2 className="text-3xl md:text-4xl font-light tracking-tight">Projects</h2>
            </div>
            <span className="text-xs text-white/25 tracking-wider hidden md:block">
              {projects.length} works
            </span>
          </div>
          <Carousel onPlay={setActiveVideo} paused={!!activeVideo} />
        </section>

        {/* ── Cómo trabajamos ── */}
        <section id="process" className="py-32 px-8 md:px-16">
          <motion.div
            className="max-w-5xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-white/30 mb-4">Proceso</p>
            <h2 className="font-bold leading-tight tracking-tight text-white mb-6" style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}>
              Cómo trabajamos
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-2xl mb-16">
              Cada proyecto empieza con una conversación. Antes de hablar de edición, nos interesa entender tu contenido: qué querés comunicar, a quién le hablás y cómo funciona tu proceso de creación.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  number: "01",
                  title: "Entendemos tu contenido",
                  description: "Analizamos tu estilo, el tipo de videos que querés publicar y cómo se adapta a formatos como Reels, TikTok o Shorts.",
                },
                {
                  number: "02",
                  title: "Definimos la forma de trabajo",
                  description: "En base a tu flujo de contenido, armamos una propuesta personalizada: desde edición continua hasta planificación estratégica de videos.",
                },
                {
                  number: "03",
                  title: "Convertimos tus ideas en contenido",
                  description: "A partir de tus crudos o ideas, transformamos el material en videos dinámicos, pensados para retener atención y funcionar en redes.",
                },
              ].map(({ number, title, description }, i) => (
                <motion.div
                  key={number}
                  className="flex flex-col gap-4"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <span className="text-white/15 font-bold" style={{ fontSize: "clamp(3rem, 6vw, 5rem)", lineHeight: 1 }}>
                    {number}
                  </span>
                  <div className="w-8 h-px bg-white/20" />
                  <h3 className="text-white font-medium text-lg leading-snug">{title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── About ── */}
        <section id="about" className="py-32 px-8 md:px-16">
          <motion.div
            className="max-w-5xl border-l-2 border-white/60 pl-8 md:pl-14"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-white/30 mb-12">Nosotros</p>

            <motion.h2
              className="font-bold leading-tight tracking-tight text-white max-w-4xl mb-16"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Tener ideas no es lo difícil.<br />
              <em className="not-italic text-white/40">Convertirlas en buen contenido si.</em>
            </motion.h2>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 text-white/50 text-base leading-relaxed mb-20"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="flex flex-col gap-6">
                <p>
                  Grabar un video <span className="text-white font-medium">puede llevar minutos.</span> Pero editarlo, darle ritmo, hacerlo
                  claro y mantener la atención de quien mira…{" "}
                  <span className="text-white font-medium">puede llevar horas.</span>{" "}
                  Ahí es donde aparece Prinesa Studio.
                </p>
                <p>
                  Creamos el estudio con una idea clara: que los creadores puedan{" "}
                  <span className="text-white font-medium">enfocarse en lo que mejor hacen</span>
                  {" "}— crear — mientras nosotros nos ocupamos de transformar ese material en
                  videos dinámicos, claros y pensados para funcionar en redes.
                </p>
              </div>
              <div className="flex flex-col gap-6">
                <p>
                  Cada proyecto que llega a nosotros empieza igual: escuchando la idea detrás
                  del contenido. Porque no creemos en ediciones genéricas. Creemos en encontrar
                  la forma de que cada video tenga{" "}
                  <span className="text-white font-medium">personalidad, ritmo y propósito.</span>
                </p>
                <p>
                  Prinesa Studio es un espacio creativo donde las ideas toman forma, las
                  historias se editan con intención y el contenido deja de ser solo un video
                  más para convertirse en algo que{" "}
                  <span className="text-white font-medium">realmente conecta.</span>
                </p>
                <p>
                  <span className="text-white font-medium">Editamos y estructuramos contenido</span>{" "}
                  para que retenga atención en redes.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="border-t border-white/8 pt-12"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <p className="font-bold leading-tight tracking-tight text-white/80" style={{ fontSize: "clamp(1.4rem, 3vw, 2.4rem)" }}>
                Hoy en redes no gana quien sube más contenido.{" "}
                <em className="not-italic text-white/40">
                  <span className="text-white">Gana quien logra que alguien se quede mirando.</span>
                </em>
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Contact ── */}
        <section id="contact" className="py-24 px-8 md:px-16" style={{ background: "#f5f4f0" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center text-center gap-6"
          >
            <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "#999" }}>
              Trabajemos juntos
            </p>
            <h2 className="font-semibold leading-tight tracking-tight max-w-xl" style={{ fontSize: "clamp(1.3rem, 2.5vw, 2.2rem)", color: "#111" }}>
              Contáctanos y llevemos tu marca al siguiente nivel.
            </h2>
            <p className="text-sm md:text-base max-w-md leading-relaxed" style={{ color: "#666" }}>
              Cada proyecto empieza con una conversación. Contanos tu idea
              y te respondemos en menos de 24 horas.
            </p>

            <a
              href="mailto:prinesastudio@gmail.com"
              className="group flex items-center gap-3 mt-4 px-6 py-4 rounded-full transition-all duration-300"
              style={{ background: "#111", border: "1px solid #111" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#333"; e.currentTarget.style.borderColor = "#333" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.borderColor = "#111" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span className="text-sm md:text-base tracking-wide" style={{ color: "#fff" }}>
                prinesastudio@gmail.com
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="-translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                <path d="M1 7h11M7 2l5 5-5 5" />
              </svg>
            </a>

            <div className="flex items-center gap-8 mt-6">
              <a
                href="https://wa.me/5491133015519?text=Hola!%20Vi%20tu%20portfolio%20y%20me%20interesa%20trabajar%20juntos.%20%C2%BFPodr%C3%ADan%20contarme%20m%C3%A1s%20sobre%20sus%20servicios%20y%20coordinar%20una%20llamada%3F"
                target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-2 transition-all duration-300"
                style={{ color: "#444" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#000")}
                onMouseLeave={e => (e.currentTarget.style.color = "#444")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-xs tracking-[0.2em] uppercase font-medium">WhatsApp</span>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <path d="M1 6h9M6 2l4 4-4 4" />
                </svg>
              </a>

              <span className="w-px h-4" style={{ background: "#ccc" }} />

              <a
                href="https://www.linkedin.com/in/prinesa-studio"
                target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-2 transition-all duration-300"
                style={{ color: "#444" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#000")}
                onMouseLeave={e => (e.currentTarget.style.color = "#444")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-xs tracking-[0.2em] uppercase font-medium">LinkedIn</span>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <path d="M1 6h9M6 2l4 4-4 4" />
                </svg>
              </a>
            </div>
          </motion.div>

          <p className="mt-20 text-center text-xs" style={{ color: "#bbb" }}>
            © {new Date().getFullYear()} Prinesa Studio — Todos los derechos reservados
          </p>
        </section>
      </main>

      {/* ── Modal ── */}
      <AnimatePresence>
        {activeVideo && (
          <VideoModal src={activeVideo} onClose={() => setActiveVideo(null)} />
        )}
      </AnimatePresence>
    </>
  )
}