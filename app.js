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
    const scroller = screens[name].querySelector('.content, .tiers__list, .checkout, .success');
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
    show('tiers');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });

  /* ============ TIER → CHECKOUT ============ */
  const tierPrices = { essential: '$4,99', insider: '$19,99', inner: '$99,99' };
  const tierNames  = {
    essential: 'SuperFan · Essential',
    insider:   'SuperFan · Insider',
    inner:     'SuperFan · Inner Circle',
  };

  document.getElementById('goCheckout').addEventListener('click', () => {
    const sel = document.querySelector('input[name="tier"]:checked');
    const tier = sel ? sel.value : 'insider';
    document.getElementById('checkoutTierName').textContent = tierNames[tier];
    document.getElementById('checkoutTierPrice').textContent = tierPrices[tier];
    document.getElementById('checkoutTotal').textContent = tierPrices[tier];
    document.getElementById('payAmount').textContent = tierPrices[tier];
    show('checkout');
  });

  /* ============ CHECKOUT → SUCCESS ============ */
  document.getElementById('goSuccess').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    btn.style.opacity = '.7';
    btn.textContent = 'Обробка платежу…';
    setTimeout(() => {
      btn.style.opacity = '';
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="margin-right:6px;vertical-align:-3px"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 15-4-4 1.4-1.4L11 14.2l5.6-5.6L18 10z"/></svg>Оформити за <span id="payAmount">' + document.getElementById('checkoutTotal').textContent + '</span>';
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

})();
