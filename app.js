(function () {
  'use strict';

  /* ============ TRUE VISIBLE VIEWPORT HEIGHT ============
   * Some mobile browsers (Yandex iOS, in-app webviews, etc.) keep a
   * permanent bottom toolbar that 100vh/100dvh/100svh do NOT account
   * for. We use visualViewport.height to pin the device frame to the
   * actually-visible area so the nowplaying bar, tabbar and popup
   * always sit above any browser chrome.
   */
  function setAppHeight() {
    const h = (window.visualViewport && window.visualViewport.height)
      || window.innerHeight;
    document.documentElement.style.setProperty('--app-h', h + 'px');
  }
  setAppHeight();
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', setAppHeight);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setAppHeight);
    window.visualViewport.addEventListener('scroll', setAppHeight);
  }

  const screens = {
    home:     document.getElementById('screen-home'),
    story:    document.getElementById('screen-story'),
    profile:  document.getElementById('screen-profile'),
    tiers:    document.getElementById('screen-tiers'),
    checkout: document.getElementById('screen-checkout'),
    success:  document.getElementById('screen-success'),
  };
  const overlay = document.getElementById('overlay');
  const history = ['home'];

  function show(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    if (history[history.length - 1] !== name) history.push(name);
    const scroller = screens[name].querySelector('.content, .tiers__list, .checkout, .success, .profile');
    if (scroller) scroller.scrollTop = 0;
  }

  function back() {
    if (history.length > 1) {
      history.pop();
      const prev = history[history.length - 1];
      Object.values(screens).forEach(s => s.classList.remove('active'));
      screens[prev].classList.add('active');
    } else {
      show('home');
    }
  }

  /* ============ POPUP ============ */
  function openPopup() { overlay.classList.add('active'); }
  function closePopup() { overlay.classList.remove('active'); }

  document.getElementById('popupClose').addEventListener('click', closePopup);
  document.getElementById('popupLater').addEventListener('click', closePopup);

  document.getElementById('goTiers').addEventListener('click', () => {
    closePopup();
    show('profile');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });

  /* ============ TIER → CHECKOUT ============ */
  const tierPrices = { essential: '$4.99', insider: '$19.99', inner: '$99.99' };
  const tierNames  = {
    essential: 'SuperFan · Essential',
    insider:   'SuperFan · Insider',
    inner:     'SuperFan · Inner Circle',
  };

  function openCheckout(tier) {
    tier = tier || 'essential';
    document.getElementById('checkoutTierName').textContent = tierNames[tier];
    document.getElementById('checkoutTierPrice').textContent = tierPrices[tier];
    document.getElementById('checkoutTotal').textContent = tierPrices[tier];
    document.getElementById('payAmount').textContent = tierPrices[tier];
    show('checkout');
  }

  /* Any locked post (or its CTA button) on the profile feed → checkout @ $4,99 */
  document.querySelectorAll('.post-locked__cta, .post-locked').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openCheckout('essential');
    });
  });

  /* Legacy tier-selection "Continue" button still works if reached */
  const goCheckoutBtn = document.getElementById('goCheckout');
  if (goCheckoutBtn) {
    goCheckoutBtn.addEventListener('click', () => {
      const sel = document.querySelector('input[name="tier"]:checked');
      openCheckout(sel ? sel.value : 'insider');
    });
  }

  /* ============ CHECKOUT → SUCCESS ============ */
  document.getElementById('goSuccess').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    btn.style.opacity = '.7';
    btn.textContent = 'Processing payment…';
    setTimeout(() => {
      btn.style.opacity = '';
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="margin-right:6px;vertical-align:-3px"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 15-4-4 1.4-1.4L11 14.2l5.6-5.6L18 10z"/></svg>Subscribe for <span id="payAmount">' + document.getElementById('checkoutTotal').textContent + '</span>';
      show('success');
    }, 900);
  });

  /* ============ BACK BUTTONS ============ */
  document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', back));

  document.getElementById('backHome').addEventListener('click', () => {
    show('home');
    history.length = 0;
    history.push('home');
  });

  /* ============ AUTO-OPEN POPUP ============ */
  // Slight delay so the user briefly sees the underlying UI first
  setTimeout(openPopup, 700);

  /* ============ NOWPLAYING tap → reopens popup (extra hook for jury demo) ============ */
  document.getElementById('nowplaying').addEventListener('click', openPopup);

  /* Card tap on the featured mix also opens popup */
  document.getElementById('card-featured').addEventListener('click', openPopup);

  /* ============================================================
     ============ WRAPPED FUNNEL — story carousel ===============
     ============================================================ */

  /* ---------- STORY NAVIGATION ---------- */
  const slides = Array.from(document.querySelectorAll('.slide'));
  const bars   = Array.from(document.querySelectorAll('.story-progress .bar'));
  let slideIdx = 0;

  function renderSlide() {
    slides.forEach((s, i) => s.classList.toggle('active', i === slideIdx));
    bars.forEach((b, i) => {
      b.classList.remove('active', 'done');
      if (i < slideIdx) b.classList.add('done');
      else if (i === slideIdx) b.classList.add('active');
    });
  }
  function nextSlide() { if (slideIdx < slides.length - 1) { slideIdx++; renderSlide(); } }
  function prevSlide() { if (slideIdx > 0) { slideIdx--; renderSlide(); } }

  /* ---------- STORY AUDIO + MUTE ---------- */
  const storyAudio = document.getElementById('storyAudio');
  const muteBtn = document.getElementById('muteStory');
  let storyMuted = false;

  function playStoryAudio() {
    if (!storyAudio) return;
    storyAudio.muted = storyMuted;
    storyAudio.currentTime = 0;
    const p = storyAudio.play();
    if (p && p.catch) p.catch(() => {}); /* iOS autoplay-blocked silent fail */
  }
  function stopStoryAudio() {
    if (!storyAudio) return;
    storyAudio.pause();
    storyAudio.currentTime = 0;
  }
  if (muteBtn) {
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      storyMuted = !storyMuted;
      if (storyAudio) storyAudio.muted = storyMuted;
      muteBtn.classList.toggle('muted', storyMuted);
      muteBtn.setAttribute('aria-label', storyMuted ? 'Unmute' : 'Mute');
    });
  }

  function openStory() {
    closePopup(); /* dismiss the SuperFan invite if it's still open */
    slideIdx = 0;
    renderSlide();
    show('story');
    playStoryAudio();
  }
  function closeStory() {
    stopStoryAudio();
    show('home');
  }

  document.getElementById('openWrapped').addEventListener('click', openStory);
  document.getElementById('closeStory').addEventListener('click', closeStory);
  document.getElementById('tapNext').addEventListener('click', nextSlide);
  document.getElementById('tapPrev').addEventListener('click', prevSlide);

  /* Keyboard nav for desktop preview */
  window.addEventListener('keydown', (e) => {
    if (!screens.story.classList.contains('active')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
    else if (e.key === 'ArrowLeft') prevSlide();
    else if (e.key === 'Escape') closeStory();
  });

  /* Slide 4 "Become SuperFan" → existing profile screen */
  document.getElementById('becomeSuperfan').addEventListener('click', (e) => {
    e.stopPropagation();
    stopStoryAudio();
    show('profile');
  });

  /* Stop tap zones from swallowing CTAs on story slides */
  document.querySelectorAll('.cta-superfan, .share-btn, .story-chrome').forEach(el => {
    el.addEventListener('click', (e) => e.stopPropagation());
  });

  /* ---------- SHARE BUTTON (native share sheet) ---------- */
  const shareBtn = document.querySelector('.share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const data = {
        title: 'My 2026 Wrapped',
        text: "I'm in the top 1% of Playboi Carti's fans this year. Check out my Spotify Wrapped 2026.",
        url: window.location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(data);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(data.url);
          shareBtn.textContent = 'Link copied!';
          setTimeout(() => { shareBtn.textContent = 'Share this story'; }, 1800);
        }
      } catch (_) { /* user cancelled share sheet */ }
    });
  }

})();
