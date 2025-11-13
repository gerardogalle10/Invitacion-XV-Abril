import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EVENT_DATE = new Date("2025-12-19T18:00:00"); // Viernes 19 de Diciembre 2025, 6:00 pm

const GALLERY_IMAGES = [
  "https://i.postimg.cc/8c0XtQ3Z/IMG-20251110-WA0052.jpg",
  "https://i.postimg.cc/nrPS0b5W/IMG-20251110-WA0053.jpg",
  "https://i.postimg.cc/SRv1DF5t/IMG-20251110-WA0054.jpg",
  "https://i.postimg.cc/597rxL0V/IMG-20251110-WA0055.jpg",
  "https://i.postimg.cc/wMG408PP/Whats-App-Image-2025-11-10-at-13-28-30-a502cbab.jpg",
];

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const AUDIO_URL =
  "https://github.com/gerardogalle10/audio-xv/raw/main/Nocrezcasmas.mp3";

// 👉 Número de WhatsApp (sin +, sin espacios)
const WHATSAPP_NUMBER = "528662613760";

const InvitacionXV: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isInvitationOpen, setIsInvitationOpen] = useState(false);
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  // 🔊 Audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sliderDirectionRef = useRef<1 | -1>(1); // 1 = hacia adelante, -1 = hacia atrás
  const [isPlaying, setIsPlaying] = useState(false);

  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    "XV de Abril Brithzeidy"
  )}&dates=20251220T000000Z/20251220T050000Z&details=${encodeURIComponent(
    "¡Ha llegado el momento de soñar! Con mucha alegría, te invito a celebrar mis XV años, un día lleno de magia, amor y felicidad."
  )}&location=${encodeURIComponent(
    "Parroquia San José Obrero, Monclova, Coahuila"
  )}`;

  // funciones para avanzar / retroceder
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % GALLERY_IMAGES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? GALLERY_IMAGES.length - 1 : prev - 1
    );
  };

  // ---- Audio setup ----
  useEffect(() => {
    audioRef.current = new Audio(AUDIO_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.6;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // --- Auto-cambio de imagen cada 5 segundos (1→5→1 tipo ping-pong) ---
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) => {
      const total = GALLERY_IMAGES.length;
      let dir = sliderDirectionRef.current;
      let next = prev + dir;

      if (next >= total) {
        // Llegó al último, ahora regresa
        dir = -1;
        sliderDirectionRef.current = dir;
        next = prev + dir; // prev - 1
      } else if (next < 0) {
        // Llegó al primero, ahora avanza
        dir = 1;
        sliderDirectionRef.current = dir;
        next = prev + dir; // prev + 1
      }

      return next;
    });
  }, 5000);

  return () => clearInterval(interval);
}, []);


  // ---- Countdown ----
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = EVENT_DATE.getTime() - now;

      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("No se pudo reproducir el audio:", err);
        });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);

    const nombre = (data.get("nombre") as string) || "";
    const asistencia = (data.get("asistencia") as string) || "";
    const personas = (data.get("personas") as string) || "";
    const comentarios =
      (data.get("comentarios") as string) || "Sin comentarios.";

    const asistenciaTexto =
      asistencia === "si"
        ? "Sí, asistiré"
        : asistencia === "no"
        ? "No podré asistir"
        : asistencia;

    const mensaje =
      `*Confirmación de asistencia - XV de Abril*\n\n` +
      `*Nombre:* ${nombre}\n` +
      `*¿Asistirás?:* ${asistenciaTexto}\n` +
      `*Número de personas:* ${personas}\n` +
      `*Comentarios:* ${comentarios}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      mensaje
    )}`;

    window.open(url, "_blank");
    form.reset();

    alert(
      "¡Gracias por confirmar tu asistencia! 💖\nSe abrirá WhatsApp para enviar la confirmación."
    );
  };

  const formatNumber = (n: number) => n.toString().padStart(2, "0");

return (
  <div className="relative w-full overflow-x-hidden bg-neutral-500">
    {/* SOBRE INICIAL / PORTADA */}
    <AnimatePresence>
      {!isInvitationOpen && (
        <motion.div
          key="sobre-portada"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#f5f0e9]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative w-80 max-w-sm mx-4"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Texto arriba del sobre */}
            <div className="mb-6 text-center">
              <p
                className="text-xs tracking-[0.3em] uppercase text-gray-500"
                style={{ fontFamily: '"Dancing Script", cursive' }}
              >
                Invitación
              </p>
              <p
                className="text-3xl mt-2 text-[#9a8e80]"
                style={{ fontFamily: '"Dancing Script", cursive' }}
              >
                XV de Abril Brithzeidy
              </p>
            </div>

            {/* “Sobre” estilizado */}
            <div className="relative h-48">
              {/* cuerpo del sobre */}
              <div
                className="absolute inset-x-0 bottom-0 h-40 rounded-3xl shadow-2xl"
                style={{ backgroundColor: "rgb(249, 211, 224)" }}
              >
                <div className="absolute inset-4 rounded-2xl border border-white/70" />
                <div className="absolute right-4 top-4 h-10 w-10 rounded-full bg-white/80 shadow-md" />
              </div>

              {/* solapa */}
              <motion.div
                className="absolute inset-x-4 top-0 h-24 origin-top rounded-3xl"
                style={{
                  background:
                    "linear-gradient(to bottom, rgb(217,202,254), rgb(249,211,224))",
                }}
                initial={{ rotateX: 0 }}
                animate={{ rotateX: 0 }}
              />
            </div>

            {/* Botón para “abrir” */}
            <motion.button
              type="button"
              onClick={() => setIsInvitationOpen(true)}
              className="mt-8 w-full rounded-full bg-[#9E8B8E] px-6 py-3 text-sm text-white shadow-md hover:bg-[#8A7477] focus:outline-none focus:ring-2 focus:ring-[#9E8B8E] focus:ring-offset-2"
              style={{ fontFamily: '"Dancing Script", cursive' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
            >
              Tocar para abrir invitación
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* CONTENIDO REAL DE LA INVITACIÓN */}
    <div
      className={
        isInvitationOpen
          ? "opacity-100 transition-opacity duration-500"
          : "opacity-0 pointer-events-none select-none"
      }
    >
      {/* BOTÓN/MENÚ FLOTANTE - SIEMPRE FIJO (FUERA DEL CONTENEDOR PRINCIPAL) */}
      <button
        className="fixed top-6 right-6 z-50 p-2 rounded-full bg-opacity-80 backdrop-blur-sm shadow-md"
        style={{ backgroundColor: "rgb(249, 211, 224)" }}
        aria-label="Abrir menú"
        type="button"
        onClick={() => setMenuOpen((m) => !m)}
      >
        <div className="w-6 h-5 relative flex flex-col justify-between">
          <span
            className={`w-full h-0.5 bg-[#9a8e80] origin-center transition-transform duration-200 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`w-full h-0.5 bg-[#9a8e80] transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`w-full h-0.5 bg-[#9a8e80] origin-center transition-transform duration-200 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </div>
      </button>

      {/* BOTÓN DE AUDIO FLOTANTE - SIEMPRE FIJO (FUERA DEL CONTENEDOR PRINCIPAL) */}
      <button
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-opacity-80 backdrop-blur-sm shadow-lg"
        style={{ backgroundColor: "rgb(249, 211, 224)" }}
        aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
        type="button"
        onClick={toggleAudio}
      >
        <div className="flex items-center justify-center">
          {isPlaying ? (
            <svg
              stroke="currentColor"
              fill="currentColor"
              viewBox="0 0 512 512"
              className="w-4 h-4 text-[#9a8e80]"
            >
              <path d="M176 64h-48C110.3 64 96 78.3 96 96v320c0 17.7 14.3 32 32 32h48c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm208 0h-48c-17.7 0-32 14.3-32 32v320c0 17.7 14.3 32 32 32h48c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32z" />
            </svg>
          ) : (
            <svg
              stroke="currentColor"
              fill="currentColor"
              viewBox="0 0 512 512"
              className="w-4 h-4 text-[#9a8e80]"
            >
              <path d="M470.38 1.51L150.41 96A32 32 0 0 0 128 126.51v261.41A139 139 0 0 0 96 384c-53 0-96 28.66-96 64s43 64 96 64 96-28.66 96-64V214.32l256-75v184.61a138.4 138.4 0 0 0-32-3.93c-53 0-96 28.66-96 64s43 64 96 64 96-28.65 96-64V32a32 32 0 0 0-41.62-30.49z" />
            </svg>
          )}
        </div>
      </button>

      {/* OVERLAY MENÚ CON ANIMACIÓN (TAMBIÉN FUERA DEL CONTENEDOR SCROLLABLE) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.nav
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 px-8 py-16 bg-white/95 rounded-3xl shadow-2xl"
            >
              <h2
                className="text-3xl text-[#9a8e80] mb-4 border-b-2 border-[#9a8e80] pb-2 flex-shrink-0"
                style={{ fontFamily: '"Dancing Script", cursive' }}
              >
                Menú
              </h2>

              <ul className="space-y-2 text-center w-full max-w-xs flex-shrink-0">
                {/* INICIO */}
                <li tabIndex={0}>
                  <button
                    type="button"
                    onClick={() => handleScrollTo("inicio")}
                    className="flex items-center gap-3 text-[#000000] hover:text-[#746b60] group p-3 rounded-lg hover:bg-[#9a8e80]/10 w-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9a8e80]/5 to-[#9a8e80]/10 rounded-lg -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <div className="relative z-10">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        viewBox="0 0 576 512"
                        className="w-6 h-6"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z" />
                      </svg>
                    </div>
                    <span
                      className="text-lg relative z-10"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Inicio
                    </span>
                  </button>
                </li>

                {/* CONTADOR */}
                <li tabIndex={0}>
                  <button
                    type="button"
                    onClick={() => handleScrollTo("contador")}
                    className="flex items-center gap-3 text-[#000000] hover:text-[#746b60] group p-3 rounded-lg hover:bg-[#9a8e80]/10 w-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9a8e80]/5 to-[#9a8e80]/10 rounded-lg -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <div className="relative z-10">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        viewBox="0 0 448 512"
                        className="w-6 h-6"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z" />
                      </svg>
                    </div>
                    <span
                      className="text-lg relative z-10"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Contador
                    </span>
                  </button>
                </li>

                {/* PADRES */}
                <li tabIndex={0}>
                  <button
                    type="button"
                    onClick={() => handleScrollTo("padres")}
                    className="flex items-center gap-3 text-[#000000] hover:text-[#746b60] group p-3 rounded-lg hover:bg-[#9a8e80]/10 w-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9a8e80]/5 to-[#9a8e80]/10 rounded-lg -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <div className="relative z-10">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        viewBox="0 0 576 512"
                        className="w-6 h-6"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M488.2 59.1C478.1 99.6 441.7 128 400 128s-78.1-28.4-88.2-68.9L303 24.2C298.8 7.1 281.4-3.3 264.2 1S236.7 22.6 241 39.8l8.7 34.9c11 44 40.2 79.6 78.3 99.6V480c0 17.7 14.3 32 32 32s32-14.3 32-32V352h16V480c0 17.7 14.3 32 32 32s32-14.3 32-32V174.3c38.1-20 67.3-55.6 78.3-99.6L559 39.8c4.3-17.1-6.1-34.5-23.3-38.8S501.2 7.1 497 24.2l-8.7 34.9zM400 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM80 96A48 48 0 1 0 80 0a48 48 0 1 0 0 96zm-8 32c-35.3 0-64 28.7-64 64v96l0 .6V480c0 17.7 14.3 32 32 32s32-14.3 32-32V352H88V480c0 17.7 14.3 32 32 32s32-14.3 32-32V252.7l13 20.5c5.9 9.2 16.1 14.9 27 14.9h48c17.7 0 32-14.3 32-32s-14.3-32-32-32H209.6l-37.4-58.9C157.6 142 132.1 128 104.7 128H72z" />
                      </svg>
                    </div>
                    <span
                      className="text-lg relative z-10"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Padres
                    </span>
                  </button>
                </li>

                {/* ITINERARIO */}
                <li tabIndex={0}>
                  <button
                    type="button"
                    onClick={() => handleScrollTo("programa")}
                    className="flex items-center gap-3 text-[#000000] hover:text-[#746b60] group p-3 rounded-lg hover:bg-[#9a8e80]/10 w-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9a8e80]/5 to-[#9a8e80]/10 rounded-lg -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <div className="relative z-10">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-6 h-6"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                    </div>
                    <span
                      className="text-lg relative z-10"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Itinerario
                    </span>
                  </button>
                </li>

                {/* UBICACIONES */}
                <li tabIndex={0}>
                  <button
                    type="button"
                    onClick={() => handleScrollTo("ubicaciones")}
                    className="flex items-center gap-3 text-[#000000] hover:text-[#746b60] group p-3 rounded-lg hover:bg-[#9a8e80]/10 w-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9a8e80]/5 to-[#9a8e80]/10 rounded-lg -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <div className="relative z-10">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        viewBox="0 0 512 512"
                        className="w-6 h-6"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z" />
                      </svg>
                    </div>
                    <span
                      className="text-lg relative z-10"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Ubicaciones
                    </span>
                  </button>
                </li>

                {/* VESTIMENTA */}
                <li tabIndex={0}>
                  <button
                    type="button"
                    onClick={() => handleScrollTo("vestimenta")}
                    className="flex items-center gap-3 text-[#000000] hover:text-[#746b60] group p-3 rounded-lg hover:bg-[#9a8e80]/10 w-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9a8e80]/5 to-[#9a8e80]/10 rounded-lg -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <div className="relative z-10">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        className="w-6 h-6"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M4 1.5c0 0.828-0.672 1.5-1.5 1.5s-1.5-0.672-1.5-1.5c0-0.828 0.672-1.5 1.5-1.5s1.5 0.672 1.5 1.5z" />
                        <path d="M13 1.5c0 0.828-0.672 1.5-1.5 1.5s-1.5-0.672-1.5-1.5c0-0.828 0.672-1.5 1.5-1.5s1.5 0.672 1.5 1.5z" />
                        <path d="M4 4h-3c-0.552 0-1 0.448-1 1v5h1v6h1.25v-6h0.5v6h1.25v-6h1v-5c0-0.552-0.448-1-1-1z" />
                        <path d="M15.234 8l0.766-0.555-2.083-3.221c-0.092-0.14-0.249-0.225-0.417-0.225h-4c-0.168 0-0.325 0.084-0.417 0.225l-2.083 3.221 0.766 0.555 1.729-2.244 0.601 1.402-2.095 3.841h1.917l0.333 5h1v-5h0.5v5h1l0.333-5h1.917l-2.095-3.842 0.601-1.402 1.729 2.244z" />
                      </svg>
                    </div>
                    <span
                      className="text-lg relative z-10"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Vestimenta
                    </span>
                  </button>
                </li>

                {/* MESA DE REGALOS */}
                <li tabIndex={0}>
                  <button
                    type="button"
                    onClick={() => handleScrollTo("regalos")}
                    className="flex items-center gap-3 text-[#000000] hover:text-[#746b60] group p-3 rounded-lg hover:bg-[#9a8e80]/10 w-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9a8e80]/5 to-[#9a8e80]/10 rounded-lg -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <div className="relative z-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                    </div>
                    <span
                      className="text-lg relative z-10"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Mesa de Regalos
                    </span>
                  </button>
                </li>

                {/* GALERÍA */}
                <li tabIndex={0}>
                  <button
                    type="button"
                    onClick={() => handleScrollTo("confirmacion")}
                    className="flex items-center gap-3 text-[#000000] hover:text-[#746b60] group p-3 rounded-lg hover:bg-[#9a8e80]/10 w-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9a8e80]/5 to-[#9a8e80]/10 rounded-lg -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <div className="relative z-10">
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-6 h-6"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="none"
                          strokeWidth={2}
                          d="M1,1 L19,1 L19,19 L1,19 L1,1 Z M5,19 L5,23 L23,23 L23,5.97061363 L18.9998921,5.97061363 M6,8 C6.55228475,8 7,7.55228475 7,7 C7,6.44771525 6.55228475,6 6,6 C5.44771525,6 5,6.44771525 5,7 C5,7.55228475 5.44771525,8 6,8 Z M2,18 L7,12 L10,15 L14,10 L19,16"
                        />
                      </svg>
                    </div>
                    <span
                      className="text-lg relative z-10"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Galería
                    </span>
                  </button>
                </li>

                {/* CONFIRMACIÓN */}
                <li tabIndex={0}>
                  <button
                    type="button"
                    onClick={() => handleScrollTo("confirmacion")}
                    className="flex items-center gap-3 text-[#000000] hover:text-[#746b60] group p-3 rounded-lg hover:bg-[#9a8e80]/10 w-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#9a8e80]/5 to-[#9a8e80]/10 rounded-lg -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    <div className="relative z-10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span
                      className="text-lg relative z-10"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Confirmación
                    </span>
                  </button>
                </li>
              </ul>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENEDOR PRINCIPAL SCROLLABLE */}
      <div className="relative w-full overflow-x-hidden bg-neutral-500">
        {/* HERO PRINCIPAL */}
        <section
          id="inicio"
          className="min-h-screen"
          style={{ backgroundColor: "rgb(249, 211, 224)" }}
        >
          <motion.main
            className="relative min-h-screen"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <header className="pointer-events-none absolute top-0 left-0 right-0 z-30 pt-24 pb-8 text-center">
              <div className="max-w-md mx-auto px-4">
                <motion.h1
                  className="text-4xl mb-2 text-white"
                  style={{ fontFamily: '"Dancing Script", cursive' }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <span>Abril Brithzeidy</span>
                </motion.h1>
              </div>
            </header>

            <div className="relative h-screen overflow-hidden">
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-black opacity-5" />
                <img
                  src="https://i.postimg.cc/Wzyjryww/MIS-XV-ANOS-098-copia.jpg"
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(1.1) contrast(1.05)" }}
                  alt="Foto principal XV"
                />
              </motion.div>
            </div>
          </motion.main>
        </section>

        {/* TEXTO INTRO + CONTADOR (ANIMADO) */}
        <section id="contador">
          {/* Texto de invitación */}
          <motion.div
            className="relative py-6 px-4 flex justify-center items-center w-full bg-[#f5f0e9]"
            style={{ opacity: 1 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1
              className="text-lg sm:text-xl mb-2 text-center max-w-full px-4 mx-auto leading-relaxed w-full break-words"
              style={{ fontFamily: '"Dancing Script", cursive' }}
            >
              <span>
                ¡Ha llegado el momento de soñar! Con mucha alegría, te invito a
                celebrar mis XV años, un día lleno de magia, amor y felicidad
              </span>
            </h1>
          </motion.div>

          {/* Sección Mis XV con contador */}
          <motion.div
            className="relative min-h-screen bg-[#f5f0e9]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <div className="relative h-screen overflow-hidden">
              <motion.img
                src="https://i.postimg.cc/1zs5LQ6x/MIS-XV-ANOS-112.jpg"
                alt="Foto XV"
                className="w-full h-full object-cover"
                style={{ filter: "brightness(1.1) contrast(1.05)" }}
                initial={{ scale: 1.05 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />

              <div className="absolute bottom-0 left-0 right-0">
                <div className="relative">
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[380px] rounded-t-full"
                    style={{
                      backgroundColor: "rgba(249, 211, 224, 0.7)",
                    }}
                  />

                  <motion.div
                    className="relative px-2 sm:px-6 pb-8 pt-16 text-center w-full"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      delay: 0.2,
                      duration: 0.8,
                      ease: "easeOut",
                    }}
                  >
                    <h1
                      className="text-2xl sm:text-3xl md:text-4xl mb-2 text-center max-w-full px-4 mx-auto leading-tight break-words w-full"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      <span>Mis XV</span>
                    </h1>
                    <p
                      className="text-lg sm:text-xl mb-8 text-center max-w-full px-4 mx-auto break-words"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Viernes 19 de Diciembre de 2025
                    </p>

                    {/* CONTADOR */}
                    <motion.div
                      className="flex justify-center gap-4 mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: 0.35, duration: 0.7 }}
                    >
                      {/* DÍAS */}
                      <motion.div
                        className="w-20 h-20 rounded-lg flex flex-col items-center justify-center relative overflow-hidden"
                        style={{
                          color: "#ffffff",
                          backgroundColor: "rgb(217, 202, 254)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <div
                          className="absolute inset-0 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.1)",
                            transform: "scale(1.1)",
                          }}
                        />
                        <span
                          className="text-2xl font-bold relative z-10"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          {countdown.days}
                        </span>
                        <span
                          className="text-sm relative z-10"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          Días
                        </span>
                      </motion.div>

                      {/* HORAS */}
                      <motion.div
                        className="w-20 h-20 rounded-lg flex flex-col items-center justify-center relative overflow-hidden"
                        style={{
                          color: "#ffffff",
                          backgroundColor: "rgb(217, 202, 254)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <div
                          className="absolute inset-0 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.1)",
                            transform: "scale(1.05)",
                          }}
                        />
                        <span
                          className="text-2xl font-bold relative z-10"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          {formatNumber(countdown.hours)}
                        </span>
                        <span
                          className="text-sm relative z-10"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          Hrs
                        </span>
                      </motion.div>

                      {/* MINUTOS */}
                      <motion.div
                        className="w-20 h-20 rounded-lg flex flex-col items-center justify-center relative overflow-hidden"
                        style={{
                          color: "#ffffff",
                          backgroundColor: "rgb(217, 202, 254)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <div
                          className="absolute inset-0 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.1)",
                            transform: "scale(1.02)",
                          }}
                        />
                        <span
                          className="text-2xl font-bold relative z-10"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          {formatNumber(countdown.minutes)}
                        </span>
                        <span
                          className="text-sm relative z-10"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          Mins
                        </span>
                      </motion.div>

                      {/* SEGUNDOS */}
                      <motion.div
                        className="w-20 h-20 rounded-lg flex flex-col items-center justify-center relative overflow-hidden"
                        style={{
                          color: "#ffffff",
                          backgroundColor: "rgb(217, 202, 254)",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      >
                        <div
                          className="absolute inset-0 rounded-lg"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.1)",
                            transform: "scale(1.02)",
                          }}
                        />
                        <span
                          className="text-2xl font-bold relative z-10"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          {formatNumber(countdown.seconds)}
                        </span>
                        <span
                          className="text-sm relative z-10"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          Segs
                        </span>
                      </motion.div>
                    </motion.div>

                    {/* Botón agregar a calendario */}
                    <motion.button
                      type="button"
                      onClick={() => window.open(calendarUrl, "_blank")}
                      className="flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-full transition-colors duration-300 relative overflow-hidden shadow-sm"
                      style={{
                        fontFamily: '"Dancing Script", cursive',
                        color: "#ffffff",
                        backgroundColor: "rgb(217, 202, 254)",
                      }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 relative z-10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="relative z-10">
                        Agregar a Calendario
                      </span>
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* PADRES Y PADRINOS (ANIMADO) */}
        <section id="padres">
          <motion.div
            className="relative min-h-screen w-full overflow-hidden"
            style={{ backgroundColor: "rgb(217, 202, 254)" }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative w-full">
              <motion.div
                className="relative rounded-b-[50%]"
                style={{
                  backgroundColor: "rgb(249, 211, 224)",
                  borderRadius: "0 0 50% 50%",
                }}
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="px-8 pt-16 pb-32 text-center">
                  <motion.div
                    className="mx-auto max-w-sm space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      delay: 0.15,
                      duration: 0.7,
                      ease: "easeOut",
                    }}
                  >
                    <motion.h1
                      className="font-serif text-2xl leading-relaxed"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      <span>
                        ¡Celebra con nosotros este día tan maravilloso!
                      </span>
                    </motion.h1>

                    <motion.div
                      className="flex flex-col justify-center items-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <div className="space-y-2">
                        <motion.p
                          className="text-sm font-light"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ delay: 0.35, duration: 0.5 }}
                        >
                          <span>Mis Padres</span>
                        </motion.p>

                        <motion.p
                          className="font-serif text-xl"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        >
                          <span>Yessika Yazmín Gallegos Sifuentes</span>
                        </motion.p>

                        <motion.p
                          className="font-serif text-xl"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ delay: 0.45, duration: 0.5 }}
                        >
                          <span>Jesús Gerardo Bañuelos Beltrán</span>
                        </motion.p>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>

              <div className="h-64" />
            </div>
          </motion.div>
        </section>

        {/* ITINERARIO (ANIMADO) */}
        <section id="programa">
          <motion.div
            className="relative min-h-screen w-full overflow-hidden"
            style={{ backgroundColor: "rgb(249, 211, 224)" }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative w-full min-h-screen rounded-b-[50%]">
              <motion.div
                className="pt-12 px-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
              >
                <motion.h1
                  className="text-4xl mb-10"
                  style={{ fontFamily: '"Dancing Script", cursive' }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <span>Itinerario</span>
                </motion.h1>

                <div className="max-w-xs mx-auto space-y-8 pb-16">
                  <div className="relative">
                    <motion.div
                      className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
                      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                      initial={{ scaleY: 0, originY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />

                    {/* CEREMONIA RELIGIOSA */}
                    <motion.div
                      className="relative flex items-center justify-between mb-8"
                      initial={{ opacity: 0, x: -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: 0.25, duration: 0.5 }}
                    >
                      <div className="text-left w-24">
                        <p
                          className="text-xl"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          CEREMONIA RELIGIOSA
                        </p>
                        <p
                          className="text-lg"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          Acompáñanos a recibir la bendición de Dios
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 bg-[#f5f5f5] hover:scale-110 transition-transform duration-300">
                        <img
                          src="https://digitalrsvp.mx/api/images/iglesia-icono-2.png"
                          alt="Religious Ceremony"
                          className="w-10 h-10 object-cover"
                        />
                      </div>
                      <div className="w-24" />
                    </motion.div>

                    {/* RECEPCIÓN / FOTOS */}
                    <motion.div
                      className="relative flex items-center justify-between mb-8"
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="w-24" />
                      <div className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 bg-[#f5f5f5] hover:scale-110 transition-transform duration-300">
                        <img
                          src="https://digitalrsvp.mx/api/images/icono-recepcion-fotos.png"
                          alt="Recepción XV"
                          className="w-10 h-10 object-cover"
                        />
                      </div>
                      <div className="text-right w-24">
                        <p
                          className="text-xl"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          RECEPCIÓN
                        </p>
                        <p
                          className="text-lg"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          Tómate fotos con nosotros
                        </p>
                      </div>
                    </motion.div>

                    {/* BAILE DE XV AÑOS */}
                    <motion.div
                      className="relative flex items-center justify-between mb-8"
                      initial={{ opacity: 0, x: -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: 0.35, duration: 0.5 }}
                    >
                      <div className="text-left w-24">
                        <p
                          className="text-xl"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          BAILE DE XV AÑOS
                        </p>
                        <p
                          className="text-lg"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          Disfruta mi vals de XV años
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 bg-[#f5f5f5] hover:scale-110 transition-transform duration-300">
                        <img
                          src="https://digitalrsvp.mx/api/images/icono-baile-pareja.png"
                          alt="Baile XV"
                          className="w-10 h-10 object-cover"
                        />
                      </div>
                      <div className="w-24" />
                    </motion.div>

                    {/* BAILE GENERAL */}
                    <motion.div
                      className="relative flex items-center justify-between mb-8"
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <div className="w-24" />
                      <div className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 bg-[#f5f5f5] hover:scale-110 transition-transform duration-300">
                        <img
                          src="https://digitalrsvp.mx/api/images/icono-gorro-regalo.png"
                          alt="Baile"
                          className="w-10 h-10 object-cover"
                        />
                      </div>
                      <div className="text-right w-24">
                        <p
                          className="text-xl"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          BAILE
                        </p>
                        <p
                          className="text-lg"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          Sácale brillo a la pista
                        </p>
                      </div>
                    </motion.div>

                    {/* CENA */}
                    <motion.div
                      className="relative flex items-center justify-between mb-8"
                      initial={{ opacity: 0, x: -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: 0.45, duration: 0.5 }}
                    >
                      <div className="text-left w-24">
                        <p
                          className="text-xl"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          CENA
                        </p>
                        <p
                          className="text-lg"
                          style={{ fontFamily: '"Dancing Script", cursive' }}
                        >
                          Disfruta de un refrescante cóctel
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 bg-[#f5f5f5] hover:scale-110 transition-transform duration-300">
                        <img
                          src="https://digitalrsvp.mx/api/images/icono-cubiertos-comida.png"
                          alt="Cena"
                          className="w-10 h-10 object-cover"
                        />
                      </div>
                      <div className="w-24" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* UBICACIONES (ANIMADAS) */}
        <section id="ubicaciones">
          <motion.div
            className="h-auto pb-8 px-4 py-8 bg-[#E5DDD3]"
            style={{ opacity: 1 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative z-10">
              <motion.h1
                className="text-3xl text-center mb-8"
                style={{ fontFamily: '"Dancing Script", cursive' }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <span>Ubicaciones</span>
              </motion.h1>

              <motion.div
                className="max-w-6xl px-4 mx-auto space-y-8 lg:flex lg:space-x-8 lg:space-y-0"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      staggerChildren: 0.2,
                      duration: 0.6,
                      ease: "easeOut",
                    },
                  },
                }}
              >
                {/* Ceremonia */}
                <motion.article
                  className="lg:flex-1 space-y-4"
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <h2
                    className="text-3xl font-serif text-center"
                    style={{ fontFamily: '"Dancing Script", cursive' }}
                  >
                    Ceremonia Religiosa
                  </h2>
                  <div className="relative">
                    <motion.div
                      className="overflow-hidden rounded-t-[50%]"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src="https://i.postimg.cc/sxmGr3y5/Iglesia.jpg"
                        alt="Iglesia"
                        className="w-full h-52 object-cover"
                      />
                    </motion.div>
                    <motion.a
                      href="https://maps.app.goo.gl/6bCZqYcmwr7ujVjL8"
                      className="absolute inset-x-4 bottom-4 py-2 rounded-lg text-center text-sm font-medium text-white"
                      style={{
                        fontFamily: '"Dancing Script", cursive',
                        backgroundColor: "rgb(217, 202, 254)",
                      }}
                      target="_blank"
                      rel="noreferrer"
                      whileTap={{ scale: 0.96 }}
                    >
                      Ver Ubicación
                    </motion.a>
                  </div>
                  <div className="text-center space-y-2">
                    <p
                      className="text-xl"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      6:00 p.m.
                    </p>
                    <p
                      className="text-xl"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      <span>Parroquia San José Obrero</span>
                    </p>
                  </div>
                </motion.article>

                {/* Recepción */}
                <motion.article
                  className="lg:flex-1 space-y-4"
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <h2
                    className="text-3xl font-serif text-center"
                    style={{ fontFamily: '"Dancing Script", cursive' }}
                  >
                    Recepción
                  </h2>
                  <div className="relative">
                    <motion.div
                      className="overflow-hidden rounded-t-[50%]"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src="https://i.postimg.cc/ZnHvSJZ8/salon.jpg"
                        alt="Recepción"
                        className="w-full h-52 object-cover"
                      />
                    </motion.div>
                    <motion.a
                      href="https://maps.app.goo.gl/Mz137qzf2112Zzro7"
                      className="absolute inset-x-4 bottom-4 py-2 rounded-lg text-center text-sm font-medium text-white"
                      style={{
                        fontFamily: '"Dancing Script", cursive',
                        backgroundColor: "rgb(217, 202, 254)",
                      }}
                      target="_blank"
                      rel="noreferrer"
                      whileTap={{ scale: 0.96 }}
                    >
                      Ver Ubicación
                    </motion.a>
                  </div>
                  <div className="text-center space-y-2">
                    <p
                      className="text-xl"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      9:00 p.m.
                    </p>
                    <p
                      className="text-xl"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      <span>Salón París (Del Continental)</span>
                    </p>
                  </div>
                </motion.article>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* VESTIMENTA (ANIMADA) */}
        <section id="vestimenta">
          <motion.div
            className="min-h-auto px-0 pt-0 pb-24"
            style={{ backgroundColor: "rgb(249, 211, 224)" }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="w-full">
              <motion.div
                className="relative min-w-full"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div
                  className="pb-16 pt-12 rounded-b-[50%]"
                  style={{ backgroundColor: "rgb(217, 202, 254)" }}
                >
                  <h1
                    className="text-center font-serif text-3xl px-4"
                    style={{ fontFamily: '"Dancing Script", cursive' }}
                  >
                    Código de
                    <br />
                    Vestimenta
                  </h1>
                </div>
              </motion.div>

              <motion.div
                className="relative mx-4 mt-8 rounded-3xl bg-white p-8 shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <h2
                  className="text-center font-serif text-2xl mb-8"
                  style={{ fontFamily: '"Dancing Script", cursive' }}
                >
                  <span>Formal</span>
                </h2>
                <p
                  className="text-center font-serif text-2xl mb-8"
                  style={{ fontFamily: '"Dancing Script", cursive' }}
                >
                  <span>El rosa reservado para la XV</span>
                </p>

                <div className="grid grid-cols-2 gap-8">
                  {/* Hombres */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.1,
                      ease: "easeOut",
                    }}
                  >
                    <motion.div
                      className="mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: "rgb(249, 211, 224)" }}
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.25 }}
                    >
                      <img
                        src="https://digitalrsvp.mx/api/Images/3d54e1fc-e5d1-4f6f-a42b-9e85a9d5558a.png"
                        alt="Vestimenta Hombre"
                        className="w-12 h-12 object-contain"
                      />
                    </motion.div>
                    <h3
                      className="font-serif text-xl mb-2"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Hombres
                    </h3>
                    <p
                      className="text-sm"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      <span>დ</span>
                    </p>
                  </motion.div>

                  {/* Mujeres */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.2,
                      ease: "easeOut",
                    }}
                  >
                    <motion.div
                      className="mx-auto h-24 w-24 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: "rgb(249, 211, 224)" }}
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.25 }}
                    >
                      <img
                        src="https://digitalrsvp.mx/api/Images/f037e0b7-4ab2-423f-b5e5-87b579fdf26e.png"
                        alt="Vestimenta Mujer"
                        className="w-12 h-12 object-contain"
                      />
                    </motion.div>
                    <h3
                      className="font-serif text-xl mb-2"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Mujeres
                    </h3>
                    <p
                      className="text-sm"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      <span>დ</span>
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* MESA DE REGALOS (ANIMADA) */}
        <section id="regalos">
          <motion.div
            className="sm:h-auto flex items-center justify-center"
            style={{ backgroundColor: "rgb(249, 211, 224)" }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="w-full max-w-md">
              <div className="relative w-full">
                <motion.div
                  className="relative z-10 pt-0 pb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  <div
                    className="relative min-w-screen pt-8 pb-20 rounded-b-[100%] mb-12"
                    style={{ backgroundColor: "rgb(217, 202, 254)" }}
                  >
                    <h1
                      className="text-4xl font-serif text-center"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      <span>Mesa de Regalos</span>
                    </h1>
                  </div>

                  <motion.div
                    className="text-center px-10 mb-6"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <p style={{ fontFamily: '"Dancing Script", cursive' }}>
                      <span>
                        Su presencia en mi fiesta de quince años es el mejor
                        regalo que puedo recibir. Sin embargo, si desean hacerme
                        un obsequio adicional, les agradezco de antemano por su
                        generosidad. ¡Gracias por ser parte de este día tan
                        especial!
                      </span>
                    </p>
                  </motion.div>

                  <motion.div
                    className="space-y-6 py-12 px-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  >
                    <div className="text-center">
                      <motion.div
                        className="w-28 h-28 mx-auto rounded-full border-4 flex items-center justify-center mb-3"
                        style={{ backgroundColor: "rgb(249, 211, 224)" }}
                        whileHover={{ scale: 1.08, rotate: 2 }}
                        transition={{ duration: 0.25 }}
                      >
                        <img
                          src="https://i.postimg.cc/BQx3Vgkp/B933-DA19-48-D7-40-F9-B4-CA-5-B82-B72447-A9.png"
                          alt="Amazon"
                          className="w-24 h-24 object-contain"
                        />
                      </motion.div>
                      {/* Aquí podrías agregar texto / link a mesa de regalos */}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CONFIRMACIÓN DE ASISTENCIA (ANIMADA) */}
        <section id="confirmacion">
          <motion.div
            className="min-h-screen py-12"
            style={{
              fontFamily: '"Dancing Script", cursive',
              backgroundColor: "#f5f0e9",
            }}
            initial={{ y: 40 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mx-auto max-w-md px-4">
              {/* Tarjeta de foto + SLIDER */}
              <motion.div
                className="mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="relative">
                  <div className="relative">
                    <div className="absolute -bottom-2 left-1 right-1 top-2 rotate-[-4deg] rounded-lg bg-white shadow-md" />
                    <div className="absolute -bottom-1 left-0.5 right-0.5 top-1 rotate-[-2deg] rounded-lg bg-white shadow-md" />

                    <motion.div
                      className="relative rounded-lg bg-white p-4 shadow-xl"
                      initial={{ opacity: 0, scale: 0.96 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <div className="overflow-hidden rounded-md">
                        {/* TRACK DEL SLIDER */}
                        <div
                          className="flex transition-transform duration-500 ease-out"
                          style={{
                            transform: `translateX(-${currentSlide * 100}%)`,
                          }}
                        >
                          {GALLERY_IMAGES.map((src, index) => (
                            <img
                              key={index}
                              src={src}
                              alt={`Galería XV ${index + 1}`}
                              className="aspect-[4/5] w-full object-cover flex-shrink-0"
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Botones izquierda / derecha */}
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white active:scale-95 transition"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        d="M15 18l-6-6 6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white active:scale-95 transition"
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        d="M9 6l6 6-6 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Texto debajo + indicador */}
                  <div className="mt-8 text-center">
                    <div className="mb-2 flex justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-8 w-8 text-gray-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7h8m-8 5h8m-8 5h8"
                        />
                      </svg>
                    </div>
                    <p
                      className="font-serif text-sm text-gray-600"
                      style={{ fontFamily: '"Dancing Script", cursive' }}
                    >
                      Desliza para ver más fotos
                    </p>
                  </div>

                  <motion.div
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-sm font-light text-gray-800"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.7 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {currentSlide + 1} / {GALLERY_IMAGES.length}
                  </motion.div>
                </div>
              </motion.div>

              {/* Formulario */}
              <motion.div
                className="rounded-lg bg-white p-6 shadow-xl"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <h2
                  className="mb-6 text-center text-2xl text-gray-800"
                  style={{ fontFamily: '"Dancing Script", cursive' }}
                   >
                    Confirmación de Asistencia
                </h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <label
                      htmlFor="nombre"
                      className="mb-1 block text-sm font-medium text-gray-700"
                      style={{ fontFamily: "inherit" }}
                    >
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      className="w-full text-black rounded-md border border-gray-300 px-3 py-2 focus:border-[#9E8B8E] focus:outline-none focus:ring-1 focus:ring-[#9E8B8E]"
                      placeholder="Juan Pérez"
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.05,
                      ease: "easeOut",
                    }}
                  >
                    <label
                      htmlFor="asistencia"
                      className="mb-1 block text-sm font-medium text-gray-700"
                      style={{ fontFamily: "inherit" }}
                    >
                      ¿Asistirás?
                    </label>
                    <select
                      id="asistencia"
                      name="asistencia"
                      className="w-full text-black rounded-md border border-gray-300 px-3 py-2 focus:border-[#9E8B8E] focus:outline-none focus:ring-1 focus:ring-[#9E8B8E]"
                      required
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="si">¡Sí, por supuesto!</option>
                      <option value="no">Lo siento, no podré asistir</option>
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1,
                      ease: "easeOut",
                    }}
                  >
                    <label
                      htmlFor="personas"
                      className="mb-1 block text-sm font-medium text-gray-700"
                      style={{ fontFamily: "inherit" }}
                    >
                      ¿Cuántas personas asistirán?
                    </label>
                    <select
                      id="personas"
                      name="personas"
                      className="w-full text-black rounded-md border border-gray-300 px-3 py-2 focus:border-[#9E8B8E] focus:outline-none focus:ring-1 focus:ring-[#9E8B8E]"
                      required
                    >
                      <option value="">
                        Selecciona el número de personas
                      </option>
                      <option value="1">1 persona</option>
                      <option value="2">2 personas</option>
                      <option value="3">3 personas</option>
                      <option value="4">4 personas</option>
                      <option value="5">5 personas</option>
                      <option value="6">6 personas</option>
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.15,
                      ease: "easeOut",
                    }}
                  >
                    <label
                      htmlFor="comentarios"
                      className="mb-1 block text-sm font-medium text-gray-700"
                      style={{ fontFamily: "inherit" }}
                    >
                      Comentarios y Felicitaciones
                    </label>
                    <textarea
                      id="comentarios"
                      name="comentarios"
                      rows={3}
                      className="w-full text-black rounded-md border border-gray-300 px-3 py-2 focus:border-[#9E8B8E] focus:outline-none focus:ring-1 focus:ring-[#9E8B8E]"
                      placeholder="Escribe tus felicitaciones o comentarios aquí..."
                    />
                  </motion.div>

                  <div className="grid gap-4 pt-4 sm:grid-cols-2">
                    <motion.button
                      type="submit"
                      className="w-full rounded-md bg-[#9E8B8E] px-4 py-2 text-white transition-colors hover:bg-[#8A7477] focus:outline-none focus:ring-2 focus:ring-[#9E8B8E] focus:ring-offset-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                    >
                      Confirmar
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
          </section>
          </div>   
       </div>    
     </div>      
  );
};

export default InvitacionXV;
