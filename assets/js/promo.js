/* ==========================================================================
   HomeBasket — moving promotional banner (home page)
   * A text ticker scrolls across the top by itself, and the slides slide
     sideways every few seconds. The yellow progress bar under the slides is
     the timer, so what you see is exactly when the next slide arrives.
   * It keeps moving when the mouse is over it. The Pause button stops both
     the ticker and the slides. Keyboard focus inside the banner and a hidden
     browser tab also hold the slides.
   * For visitors whose device asks to reduce motion it starts still; the Play
     button switches the movement on.
   ========================================================================== */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var root = document.querySelector(".promo"); if (!root) return;
    var slides = [].slice.call(root.querySelectorAll(".promo-slide")), strip = root.querySelector(".promo-slides");
    var dotsBox = root.querySelector(".promo-dots"), bar = root.querySelector(".promo-progress span");
    var prev = root.querySelector(".promo-prev"), next = root.querySelector(".promo-next"), toggle = root.querySelector(".promo-toggle");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var DELAY = 4500, index = 0, paused = reduce;
    root.style.setProperty("--promo-delay", DELAY + "ms");

    dotsBox.innerHTML = slides.map(function (s, i) { return '<button type="button" class="promo-dot" data-i="' + i + '" aria-label="Show slide ' + (i + 1) + " of " + slides.length + '"></button>'; }).join("");
    var dots = [].slice.call(dotsBox.children);

    function show(i) {
      index = (i + slides.length) % slides.length;
      strip.style.transform = "translateX(" + (-index * 100) + "%)";
      slides.forEach(function (s, k) {
        var on = k === index; s.classList.toggle("is-active", on); s.setAttribute("aria-hidden", on ? "false" : "true");
        [].forEach.call(s.querySelectorAll("a, button"), function (el) { el.tabIndex = on ? 0 : -1; });
      });
      dots.forEach(function (d, k) { d.classList.toggle("is-on", k === index); if (k === index) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
    }
    function restart() { bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; }   /* the bar re-fills from empty */
    function go(i) { show(i); restart(); }
    function syncToggle() {
      root.classList.toggle("is-paused", paused);
      toggle.classList.toggle("is-paused", paused);
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", paused ? "Play the promotions slideshow" : "Pause the promotions slideshow");
      root.querySelector(".promo-track").setAttribute("aria-live", paused ? "polite" : "off");
    }

    bar.addEventListener("animationend", function () { go(index + 1); });   /* the timer finished: next slide */
    prev.addEventListener("click", function () { go(index - 1); });
    next.addEventListener("click", function () { go(index + 1); });
    dotsBox.addEventListener("click", function (e) { var d = e.target.closest(".promo-dot"); if (d) go(Number(d.dataset.i)); });
    toggle.addEventListener("click", function () {
      paused = !paused;
      if (!paused && reduce) root.classList.add("motion-ok");   /* the visitor chose movement */
      syncToggle(); restart();
    });
    /* only keyboard focus holds the slides; clicking a button with the mouse must not leave it held */
    root.addEventListener("focusin", function (e) { if (e.target.matches && e.target.matches(":focus-visible")) root.classList.add("is-hold"); });
    root.addEventListener("focusout", function (e) { if (!root.contains(e.relatedTarget)) root.classList.remove("is-hold"); });
    document.addEventListener("visibilitychange", function () { root.classList.toggle("is-hold", document.hidden); });
    root.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(index - 1); else if (e.key === "ArrowRight") go(index + 1); });

    show(0); syncToggle(); restart();
  });
})();
