/* =========================================================
   De la Costa Barber Studio — Lógica del sitio
   ========================================================= */

// Número de WhatsApp oficial (52 1 744 172 5996)
const WHATSAPP_NUMERO = "5217441725996";

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- AÑO EN FOOTER ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- NAVBAR SCROLL ---------- */
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 60);
    });
  }

  /* ---------- MENÚ MÓVIL ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => navLinks.classList.remove("open"))
    );
  }

  /* ============================================
     MODAL DE ALERTA BONITO (reemplaza alert())
     ============================================ */
  const alertModal = document.getElementById("alertModal");
  const alertTitle = document.getElementById("alertTitle");
  const alertMessage = document.getElementById("alertMessage");
  const alertClose = document.getElementById("alertClose");

  function showAlert(titulo, mensaje) {
    if (!alertModal) { alert(`${titulo}\n${mensaje}`); return; }
    alertTitle.textContent = titulo;
    alertMessage.textContent = mensaje;
    alertModal.classList.add("active");
    alertModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function hideAlert() {
    if (!alertModal) return;
    alertModal.classList.remove("active");
    alertModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (alertClose) alertClose.addEventListener("click", hideAlert);
  if (alertModal) {
    alertModal.addEventListener("click", (e) => {
      if (e.target === alertModal) hideAlert();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && alertModal?.classList.contains("active")) hideAlert();
  });

  /* ============================================
     UTILIDAD: Copiar texto al portapapeles
     (funciona en móvil, tablet, laptop y PC)
     ============================================ */
  async function copiarTexto(texto) {
    // 1) API moderna si está disponible y en contexto seguro
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(texto);
        return true;
      } catch (err) {
        // Si falla, cae al fallback
      }
    }
    // 2) Fallback con textarea + execCommand
    try {
      const temp = document.createElement("textarea");
      temp.value = texto;
      temp.setAttribute("readonly", "");
      temp.style.position = "fixed";
      temp.style.top = "-9999px";
      temp.style.left = "-9999px";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.select();
      temp.setSelectionRange(0, temp.value.length); // iOS
      const ok = document.execCommand("copy");
      document.body.removeChild(temp);
      return ok;
    } catch (err) {
      return false;
    }
  }

  /* ============================================
     CARRUSEL DEL HERO — DESACTIVADO
     (Ahora solo hay banner1 fijo en el inicio.)
     ============================================ */
  const slides = document.querySelectorAll(".hero-slider .slide");
  const dots = document.querySelectorAll("#sliderDots .dot");
  const heroEl = document.querySelector(".hero");
  let currentSlide = 0;
  let sliderTimer = null;
  const SLIDER_INTERVAL = 5000;

  function goToSlide(index) {
    slides.forEach((s, i) => s.classList.toggle("active", i === index));
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
    currentSlide = index;
  }

  function nextSlide() {
    if (!slides.length) return;
    goToSlide((currentSlide + 1) % slides.length);
  }

  function startSlider() {
    stopSlider();
    if (slides.length > 1) sliderTimer = setInterval(nextSlide, SLIDER_INTERVAL);
  }

  function stopSlider() {
    if (sliderTimer) { clearInterval(sliderTimer); sliderTimer = null; }
  }

  if (slides.length > 1) {
    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        goToSlide(Number(dot.dataset.slide));
        startSlider();
      });
    });
    if (heroEl) {
      heroEl.addEventListener("mouseenter", stopSlider);
      heroEl.addEventListener("mouseleave", startSlider);
    }
    document.addEventListener("visibilitychange", () => {
      document.hidden ? stopSlider() : startSlider();
    });
    startSlider();
  }

  /* ============================================
     UTILIDAD: Convertir hora 24h a 12h con AM/PM
     ============================================ */
  function convertirHora12(hora24) {
    const [hh, mm] = hora24.split(":").map(Number);
    const sufijo = hh >= 12 ? "pm" : "am";
    let h12 = hh % 12;
    if (h12 === 0) h12 = 12;
    const mmStr = String(mm).padStart(2, "0");
    return `${h12}:${mmStr} ${sufijo}`;
  }

  /* ============================================
     FORMULARIO DE CITA
     ============================================ */
  const form = document.getElementById("citaForm");
  const servicioSel = document.getElementById("servicio");
  const totalServicioEl = document.getElementById("totalServicio");
  const anticipoEl = document.getElementById("anticipo");
  const fechaInput = document.getElementById("fecha");
  const horaInput = document.getElementById("hora"); // <select>

  if (form && servicioSel && fechaInput && horaInput) {

    const hoy = new Date().toISOString().split("T")[0];
    fechaInput.min = hoy;

    function actualizarResumen() {
      const opt = servicioSel.options[servicioSel.selectedIndex];
      const precio = Number(opt?.dataset?.precio || 0);
      const anticipo = precio / 2;
      if (totalServicioEl) totalServicioEl.textContent = `$${precio}`;
      if (anticipoEl) anticipoEl.textContent = `$${anticipo}`;
    }
    servicioSel.addEventListener("change", actualizarResumen);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const servicio = servicioSel.value;
      const fecha = fechaInput.value;
      const hora = horaInput.value;

      if (!nombre || !servicio || !fecha || !hora) {
        showAlert("Campos incompletos", "Por favor completa todos los campos para continuar.");
        return;
      }

      const fechaObj = new Date(fecha + "T00:00:00");
      const dia = fechaObj.getDay();
      if (dia === 0) {
        showAlert("Domingo cerrado", "Los domingos no hay servicio. Elige de Lunes a Sábado.");
        return;
      }

      const hoyObj = new Date();
      hoyObj.setHours(0, 0, 0, 0);
      if (fechaObj < hoyObj) {
        showAlert("Fecha inválida", "No puedes agendar en una fecha pasada.");
        return;
      }

      const horasPermitidas = ["11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];
      if (!horasPermitidas.includes(hora)) {
        showAlert("Hora inválida", "La hora debe estar entre 11:00 am y 7:00 pm (Lunes a Sábado).");
        return;
      }

      const opt = servicioSel.options[servicioSel.selectedIndex];
      const precio = Number(opt.dataset.precio);
      const anticipo = precio / 2;

      const fechaLegible = fechaObj.toLocaleDateString("es-MX", {
        weekday: "long", day: "numeric", month: "long", year: "numeric"
      });

      const hora12 = convertirHora12(hora);

      const mensaje =
`Hola delacostabs, quisiera agendar una cita.

Nombre: ${nombre}
Servicio: ${servicio}
Fecha: ${fechaLegible}
Hora: ${hora12}
Total servicio: $${precio}
Anticipo (50%): $${anticipo}

Antes de agendar realizare la transferencia del 50% del anticipo. Hay disponibilidad para esta fecha y hora?`;

      abrirModal(mensaje);
    });
  }

  /* ============================================
     MODAL DE SOLICITUD (solo WhatsApp + copiar)
     ============================================ */
  const modal = document.getElementById("modal");
  const modalClose = document.getElementById("modalClose");
  const mensajeTexto = document.getElementById("mensajeTexto");
  const btnCopiar = document.getElementById("btnCopiar");
  const btnWhatsapp = document.getElementById("btnWhatsapp");

  function abrirModal(mensaje) {
    if (!modal) return;
    if (mensajeTexto) mensajeTexto.value = mensaje;
    if (btnWhatsapp) {
      btnWhatsapp.href = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
    }
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function cerrarModal() {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (modal) {
    if (modalClose) modalClose.addEventListener("click", cerrarModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) cerrarModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cerrarModal();
    });
  }

  /* ---------- COPIAR MENSAJE DEL MODAL ---------- */
  if (btnCopiar && mensajeTexto) {
    btnCopiar.addEventListener("click", async () => {
      const ok = await copiarTexto(mensajeTexto.value);
      if (ok) {
        btnCopiar.innerHTML = '<i class="fas fa-check"></i> Copiado';
        setTimeout(() => {
          btnCopiar.innerHTML = '<i class="fas fa-copy"></i> Copiar mensaje';
        }, 2000);
      } else {
        showAlert("No se pudo copiar", "Selecciona el texto y copia manualmente.");
      }
    });
  }

  /* ============================================
     BOTONES DE COPIAR (Banco, Beneficiario, CLABE)
     ============================================ */
  const copyButtons = document.querySelectorAll(".btn-copy");

  copyButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.copy;
      const target = document.getElementById(id);
      if (!target) return;

      const texto = target.textContent.trim();
      const ok = await copiarTexto(texto);

      if (ok) {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.classList.add("copied");
        setTimeout(() => {
          btn.innerHTML = original;
          btn.classList.remove("copied");
        }, 1800);
      } else {
        showAlert("No se pudo copiar", "Copia manualmente el dato: " + texto);
      }
    });
  });

  /* ============================================
     LIGHTBOX DE INSTALACIONES
     ============================================ */
  const galleryImgs = Array.from(document.querySelectorAll(".gallery-item img"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  let currentImg = 0;

  function openLightbox(index) {
    if (!lightbox || !lightboxImg) return;
    currentImg = index;
    lightboxImg.src = galleryImgs[currentImg].src;
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function showPrev() {
    if (!galleryImgs.length) return;
    currentImg = (currentImg - 1 + galleryImgs.length) % galleryImgs.length;
    lightboxImg.src = galleryImgs[currentImg].src;
  }

  function showNext() {
    if (!galleryImgs.length) return;
    currentImg = (currentImg + 1) % galleryImgs.length;
    lightboxImg.src = galleryImgs[currentImg].src;
  }

  if (galleryImgs.length && lightbox) {
    galleryImgs.forEach((img, i) => {
      img.addEventListener("click", () => openLightbox(i));
    });
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener("click", showPrev);
    if (lightboxNext) lightboxNext.addEventListener("click", showNext);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    });
  }

});