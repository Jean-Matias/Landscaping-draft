const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealItems = document.querySelectorAll(".reveal");
const countItems = document.querySelectorAll("[data-count]");
const parallaxItems = document.querySelectorAll("[data-parallax]");

if (reduceMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  countItems.forEach((item) => {
    item.textContent = item.dataset.count;
  });
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 55, 260)}ms`;
    revealObserver.observe(item);
  });

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.65 }
  );

  countItems.forEach((item) => countObserver.observe(item));

  let ticking = false;

  const moveParallax = () => {
    const viewportMid = window.innerHeight / 2;

    parallaxItems.forEach((item) => {
      const speed = Number(item.dataset.speed || 0.12);
      const bounds = item.getBoundingClientRect();
      const distance = bounds.top + bounds.height / 2 - viewportMid;
      const offset = distance * speed;

      item.style.transform = `translate3d(0, ${offset}px, 0) scale(1.05)`;
    });

    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(moveParallax);
        ticking = true;
      }
    },
    { passive: true }
  );

  moveParallax();
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
});

function animateCount(element) {
  const target = Number(element.dataset.count);
  const duration = 1200;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased).toLocaleString();

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}
