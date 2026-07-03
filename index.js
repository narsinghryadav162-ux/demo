/* ==========================================================================
   Aurelia Residences - Client-side Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. SYSTEM PRELOADER
  const preloader = document.getElementById('preloader');
  const loaderProgress = document.getElementById('loader-progress');
  const loaderStatus = document.getElementById('loader-status');
  
  const loadingPhrases = [
    "Aligning golden facades...",
    "Polishing Italian Carrara marble...",
    "Synthesizing panoramic skylines...",
    "Calibrating private lift shafts...",
    "Readying the digital concierge..."
  ];

  let progress = 0;
  let phraseIndex = 0;
  
  const progressInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      setTimeout(() => {
        preloader.classList.add('loaded');
        initScrollAnimations();
      }, 500);
    }
    
    loaderProgress.style.width = `${progress}%`;
    
    // Periodically change loading status text
    if (progress % 25 === 0 || progress % 23 === 0) {
      phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
      loaderStatus.textContent = loadingPhrases[phraseIndex];
    }
  }, 100);

  // 2. MOBILE MENU WIDGET
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-item, .mobile-cta');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
    });
  });

  // Sticky header on scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 3. GSAP SCROLL STORY WALKTHROUGH & SITE REVEALS
  function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    const scenesCount = 9;

    // Set initial states for all scene backgrounds and cards in GSAP
    gsap.set(".scene-bg", { opacity: 0, scale: 1.3, filter: "blur(15px)" });
    gsap.set(".scene-card", { opacity: 0, y: 100, filter: "blur(10px)" });
    
    // Except Scene 1, which starts visible
    gsap.set("#scene-bg-1", { opacity: 1, scale: 1.02, filter: "blur(0px)" });
    gsap.set("#trigger-scene-1 .scene-card", { opacity: 1, y: 0, filter: "blur(0px)" });

    // Main timeline with ScrollTrigger
    const mainTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#walkthrough-section",
        start: "top top",
        end: `+=${scenesCount * 150}vh`, // Generous scroll height for smooth pacing
        pin: true,
        scrub: 1.2,
        onUpdate: (self) => {
          // Update radial progress bar stroke
          const percent = self.progress * 100;
          const radialBar = document.getElementById('radial-progress-bar');
          if (radialBar) {
            radialBar.style.strokeDasharray = `${percent}, 100`;
          }
          
          // Determine current scene index dynamically
          const activeSceneIndex = Math.min(
            Math.floor(self.progress * (scenesCount + 0.5)) + 1,
            scenesCount
          );
          const numDisplay = document.getElementById('current-scene-num');
          if (numDisplay) {
            numDisplay.textContent = `0${activeSceneIndex}`;
          }
        }
      }
    });

    // 0. Intro Overlay fade out (occurs at the very start of scroll)
    const introOverlay = document.getElementById('hero-intro');
    if (introOverlay) {
      mainTimeline.to(introOverlay, {
        opacity: 0,
        scale: 1.05,
        filter: "blur(10px)",
        pointerEvents: "none",
        duration: 0.8
      });
      // Slide up the first card as intro fades out
      mainTimeline.fromTo("#trigger-scene-1 .scene-card", 
        { opacity: 0, y: 50, filter: "blur(5px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4 },
        "-=0.4"
      );
    }

    // Loop to build transitions between scenes
    for (let i = 1; i < scenesCount; i++) {
      const currentBg = `#scene-bg-${i}`;
      const nextBg = `#scene-bg-${i + 1}`;
      const currentCard = `#trigger-scene-${i} .scene-card`;
      const nextCard = `#trigger-scene-${i + 1} .scene-card`;

      // Insert transition block in timeline
      const transitionTime = `scene-transition-${i}`;
      mainTimeline.addLabel(transitionTime);

      // Current scene zooms out and blurs away
      mainTimeline.to(currentBg, {
        opacity: 0,
        scale: 1.3,
        filter: "blur(15px)",
        duration: 1
      }, transitionTime);
      
      mainTimeline.to(currentCard, {
        opacity: 0,
        y: -100,
        filter: "blur(10px)",
        duration: 0.8
      }, transitionTime);

      // Next scene zooms in from blur
      mainTimeline.to(nextBg, {
        opacity: 1,
        scale: 1.02,
        filter: "blur(0px)",
        duration: 1
      }, transitionTime);

      mainTimeline.to(nextCard, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8
      }, `${transitionTime}+=0.2`); // Stagger card appearance slightly
    }

    // Site-wide Scroll Reveal Animations using GSAP ScrollTrigger
    const reveals = document.querySelectorAll('.section-header, .fp-luxury-badge, .comparison-table, .vt-viewport, .timeline-node, .calculator-grid, .booking-contact-wrapper, .faq-card, .developer-grid');
    
    reveals.forEach(el => {
      gsap.fromTo(el, 
        { opacity: 0, y: 40, filter: "blur(5px)" },
        { 
          opacity: 1, 
          y: 0, 
          filter: "blur(0px)",
          duration: 1, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%", // Starts when element is 85% from top of viewport
            toggleActions: "play none none none"
          }
        }
      );
    });

    // Staggered reveal for grids
    const staggerGrids = [
      { container: ".property-carousel-track", items: ".property-card" },
      { container: ".gallery-grid", items: ".gallery-item" },
      { container: ".amenities-grid", items: ".amenity-card" }
    ];
    
    staggerGrids.forEach(grid => {
      const containerEl = document.querySelector(grid.container);
      if (containerEl) {
        gsap.fromTo(containerEl.querySelectorAll(grid.items),
          { opacity: 0, y: 50, filter: "blur(5px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.2,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerEl,
              start: "top 80%"
            }
          }
        );
      }
    });
  }

  // Mouse move follow lighting effect in cinematic viewer
  const viewer = document.querySelector('.cinematic-viewer');
  const glowMask = document.getElementById('glow-mask');
  
  if (viewer && glowMask) {
    viewer.addEventListener('mousemove', (e) => {
      const rect = viewer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glowMask.style.background = `radial-gradient(circle 350px at ${x}px ${y}px, rgba(255, 255, 255, 0.08), transparent 70%)`;
    });
  }

  // 4. PROPERTY CAROUSEL
  const carouselTrack = document.getElementById('property-carousel');
  const btnPrev = document.getElementById('prop-prev');
  const btnNext = document.getElementById('prop-next');
  
  if (carouselTrack && btnPrev && btnNext) {
    let scrollPos = 0;
    
    btnNext.addEventListener('click', () => {
      const cardWidth = document.querySelector('.property-card').offsetWidth + 32; // width + gap
      const maxScroll = carouselTrack.scrollWidth - carouselTrack.offsetWidth;
      scrollPos = Math.min(scrollPos + cardWidth, maxScroll);
      carouselTrack.style.transform = `translateX(-${scrollPos}px)`;
    });

    btnPrev.addEventListener('click', () => {
      const cardWidth = document.querySelector('.property-card').offsetWidth + 32;
      scrollPos = Math.max(scrollPos - cardWidth, 0);
      carouselTrack.style.transform = `translateX(-${scrollPos}px)`;
    });
  }

  // 5. INTERACTIVE FLOOR PLANS WIDGET
  const floorplanZones = document.querySelectorAll('.floorplan-zone');
  const fpRoomName = document.getElementById('fp-room-name');
  const fpRoomSize = document.getElementById('fp-room-size');
  const fpRoomFinish = document.getElementById('fp-room-finish');
  const fpRoomCeiling = document.getElementById('fp-room-ceiling');
  const fpSelectedCode = document.getElementById('fp-selected-code');

  const floorPlanDetails = {
    "zone-master-bedroom": {
      name: "Master Suite Sanctuary",
      size: "1,200 Sq.Ft",
      finish: "Polished Italian Walnut & Gilded Champagne Silk Panels",
      ceiling: "3.8 Meters, Integrated Cove Accent Lighting"
    },
    "zone-master-bath": {
      name: "Ensuite Master Bathroom",
      size: "450 Sq.Ft",
      finish: "Statuary Bookmatched Marble & Gold Dornbracht Fixtures",
      ceiling: "3.2 Meters, Custom Glass Sky Dome Ceiling Skylight"
    },
    "zone-living-hall": {
      name: "Grand Living Great Hall",
      size: "2,800 Sq.Ft",
      finish: "Premium Extra-White Calacatta Gold Marble & Acoustic Oak Slats",
      ceiling: "6.2 Meters, Double Height Arching Vault"
    },
    "zone-dining": {
      name: "Private Dining Salon",
      size: "950 Sq.Ft",
      finish: "Chevron Brushed Light Oak Floors & Decorative Gold Leaves Trim",
      ceiling: "4.2 Meters, Plaster Finish with Suspended Pendant Rails"
    },
    "zone-kitchen": {
      name: "Professional Modular Kitchen",
      size: "600 Sq.Ft",
      finish: "Tuscan Travertine Island Countertops & Matte Lacquered Oak Cabinets",
      ceiling: "3.5 Meters, Concealed High-Output Induction Ventilations"
    },
    "zone-terrace": {
      name: "Private Sky Deck & Pool",
      size: "2,500 Sq.Ft",
      finish: "Acid-washed Non-Slip Travertine Slab & Structural Glass Railings",
      ceiling: "Infinite, Open Sky Parapet"
    },
    "zone-guest-suite": {
      name: "VIP Guest Suite",
      size: "700 Sq.Ft",
      finish: "Smooth Silk Wall coverings & Teak Wood Solid Parquet",
      ceiling: "3.5 Meters, Cove Lighting Systems"
    }
  };

  // Hover animations & descriptions updates
  floorplanZones.forEach(zone => {
    zone.addEventListener('mouseenter', () => {
      const zoneId = zone.id;
      const data = floorPlanDetails[zoneId];
      
      floorplanZones.forEach(z => z.classList.remove('active'));
      zone.classList.add('active');

      if (data) {
        // Slide / fade animation text update
        fpRoomName.style.opacity = 0;
        fpRoomSize.style.opacity = 0;
        fpRoomFinish.style.opacity = 0;
        fpRoomCeiling.style.opacity = 0;
        
        setTimeout(() => {
          fpRoomName.textContent = data.name;
          fpRoomSize.textContent = data.size;
          fpRoomFinish.textContent = data.finish;
          fpRoomCeiling.textContent = data.ceiling;
          fpSelectedCode.textContent = zoneId.replace('zone-', 'AURELIA - ').toUpperCase();
          
          fpRoomName.style.opacity = 1;
          fpRoomSize.style.opacity = 1;
          fpRoomFinish.style.opacity = 1;
          fpRoomCeiling.style.opacity = 1;
        }, 150);
      }
    });
  });

  // Switch layouts on floor plan buttons
  const fpToggleButtons = document.querySelectorAll('.fp-toggle-btn');
  fpToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      fpToggleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // In a real app we'd load separate SVG shapes, here we just change values to represent different pricing suites
      const planCode = btn.getAttribute('data-plan');
      if (planCode === 'skyvilla') {
        document.getElementById('zone-master-bedroom').setAttribute('data-size', '1,050 Sq.Ft');
        document.getElementById('zone-living-hall').setAttribute('data-size', '2,200 Sq.Ft');
      } else if (planCode === 'duplex') {
        document.getElementById('zone-master-bedroom').setAttribute('data-size', '900 Sq.Ft');
        document.getElementById('zone-living-hall').setAttribute('data-size', '1,800 Sq.Ft');
      } else {
        document.getElementById('zone-master-bedroom').setAttribute('data-size', '1,200 Sq.Ft');
        document.getElementById('zone-living-hall').setAttribute('data-size', '2,800 Sq.Ft');
      }
    });
  });

  // 6. 360° VIRTUAL PANORAMIC TOUR MOCK WITH INERTIA
  const vtViewport = document.getElementById('vt-viewport-window');
  const vtPanorama = document.getElementById('vt-panorama-track');
  const vtToast = document.getElementById('vt-toast');
  const vtToastClose = document.getElementById('vt-toast-close');
  const vtToastBody = document.getElementById('vt-toast-body');

  if (vtViewport && vtPanorama) {
    let isDragging = false;
    let startX = 0;
    let targetPan = 0;
    let currentPan = 0;
    let lastX = 0;
    let velocity = 0;
    
    // VISCOUS INERTIA ANIMATION LOOP
    function animateInertia() {
      // Interpolate position
      currentPan += (targetPan - currentPan) * 0.12; // Damping factor
      
      // Clamp bounds
      const viewportWidth = vtViewport.offsetWidth;
      const panoWidth = vtPanorama.offsetWidth;
      const maxPan = -(panoWidth - viewportWidth);
      
      if (currentPan > 0) {
        currentPan = 0;
        targetPan = 0;
      } else if (currentPan < maxPan) {
        currentPan = maxPan;
        targetPan = maxPan;
      }
      
      vtPanorama.style.transform = `translateX(${currentPan}px)`;
      requestAnimationFrame(animateInertia);
    }
    
    // Start loop
    requestAnimationFrame(animateInertia);
    
    // Drag panning
    vtViewport.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - targetPan;
      lastX = e.clientX;
      velocity = 0;
      vtViewport.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        vtViewport.style.cursor = 'grab';
        // Add velocity momentum on release
        targetPan += velocity * 5;
      }
    });

    vtViewport.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = e.clientX - startX;
      velocity = e.clientX - lastX;
      lastX = e.clientX;
      targetPan = x;
    });

    // Touch support
    vtViewport.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX - targetPan;
      lastX = e.touches[0].clientX;
      velocity = 0;
    });

    window.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        targetPan += velocity * 5;
      }
    });

    vtViewport.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const x = e.touches[0].clientX - startX;
      velocity = e.touches[0].clientX - lastX;
      lastX = e.touches[0].clientX;
      targetPan = x;
    });

    // Hotspots clicking
    const hotspots = document.querySelectorAll('.vt-hotspot');
    hotspots.forEach(hotspot => {
      hotspot.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid triggering grab
        const tipText = hotspot.getAttribute('data-tip');
        vtToastBody.textContent = tipText;
        vtToast.classList.add('active');
      });
    });

    vtToastClose.addEventListener('click', () => {
      vtToast.classList.remove('active');
    });
  }

  // 7. PHOTO GALLERY CATEGORY FILTERING & LIGHTBOX
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let activeGalleryArr = [];
  let currentImgIndex = 0;

  // Filtering Logic
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      
      galleryItems.forEach(item => {
        if (filter === 'all' || item.classList.contains(filter)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox Logic
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
      activeGalleryArr = Array.from(galleryItems).filter(el => {
        return activeFilter === 'all' || el.classList.contains(activeFilter);
      });
      
      currentImgIndex = activeGalleryArr.indexOf(item);
      openLightbox(item);
    });
  });

  function openLightbox(item) {
    const src = item.getAttribute('data-src');
    const alt = item.querySelector('img').getAttribute('alt');
    
    lightboxImg.src = src;
    lightboxCaption.textContent = alt;
    lightbox.classList.add('active');
  }

  lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
  });

  lightboxNext.addEventListener('click', () => {
    currentImgIndex = (currentImgIndex + 1) % activeGalleryArr.length;
    openLightbox(activeGalleryArr[currentImgIndex]);
  });

  lightboxPrev.addEventListener('click', () => {
    currentImgIndex = (currentImgIndex - 1 + activeGalleryArr.length) % activeGalleryArr.length;
    openLightbox(activeGalleryArr[currentImgIndex]);
  });

  // 8. INTERACTIVE LOCATION MAP (LEAFLET.JS)
  const mapLoader = document.getElementById('map-loader');
  const poiItems = document.querySelectorAll('.poi-item');
  let map;

  if (document.getElementById('leaflet-map-container')) {
    // Map initial configuration (Manhattan high-end coordinates)
    const towerLat = 40.7580;
    const towerLng = -73.9855;

    map = L.map('leaflet-map-container', {
      center: [towerLat, towerLng],
      zoom: 14,
      scrollWheelZoom: false,
      zoomControl: true
    });

    // Custom dark-theme map styles (CartoDB Dark Matter tiles)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB'
    }).addTo(map);

    // Custom Icon for Aurelia Residences
    const aureliaIcon = L.divIcon({
      className: 'aurelia-map-marker',
      html: `<div class="marker-pin-gold"><i class="fa-solid fa-hotel"></i></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    // Tower Marker
    L.marker([towerLat, towerLng], { icon: aureliaIcon })
      .addTo(map)
      .bindPopup(`<strong style="color:#D4AF37;">Aurelia Residences</strong><br>The Pinnacle of Luxury Living`)
      .openPopup();

    // Map loaded callback
    map.whenReady(() => {
      mapLoader.classList.add('fade-out');
    });

    // Interactive POI items clicking
    poiItems.forEach(item => {
      item.addEventListener('click', () => {
        poiItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const lat = parseFloat(item.getAttribute('data-lat'));
        const lng = parseFloat(item.getAttribute('data-lng'));
        const title = item.querySelector('h5').textContent;
        const desc = item.getAttribute('data-desc');

        // Pan map smooth
        map.panTo([lat, lng], { animate: true, duration: 1 });

        // Add transient marker popup
        const tempIcon = L.divIcon({
          className: 'poi-map-marker',
          html: `<div class="marker-pin-poi"><i class="fa-solid fa-location-crosshairs"></i></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });

        const popup = L.popup()
          .setLatLng([lat, lng])
          .setContent(`<strong style="color:#D4AF37; font-family:'Cormorant Garamond',serif; font-size: 1.1rem;">${title}</strong><br><span style="font-size:0.75rem; color:#aaa; line-height:1.4;">${desc}</span>`)
          .openOn(map);
      });
    });
  }

  // 9. MORTGAGE EMI CALCULATOR
  const valProp = document.getElementById('prop-value');
  const valDown = document.getElementById('down-payment');
  const valRate = document.getElementById('interest-rate');
  const valTerm = document.getElementById('loan-term');

  const txtProp = document.getElementById('prop-value-txt');
  const txtDown = document.getElementById('down-payment-txt');
  const txtRate = document.getElementById('interest-rate-txt');
  const txtTerm = document.getElementById('loan-term-txt');

  const txtEMI = document.getElementById('monthly-emi-txt');
  const txtFinanced = document.getElementById('financed-amt-txt');
  const txtInterest = document.getElementById('interest-amt-txt');
  const txtTotalRepay = document.getElementById('total-repayment-txt');

  const chartPrincipalSegment = document.getElementById('chart-principal-segment');
  const chartInterestSegment = document.getElementById('chart-interest-segment');

  if (valProp && valDown && valRate && valTerm) {
    
    function calculateMortgage() {
      const price = parseFloat(valProp.value);
      
      // Update Down Payment max/min attributes dynamically
      valDown.max = price * 0.8;
      valDown.min = price * 0.1;
      
      let down = parseFloat(valDown.value);
      if (down > valDown.max) down = valDown.max;
      if (down < valDown.min) down = valDown.min;

      const rate = parseFloat(valRate.value) / 100 / 12; // Monthly rate
      const termMonths = parseInt(valTerm.value) * 12; // Loan term months
      
      const principal = price - down;
      
      // EMI formula
      let emi = 0;
      if (rate > 0) {
        emi = (principal * rate * Math.pow(1 + rate, termMonths)) / (Math.pow(1 + rate, termMonths) - 1);
      } else {
        emi = principal / termMonths;
      }

      const totalRepay = emi * termMonths;
      const totalInterest = totalRepay - principal;
      const estMonthlyInterest = totalInterest / termMonths;

      // Update text details
      txtProp.textContent = formatCurrency(price);
      txtDown.textContent = `${formatCurrency(down)} (${Math.round((down/price)*100)}%)`;
      txtRate.textContent = `${valRate.value}%`;
      txtTerm.textContent = `${valTerm.value} Years`;

      txtEMI.textContent = formatCurrency(Math.round(emi));
      txtFinanced.textContent = formatCurrency(principal);
      txtInterest.textContent = formatCurrency(Math.round(estMonthlyInterest));
      txtTotalRepay.textContent = formatCurrency(Math.round(totalRepay));

      // Update SVG donut chart segments
      const principalRatio = principal / totalRepay;
      const interestRatio = totalInterest / totalRepay;
      
      const circumference = 2 * Math.PI * 70; // r=70 -> 440 circumference
      const principalStroke = circumference * principalRatio;
      const interestStroke = circumference * interestRatio;

      chartPrincipalSegment.style.strokeDasharray = `${principalStroke} ${circumference}`;
      chartInterestSegment.style.strokeDasharray = `${interestStroke} ${circumference}`;
      chartInterestSegment.style.strokeDashoffset = `-${principalStroke}`;
    }

    function formatCurrency(val) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(val);
    }

    // Attach listeners
    valProp.addEventListener('input', calculateMortgage);
    valDown.addEventListener('input', calculateMortgage);
    valRate.addEventListener('input', calculateMortgage);
    valTerm.addEventListener('input', calculateMortgage);

    // Initial run
    calculateMortgage();
  }

  // 10. SITE VISIT BOOKING SUBMISSION
  const bookingForm = document.getElementById('visit-booking-form');
  const bookingSuccess = document.getElementById('booking-success');
  const closeSuccessBtn = document.getElementById('close-success-btn');
  const slotButtons = document.querySelectorAll('.slot-btn');
  let selectedSlot = "Morning (09:00 AM - 12:00 PM)";

  slotButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      slotButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedSlot = btn.getAttribute('data-slot');
    });
  });

  if (bookingForm && bookingSuccess && closeSuccessBtn) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('visit-name').value;
      const email = document.getElementById('visit-email').value;
      const phone = document.getElementById('visit-phone').value;
      const date = document.getElementById('visit-date').value;

      // Simulate network request
      setTimeout(() => {
        bookingSuccess.classList.add('active');
      }, 300);
    });

    closeSuccessBtn.addEventListener('click', () => {
      bookingSuccess.classList.remove('active');
      bookingForm.reset();
    });
  }

  // 11. FAQ ACCORDION OPEN/CLOSE
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const card = question.parentElement;
      const answer = card.querySelector('.faq-answer');
      const isOpen = card.classList.contains('open');

      // Close all other accordions
      document.querySelectorAll('.faq-card').forEach(c => {
        c.classList.remove('open');
        c.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        card.classList.add('open');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });

  // 12. WHATSAPP CHAT CHANNELS WIDGET
  const waBubble = document.getElementById('wa-bubble-btn');
  const waWindow = document.getElementById('wa-window');
  const waClose = document.getElementById('wa-window-close');

  if (waBubble && waWindow && waClose) {
    waBubble.addEventListener('click', () => {
      waWindow.classList.add('active');
    });

    waClose.addEventListener('click', () => {
      waWindow.classList.remove('active');
    });
  }

  // 13. Subtle 3D Card tilt effect (Card hover animations)
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const tiltX = (y - centerY) / 10;
      const tiltY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

});
