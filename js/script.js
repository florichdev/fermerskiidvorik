document.addEventListener('DOMContentLoaded', () => {
  initsializirovatShapku();
  initsializirovatGlavnyFona();
  initsializirovatSlayderyDomov();
  initsializirovatZooSlayder();
  initsializirovatSlayderOtzyvov();
  initsializirovatGalereyu();
  initsializirovatAkkordeon();
  initsializirovatKnopkuVverh();
  initsializirovatBronirovanieFreym();
});

/* 1. ШАПКА И НАВИГАЦИЯ */
function initsializirovatShapku() {
  const shapka = document.getElementById('glavnaya-shapka');
  const burger = document.getElementById('knopka-burger');
  const menyu = document.getElementById('glavnoe-menyu');
  const ssylkiMenyu = document.querySelectorAll('.menyu__punkt a');

  const priProkrutke = () => {
    if (window.scrollY > 20) {
      shapka.classList.add('shapka--prokrutka');
    } else {
      shapka.classList.remove('shapka--prokrutka');
    }
  };
  window.addEventListener('scroll', priProkrutke, { passive: true });
  priProkrutke();

  if (burger && menyu) {
    burger.addEventListener('click', () => {
      const otkryto = menyu.classList.toggle('aktivno');
      burger.setAttribute('aria-expanded', otkryto ? 'true' : 'false');
      document.body.style.overflow = otkryto ? 'hidden' : '';
    });

    ssylkiMenyu.forEach(ssylka => {
      ssylka.addEventListener('click', () => {
        menyu.classList.remove('aktivno');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
}

/* 2. СЛАЙДЕРЫ ФОТОГРАФИЙ В КАРТОЧКАХ ДОМОВ */
function initsializirovatSlayderyDomov() {
  const kartochkiDomov = document.querySelectorAll('.dom-kartochka');

  kartochkiDomov.forEach(kartochka => {
    const slaydy = kartochka.querySelectorAll('.dom-kartochka__slayd');
    const tochki = kartochka.querySelectorAll('.dom-kartochka__tochka');
    const knopkaNazad = kartochka.querySelector('.dom-kartochka__knopka-strelka--nazad');
    const knopkaVpered = kartochka.querySelector('.dom-kartochka__knopka-strelka--vpered');
    const galereya = kartochka.querySelector('.dom-kartochka__galereya');

    if (!slaydy.length) return;

    let tekushchiyIndeks = 0;

    const pokazatSlayd = (indeks) => {
      if (indeks < 0) indeks = slaydy.length - 1;
      if (indeks >= slaydy.length) indeks = 0;
      tekushchiyIndeks = indeks;

      slaydy.forEach((slayd, i) => {
        slayd.classList.toggle('aktivny', i === tekushchiyIndeks);
      });

      tochki.forEach((tochka, i) => {
        tochka.classList.toggle('aktivna', i === tekushchiyIndeks);
      });
    };

    if (knopkaNazad) {
      knopkaNazad.addEventListener('click', (e) => {
        e.preventDefault();
        pokazatSlayd(tekushchiyIndeks - 1);
      });
    }

    if (knopkaVpered) {
      knopkaVpered.addEventListener('click', (e) => {
        e.preventDefault();
        pokazatSlayd(tekushchiyIndeks + 1);
      });
    }

    tochki.forEach((tochka, idx) => {
      tochka.addEventListener('click', () => {
        pokazatSlayd(idx);
      });
    });

    if (galereya) {
      let touchStartX = 0;
      let touchEndX = 0;

      galereya.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      galereya.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const raznitsa = touchStartX - touchEndX;
        if (Math.abs(raznitsa) > 40) {
          if (raznitsa > 0) {
            pokazatSlayd(tekushchiyIndeks + 1);
          } else {
            pokazatSlayd(tekushchiyIndeks - 1);
          }
        }
      }, { passive: true });
    }
  });
}

/* 2.1. СЛАЙДЕРЫ ФОТОГРАФИЙ В МИНИ-ЗООПАРКЕ И ДЕТСКОЙ ПЛОЩАДКЕ */
function initsializirovatZooSlayder() {
  const kartochki = document.querySelectorAll('.zoo-kartochka');
  if (!kartochki.length) return;

  kartochki.forEach(kartochka => {
    const slaydy = kartochka.querySelectorAll('.zoo-kartochka__slayd');
    if (slaydy.length <= 1) return;

    let tekushchiy = 0;
    let intervalId = null;
    let vZoneVidimosti = false;

    const vpered = () => {
      slaydy[tekushchiy].classList.remove('aktivny');
      tekushchiy = (tekushchiy + 1) % slaydy.length;
      slaydy[tekushchiy].classList.add('aktivny');
    };

    const zapustit = () => {
      if (intervalId || document.hidden || !vZoneVidimosti) return;
      intervalId = setInterval(vpered, 4500);
    };

    const ostanovit = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          vZoneVidimosti = entry.isIntersecting;
          if (vZoneVidimosti) {
            zapustit();
          } else {
            ostanovit();
          }
        });
      }, { threshold: 0.2 });
      observer.observe(kartochka);
    } else {
      vZoneVidimosti = true;
      zapustit();
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        ostanovit();
      } else if (vZoneVidimosti) {
        zapustit();
      }
    });
  });
}

/* 3. СЛАЙДЕР ОТЗЫВОВ ГОСТЕЙ (8 КАРТОЧЕК) */
function initsializirovatSlayderOtzyvov() {
  const dorozhka = document.getElementById('otzyvy-dorozhka');
  const knopkaNazad = document.getElementById('otzyvy-nazad');
  const knopkaVpered = document.getElementById('otzyvy-vpered');
  const tochkiKonteyner = document.getElementById('otzyvy-tochki');

  if (!dorozhka) return;

  const kartochki = dorozhka.querySelectorAll('.otzyv-kartochka');
  if (!kartochki.length) return;

  let tekushchiyIndeks = 0;
  let keshirovannayaShirina = 0;

  const poluchitKolichestvoVidimykh = () => (window.innerWidth <= 900 ? 1 : 2);
  const poluchitMaksimalnyIndeks = () => Math.max(0, kartochki.length - poluchitKolichestvoVidimykh());

  const poluchitShirinuKartochki = () => {
    if (!keshirovannayaShirina && kartochki[0]) {
      keshirovannayaShirina = kartochki[0].offsetWidth;
    }
    return keshirovannayaShirina || 300;
  };

  const poluchitPromezhutok = () => {
    const computedGap = parseFloat(window.getComputedStyle(dorozhka).gap);
    return isNaN(computedGap) ? 24 : computedGap;
  };

  const obnovitTochki = () => {
    if (!tochkiKonteyner) return;
    tochkiKonteyner.innerHTML = '';
    const max = poluchitMaksimalnyIndeks();

    for (let i = 0; i <= max; i++) {
      const tochka = document.createElement('button');
      tochka.type = 'button';
      tochka.className = `otzyvy__tochka ${i === tekushchiyIndeks ? 'aktivna' : ''}`;
      tochka.setAttribute('aria-label', `Перейти к отзыву ${i + 1}`);
      tochka.setAttribute('aria-current', i === tekushchiyIndeks ? 'true' : 'false');
      tochka.addEventListener('click', (e) => {
        e.preventDefault();
        tekushchiyIndeks = i;
        prokrutitSlayder();
      });
      tochkiKonteyner.appendChild(tochka);
    }
  };

  const prokrutitSlayder = () => {
    const max = poluchitMaksimalnyIndeks();
    if (tekushchiyIndeks > max) tekushchiyIndeks = max;
    if (tekushchiyIndeks < 0) tekushchiyIndeks = 0;

    const shirinaKartochki = poluchitShirinuKartochki();
    const promezhutok = poluchitPromezhutok();
    const smeshchenie = tekushchiyIndeks * (shirinaKartochki + promezhutok);

    dorozhka.style.transform = `translateX(-${smeshchenie}px)`;

    const vseTochki = tochkiKonteyner ? tochkiKonteyner.querySelectorAll('.otzyvy__tochka') : [];
    vseTochki.forEach((t, idx) => {
      const aktivna = idx === tekushchiyIndeks;
      t.classList.toggle('aktivna', aktivna);
      t.setAttribute('aria-current', aktivna ? 'true' : 'false');
    });
  };

  if (knopkaNazad) {
    knopkaNazad.addEventListener('click', (e) => {
      e.preventDefault();
      const max = poluchitMaksimalnyIndeks();
      tekushchiyIndeks = tekushchiyIndeks > 0 ? tekushchiyIndeks - 1 : max;
      prokrutitSlayder();
    });
  }

  if (knopkaVpered) {
    knopkaVpered.addEventListener('click', (e) => {
      e.preventDefault();
      const max = poluchitMaksimalnyIndeks();
      tekushchiyIndeks = tekushchiyIndeks < max ? tekushchiyIndeks + 1 : 0;
      prokrutitSlayder();
    });
  }

  let touchStartX = 0;
  let touchEndX = 0;

  dorozhka.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  dorozhka.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      const max = poluchitMaksimalnyIndeks();
      if (diff > 0) {
        tekushchiyIndeks = tekushchiyIndeks < max ? tekushchiyIndeks + 1 : 0;
      } else {
        tekushchiyIndeks = tekushchiyIndeks > 0 ? tekushchiyIndeks - 1 : max;
      }
      prokrutitSlayder();
    }
  }, { passive: true });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      keshirovannayaShirina = 0;
      obnovitTochki();
      prokrutitSlayder();
    }, 150);
  }, { passive: true });

  obnovitTochki();
  prokrutitSlayder();
}

/* 4. ФОТОГАЛЕРЕЯ И ПОЛНОЭКРАННЫЙ ЛАЙТБОКС С ПОДДЕРЖКОЙ ACCESSIBILITY */
function initsializirovatGalereyu() {
  const vkladki = document.querySelectorAll('.galereya__vkladka');
  const elementy = document.querySelectorAll('.galereya__element');

  const oknoProsmotra = document.getElementById('polny-ekran');
  const kartinkaProsmotra = document.getElementById('polny-ekran-kartinka');
  const schetchikProsmotra = document.getElementById('polny-ekran-schetchik');
  const knopkaZakryt = document.getElementById('polny-ekran-zakryt');
  const podlozhka = document.getElementById('polny-ekran-podlozhka');
  const knopkaNazad = document.getElementById('polny-ekran-nazad');
  const knopkaVpered = document.getElementById('polny-ekran-vpered');

  if (!oknoProsmotra) return;

  let tekushchiySpisok = [];
  let tekushchiyIndeks = 0;
  let posledniyAktivnyElement = null;

  function obnovitSoderzhanieProsmotra() {
    const item = tekushchiySpisok[tekushchiyIndeks];
    if (!item) return;

    if (kartinkaProsmotra) {
      kartinkaProsmotra.src = item.src;
      kartinkaProsmotra.alt = item.alt || 'Фото базы отдыха';
    }
    if (schetchikProsmotra) {
      schetchikProsmotra.textContent = `${tekushchiyIndeks + 1} из ${tekushchiySpisok.length}`;
    }
  }

  function sleduyushcheeFoto() {
    if (!tekushchiySpisok.length) return;
    tekushchiyIndeks = (tekushchiyIndeks + 1) % tekushchiySpisok.length;
    obnovitSoderzhanieProsmotra();
  }

  function predydushcheeFoto() {
    if (!tekushchiySpisok.length) return;
    tekushchiyIndeks = (tekushchiyIndeks - 1 + tekushchiySpisok.length) % tekushchiySpisok.length;
    obnovitSoderzhanieProsmotra();
  }

  function zakrytProsmotr() {
    oknoProsmotra.classList.remove('aktivno');
    oknoProsmotra.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (posledniyAktivnyElement && typeof posledniyAktivnyElement.focus === 'function') {
      posledniyAktivnyElement.focus();
    }
  }

  // Универсальное открытие просмотрщика для любых фото на сайте
  window.otkrytUniversalnyProsmotr = function(spisok, nachalnyIndeks = 0) {
    if (!spisok || !spisok.length) return;
    tekushchiySpisok = spisok.map(item => {
      if (typeof item === 'string') return { src: item, alt: 'Фото базы отдыха' };
      if (item instanceof HTMLImageElement) {
        return {
          src: item.currentSrc || item.src,
          alt: item.alt || 'Фото базы отдыха'
        };
      }
      if (item instanceof HTMLElement) {
        const img = item.querySelector('img') || item;
        return {
          src: img ? (img.currentSrc || img.src) : '',
          alt: img ? img.alt : 'Фото базы отдыха'
        };
      }
      return {
        src: item.src || '',
        alt: item.alt || 'Фото базы отдыха'
      };
    }).filter(it => it.src);

    if (!tekushchiySpisok.length) return;
    tekushchiyIndeks = Math.max(0, Math.min(nachalnyIndeks, tekushchiySpisok.length - 1));
    obnovitSoderzhanieProsmotra();

    posledniyAktivnyElement = document.activeElement;
    oknoProsmotra.classList.add('aktivno');
    oknoProsmotra.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (knopkaZakryt) {
      setTimeout(() => knopkaZakryt.focus(), 60);
    }
  };

  // 1. Привязка табов и фильтрации основной галереи
  vkladki.forEach(vkladka => {
    vkladka.addEventListener('click', () => {
      vkladki.forEach(v => {
        v.classList.remove('aktivna');
        v.setAttribute('aria-selected', 'false');
      });
      vkladka.classList.add('aktivna');
      vkladka.setAttribute('aria-selected', 'true');

      const filtr = vkladka.dataset.kategoriya;
      elementy.forEach(el => {
        const kat = el.dataset.kategoriya;
        el.style.display = (filtr === 'vse' || kat === filtr) ? '' : 'none';
      });
    });
  });

  // 2. Клик по фото в основной галерее
  elementy.forEach(el => {
    el.addEventListener('click', () => {
      const vidimye = Array.from(elementy).filter(item => item.style.display !== 'none');
      const idx = vidimye.indexOf(el);
      window.otkrytUniversalnyProsmotr(vidimye, idx !== -1 ? idx : 0);
    });
  });

  // 3. Клик по фото в карточках домиков (A-frame и Сфера)
  document.querySelectorAll('.dom-kartochka').forEach(dom => {
    const slaydImgs = Array.from(dom.querySelectorAll('.dom-kartochka__slayd img'));
    slaydImgs.forEach((img, idx) => {
      img.addEventListener('click', () => {
        window.otkrytUniversalnyProsmotr(slaydImgs, idx);
      });
    });
  });

  // 4. Клик по фото банного чана
  const bannyBlok = document.querySelector('.banny-chan-blok');
  if (bannyBlok) {
    const bannyImgs = Array.from(bannyBlok.querySelectorAll('.banny-chan-blok__galereya img'));
    bannyImgs.forEach((img, idx) => {
      img.addEventListener('click', () => {
        window.otkrytUniversalnyProsmotr(bannyImgs, idx);
      });
    });
  }

  // 5. Клик по фото мини-зоопарка и детской площадки
  document.querySelectorAll('.zoo-kartochka').forEach(zoo => {
    const zooImgs = Array.from(zoo.querySelectorAll('.zoo-kartochka__slayd img'));
    zooImgs.forEach((img, idx) => {
      img.addEventListener('click', () => {
        window.otkrytUniversalnyProsmotr(zooImgs, idx);
      });
    });
  });

  // 6. Клик по фото в блоке «Что рядом» (водопады)
  const ryadomImgs = Array.from(document.querySelectorAll('#chto-ryadom .chto-ryadom__foto img, .chto-ryadom__foto img'));
  const ryadomFotos = Array.from(document.querySelectorAll('#chto-ryadom .chto-ryadom__foto, .chto-ryadom__foto'));
  ryadomFotos.forEach((blok, idx) => {
    blok.style.cursor = 'pointer';
    blok.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      window.otkrytUniversalnyProsmotr(ryadomImgs, idx);
    });
  });

  // 7. Клик по фото в блоке «Атмосфера»
  document.querySelectorAll('.atmosfera__foto-obolochka img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      const vseAtmosfera = Array.from(document.querySelectorAll('.atmosfera__foto-obolochka img'));
      const idx = vseAtmosfera.indexOf(img);
      window.otkrytUniversalnyProsmotr(vseAtmosfera, idx !== -1 ? idx : 0);
    });
  });

  if (knopkaZakryt) knopkaZakryt.addEventListener('click', zakrytProsmotr);
  if (podlozhka) podlozhka.addEventListener('click', zakrytProsmotr);
  if (knopkaVpered) knopkaVpered.addEventListener('click', sleduyushcheeFoto);
  if (knopkaNazad) knopkaNazad.addEventListener('click', predydushcheeFoto);

  // Тач-свайпы для мобильных устройств в лайтбоксе
  let touchStartX = 0;
  let touchEndX = 0;
  oknoProsmotra.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  oknoProsmotra.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) sleduyushcheeFoto();
      else predydushcheeFoto();
    }
  }, { passive: true });

  // Клавиатурная навигация и ловушка фокуса (Focus Trap)
  document.addEventListener('keydown', (e) => {
    if (!oknoProsmotra.classList.contains('aktivno')) return;
    if (e.key === 'Escape') {
      zakrytProsmotr();
      return;
    }
    if (e.key === 'ArrowRight') {
      sleduyushcheeFoto();
      return;
    }
    if (e.key === 'ArrowLeft') {
      predydushcheeFoto();
      return;
    }
    if (e.key === 'Tab') {
      const fokusiruemye = Array.from(oknoProsmotra.querySelectorAll('button:not([disabled])'));
      if (!fokusiruemye.length) return;
      const pervy = fokusiruemye[0];
      const posledniy = fokusiruemye[fokusiruemye.length - 1];
      if (e.shiftKey && document.activeElement === pervy) {
        e.preventDefault();
        posledniy.focus();
      } else if (!e.shiftKey && document.activeElement === posledniy) {
        e.preventDefault();
        pervy.focus();
      }
    }
  });
}

/* 5. АККОРДЕОН ПРАВИЛ ПРОЖИВАНИЯ */
function initsializirovatAkkordeon() {
  const pravila = document.querySelectorAll('.pravilo-element');

  pravila.forEach(pravilo => {
    const knopka = pravilo.querySelector('.pravilo-element__knopka');
    if (!knopka) return;

    knopka.addEventListener('click', () => {
      const byloAktivno = pravilo.classList.contains('aktivno');

      pravila.forEach(p => {
        p.classList.remove('aktivno');
        const k = p.querySelector('.pravilo-element__knopka');
        if (k) k.setAttribute('aria-expanded', 'false');
      });

      if (!byloAktivno) {
        pravilo.classList.add('aktivno');
        knopka.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* 6. АНИМИРОВАННЫЙ ФОН ГЛАВНОГО ЭКРАНА С ЭНЕРГОСБЕРЕЖЕНИЕМ */
function initsializirovatGlavnyFona() {
  const obolochka = document.getElementById('glavniy-ekran-fon');
  if (!obolochka) return;

  const fonaFoto = obolochka.querySelectorAll('.glavniy-ekran__fon-foto');
  if (fonaFoto.length <= 1) return;

  let tekushchiyIndeks = 0;
  let fonInterval = null;
  let vZoneVidimosti = true;

  const peremesitNaSleduyushchiy = () => {
    fonaFoto[tekushchiyIndeks].classList.remove('aktivny');
    tekushchiyIndeks = (tekushchiyIndeks + 1) % fonaFoto.length;
    fonaFoto[tekushchiyIndeks].classList.add('aktivny');
  };

  const zapustitFon = () => {
    if (fonInterval || document.hidden || !vZoneVidimosti) return;
    fonInterval = setInterval(peremesitNaSleduyushchiy, 6000);
  };

  const ostanovitFon = () => {
    if (fonInterval) {
      clearInterval(fonInterval);
      fonInterval = null;
    }
  };

  if ('IntersectionObserver' in window) {
    const fonObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        vZoneVidimosti = entry.isIntersecting;
        if (vZoneVidimosti) {
          zapustitFon();
        } else {
          ostanovitFon();
        }
      });
    }, { threshold: 0.1 });
    fonObserver.observe(obolochka);
  } else {
    zapustitFon();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      ostanovitFon();
    } else if (vZoneVidimosti) {
      zapustitFon();
    }
  });
}

/* 7. КНОПКА ВОЗВРАТА НАВЕРХ */
function initsializirovatKnopkuVverh() {
  const knopkaVverh = document.getElementById('knopka-vverh');
  if (!knopkaVverh) return;

  const priProkrutke = () => {
    if (window.scrollY > 400) {
      knopkaVverh.classList.add('vidima');
    } else {
      knopkaVverh.classList.remove('vidima');
    }
  };

  window.addEventListener('scroll', priProkrutke, { passive: true });
  priProkrutke();

  knopkaVverh.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* 8. ИНТЕГРАЦИЯ И ЗАЩИТА МОДУЛЯ БРОНИРОВАНИЯ (IFRAME FALLBACK) */
function initsializirovatBronirovanieFreym() {
  const freym = document.getElementById('bronirovanie-iframe');
  const zagruzka = document.getElementById('freym-zagruzka');
  const oshibka = document.getElementById('freym-oshibka');
  if (!freym || !zagruzka) return;

  let zagruzheno = false;

  const otmetitZagruzku = () => {
    zagruzheno = true;
    zagruzka.classList.add('skryto');
    if (oshibka) oshibka.classList.remove('vidim');
  };

  const pokazatOshibku = () => {
    if (!zagruzheno) {
      zagruzka.classList.add('skryto');
      if (oshibka) oshibka.classList.add('vidim');
    }
  };

  freym.addEventListener('load', otmetitZagruzku);
  freym.addEventListener('error', pokazatOshibku);

  // Таймаут ожидания загрузки виджета (7.5 секунд)
  setTimeout(() => {
    if (!zagruzheno) {
      if (!navigator.onLine) {
        pokazatOshibku();
      }
    }
  }, 7500);

  window.addEventListener('offline', () => {
    if (!zagruzheno) pokazatOshibku();
  });
}