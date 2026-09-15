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
  const project24Story = document.querySelector('[data-project-24-story]');
  const project24StoryFrames = [...(project24Story?.querySelectorAll('.project-24-story__frame') || [])];
  const brandScatterStory = document.querySelector('[data-brand-scatter-story]');
  const brandScatterFrames = [...(brandScatterStory?.querySelectorAll('.brand-scatter-story__frame') || [])];
  const project24Scatter = document.querySelector('[data-project-24-scatter]');
  const scatterVideoIndexes = new Set([12, 13, 29]);
  const scatterExtensions = ['png', 'png', 'png', 'jpg', 'jpg', 'png', 'png', 'jpg', 'jpg', 'jpg', 'jpg', 'mp4', 'mp4', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'jpg', 'png', 'png', 'png', 'jpg', 'png', 'mp4', 'jpg', 'png'];
  if (project24Scatter && !project24Scatter.children.length) {
    const orbit = document.createElement('div');
    orbit.className = 'project-24-scatter__orbit';
    const createCore = (depth, layers) => {
      const core = document.createElement('div');
      core.className = `project-24-scatter__core project-24-scatter__core--${depth}`;
      core.setAttribute('aria-hidden', 'true');
      for (let layer = 0; layer < layers; layer += 1) {
        const coreImage = document.createElement('img');
        coreImage.src = '/media/brand/core/chengyuan-flower-alpha.png';
        coreImage.alt = '';
        coreImage.decoding = 'async';
        coreImage.className = `project-24-scatter__core-image project-24-scatter__core-image--${layer + 1}`;
        core.append(coreImage);
      }
      return core;
    };
    const coreBack = createCore('back', 1);
    const coreFront = createCore('front', 3);
    project24Scatter.append(coreBack);
    project24Scatter.append(orbit);
    project24Scatter.append(coreFront);
    scatterExtensions.forEach((extension, index) => {
      const number = index + 1;
      const item = document.createElement('button');
      const float = document.createElement('span');
      const media = document.createElement(scatterVideoIndexes.has(number) ? 'video' : 'img');
      item.className = 'project-24-scatter__item';
      item.type = 'button';
      item.setAttribute('aria-label', `放大查看品牌项目${scatterVideoIndexes.has(number) ? '视频' : '素材'} ${number}`);
      item.setAttribute('aria-pressed', 'false');
      float.className = 'project-24-scatter__float';
      media.src = `/media/project-24/scatter/scatter-${String(number).padStart(2, '0')}.${extension}`;
      if (media instanceof HTMLVideoElement) {
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.preload = 'metadata';
        media.setAttribute('aria-label', `乘愿而归品牌项目视频 ${number}`);
      } else {
        media.alt = `乘愿而归品牌项目素材 ${number}`;
        media.loading = 'eager';
        media.decoding = 'async';
        media.fetchPriority = 'low';
      }
      float.append(media);
      item.append(float);
      orbit.append(item);
    });
  }
  const project24ScatterOrbit = project24Scatter?.querySelector('.project-24-scatter__orbit');
  const project24ScatterItems = [...(project24Scatter?.querySelectorAll('.project-24-scatter__item') || [])];
  const project24ScatterVideos = [...(project24Scatter?.querySelectorAll('video') || [])];
  const sphereFocusMode = Boolean(brandScatterStory);
  let project24StoryFrame;
  let brandScatterStoryFrame;

  const project24ScatterLayout = [
    [18, 12, 10], [32, 10, 7], [45, 15, 11], [59, 11, 8], [73, 15, 12], [84, 12, 8],
    [15, 30, 12], [27, 28, 7], [38, 34, 10], [50, 27, 13], [63, 34, 9], [75, 28, 12], [85, 34, 7],
    [19, 49, 15], [34, 54, 11], [47, 47, 8], [59, 54, 14], [73, 47, 10], [84, 54, 12],
    [16, 70, 10], [29, 66, 14], [43, 73, 8], [56, 67, 12], [70, 74, 9], [83, 68, 13],
    [19, 86, 13], [33, 84, 7], [45, 88, 11], [59, 83, 9], [73, 87, 13], [84, 84, 7],
  ];
  const project24SpherePoints = [];
  project24ScatterItems.forEach((item, index) => {
    const [x, y, width] = project24ScatterLayout[index];
    const pointIndex = index + .5;
    const sphereY = 1 - (2 * pointIndex) / project24ScatterItems.length;
    const sphereRadius = Math.sqrt(1 - sphereY * sphereY);
    const theta = Math.PI * (3 - Math.sqrt(5)) * pointIndex;
    const sphereX = Math.cos(theta) * sphereRadius;
    const sphereZ = Math.sin(theta) * sphereRadius;
    project24SpherePoints.push({ x: sphereX, y: sphereY, z: sphereZ });
    item.style.setProperty('--scatter-x', `${x}%`);
    item.style.setProperty('--scatter-y', `${y}%`);
    item.style.setProperty('--scatter-w', `${width}vw`);
    item.style.setProperty('--scatter-z', String(1 + (index * 7) % 9));
    item.style.setProperty('--scatter-float-duration', `${6.2 + (index % 7) * .45}s`);
    item.style.setProperty('--scatter-float-delay', `${-(index % 9) * .37}s`);
    item.style.setProperty('--sphere-w', `${82 + (index * 17) % 48}px`);
    item.style.setProperty('--sphere-mobile-w', `${48 + (index * 11) % 24}px`);
  });
  const setProject24ScatterSelection = (selectedItem) => {
    const wasExpanded = project24Scatter?.classList.contains('is-flat') || project24Scatter?.classList.contains('is-focus');
    if (!selectedItem && wasExpanded) {
      project24Scatter.classList.add('is-collapsing');
      scatterTransitionUntil = performance.now() + 780;
      window.setTimeout(() => project24Scatter?.classList.remove('is-collapsing'), 800);
    }
    project24Scatter?.classList.toggle('is-flat', Boolean(selectedItem) && !sphereFocusMode);
    project24Scatter?.classList.toggle('is-focus', Boolean(selectedItem) && sphereFocusMode);
    project24Scatter?.classList.toggle('has-selection', Boolean(selectedItem));
    project24ScatterItems.forEach((item) => {
      const selected = item === selectedItem;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  };
  project24ScatterItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.stopPropagation();
      setProject24ScatterSelection(item.classList.contains('is-selected') ? null : item);
    });
  });
  project24Scatter?.addEventListener('click', (event) => {
    if (event.target === project24Scatter) setProject24ScatterSelection(null);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setProject24ScatterSelection(null);
  });

  let scatterRotationX = -8;
  let scatterRotationY = 18;
  let scatterVelocityX = 0;
  let scatterVelocityY = 0;
  let scatterLastPointerTime = 0;
  let scatterTransitionUntil = 0;
  let scatterDragging = false;
  let scatterMoved = false;
  let scatterPointerX = 0;
  let scatterPointerY = 0;
  let scatterAutoRotating = true;
  let scatterVisible = false;
  let scatterAnimationFrame;
  const renderScatterSphere = (time = performance.now(), force = false) => {
    scatterAnimationFrame = undefined;
    if (!project24ScatterOrbit || reducedMotion.matches || (!scatterVisible && !force)) return;
    const isFlat = project24Scatter?.classList.contains('is-flat');
    const isFocused = project24Scatter?.classList.contains('is-focus');
    const isTransitioning = time < scatterTransitionUntil;
    if (!scatterDragging && !isFlat && !isFocused && !isTransitioning) {
      if (Math.abs(scatterVelocityX) + Math.abs(scatterVelocityY) > .015) {
        scatterRotationY += scatterVelocityX;
        scatterRotationX = Math.max(-62, Math.min(62, scatterRotationX + scatterVelocityY));
        scatterVelocityX *= .94;
        scatterVelocityY *= .94;
      } else if (scatterAutoRotating) {
        scatterRotationY += .14;
      }
    }
    if (!isFlat) {
      const angleY = scatterRotationY * Math.PI / 180;
      const angleX = scatterRotationX * Math.PI / 180;
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const radius = Math.min(window.innerWidth * .39, window.innerHeight * .38, 400);
      const coreWidth = Math.min(370, Math.max(240, window.innerWidth * .23));
      const coreHeight = coreWidth * 2171 / 1907;
      const breath = 1 + Math.sin(time / 1550) * .012;
      const perspective = 1120;
      project24SpherePoints.forEach((point, index) => {
        const rotatedX = point.x * cosY + point.z * sinY;
        const rotatedZ = -point.x * sinY + point.z * cosY;
        const rotatedY = point.y * cosX - rotatedZ * sinX;
        const depth = point.y * sinX + rotatedZ * cosX;
        const projectedDepth = depth * radius;
        const perspectiveScale = perspective / (perspective - projectedDepth);
        const screenX = rotatedX * radius * perspectiveScale * breath;
        const screenY = -rotatedY * radius * perspectiveScale * breath;
        const softYaw = 0;
        const softPitch = 0;
        const item = project24ScatterItems[index];
        item.style.setProperty('--sphere-live-transform', `translate(-50%, -50%) translate3d(${screenX.toFixed(2)}px, ${screenY.toFixed(2)}px, 0) rotateY(${softYaw.toFixed(2)}deg) rotateX(${softPitch.toFixed(2)}deg) scale(${(perspectiveScale * breath).toFixed(4)})`);
        item.style.setProperty('--sphere-z', String(Math.round((depth + 1) * 100)));
        item.style.setProperty('--sphere-depth-opacity', String(.34 + (depth + 1) * .33));
        if (depth > .08) item.classList.add('is-sphere-front');
        else if (depth < -.08) item.classList.remove('is-sphere-front');
        const itemWidth = (82 + (index * 17) % 48) * perspectiveScale;
        const overlapsCore = Math.abs(screenX) < coreWidth / 2 + itemWidth * .55
          && Math.abs(screenY) < coreHeight / 2 + itemWidth * .75;
        const clearsCore = Math.abs(screenX) > coreWidth / 2 + itemWidth * .55 + 16
          || Math.abs(screenY) > coreHeight / 2 + itemWidth * .75 + 16;
        if (depth > .08 && overlapsCore) item.classList.add('is-core-occluder');
        else if (depth < -.08 || clearsCore) item.classList.remove('is-core-occluder');
      });
    }
    if (scatterVisible) scatterAnimationFrame = requestAnimationFrame(renderScatterSphere);
  };
  const requestScatterSphere = () => {
    if (!scatterAnimationFrame && scatterVisible) scatterAnimationFrame = requestAnimationFrame(renderScatterSphere);
  };
  if (project24Scatter) {
    renderScatterSphere(performance.now(), true);
    project24Scatter.classList.add('is-ready', 'is-initialized');
  }
  if (project24Scatter) {
    const scatterObserver = new IntersectionObserver(([entry]) => {
      scatterVisible = entry.isIntersecting;
      project24ScatterVideos.forEach((video) => {
        if (!scatterVisible) video.pause();
      });
      requestScatterSphere();
    }, { threshold: .08 });
    scatterObserver.observe(project24Scatter);
    project24Scatter.addEventListener('pointerdown', (event) => {
      if (event.target.closest('.project-24-scatter__item')) return;
      scatterDragging = true;
      scatterMoved = false;
      scatterPointerX = event.clientX;
      scatterPointerY = event.clientY;
      scatterLastPointerTime = performance.now();
      scatterVelocityX = 0;
      scatterVelocityY = 0;
      scatterAutoRotating = false;
      project24Scatter.classList.add('is-dragging');
      project24Scatter.setPointerCapture(event.pointerId);
    });
    project24Scatter.addEventListener('pointermove', (event) => {
      if (!scatterDragging || project24Scatter.classList.contains('is-flat') || project24Scatter.classList.contains('is-focus')) return;
      const deltaX = event.clientX - scatterPointerX;
      const deltaY = event.clientY - scatterPointerY;
      const now = performance.now();
      const elapsed = Math.max(8, now - scatterLastPointerTime);
      if (Math.abs(deltaX) + Math.abs(deltaY) > 3) scatterMoved = true;
      scatterRotationY += deltaX * .22;
      scatterRotationX = Math.max(-62, Math.min(62, scatterRotationX - deltaY * .18));
      scatterVelocityX = (deltaX * .22) * (16.67 / elapsed);
      scatterVelocityY = (-deltaY * .18) * (16.67 / elapsed);
      scatterPointerX = event.clientX;
      scatterPointerY = event.clientY;
      scatterLastPointerTime = now;
      requestScatterSphere();
    });
    project24Scatter.addEventListener('pointerup', (event) => {
      if (!scatterDragging) return;
      scatterDragging = false;
      project24Scatter.classList.remove('is-dragging');
      if (project24Scatter.hasPointerCapture(event.pointerId)) project24Scatter.releasePointerCapture(event.pointerId);
      if (project24Scatter.classList.contains('is-flat') || project24Scatter.classList.contains('is-focus')) setProject24ScatterSelection(null);
      else if (!scatterMoved) {
        scatterAutoRotating = !scatterAutoRotating;
        scatterVelocityX = 0;
        scatterVelocityY = 0;
      } else {
        scatterAutoRotating = true;
      }
      requestScatterSphere();
    });
  }

  const clamp01 = (value) => Math.max(0, Math.min(1, value));
  const smoothStep = (value) => {
    const progress = clamp01(value);
    return progress * progress * (3 - 2 * progress);
  };
  const syncProject24Story = () => {
    project24StoryFrame = undefined;
    if (!project24Story || !project24StoryFrames.length) return;

    if (reducedMotion.matches) {
      project24StoryFrames.forEach((frame) => {
        frame.style.removeProperty('opacity');
        frame.style.removeProperty('transform');
        frame.style.removeProperty('z-index');
      });
      project24ScatterItems.forEach((item) => {
        item.tabIndex = 0;
        item.style.removeProperty('--scatter-item-opacity');
        item.style.removeProperty('--scatter-item-scale');
      });
      return;
    }

    const storyTop = window.scrollY + project24Story.getBoundingClientRect().top;
    const travel = Math.max(1, project24Story.offsetHeight - window.innerHeight);
    const progress = clamp01((window.scrollY - storyTop) / travel);
    const position = progress * (project24StoryFrames.length - 1);

    project24StoryFrames.forEach((frame, index) => {
      const distance = index - position;
      let opacity = 0;
      let scale = .72;

      if (distance <= 0 && distance >= -1) {
        const exitProgress = -distance;
        const depthEase = 1 - Math.pow(1 - exitProgress, 4);
        scale = 1 - .48 * depthEase;
        opacity = 1 - smoothStep((exitProgress - .06) / .76);
      } else if (distance > 0 && distance <= 1) {
        const enterProgress = 1 - distance;
        const settleEase = 1 - Math.pow(1 - enterProgress, 5);
        scale = .72 + .28 * settleEase;
        opacity = smoothStep((enterProgress - .04) / .66);
      }

      frame.style.opacity = opacity.toFixed(4);
      frame.style.transform = `scale(${scale.toFixed(4)})`;
      frame.style.zIndex = String(index + 1);
      frame.style.pointerEvents = 'none';
    });
  };
  const requestProject24Story = () => {
    if (project24StoryFrame) return;
    project24StoryFrame = requestAnimationFrame(syncProject24Story);
  };
  if (project24Story) {
    window.addEventListener('scroll', requestProject24Story, { passive: true });
    window.addEventListener('resize', requestProject24Story, { passive: true });
    document.addEventListener('visibilitychange', requestProject24Story);
    syncProject24Story();
  }

  const syncBrandScatterStory = () => {
    brandScatterStoryFrame = undefined;
    if (!brandScatterStory || brandScatterFrames.length !== 3) return;
    if (reducedMotion.matches) {
      brandScatterFrames.forEach((frame) => {
        frame.style.removeProperty('opacity');
        frame.style.removeProperty('transform');
      });
      project24ScatterItems.forEach((item) => {
        item.tabIndex = 0;
        item.style.removeProperty('--scatter-item-opacity');
        item.style.removeProperty('--scatter-item-scale');
      });
      return;
    }
    const storyTop = window.scrollY + brandScatterStory.getBoundingClientRect().top;
    const travel = Math.max(1, brandScatterStory.offsetHeight - window.innerHeight);
    const progress = clamp01((window.scrollY - storyTop) / travel);
    const sphereProgress = clamp01(progress / .58);
    const introExitEase = 1 - Math.pow(1 - sphereProgress, 4);
    const sphereEnterEase = 1 - Math.pow(1 - sphereProgress, 5);
    const sphereExit = clamp01((progress - .75) / .20);
    const sphereExitEase = smoothStep(sphereExit);
    const sphereFade = smoothStep(clamp01((sphereExit - .24) / .76));
    const videoEnter = clamp01((progress - .84) / .14);
    const videoEnterEase = 1 - Math.pow(1 - videoEnter, 3);
    brandScatterFrames[0].style.opacity = (1 - smoothStep((sphereProgress - .04) / .72)).toFixed(4);
    brandScatterFrames[0].style.transform = `scale(${(1 - .48 * introExitEase).toFixed(4)})`;
    brandScatterFrames[0].style.pointerEvents = 'none';
    brandScatterFrames[1].style.opacity = (smoothStep((sphereProgress - .025) / .54) * (1 - sphereFade)).toFixed(4);
    brandScatterFrames[1].style.transform = `scale(${((.7 + .3 * sphereEnterEase) * (1 + .86 * sphereExitEase)).toFixed(4)})`;
    brandScatterFrames[1].style.pointerEvents = sphereProgress > .55 && sphereExit < .08 ? 'auto' : 'none';
    brandScatterFrames[2].style.opacity = smoothStep((videoEnter - .015) / .58).toFixed(4);
    brandScatterFrames[2].style.transform = `translate3d(0, 0, 0) scale(${(.62 + .38 * videoEnterEase).toFixed(4)})`;
    brandScatterFrames[2].style.pointerEvents = videoEnter > .72 ? 'auto' : 'none';
    project24ScatterItems.forEach((item, index) => {
      const delay = (index % 7) * .012;
      const itemProgress = clamp01((sphereProgress - .025 - delay) / .48);
      const itemEase = 1 - Math.pow(1 - itemProgress, 4);
      item.style.setProperty('--scatter-item-opacity', smoothStep(itemProgress).toFixed(4));
      item.style.setProperty('--scatter-item-scale', (.62 + .38 * itemEase).toFixed(4));
      item.tabIndex = sphereProgress > .72 && sphereExit < .08 ? 0 : -1;
    });
    project24ScatterVideos.forEach((video) => {
      if (sphereProgress > .38 && sphereExit < .75 && document.visibilityState === 'visible') video.play().catch(() => {});
      else video.pause();
    });
  };
  const requestBrandScatterStory = () => {
    if (brandScatterStoryFrame) return;
    brandScatterStoryFrame = requestAnimationFrame(syncBrandScatterStory);
  };
  if (brandScatterStory) {
    window.addEventListener('scroll', requestBrandScatterStory, { passive: true });
    window.addEventListener('resize', requestBrandScatterStory, { passive: true });
    document.addEventListener('visibilitychange', requestBrandScatterStory);
    syncBrandScatterStory();
  }
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
    const homeGroups = [...revealGroups.entries()]
      .filter(([name]) => name.startsWith('work-stage-') || name.startsWith('home-'))
      .sort(([left], [right]) => {
        const stageOrder = { 'work-stage-hero': -2, 'work-stage-showcase': -1 };
        const leftOrder = stageOrder[left] ?? Number(left.slice(5));
        const rightOrder = stageOrder[right] ?? Number(right.slice(5));
        return leftOrder - rightOrder;
      });
    if (!homeGroups.length) return;

    const viewportCenter = window.innerHeight * .5;
    const activeName = homeGroups.reduce((closest, [name, group]) => {
      const rects = group.map((item) => item.getBoundingClientRect());
      const top = Math.min(...rects.map((rect) => rect.top));
      const bottom = Math.max(...rects.map((rect) => rect.bottom));
      const distance = Math.abs((top + bottom) * .5 - viewportCenter);
      return !closest || distance < closest.distance ? { name, distance } : closest;
    }, null)?.name;
    const activeIndex = homeGroups.findIndex(([name]) => name === activeName);
    homeGroups.forEach(([name, group], groupIndex) => {
      group.forEach((item) => {
        item.classList.toggle('is-revealed', name === activeName);
        item.classList.toggle('is-retreating', groupIndex < activeIndex);
      });
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

    if (body.classList.contains('work-page')) {
      const hero = document.querySelector('.home-feature');
      const showcaseStage = [...document.querySelectorAll('.work-intro, .type-showcase')];
      if (hero) addRevealGroup('work-stage-hero', [hero]);
      if (showcaseStage.length) addRevealGroup('work-stage-showcase', showcaseStage);
    }

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

        if (body.classList.contains('work-page') && (
          entry.target.classList.contains('project-card') ||
          entry.target.dataset.revealGroup?.startsWith('work-stage-')
        )) {
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
    requestProject24Story();
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
