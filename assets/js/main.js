(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll('img[data-fallback]').forEach((image) => {
    image.addEventListener('error', () => {
      const fallback = image.dataset.fallback;
      if (fallback && image.getAttribute('src') !== fallback) image.src = fallback;
    }, { once: true });
  });

  const setHeaderState = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('is-menu-open');
  };

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
    mobileMenu?.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('is-menu-open', !isOpen);
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  // Native browser scrolling is intentional. No wheel interception or smoothing library.
  const showContentWithoutGsap = () => {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((node) => {
      node.style.opacity = '1';
      node.style.transform = 'none';
    });
    document.querySelectorAll('.clip-reveal').forEach((node) => {
      node.style.clipPath = 'inset(0)';
    });
  };

  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    const page = document.body.dataset.page;
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (page === 'home') {
      intro
        .to('.hero-kicker', { opacity: 1, y: 0, duration: 0.75 }, 0.08)
        .to('.hero-portrait-wrap', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.05, ease: 'power4.inOut' }, 0.14)
        .to('.hero-meta', { opacity: 1, x: 0, duration: 0.7 }, 0.38)
        .to('.hero-specialty', { opacity: 1, x: 0, duration: 0.7 }, 0.42)
        .to('.hero-name', { opacity: 1, x: 0, duration: 0.85 }, 0.5)
        .to('.hero-role', { opacity: 1, x: 0, duration: 0.85 }, 0.55);
    } else {
      const firstReveals = document.querySelectorAll('main > :first-child .reveal, main > :first-child .reveal-left, main > :first-child .reveal-right');
      const firstClips = document.querySelectorAll('main > :first-child .clip-reveal');
      intro.to(firstReveals, { opacity: 1, x: 0, y: 0, duration: 0.85, stagger: 0.09 }, 0.08);
      intro.to(firstClips, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.05, ease: 'power4.inOut', stagger: 0.12 }, 0.14);
    }

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((element) => {
      if (element.closest('main > :first-child') || element.closest('.hero')) return;
      gsap.to(element, {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.82,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true }
      });
    });

    document.querySelectorAll('.clip-reveal').forEach((element) => {
      if (element.closest('main > :first-child') || element.closest('.hero')) return;
      gsap.to(element, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.05,
        ease: 'power4.inOut',
        scrollTrigger: { trigger: element, start: 'top 86%', once: true }
      });
    });

    // Parallax is deliberately light and never changes wheel/touch input.
    document.querySelectorAll('[data-parallax]').forEach((element) => {
      const amount = Math.max(-0.05, Math.min(0.05, Number(element.dataset.parallax || 0.03)));
      gsap.to(element, {
        yPercent: amount * 100,
        ease: 'none',
        scrollTrigger: { trigger: element.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.4 }
      });
    });

    document.querySelectorAll('[data-count]').forEach((counter) => {
      const target = Number(counter.dataset.count || 0);
      const suffix = counter.dataset.suffix || '';
      const value = { number: 0 };
      gsap.to(value, {
        number: target,
        duration: 1.25,
        ease: 'power2.out',
        scrollTrigger: { trigger: counter, start: 'top 90%', once: true },
        onUpdate: () => { counter.textContent = `${Math.round(value.number)}${suffix}`; }
      });
    });

    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  } else {
    showContentWithoutGsap();
    document.querySelectorAll('[data-count]').forEach((counter) => {
      counter.textContent = `${counter.dataset.count || 0}${counter.dataset.suffix || ''}`;
    });
  }

  const internalPageLinks = [...document.querySelectorAll('a[href]')].filter((link) => {
    const href = link.getAttribute('href');
    return href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !link.target && new URL(link.href, location.href).origin === location.origin;
  });

  internalPageLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const destination = new URL(link.href, location.href);
      if (destination.pathname === location.pathname && destination.hash) return;
      if (prefersReducedMotion || !window.gsap) return;
      event.preventDefault();
      closeMenu();
      window.gsap.timeline({ onComplete: () => { location.href = destination.href; } })
        .set('.page-transition', { transformOrigin: 'bottom' })
        .to('.page-transition', { scaleY: 1, duration: 0.5, ease: 'power4.inOut' })
        .fromTo('.page-transition span', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }, 0.16);
    });
  });

  if (window.gsap && !prefersReducedMotion) {
    window.gsap.set('.page-transition', { scaleY: 1, transformOrigin: 'top' });
    window.gsap.to('.page-transition', { scaleY: 0, duration: 0.65, delay: 0.04, ease: 'power4.inOut' });
  }

  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      if (prefersReducedMotion || event.pointerType === 'touch') return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.15;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.15;
      if (window.gsap) window.gsap.to(element, { x, y, duration: 0.25, ease: 'power2.out' });
    });
    element.addEventListener('pointerleave', () => {
      if (window.gsap) window.gsap.to(element, { x: 0, y: 0, duration: 0.4, ease: 'elastic.out(1,.5)' });
    });
  });

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && window.matchMedia('(pointer:fine)').matches && !prefersReducedMotion) {
    let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
    window.addEventListener('pointermove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }, { passive: true });
    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    };
    renderCursor();
    document.querySelectorAll('a, button, .work-card, .showcase-card, .service-card--rich').forEach((element) => {
      element.addEventListener('pointerenter', () => document.body.classList.add('cursor-active'));
      element.addEventListener('pointerleave', () => document.body.classList.remove('cursor-active'));
    });
  }

  const loadMore = document.querySelector('[data-load-more]');
  loadMore?.addEventListener('click', () => {
    loadMore.textContent = 'More case studies coming soon';
    loadMore.disabled = true;
    loadMore.setAttribute('aria-disabled', 'true');
  });

  const contactForm = document.querySelector('#contact-form');
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = document.querySelector('#form-status');
    const fields = {
      name: contactForm.elements.name,
      email: contactForm.elements.email,
      message: contactForm.elements.message
    };
    const errors = {};
    if (!fields.name.value.trim()) errors.name = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(fields.email.value.trim())) errors.email = 'Please enter a valid email.';
    if (fields.message.value.trim().length < 10) errors.message = 'Please add a little more detail.';

    ['name', 'email', 'subject', 'message'].forEach((key) => {
      const node = document.querySelector(`#${key}-error`);
      if (node) node.textContent = errors[key] || '';
      const input = contactForm.elements[key];
      if (input) input.setAttribute('aria-invalid', errors[key] ? 'true' : 'false');
    });

    const firstError = Object.keys(errors)[0];
    if (firstError) {
      status.textContent = 'Please review the highlighted fields.';
      fields[firstError].focus();
      return;
    }

    const subject = (contactForm.elements.subject.value || '').trim() || 'Message from your portfolio';
    const bodyText = fields.message.value.trim() + '\n\n— ' + fields.name.value.trim() + ' (' + fields.email.value.trim() + ')';
    status.textContent = 'Your email app should open. If it does not, write to 5799s.naveen@gmail.com directly.';
    window.location.href = 'mailto:5799s.naveen@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyText);
  });

  const workSlider = document.querySelector('[data-work-slider]');
  if (workSlider) {
    const viewport = workSlider.querySelector('.work-slider-viewport');
    const track = workSlider.querySelector('[data-slider-track]');
    const originalSlides = [...track.children];
    const previousButton = workSlider.querySelector('[data-slider-prev]');
    const nextButton = workSlider.querySelector('[data-slider-next]');
    const dotsWrap = workSlider.querySelector('[data-slider-dots]');
    const status = workSlider.querySelector('[data-slider-status]');
    const cloneCount = Math.min(2, originalSlides.length);
    let currentIndex = 0;
    let physicalIndex = cloneCount;
    let timer = null;
    let pointerStartX = null;
    let isAnimating = false;

    const markClone = (slide) => {
      slide.setAttribute('aria-hidden', 'true');
      slide.tabIndex = -1;
      slide.querySelectorAll('a, button, input, textarea, select').forEach((node) => { node.tabIndex = -1; });
      return slide;
    };

    const beforeFragment = document.createDocumentFragment();
    originalSlides.slice(-cloneCount).forEach((slide) => beforeFragment.append(markClone(slide.cloneNode(true))));
    track.prepend(beforeFragment);
    const afterFragment = document.createDocumentFragment();
    originalSlides.slice(0, cloneCount).forEach((slide) => afterFragment.append(markClone(slide.cloneNode(true))));
    track.append(afterFragment);

    const dots = originalSlides.map((_, index) => {
      const dotButton = document.createElement('button');
      dotButton.type = 'button';
      dotButton.className = 'slider-dot';
      dotButton.setAttribute('aria-label', `Show project ${index + 1} of ${originalSlides.length}`);
      dotButton.addEventListener('click', () => goTo(index, true));
      dotsWrap.append(dotButton);
      return dotButton;
    });

    const slidesPerView = () => window.matchMedia('(max-width: 700px)').matches ? 1 : 2;
    const gapSize = () => {
      const styles = window.getComputedStyle(track);
      return parseFloat(styles.columnGap || styles.gap || '0') || 0;
    };
    const stepSize = () => {
      const slide = track.children[physicalIndex] || track.children[0];
      return (slide?.getBoundingClientRect().width || viewport.clientWidth) + gapSize();
    };

    const setOffset = (animate = true) => {
      track.classList.toggle('is-jumping', !animate);
      track.style.transform = `translate3d(${-physicalIndex * stepSize()}px, 0, 0)`;
      if (!animate) requestAnimationFrame(() => track.classList.remove('is-jumping'));
    };

    const updateState = () => {
      const visibleCount = slidesPerView();
      originalSlides.forEach((slide, index) => {
        const distance = (index - currentIndex + originalSlides.length) % originalSlides.length;
        const isVisible = distance < visibleCount;
        slide.setAttribute('aria-hidden', String(!isVisible));
        slide.tabIndex = isVisible ? 0 : -1;
      });
      dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === currentIndex)));
      if (status) {
        const ending = ((currentIndex + visibleCount - 1) % originalSlides.length) + 1;
        status.textContent = visibleCount === 1
          ? `Project ${currentIndex + 1} of ${originalSlides.length}`
          : `Projects ${currentIndex + 1} and ${ending} of ${originalSlides.length}`;
      }
    };

    const finishReducedMotion = () => {
      if (prefersReducedMotion) isAnimating = false;
    };

    const goTo = (index, userInitiated = false) => {
      if (isAnimating) return;
      currentIndex = (index + originalSlides.length) % originalSlides.length;
      physicalIndex = currentIndex + cloneCount;
      isAnimating = !prefersReducedMotion;
      setOffset(!prefersReducedMotion);
      updateState();
      finishReducedMotion();
      if (userInitiated) restartAutoplay();
    };

    const next = (userInitiated = false) => {
      if (isAnimating) return;
      isAnimating = !prefersReducedMotion;
      currentIndex = (currentIndex + 1) % originalSlides.length;
      physicalIndex += 1;
      setOffset(!prefersReducedMotion);
      updateState();
      finishReducedMotion();
      if (userInitiated) restartAutoplay();
    };

    const previous = (userInitiated = false) => {
      if (isAnimating) return;
      isAnimating = !prefersReducedMotion;
      currentIndex = (currentIndex - 1 + originalSlides.length) % originalSlides.length;
      physicalIndex -= 1;
      setOffset(!prefersReducedMotion);
      updateState();
      finishReducedMotion();
      if (userInitiated) restartAutoplay();
    };

    const stopAutoplay = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };
    const startAutoplay = () => {
      stopAutoplay();
      if (!prefersReducedMotion && !document.hidden) timer = window.setInterval(() => next(false), 3000);
    };
    const restartAutoplay = () => { stopAutoplay(); startAutoplay(); };

    track.addEventListener('transitionend', (event) => {
      if (event.target !== track || event.propertyName !== 'transform') return;
      if (physicalIndex >= originalSlides.length + cloneCount) {
        physicalIndex = cloneCount;
        setOffset(false);
      } else if (physicalIndex < cloneCount) {
        physicalIndex = currentIndex + cloneCount;
        setOffset(false);
      }
      isAnimating = false;
    });

    previousButton?.addEventListener('click', () => previous(true));
    nextButton?.addEventListener('click', () => next(true));
    viewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerStartX = event.clientX;
      stopAutoplay();
    });
    viewport.addEventListener('pointerup', (event) => {
      if (pointerStartX === null) return;
      const delta = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(delta) > 48) delta < 0 ? next(true) : previous(true);
      else startAutoplay();
    });
    viewport.addEventListener('pointercancel', () => { pointerStartX = null; startAutoplay(); });
    workSlider.addEventListener('mouseenter', stopAutoplay);
    workSlider.addEventListener('mouseleave', startAutoplay);
    workSlider.addEventListener('focusin', stopAutoplay);
    workSlider.addEventListener('focusout', (event) => {
      if (!workSlider.contains(event.relatedTarget)) startAutoplay();
    });
    document.addEventListener('visibilitychange', () => document.hidden ? stopAutoplay() : startAutoplay());
    window.addEventListener('resize', () => {
      workSlider.style.setProperty('--slides-per-view', String(slidesPerView()));
      setOffset(false);
      updateState();
    }, { passive: true });

    workSlider.style.setProperty('--slides-per-view', String(slidesPerView()));
    requestAnimationFrame(() => setOffset(false));
    updateState();
    startAutoplay();
  }

  const testimonialSlider = document.querySelector('[data-testimonial-slider]');
  if (testimonialSlider) {
    const viewport = testimonialSlider.querySelector('.testimonial-viewport');
    const track = testimonialSlider.querySelector('[data-testimonial-track]');
    const originals = [...track.children];
    const previousButton = testimonialSlider.querySelector('[data-testimonial-prev]');
    const nextButton = testimonialSlider.querySelector('[data-testimonial-next]');
    const dotsWrap = testimonialSlider.querySelector('[data-testimonial-dots]');
    const status = testimonialSlider.querySelector('[data-testimonial-status]');
    let currentIndex = 0;
    let physicalIndex = 1;
    let timer = null;
    let pointerStartX = null;
    let isAnimating = false;

    const firstClone = originals[0].cloneNode(true);
    const lastClone = originals[originals.length - 1].cloneNode(true);
    [firstClone, lastClone].forEach((clone) => {
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a, button').forEach((node) => { node.tabIndex = -1; });
    });
    track.append(firstClone);
    track.prepend(lastClone);

    const dots = originals.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot';
      dot.setAttribute('aria-label', `Show testimonial ${index + 1} of ${originals.length}`);
      dot.addEventListener('click', () => goTo(index, true));
      dotsWrap.append(dot);
      return dot;
    });

    const setOffset = (animate = true) => {
      track.classList.toggle('is-jumping', !animate);
      track.style.transform = `translate3d(${-physicalIndex * viewport.clientWidth}px, 0, 0)`;
      if (!animate) requestAnimationFrame(() => track.classList.remove('is-jumping'));
    };
    const updateState = () => {
      originals.forEach((slide, index) => slide.setAttribute('aria-hidden', String(index !== currentIndex)));
      dots.forEach((dot, index) => dot.setAttribute('aria-current', String(index === currentIndex)));
      if (status) status.textContent = `Testimonial ${currentIndex + 1} of ${originals.length}`;
    };
    const stopAutoplay = () => { if (timer) window.clearInterval(timer); timer = null; };
    const startAutoplay = () => {
      stopAutoplay();
      if (!prefersReducedMotion && !document.hidden) timer = window.setInterval(() => next(false), 3000);
    };
    const restartAutoplay = () => { stopAutoplay(); startAutoplay(); };
    const goTo = (index, userInitiated = false) => {
      if (isAnimating) return;
      currentIndex = (index + originals.length) % originals.length;
      physicalIndex = currentIndex + 1;
      isAnimating = !prefersReducedMotion;
      setOffset(!prefersReducedMotion);
      updateState();
      if (prefersReducedMotion) isAnimating = false;
      if (userInitiated) restartAutoplay();
    };
    const next = (userInitiated = false) => {
      if (isAnimating) return;
      isAnimating = !prefersReducedMotion;
      currentIndex = (currentIndex + 1) % originals.length;
      physicalIndex += 1;
      setOffset(!prefersReducedMotion);
      updateState();
      if (prefersReducedMotion) isAnimating = false;
      if (userInitiated) restartAutoplay();
    };
    const previous = (userInitiated = false) => {
      if (isAnimating) return;
      isAnimating = !prefersReducedMotion;
      currentIndex = (currentIndex - 1 + originals.length) % originals.length;
      physicalIndex -= 1;
      setOffset(!prefersReducedMotion);
      updateState();
      if (prefersReducedMotion) isAnimating = false;
      if (userInitiated) restartAutoplay();
    };

    track.addEventListener('transitionend', (event) => {
      if (event.target !== track || event.propertyName !== 'transform') return;
      if (physicalIndex === originals.length + 1) {
        physicalIndex = 1;
        setOffset(false);
      } else if (physicalIndex === 0) {
        physicalIndex = originals.length;
        setOffset(false);
      }
      isAnimating = false;
    });
    previousButton?.addEventListener('click', () => previous(true));
    nextButton?.addEventListener('click', () => next(true));
    viewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointerStartX = event.clientX;
      stopAutoplay();
    });
    viewport.addEventListener('pointerup', (event) => {
      if (pointerStartX === null) return;
      const delta = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(delta) > 48) delta < 0 ? next(true) : previous(true);
      else startAutoplay();
    });
    viewport.addEventListener('pointercancel', () => { pointerStartX = null; startAutoplay(); });
    testimonialSlider.addEventListener('mouseenter', stopAutoplay);
    testimonialSlider.addEventListener('mouseleave', startAutoplay);
    testimonialSlider.addEventListener('focusin', stopAutoplay);
    testimonialSlider.addEventListener('focusout', (event) => {
      if (!testimonialSlider.contains(event.relatedTarget)) startAutoplay();
    });
    window.addEventListener('resize', () => setOffset(false), { passive: true });
    document.addEventListener('visibilitychange', () => document.hidden ? stopAutoplay() : startAutoplay());

    requestAnimationFrame(() => setOffset(false));
    updateState();
    startAutoplay();
  }

})();
