var $ = function (s) { return document.querySelector(s); };
var menu = $("#menu"), mb = $("#mb"), globe = null, lenis = null, openPage = null;

/* Globe Vanta.js (recréé à chaque changement de thème) */
function initGlobe() {
  try {
    if (globe) globe.destroy();
    var l = document.body.classList.contains("light");
    globe = VANTA.GLOBE({
      el: "#vanta", THREE: window.THREE, mouseControls: true, touchControls: true,
      gyroControls: false, minHeight: 200, minWidth: 200, scale: 1, scaleMobile: 1, size: 1.1,
      color: l ? 0x0055ee : 0x00e5a0, color2: l ? 0x00a6e0 : 0x4dd9ff,
      backgroundColor: l ? 0xf0f4ff : 0x05090c
    });
  } catch (err) { console.warn("Vanta indisponible", err); }
}

/* Navigation */
function sync() { mb.textContent = (menu.classList.contains("on") || openPage) ? "Fermer" : "Menu"; }
function closeAll() {
  menu.classList.remove("on");
  if (lenis) { lenis.destroy(); lenis = null; }
  if (openPage) { openPage.classList.remove("on"); openPage = null; }
  sync();
}
function toggleMenu() {
  if (openPage || menu.classList.contains("on")) { closeAll(); return; }
  menu.classList.add("on"); sync();
}
function show(id) {
  if (lenis) { lenis.destroy(); lenis = null; }
  if (openPage) openPage.classList.remove("on");
  openPage = document.getElementById(id);
  openPage.scrollTop = 0;
  openPage.querySelectorAll(".rv").forEach(function (e, i) { e.style.animationDelay = (i * 0.08) + "s"; });
  openPage.classList.add("on");
  setTimeout(function () { menu.classList.remove("on"); }, 300);
  if (window.Lenis) lenis = new Lenis({ wrapper: openPage, content: openPage.firstElementChild, duration: 1.2 });
  sync();
}
document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });

/* Smooth scroll Lenis */
function raf(t) { if (lenis) lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

/* Thème */
function theme() {
  var light = document.body.classList.toggle("light");
  try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (e) {}
  initGlobe();
}
try { if (localStorage.getItem("theme") === "light") document.body.classList.add("light"); } catch (e) {}

/* Marquee + curseur */
var mq = $("#mqi"); mq.innerHTML += mq.innerHTML;
var ring = $("#ring");
document.addEventListener("mousemove", function (e) {
  ring.style.opacity = 1; ring.style.left = e.clientX + "px"; ring.style.top = e.clientY + "px";
  ring.classList.toggle("h", !!e.target.closest("a,button,summary,.card"));
});

/* Formulaire (EmailJS) */
function loadEmailJS() {
  return new Promise(function (ok, ko) {
    if (window.emailjs) return ok();
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = ok; s.onerror = ko; document.head.appendChild(s);
  });
}
async function sendMail() {
  var v = function (id) { return $("#" + id).value.trim(); };
  var st = $("#st"), btn = $("#send");
  if (!v("n") || !v("e") || !v("m")) { st.textContent = "Merci de remplir le nom, l'email et le message."; return; }
  btn.disabled = true; st.textContent = "Envoi en cours...";
  try {
    await loadEmailJS();
    await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
      from_name: v("n"), from_email: v("e"),
      phone: v("t") ? v("i") + " " + v("t") : "Non renseigné",
      subject: v("s") || "Contact depuis le portfolio", message: v("m")
    }, { publicKey: "YOUR_PUBLIC_KEY" });
    st.textContent = "Message envoyé, je vous répondrai vite !";
    ["n", "e", "t", "s", "m"].forEach(function (id) { $("#" + id).value = ""; });
  } catch (err) {
    st.textContent = "Erreur d'envoi. Écrivez-moi : julien.fontainee@hotmail.com";
  }
  btn.disabled = false;
}

initGlobe(); sync();
