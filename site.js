(() => {
  const body = document.body;
  const siteHeader = document.querySelector('.site-header');
  const menu = document.querySelector('[data-menu]');
  const menuToggle = document.querySelector('[data-menu-toggle]');

  let headerScrollFrame;
  const syncHeaderState = () => {
    headerScrollFrame = undefined;
    siteHeader?.classList.toggle('is-compact', window.scrollY > 24);
  };
  const requestHeaderState = () => {
    if (headerScrollFrame) return;
    headerScrollFrame = requestAnimationFrame(syncHeaderState);
  };
  window.addEventListener('scroll', requestHeaderState, { passive: true });
  syncHeaderState();

  const setMenu = (open) => {
    if (!menu || !menuToggle) return;
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    body.classList.toggle('menu-open', open);
  };

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  document.querySelectorAll('[data-menu-close]').forEach((item) => item.addEventListener('click', () => setMenu(false)));

  document.querySelectorAll('[data-panel-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      setMenu(false);
      const panel = document.querySelector(`[data-panel="${trigger.dataset.panelOpen}"]`);
      panel?.showModal();
    });
  });

  document.querySelectorAll('[data-panel]').forEach((panel) => {
    panel.querySelector('[data-panel-close]')?.addEventListener('click', () => panel.close());
    panel.addEventListener('click', (event) => {
      if (event.target === panel) panel.close();
    });
  });

  document.querySelectorAll('[data-brand-video]').forEach((player) => {
    const video = player.querySelector('video');
    const start = player.querySelector('[data-brand-video-start]');
    const sound = player.querySelector('[data-brand-video-sound]');
    const progress = player.querySelector('[data-brand-video-progress]');
    if (!video || !start || !sound || !progress) return;

    const syncBrandVideo = () => {
      player.classList.toggle('is-playing', !video.paused && !video.ended);
      player.classList.toggle('is-muted', video.muted);
      start.setAttribute('aria-label', video.paused ? '播放访谈视频' : '暂停访谈视频');
      sound.setAttribute('aria-pressed', String(!video.muted));
      sound.setAttribute('aria-label', video.muted ? '打开视频声音' : '关闭视频声音');
      if (Number.isFinite(video.duration) && video.duration > 0) {
        progress.value = String(Math.round((video.currentTime / video.duration) * 1000));
      }
    };

    start.addEventListener('click', () => {
      player.classList.add('has-started');
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    });
    video.addEventListener('click', () => {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    });
    sound.addEventListener('click', () => {
      video.muted = !video.muted;
      syncBrandVideo();
    });
    progress.addEventListener('input', () => {
      if (Number.isFinite(video.duration)) video.currentTime = (Number(progress.value) / 1000) * video.duration;
    });
    ['play', 'pause', 'ended', 'timeupdate', 'loadedmetadata', 'volumechange'].forEach((eventName) => {
      video.addEventListener(eventName, syncBrandVideo);
    });
    syncBrandVideo();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu && !menu.hidden) setMenu(false);
  });

  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-category]')];
  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.filter;
      filters.forEach((item) => {
        const active = item === filter;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      cards.forEach((card) => {
        card.classList.toggle('is-hidden', category !== 'all' && !card.dataset.category.split(' ').includes(category));
      });
    });
  });

  const motionMedia = [...document.querySelectorAll('video.motion-media')];
  const autoplayMedia = [...document.querySelectorAll('video[autoplay]')];
  const motionToggle = document.querySelector('[data-motion-toggle]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionPaused = reducedMotion.matches;
  const typeShowcase = document.querySelector('[data-type-showcase]');
  const typeShowcaseTrack = typeShowcase?.querySelector('[data-type-showcase-track]');
  const typeShowcaseGroup = typeShowcase?.querySelector('[data-type-showcase-group]');
  const typeShowcaseToggle = typeShowcase?.querySelector('[data-type-showcase-toggle]');
  const visibleShowcaseVideos = new Set();
  let typeShowcaseVideos = [];
  let typeShowcasePaused = false;
  let renderTypeShowcaseState = () => {};
  let syncTypeShowcaseMotionPreference = () => {};
  const revealCards = [...document.querySelectorAll('.project-card')];
  const detailRevealItems = [
    ...document.querySelectorAll('.project-copy-board, .project-media-item, .project-copy, .about-profile'),
  ];
  const revealItems = [...revealCards, ...detailRevealItems];
  let revealObserver;
  let revealResizeTimer;
  let revealScrollDirection = 'down';
  let lastRevealScrollY = window.scrollY;
  let revealResetFrame;
  let revealGroups = new Map();
  const brandIntroPanels = [...document.querySelectorAll('.brand-intro__panel')];
  let brandRevealFrame;
  let homeRevealFrame;

  const syncBrandIntroReveal = () => {
    if (!brandIntroPanels.length || !document.documentElement.classList.contains('reveal-enabled')) return;
    const viewportCenter = window.innerHeight * .5;
    const activePanel = brandIntroPanels.reduce((closest, panel) => {
      const rect = panel.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height * .5 - viewportCenter);
      return !closest || distance < closest.distance ? { panel, distance } : closest;
    }, null)?.panel;
    brandIntroPanels.forEach((panel) => panel.classList.toggle('is-revealed', panel === activePanel));
  };

  const requestBrandIntroReveal = () => {
    if (brandRevealFrame) return;
    brandRevealFrame = requestAnimationFrame(() => {
      brandRevealFrame = undefined;
      syncBrandIntroReveal();
    });
  };

  const syncHomeProjectReveal = () => {
    if (!body.classList.contains('work-page') || !document.documentElement.classList.contains('reveal-enabled')) return;
    const projectGrid = document.querySelector('.projects');
    if (!projectGrid) return;
    const homeGroups = [...revealGroups.entries()]
      .filter(([name]) => name.startsWith('home-'))
      .sort(([left], [right]) => Number(left.slice(5)) - Number(right.slice(5)));
    if (!homeGroups.length) return;

    const gridRect = projectGrid.getBoundingClientRect();
    if (gridRect.top > window.innerHeight * .82 || gridRect.bottom < window.innerHeight * .12) {
      homeGroups.forEach(([, group]) => group.forEach((item) => item.classList.remove('is-revealed')));
      return;
    }

    const viewportCenter = window.innerHeight * .5;
    const activeName = homeGroups.reduce((closest, [name, group]) => {
      const rect = group[0].getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height * .5 - viewportCenter);
      return !closest || distance < closest.distance ? { name, distance } : closest;
    }, null)?.name;
    homeGroups.forEach(([name, group]) => {
      group.forEach((item) => item.classList.toggle('is-revealed', name === activeName));
    });
  };

  const requestHomeProjectReveal = () => {
    if (homeRevealFrame) return;
    homeRevealFrame = requestAnimationFrame(() => {
      homeRevealFrame = undefined;
      syncHomeProjectReveal();
    });
  };

  if (typeShowcase && typeShowcaseTrack && typeShowcaseGroup) {
    const typeShowcaseViewport = typeShowcase.querySelector('.type-showcase__viewport');
    const clonedGroup = typeShowcaseGroup.cloneNode(true);
    clonedGroup.removeAttribute('data-type-showcase-group');
    clonedGroup.setAttribute('aria-hidden', 'true');
    clonedGroup.querySelectorAll('img').forEach((image) => image.setAttribute('alt', ''));
    clonedGroup.querySelectorAll('video').forEach((video) => video.setAttribute('aria-hidden', 'true'));
    typeShowcaseTrack.append(clonedGroup);
    typeShowcaseVideos = [...typeShowcase.querySelectorAll('video')];
    const typeShowcaseItems = [...typeShowcase.querySelectorAll('.type-showcase__item')];

    let showcaseSegmentWidth = 0;
    let showcaseOffset = 0;
    let showcaseImpulse = 0;
    let showcaseLastFrameTime = performance.now();
    let showcasePointerId;
    let showcasePointerX = 0;
    let showcasePointerTime = 0;
    let showcaseDragging = false;
    let showcaseHovered = false;
    let showcaseFocused = false;
    const clampShowcaseSpeed = (speed) => Math.max(-1200, Math.min(1200, speed));
    const getShowcaseHoverSpeed = () => window.innerWidth <= 900 ? 72 : 92;
    const getShowcaseBaseSpeed = () => getShowcaseHoverSpeed() * 1.5;

    const paintShowcaseDepth = () => {
      if (reducedMotion.matches) {
        typeShowcaseItems.forEach((item) => {
          item.style.removeProperty('--showcase-scale');
          item.style.removeProperty('--showcase-lift');
          item.style.removeProperty('--showcase-opacity');
        });
        return;
      }

      const viewportRect = typeShowcaseViewport.getBoundingClientRect();
      const clampUnit = (value) => Math.max(0, Math.min(1, value));
      typeShowcaseItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const enteringFromLeft = center < viewportRect.left + viewportRect.width / 2;
        const edgeDistance = enteringFromLeft ? center - viewportRect.left : viewportRect.right - center;
        let scaleCurve;
        let opacityCurve;

        if (enteringFromLeft) {
          const scaleProgress = clampUnit((edgeDistance + 55) / 165);
          const opacityProgress = clampUnit((edgeDistance + 50) / 125);
          scaleCurve = 1 - Math.pow(1 - scaleProgress, 2.8);
          opacityCurve = opacityProgress * opacityProgress * (3 - 2 * opacityProgress);
        } else {
          const scaleProgress = clampUnit((edgeDistance + 25) / 150);
          const opacityProgress = clampUnit((edgeDistance + 5) / 70);
          scaleCurve = 1 - Math.pow(1 - scaleProgress, 2.2);
          opacityCurve = opacityProgress * opacityProgress * (3 - 2 * opacityProgress);
        }

        item.style.setProperty('--showcase-scale', (.72 + scaleCurve * .28).toFixed(4));
        item.style.setProperty('--showcase-lift', `${((1 - scaleCurve) * 18).toFixed(2)}px`);
        item.style.setProperty('--showcase-opacity', opacityCurve.toFixed(4));
      });
    };

    const normalizeShowcaseOffset = () => {
      if (!showcaseSegmentWidth) return;
      while (showcaseOffset >= 0) showcaseOffset -= showcaseSegmentWidth;
      while (showcaseOffset < -showcaseSegmentWidth) showcaseOffset += showcaseSegmentWidth;
    };

    const paintShowcase = () => {
      if (reducedMotion.matches) {
        typeShowcaseTrack.style.removeProperty('transform');
        return;
      }
      typeShowcaseTrack.style.transform = `translate3d(${showcaseOffset}px, 0, 0)`;
      paintShowcaseDepth();
    };

    const measureShowcase = () => {
      const gap = Number.parseFloat(getComputedStyle(typeShowcaseTrack).columnGap) || 0;
      const nextSegmentWidth = typeShowcaseGroup.getBoundingClientRect().width + gap;
      if (!nextSegmentWidth) return;
      if (!showcaseSegmentWidth) showcaseOffset = -nextSegmentWidth;
      showcaseSegmentWidth = nextSegmentWidth;
      normalizeShowcaseOffset();
      paintShowcase();
    };

    const animateShowcase = (now) => {
      const elapsed = Math.min(Math.max((now - showcaseLastFrameTime) / 1000, 0), .05);
      showcaseLastFrameTime = now;

      if (!reducedMotion.matches && !typeShowcasePaused && !document.hidden && !showcaseDragging) {
        const isSlowed = showcaseHovered || showcaseFocused;
        const baseSpeed = isSlowed ? getShowcaseHoverSpeed() : getShowcaseBaseSpeed();
        if (isSlowed) showcaseImpulse *= Math.exp(-elapsed * 10);
        else showcaseImpulse *= Math.exp(-elapsed * 3.2);
        if (Math.abs(showcaseImpulse) < .35) showcaseImpulse = 0;
        showcaseOffset += (baseSpeed + (isSlowed ? 0 : showcaseImpulse)) * elapsed;
        normalizeShowcaseOffset();
        paintShowcase();
      }

      requestAnimationFrame(animateShowcase);
    };

    const showcaseVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleShowcaseVideos.add(entry.target);
        else visibleShowcaseVideos.delete(entry.target);
      });
      renderTypeShowcaseState();
    }, { rootMargin: '120px' });

    renderTypeShowcaseState = () => {
      const paused = typeShowcasePaused || reducedMotion.matches || document.hidden;
      typeShowcase.classList.toggle('is-paused', typeShowcasePaused);
      typeShowcaseToggle?.setAttribute('aria-pressed', String(typeShowcasePaused));
      typeShowcaseToggle?.setAttribute('aria-label', typeShowcasePaused ? '播放文字设计作品轮播' : '暂停文字设计作品轮播');
      typeShowcaseVideos.forEach((video) => {
        if (!paused && visibleShowcaseVideos.has(video)) video.play().catch(() => {});
        else video.pause();
      });
    };

    typeShowcaseVideos.forEach((video) => showcaseVideoObserver.observe(video));
    typeShowcaseToggle?.addEventListener('click', () => {
      typeShowcasePaused = !typeShowcasePaused;
      renderTypeShowcaseState();
    });

    typeShowcase.addEventListener('pointerover', (event) => {
      if (event.target.closest('.type-showcase__item')) {
        showcaseHovered = true;
        showcaseImpulse = 0;
      }
    });
    typeShowcase.addEventListener('pointerout', (event) => {
      if (!event.relatedTarget?.closest?.('.type-showcase__item')) showcaseHovered = false;
    });
    typeShowcase.addEventListener('focusin', (event) => {
      if (event.target.closest('.type-showcase__item')) {
        showcaseFocused = true;
        showcaseImpulse = 0;
      }
    });
    typeShowcase.addEventListener('focusout', (event) => {
      if (!typeShowcase.contains(event.relatedTarget)) showcaseFocused = false;
    });

    const finishShowcaseDrag = (event) => {
      if (!showcaseDragging || event.pointerId !== showcasePointerId) return;
      showcaseDragging = false;
      showcasePointerId = undefined;
      typeShowcase.classList.remove('is-dragging');
      if (typeShowcaseViewport?.hasPointerCapture(event.pointerId)) {
        typeShowcaseViewport.releasePointerCapture(event.pointerId);
      }
    };

    typeShowcaseViewport?.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button') || (event.pointerType === 'mouse' && event.button !== 0)) return;
      showcaseDragging = true;
      showcasePointerId = event.pointerId;
      showcasePointerX = event.clientX;
      showcasePointerTime = performance.now();
      showcaseImpulse = 0;
      typeShowcase.classList.add('is-dragging');
      typeShowcaseViewport.setPointerCapture(event.pointerId);
    });
    typeShowcaseViewport?.addEventListener('pointermove', (event) => {
      if (!showcaseDragging || event.pointerId !== showcasePointerId || reducedMotion.matches) return;
      const now = performance.now();
      const elapsed = Math.max(now - showcasePointerTime, 8);
      const delta = event.clientX - showcasePointerX;
      showcaseOffset += delta;
      showcaseImpulse = clampShowcaseSpeed((delta / elapsed) * 1000);
      showcasePointerX = event.clientX;
      showcasePointerTime = now;
      normalizeShowcaseOffset();
      paintShowcase();
      event.preventDefault();
    });
    typeShowcaseViewport?.addEventListener('pointerup', finishShowcaseDrag);
    typeShowcaseViewport?.addEventListener('pointercancel', finishShowcaseDrag);

    typeShowcaseViewport?.addEventListener('wheel', (event) => {
      if (reducedMotion.matches || typeShowcasePaused) return;
      const horizontalGesture = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (horizontalGesture) {
        event.preventDefault();
        const delta = -event.deltaX;
        showcaseOffset += delta;
        showcaseImpulse = clampShowcaseSpeed(showcaseImpulse + delta * 7);
        normalizeShowcaseOffset();
        paintShowcase();
      } else if (event.deltaY > 0) {
        showcaseImpulse = clampShowcaseSpeed(showcaseImpulse + Math.min(event.deltaY * 2.4, 420));
      }
    }, { passive: false });

    const showcaseResizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(measureShowcase) : null;
    showcaseResizeObserver?.observe(typeShowcaseGroup);
    if (!showcaseResizeObserver) window.addEventListener('resize', measureShowcase, { passive: true });

    syncTypeShowcaseMotionPreference = () => {
      showcaseLastFrameTime = performance.now();
      showcaseImpulse = 0;
      if (reducedMotion.matches) typeShowcaseTrack.style.removeProperty('transform');
      else measureShowcase();
    };
    document.addEventListener('visibilitychange', renderTypeShowcaseState);
    requestAnimationFrame(() => {
      measureShowcase();
      requestAnimationFrame(animateShowcase);
    });
  }

  const updateRevealScrollDirection = () => {
    const currentScrollY = window.scrollY;
    if (Math.abs(currentScrollY - lastRevealScrollY) > 2) {
      revealScrollDirection = currentScrollY > lastRevealScrollY ? 'down' : 'up';
      lastRevealScrollY = currentScrollY;
    }

    if (revealScrollDirection !== 'up' || revealResetFrame) return;

    revealResetFrame = requestAnimationFrame(() => {
      revealResetFrame = undefined;
      revealGroups.forEach((group) => {
        const groupTop = Math.min(...group.map((item) => item.getBoundingClientRect().top));
        if (groupTop <= window.innerHeight) return;
        group.forEach((item) => item.classList.remove('is-revealed'));
      });
    });
  };

  window.addEventListener('scroll', updateRevealScrollDirection, { passive: true });
  window.addEventListener('scroll', requestBrandIntroReveal, { passive: true });
  window.addEventListener('resize', requestBrandIntroReveal, { passive: true });
  window.addEventListener('scroll', requestHomeProjectReveal, { passive: true });
  window.addEventListener('resize', requestHomeProjectReveal, { passive: true });

  const getProjectColumnCount = () => {
    const projectGrid = document.querySelector('.projects');
    if (!projectGrid) return 1;
    return getComputedStyle(projectGrid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
  };

  const addRevealGroup = (groupName, items) => {
    const visibleItems = items.filter((item) => !item.classList.contains('is-hidden'));
    if (!visibleItems.length) return;

    visibleItems.forEach((item, column) => {
      item.classList.add('scroll-reveal-item');
      item.dataset.revealGroup = groupName;
      item.dataset.revealColumn = String(column);
    });
    revealGroups.set(groupName, visibleItems);
  };

  const prepareRevealGroups = () => {
    revealGroups = new Map();

    const columns = getProjectColumnCount();
    revealCards.forEach((card, index) => {
      const row = Math.floor(index / columns);
      const groupName = `home-${row}`;
      card.dataset.revealGroup = groupName;
      card.dataset.revealColumn = String(index % columns);
      card.classList.add('scroll-reveal-item');
    });
    [...new Set(revealCards.map((card) => card.dataset.revealGroup))].forEach((groupName) => {
      addRevealGroup(groupName, revealCards.filter((card) => card.dataset.revealGroup === groupName));
    });

    document.querySelectorAll('.project-copy-board').forEach((item, index) => {
      addRevealGroup(`detail-board-${index}`, [item]);
    });

    document.querySelectorAll('.project-media-stack').forEach((stack, stackIndex) => {
      const items = [...stack.querySelectorAll(':scope > .project-media-item')];
      const visualRows = [];

      items.forEach((item) => {
        const itemTop = item.offsetTop;
        const row = visualRows.find((candidate) => Math.abs(candidate.top - itemTop) <= 2);

        if (row) {
          row.items.push(item);
        } else {
          visualRows.push({ top: itemTop, items: [item] });
        }
      });

      visualRows.forEach((row, rowIndex) => {
        addRevealGroup(`detail-stack-${stackIndex}-row-${rowIndex}`, row.items);
      });
    });

    document.querySelectorAll('.project-copy').forEach((item, index) => {
      addRevealGroup(`detail-copy-${index}`, [item]);
    });

    document.querySelectorAll('.about-profile').forEach((item, index) => {
      addRevealGroup(`about-section-${index}`, [item]);
    });

    document.querySelectorAll('.brand-intro__panel, .brand-proof-card').forEach((item, index) => {
      addRevealGroup(`brand-section-${index}`, [item]);
    });

    revealGroups.forEach((items, groupName) => addRevealGroup(groupName, items));
  };

  const setScrollReveal = (reduceMotion) => {
    revealObserver?.disconnect();
    revealObserver = undefined;

    prepareRevealGroups();

    if (!revealItems.length || reduceMotion) {
      document.documentElement.classList.remove('reveal-enabled');
      revealItems.forEach((item) => item.classList.add('is-revealed'));
      return;
    }

    document.documentElement.classList.add('reveal-enabled');
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const group = revealGroups.get(entry.target.dataset.revealGroup) || [entry.target];

        if (document.body.classList.contains('brand-page')) {
          if (entry.target.classList.contains('brand-intro__panel')) {
            requestBrandIntroReveal();
            return;
          }
          group.forEach((item) => item.classList.toggle('is-revealed', entry.isIntersecting));
          return;
        }

        if (body.classList.contains('work-page') && entry.target.classList.contains('project-card')) {
          requestHomeProjectReveal();
          return;
        }

        if (entry.isIntersecting && revealScrollDirection === 'down') {
          group.forEach((item) => item.classList.remove('is-revealed'));
          requestAnimationFrame(() => group.forEach((item) => item.classList.add('is-revealed')));
        }
      });
    }, {
      threshold: 0,
      rootMargin: '0px 0px -18% 0px',
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        revealGroups.forEach((group) => revealObserver?.observe(group[0]));
        syncBrandIntroReveal();
        syncHomeProjectReveal();
      });
    });
  };

  const renderMotionState = () => {
    motionMedia.forEach((media) => {
      if (motionPaused) {
        media.pause();
      } else {
        media.play().catch(() => {});
      }
    });
    if (motionToggle) {
      motionToggle.textContent = motionPaused ? '播放视频' : '暂停视频';
      motionToggle.setAttribute('aria-pressed', String(motionPaused));
    }
  };

  autoplayMedia.forEach((media) => {
    media.defaultPlaybackRate = 1;
    media.playbackRate = 1;
    media.muted = true;
    media.loop = true;
    media.play().catch(() => {});
  });

  document.querySelectorAll('[data-sound-toggle]').forEach((toggle) => {
    const media = document.getElementById(toggle.dataset.soundToggle);
    if (!media) return;

    const renderSoundState = () => {
      const soundOn = !media.muted && media.volume > 0;
      toggle.setAttribute('aria-pressed', String(soundOn));
      toggle.setAttribute('aria-label', soundOn ? '关闭视频声音' : '打开视频声音');
      toggle.setAttribute('title', soundOn ? '关闭声音' : '打开声音');
      toggle.classList.toggle('is-sound-on', soundOn);
    };

    const setSound = (soundOn) => {
      media.volume = 1;
      media.defaultMuted = !soundOn;
      media.muted = !soundOn;
      if (soundOn) {
        media.removeAttribute('muted');
      } else {
        media.setAttribute('muted', '');
      }
      renderSoundState();
      media.play().catch(() => {});
    };

    media.volume = 1;
    media.defaultMuted = true;
    media.muted = true;
    renderSoundState();
    media.addEventListener('volumechange', renderSoundState);
    toggle.addEventListener('click', () => {
      setSound(media.muted || media.volume === 0);
    });
  });

  motionToggle?.addEventListener('click', () => {
    motionPaused = !motionPaused;
    renderMotionState();
  });
  reducedMotion.addEventListener?.('change', (event) => {
    motionPaused = event.matches;
    renderMotionState();
    renderTypeShowcaseState();
    syncTypeShowcaseMotionPreference();
    setScrollReveal(event.matches);
  });
  window.addEventListener('resize', () => {
    window.clearTimeout(revealResizeTimer);
    revealResizeTimer = window.setTimeout(() => setScrollReveal(reducedMotion.matches), 180);
  }, { passive: true });
  setScrollReveal(reducedMotion.matches);
  renderMotionState();
  renderTypeShowcaseState();

  document.querySelectorAll('[data-year]').forEach((item) => {
    item.textContent = String(new Date().getFullYear());
  });
})();
