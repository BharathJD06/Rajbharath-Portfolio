/* ==========================================================================
   RAJBHARATH PARAMASIVAN - 3D INTERACTIVE PORTFOLIO ENGINE
   Senior Video Animator & Motion Designer Script
   Features: Three.js 3D WebGL Nebula, Web Audio SFX, HUD Timecode,
             Interactive Terminal, 23 Project Deep Dive Modals, Theme Engine
   ========================================================================== */

'use strict';

// ── 1. GLOBAL STATE & WEB AUDIO SYNTHESIZER ──
const AppState = {
  soundEnabled: true,
  audioCtx: null,
  currentTheme: 'cyan',
  activeFilter: 'all'
};

function initAudio() {
  if (!AppState.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    AppState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSynthSound(type) {
  if (!AppState.soundEnabled) return;
  try {
    initAudio();
    if (!AppState.audioCtx) return;
    if (AppState.audioCtx.state === 'suspended') {
      AppState.audioCtx.resume();
    }

    const now = AppState.audioCtx.currentTime;
    const osc = AppState.audioCtx.createOscillator();
    const gain = AppState.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(AppState.audioCtx.destination);

    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'term') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'modal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {
    // Graceful fallback if AudioContext restricted
  }
}

// ── 2. THREE.JS 3D WEBGL AMBIENT DATA GALAXY ──
(function initThreeScene() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 32;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle Nebula
  const particleCount = 1400;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const color1 = new THREE.Color(0x00c6ff);
  const color2 = new THREE.Color(0x7c3aed);
  const color3 = new THREE.Color(0x00f2fe);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 85;
    positions[i + 1] = (Math.random() - 0.5) * 85;
    positions[i + 2] = (Math.random() - 0.5) * 60;

    const mixedColor = Math.random() > 0.6 ? color1 : (Math.random() > 0.5 ? color2 : color3);
    colors[i] = mixedColor.r;
    colors[i + 1] = mixedColor.g;
    colors[i + 2] = mixedColor.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Circular soft particle texture
  const particleCanvas = document.createElement('canvas');
  particleCanvas.width = 32;
  particleCanvas.height = 32;
  const pctx = particleCanvas.getContext('2d');
  const gradient = pctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(0,198,255,0.7)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  pctx.fillStyle = gradient;
  pctx.fillRect(0, 0, 32, 32);

  const particleTexture = new THREE.CanvasTexture(particleCanvas);
  const material = new THREE.PointsMaterial({
    size: 0.95,
    vertexColors: true,
    map: particleTexture,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Floating Cyber Wireframe Icosahedron Geometry in Background
  const icoGeom = new THREE.IcosahedronGeometry(10, 2);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x00c6ff,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  });
  const icoMesh = new THREE.Mesh(icoGeom, icoMat);
  icoMesh.position.set(16, 4, -10);
  scene.add(icoMesh);

  // Mouse Parallax
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Responsive resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    targetX += (mouseX - targetX) * 0.03;
    targetY += (mouseY - targetY) * 0.03;

    particleSystem.rotation.y = elapsedTime * 0.03 + targetX * 0.2;
    particleSystem.rotation.x = elapsedTime * 0.015 - targetY * 0.2;

    icoMesh.rotation.x = elapsedTime * 0.05;
    icoMesh.rotation.y = elapsedTime * 0.08;
    icoMesh.position.y = 4 + Math.sin(elapsedTime * 0.6) * 1.5;

    camera.position.x += (targetX * 2 - camera.position.x) * 0.05;
    camera.position.y += (-targetY * 2 - camera.position.y) * 0.05;

    renderer.render(scene, camera);
  }
  animate();
})();

// ── 3. HUD TIMECODE GENERATOR ──
(function initHUDTimecode() {
  const timecodeEl = document.getElementById('hud-timecode');
  if (!timecodeEl) return;

  let frames = 0;
  function updateTimecode() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    frames = (frames + 1) % 60;
    const f = String(frames).padStart(2, '0');
    timecodeEl.textContent = `TC ${h}:${m}:${s}:${f}`;
    requestAnimationFrame(updateTimecode);
  }
  requestAnimationFrame(updateTimecode);
})();

// ── 4. CYBER CURSOR LERP ENGINE ──
(function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Interactive Elements Hover Reaction
  const hoverTargets = document.querySelectorAll('a, button, .project-3d-card, .pillar-card, .tool-pill, .cert-foil-card');
  hoverTargets.forEach((target) => {
    target.addEventListener('mouseenter', () => {
      ring.classList.add('active');
      playSynthSound('hover');
    });
    target.addEventListener('mouseleave', () => {
      ring.classList.remove('active');
    });
    target.addEventListener('click', () => {
      playSynthSound('click');
    });
  });
})();

// ── 5. NAVBAR SCROLL & MOBILE MENU ──
(function initNavigation() {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobLinks = document.querySelectorAll('.mob-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      playSynthSound('click');
    });
    mobLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
      });
    });
  }

  // Audio Toggle
  const audioBtn = document.getElementById('audio-toggle');
  if (audioBtn) {
    const onIcon = audioBtn.querySelector('.audio-on-icon');
    const offIcon = audioBtn.querySelector('.audio-off-icon');
    const soundBars = audioBtn.querySelector('.sound-bars');

    audioBtn.addEventListener('click', () => {
      AppState.soundEnabled = !AppState.soundEnabled;
      if (AppState.soundEnabled) {
        onIcon.classList.remove('hidden');
        offIcon.classList.add('hidden');
        soundBars.style.opacity = '1';
        playSynthSound('click');
      } else {
        onIcon.classList.add('hidden');
        offIcon.classList.remove('hidden');
        soundBars.style.opacity = '0';
      }
    });
  }

  // Theme Cycler
  const themeBtn = document.getElementById('theme-btn');
  const themes = ['cyan', 'emerald', 'synthwave', 'gold'];
  let themeIdx = 0;

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      themeIdx = (themeIdx + 1) % themes.length;
      const selected = themes[themeIdx];
      document.body.setAttribute('data-theme', selected);
      playSynthSound('click');
    });
  }
})();

// ── 6. TYPEWRITER EFFECT ──
(function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el) return;

  const roles = [
    'Business Intelligence & Executive Dashboards',
    'Predictive Analytics & Machine Learning',
    'Healthcare Bias Detection & Fairness AI',
    'SQL Architecture & High-Performance Pipelines',
    'Airline Crew & Operations Optimization',
    'Data-Driven Growth & Process Automation'
  ];

  let rIdx = 0, charIdx = 0;
  let isDeleting = false;
  let delay = 100;

  function type() {
    const current = roles[rIdx];
    if (isDeleting) {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      delay = 40;
    } else {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      delay = 90;
    }

    if (!isDeleting && charIdx === current.length) {
      delay = 2200;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      rIdx = (rIdx + 1) % roles.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }
  type();
})();

// ── 7. ANIMATED STATS COUNTER ──
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        counters.forEach((counter) => {
          const target = +counter.getAttribute('data-target');
          const duration = 1600;
          const step = Math.max(1, Math.floor(target / (duration / 20)));
          let count = 0;

          const timer = setInterval(() => {
            count += step;
            if (count >= target) {
              counter.textContent = target.toLocaleString();
              clearInterval(timer);
            } else {
              counter.textContent = count.toLocaleString();
            }
          }, 20);
        });
      }
    });
  }, { threshold: 0.5 });

  const metricsBar = document.querySelector('.hero-metrics-bar');
  if (metricsBar) observer.observe(metricsBar);
})();

// ── 8. ALL 23 REPOSITORIES METADATA & DEEP DIVE MODAL SYSTEM ──
const PROJECTS_DATABASE = {
  1: {
    title: 'Advanced Sales Market Analysis',
    category: 'Power BI / SQL / Python',
    badge: 'Executive BI',
    desc: 'Multi-dimensional sales trend analysis with predictive forecasting and executive KPI dashboards. Identified revenue expansion opportunities across product hierarchies and regional markets.',
    problem: 'Sales leadership lacked granular visibility into geographic margin leakages and seasonal churn rates across regional branch stores.',
    methodology: 'Integrated multi-table transaction databases using PostgreSQL, engineered RFM customer value matrices, and deployed Power BI dashboards with DAX margin measures.',
    metrics: ['+18% Identified Margin Lift', '5 Dynamic Regional Dashboards', 'Sub-second Query Aggregations'],
    tools: ['Python', 'Power BI', 'PostgreSQL', 'DAX', 'Time Series Forecasting'],
    repo: 'https://github.com/BharathJD06/Advance-Analysis-of-Sales-Market'
  },
  2: {
    title: 'AI Usage & Adoption Analysis',
    category: 'NLP / Machine Learning',
    badge: 'AI Research',
    desc: 'Evaluated enterprise and consumer generative AI adoption trends using Natural Language Processing (NLP) tokenization, sentiment scoring, and interactive Tableau dashboards.',
    problem: 'Understanding market resistance and adoption curves for generative AI tools across varied technological demographics.',
    methodology: 'Scraped and cleansed 15,000+ developer and enterprise discussion logs, performed VADER and RoBERTa sentiment modeling, and mapped cluster adoption trajectories.',
    metrics: ['15K+ Forum Discussions Analyzed', '88% Sentiment Accuracy', '6 Industry Vertical Segments'],
    tools: ['Python', 'NLTK', 'Tableau', 'Scikit-Learn', 'Sentiment Analysis'],
    repo: 'https://github.com/BharathJD06/AI-Usage-Analysis'
  },
  3: {
    title: 'Bank Transaction Fraud & Anomaly Detection',
    category: 'FinTech / Fraud AI',
    badge: 'FinTech Risk',
    desc: 'High-precision machine learning classification and outlier detection identifying fraudulent financial transactions while minimizing false positive alerts.',
    problem: 'Traditional rule-based fraud detection produced excessive false-positive transaction halts, degrading legitimate customer retention.',
    methodology: 'Applied Isolation Forests, Random Forest classifiers, and SMOTE class imbalance handling to identify anomalous transaction vectors in real-time.',
    metrics: ['94.2% Fraud Detection Precision', '32% Reduction in False Flags', 'Over 100K Transactions Evaluated'],
    tools: ['SQL', 'Python', 'Power BI', 'Scikit-Learn', 'SMOTE'],
    repo: 'https://github.com/BharathJD06/Bank-Transaction-Analysis'
  },
  4: {
    title: 'Airline Crew Optimizer (Dantzig-Wolfe)',
    category: 'Operations Research / Optimization',
    badge: 'OR Optimization',
    desc: 'Mathematical linear programming optimization model for airline flight crew scheduling using Dantzig-Wolfe column generation decomposition.',
    problem: 'Airlines waste millions annually on unoptimized deadhead transit and sub-optimal pilot duty time allocation.',
    methodology: 'Formulated a master set-partitioning problem decomposed into restricted sub-problems using Dantzig-Wolfe column generation and Google OR-Tools.',
    metrics: ['22% Reduction in Deadhead Transit Costs', '100% FAA Regulatory Compliance', 'Solves Combinatorial Scale in <45s'],
    tools: ['Python', 'Google OR-Tools', 'Dantzig-Wolfe', 'Linear Programming', 'Math Modeling'],
    repo: 'https://github.com/BharathJD06/CrewOptimizerDW'
  },
  5: {
    title: 'Healthcare Bias Detection & Clinical Analytics',
    category: 'Healthcare AI / Fairness',
    badge: 'Clinical AI',
    desc: 'Audited 10,000+ clinical healthcare records for algorithmic bias and diagnostic disparities, implementing fairness metrics that increased demographic parity by 15–25%.',
    problem: 'Machine learning diagnostic triage models exhibited subtle demographic skew, disproportionately deprioritizing underserved patient cohorts.',
    methodology: 'Executed demographic disparity audits, reweighted sample training weights, and developed fairness mitigation pipelines monitored via AWS QuickSight.',
    metrics: ['10,000+ Clinical Records Evaluated', '15-25% Demographic Parity Improvement', '40% Reporting Cycle Acceleration'],
    tools: ['Python', 'SQL', 'AWS QuickSight', 'Fairness Metrics', 'Clinical Data Validation'],
    repo: 'https://github.com/BharathJD06/Health-Care'
  },
  6: {
    title: 'E-Commerce Funnel & Consumer Behavior',
    category: 'Digital Retail / BI',
    badge: 'Cohort Analysis',
    desc: 'Customer journey analytics, checkout abandonment diagnostics, basket co-purchases, and revenue retention cohort models across multi-channel retail.',
    problem: 'High friction drop-offs during checkout and unclear repeat purchase intervals across varied consumer cohorts.',
    methodology: 'Engineered cohort retention heatmaps, calculated customer lifetime value (LTV), and visualized the complete checkout conversion funnel.',
    metrics: ['14% Cart Conversion Recovery', 'Identified Top 3 Drop-off Friction Nodes', 'Cohort Analysis across 12 Months'],
    tools: ['Python', 'Tableau', 'SQL', 'Funnel Analytics', 'Basket Analysis'],
    repo: 'https://github.com/BharathJD06/E-Commerce'
  },
  7: {
    title: 'Global Electricity Supply (2016-2023)',
    category: 'Geospatial / Energy',
    badge: 'Global Energy',
    desc: 'Geospatial and temporal tracking of worldwide electricity access, renewable generation vs. non-renewable fuel dependency across 190+ nations.',
    problem: 'Synthesizing heterogeneous United Nations & World Bank data sources into a unified geospatial view of electrification gaps.',
    methodology: 'Normalized 7 years of global energy telemetry into time-series geospatial datasets and built interactive Power BI drill-through maps.',
    metrics: ['190+ Countries Mapped', '7-Year Temporal Scope (2016-2023)', 'Renewable Penetration Benchmarks'],
    tools: ['Python', 'Power BI', 'Geospatial Analytics', 'ETL Pipelines'],
    repo: 'https://github.com/BharathJD06/Electricity-Supply-to-World-Populations-2016-2023'
  },
  8: {
    title: 'Strategic Mobile Sales Forecasting',
    category: 'Time Series / Machine Learning',
    badge: 'Forecasting',
    desc: 'ARIMA & Prophet time-series models for mobile phone device sales. Decomposed seasonal variances, promotional spikes, and supply chain lead times.',
    problem: 'Excess inventory overhead caused by unpredictable consumer device upgrade cycles.',
    methodology: 'Applied seasonal decomposition of time series (STL), trained ARIMA and Prophet models, and generated 12-month forward predictive demand bands.',
    metrics: ['8.4% Mean Absolute Percentage Error (MAPE)', '12-Month Horizon Forecasts', 'Confidence Intervals Quantified'],
    tools: ['Python', 'ARIMA', 'Facebook Prophet', 'Time Series Analysis', 'Pandas'],
    repo: 'https://github.com/BharathJD06/Strategic-Mobile-Sales-Analysis-and-Forecasting'
  },
  9: {
    title: 'Real Estate Valuation & Property Trends',
    category: 'Real Estate / Econometrics',
    badge: 'Valuation',
    desc: 'Urban property price trends, square footage valuation, cap rate calculations, and multivariate regression modeling for residential property investors.',
    problem: 'Property buyers lacked empirical valuation multiples accounting for transit proximity and school district scoring.',
    methodology: 'Built multiple linear regression models with feature interaction terms, engineered price-per-sqft benchmarks, and designed investor dashboards.',
    metrics: ['R² of 0.87 on Property Valuation', 'Identified Under-priced Micro-markets', 'Automated Investment Yield Calculators'],
    tools: ['Python', 'Power BI', 'Regression Modeling', 'Valuation Metrics'],
    repo: 'https://github.com/BharathJD06/Real-Estate-Analysis'
  },
  10: {
    title: 'Mall Customer Traffic & Clustering',
    category: 'Unsupervised ML / Customer Science',
    badge: 'Clustering',
    desc: 'Unsupervised K-Means and Hierarchical Clustering identifying distinct shopper personas by annual income and spending elasticity to tailor commercial tenant mix.',
    problem: 'Mall asset managers struggled to curate optimal tenant retail leasing based on footfall spending profiles.',
    methodology: 'Calculated optimal cluster count via the Elbow Method and Silhouette Analysis, deriving 5 distinct actionable customer personas.',
    metrics: ['5 Distinct Consumer Personas', '0.72 Silhouette Score', 'Targeted Marketing Recommendations'],
    tools: ['Python', 'K-Means', 'Hierarchical Clustering', 'PCA', 'Seaborn'],
    repo: 'https://github.com/BharathJD06/Mall-Customers'
  },
  11: {
    title: 'NorthWind Trading BI & Data Model',
    category: 'SQL Data Warehouse / BI',
    badge: 'Data Warehouse',
    desc: 'End-to-end relational schema modeling on the iconic Northwind dataset. Built Star Schemas, complex SQL window functions, and executive supply chain dashboards.',
    problem: 'Disorganized relational tables required modernization into an analytics-ready dimensional model.',
    methodology: 'Designed Fact and Dimension star schema architectures, wrote complex CTEs and window rank queries, and deployed Power BI sales dashboards.',
    metrics: ['Star Schema Dimensional Design', '35+ Complex SQL Analytical Queries', 'Automated KPI Refresh Pipelines'],
    tools: ['SQL', 'Power BI', 'Star Schema', 'ETL', 'Data Warehousing'],
    repo: 'https://github.com/BharathJD06/NorthWind'
  },
  12: {
    title: 'Wine Quality Physicochemical Classifier',
    category: 'Machine Learning / Supervised Classification',
    badge: 'Classification',
    desc: 'Supervised classification utilizing Random Forests and Support Vector Machines to grade wine quality using acidity, sulfur dioxide, and residual sugar parameters.',
    problem: 'Subjective human sommelier grading lacks objective, reproducible chemical consistency.',
    methodology: 'Engineered physicochemical feature ratios, scaled data using StandardScaler, and evaluated ensemble models with Stratified K-Fold validation.',
    metrics: ['89.4% Multi-class Accuracy', 'Key Drivers: Alcohol & Volatile Acidity', 'Full ROC-AUC Benchmark'],
    tools: ['Python', 'Random Forest', 'SVM', 'Hyperparameter Tuning', 'Scikit-Learn'],
    repo: 'https://github.com/BharathJD06/Wine-Quality'
  },
  13: {
    title: 'Home Loan Approval Risk Modeling',
    category: 'Credit Risk / FinTech',
    badge: 'Credit Risk',
    desc: 'Underwriting risk assessment model evaluating credit history, debt-to-income metrics, and loan repayment likelihood with logistic regression & gradient trees.',
    problem: 'Manual loan underwriting created multi-day loan approval delays and subjective loan officer disparities.',
    methodology: 'Cleaned applicant financials, applied WoE (Weight of Evidence) transformations, and built interpretable risk scoring cards.',
    metrics: ['84.7% Approval Prediction Accuracy', 'Automated 70% of Low-risk Filings', 'Clear Applicant Risk Tiering'],
    tools: ['Python', 'Scikit-Learn', 'Risk Analytics', 'Logistic Regression', 'EDA'],
    repo: 'https://github.com/BharathJD06/Home-Loan-Approval-Analysis'
  },
  14: {
    title: 'Bank of Canada Interest & Yield Trends',
    category: 'Macroeconomics / Central Banking',
    badge: 'Macroeconomics',
    desc: 'Policy interest rate trajectories, CPI inflation metrics, overnight lending benchmarks, and bond yield curves through multiple macroeconomic easing cycles.',
    problem: 'Tracking central bank monetary policy shifts and their downstream implications on commercial mortgage rates.',
    methodology: 'Extracted Bank of Canada open telemetry via Python APIs, modeled yield curve inversions, and visualized monetary policy cycles.',
    metrics: ['20-Year Historical Analysis', 'Yield Curve Inversion Warning Signals', 'Correlated Prime Rate vs Inflation'],
    tools: ['Python', 'Macroeconomics', 'Financial Modeling', 'Time Series'],
    repo: 'https://github.com/BharathJD06/Bank-of-Canada'
  },
  15: {
    title: 'GDP Per Country & Disparity Analysis',
    category: 'Global Economics / Data Viz',
    badge: 'Macro Data',
    desc: 'Cross-country economic disparities, purchasing power parity (PPP), Human Development Index (HDI) regression, and historical growth velocity benchmarks.',
    problem: 'Assessing global wealth distribution and evaluating macro factors driving long-term GDP per capita divergence.',
    methodology: 'Executed multivariate regressions evaluating education indices and institutional stability against sovereign economic output.',
    metrics: ['190+ Sovereign States Evaluated', 'Logarithmic Wealth Disparity Curves', 'High-impact Comparative Visuals'],
    tools: ['Python', 'Jupyter', 'Macroeconomics', 'Plotly', 'Matplotlib'],
    repo: 'https://github.com/BharathJD06/GDP-Per-Country'
  },
  16: {
    title: 'Air Cargo Freight Routes & Volume',
    category: 'Aviation Logistics / Operations',
    badge: 'Logistics',
    desc: 'Freight tonnage distribution across international hub airports, seasonal cargo demand fluctuations, route optimization, and operational flight efficiency.',
    problem: 'Air freight capacity planning suffers from extreme seasonal imbalances between outbound manufactured goods and inbound raw cargo.',
    methodology: 'Analyzed global flight manifests and freight payload data to uncover route bottlenecks and belly-cargo utilization peaks.',
    metrics: ['Global Route Density Visualizations', 'Seasonal Capacity Optimization Model', 'Hub Transit Turnaround Metrics'],
    tools: ['Python', 'Jupyter Notebook', 'Logistics Analytics', 'Data Wrangling'],
    repo: 'https://github.com/BharathJD06/Air-Cargo-Freight'
  },
  17: {
    title: 'Power BI Smartphone Market Dashboard',
    category: 'Power BI / Business Intelligence',
    badge: 'Power BI Exec',
    desc: 'Interactive executive reporting with custom DAX measures, dynamic drill-down hierarchies, vendor competitive landscape, and price elasticity graphs.',
    problem: 'Executive stakeholders needed an intuitive, real-time dashboard to benchmark device pricing across 500+ competitor models.',
    methodology: 'Developed comprehensive dimensional Star Schema in Power BI, created 25+ dynamic DAX measures, and configured interactive drill-through views.',
    metrics: ['500+ Smartphone Models Benchmarked', 'Dynamic Drill-through Filtering', 'Instant Visual Scenario Analysis'],
    tools: ['Power BI', 'DAX Measures', 'Data Modeling', 'Executive Reporting'],
    repo: 'https://github.com/BharathJD06/POWER-BI-SMARTPHONE-MARKET-ANALYSIS'
  },
  18: {
    title: 'Predictive Mobile Market Pricing Engine',
    category: 'Machine Learning / Regression',
    badge: 'Pricing AI',
    desc: 'Gradient boosted regression models forecasting device retail price points from hardware specifications (SoC speed, RAM density, camera sensors, 5G modems).',
    problem: 'OEM product strategists struggle to price newly designed smartphone SKUs competitively before manufacturing tooling commits.',
    methodology: 'Engineered non-linear interaction features across processor tiers and camera megapixels, tuning XGBoost and LightGBM regressors.',
    metrics: ['R² of 0.92 on Retail Price Prediction', 'Feature Importance: RAM & Display Tech', 'Cross-validated on 1,000+ Devices'],
    tools: ['Python', 'Scikit-Learn', 'XGBoost', 'Feature Engineering'],
    repo: 'https://github.com/BharathJD06/Predictive-Mobile-Market'
  },
  19: {
    title: 'Mobile Market Share & Positioning',
    category: 'Market Intelligence / BI',
    badge: 'Market Strategy',
    desc: 'Comprehensive brand equity, operating system distribution (Android vs. iOS), and pricing tier penetration benchmarking global smartphone manufacturers.',
    problem: 'Fragmented global sales metrics obscured which specific tier (budget, midrange, flagship) drove highest operating margins.',
    methodology: 'Consolidated multi-region vendor shipments into structured Tableau story points, illustrating market share erosion and flagship velocity.',
    metrics: ['Global Market Share Breakdown', 'Android vs iOS Tier Analysis', 'Interactive Storyboard Layout'],
    tools: ['Python', 'Tableau', 'Market Intelligence', 'Competitive Analysis'],
    repo: 'https://github.com/BharathJD06/Mobile-Market-Analysis'
  },
  20: {
    title: 'Macro-Financial Economic Correlator',
    category: 'Econometrics / Statistical Modeling',
    badge: 'Econometrics',
    desc: 'Statistical modeling analyzing correlation coefficients between consumer confidence indices, exchange rates, equity valuations, and central bank reserve assets.',
    problem: 'Detecting leading indicators that predict macroeconomic equity contractions before they register in lagging earnings announcements.',
    methodology: 'Performed Granger causality tests, co-integration checks, and Pearson/Spearman correlation matrices across historical market cycles.',
    metrics: ['Identified 3 Statistically Significant Leading Indicators', 'Granger Causality Validated', 'R & Python Joint Pipeline'],
    tools: ['Python', 'R Language', 'Excel', 'Econometrics', 'Statistical Testing'],
    repo: 'https://github.com/BharathJD06/Finance-Economic-Analysis'
  },
  21: {
    title: 'Corporate Financial Valuation Model',
    category: 'Corporate Finance / Valuation',
    badge: 'Valuation Model',
    desc: 'Automated DuPont analysis decomposing return on equity (ROE), working capital velocity, DCF cash flow discounting, and company solvency stress tests.',
    problem: 'Financial analysts spent hours manually calculating ratio decompositions and discounted cash flows for quarterly earnings filings.',
    methodology: 'Automated 3-stage DuPont decomposition, constructed sensitivity tables for WACC and terminal growth rates in Python and Jupyter.',
    metrics: ['Automated 3-statement Ratio Analysis', 'Dynamic Sensitivity Tables', 'Stress-tested Solvency Metrics'],
    tools: ['Python', 'Financial Modeling', 'Jupyter', 'Valuation Ratios'],
    repo: 'https://github.com/BharathJD06/Finance-Project'
  },
  22: {
    title: 'Daily Hydration & Biometric Analysis',
    category: 'Health Analytics / Biometrics',
    badge: 'Biometrics',
    desc: 'Exploratory biometric study correlating fluid intake routines with circadian energy dips, physical exertion logs, and cognitive focus durations.',
    problem: 'Quantifying the tangible productivity and cognitive impact of micro-hydration habits during intensive analytical work.',
    methodology: 'Logged 90 days of empirical fluid consumption against hourly cognitive focus scores and activity markers using Pandas and Seaborn.',
    metrics: ['90-Day Longitudinal Study', 'Statistically Significant Energy Stabilization', 'Exploratory Regression Curves'],
    tools: ['Python', 'Health Analytics', 'Exploratory Data Analysis', 'Seaborn'],
    repo: 'https://github.com/BharathJD06/Water-Intake-Analysis'
  },
  23: {
    title: 'Rajbharath 3D Animated Portfolio Engine',
    category: '3D WebGL / Interactive Motion',
    badge: 'Portfolio Architecture',
    desc: 'The open-source repository driving this high-performance WebGL portfolio with Three.js particle dynamics, HUD graphic overlays, audio feedback, and 23 project deep dives.',
    problem: 'Standard developer portfolios look generic and fail to demonstrate high-caliber technical excellence and visual presentation mastery.',
    methodology: 'Engineered hardware-accelerated 3D WebGL scenes, Web Audio API sound synthesis, responsive glassmorphism CSS, and accessible semantic markup.',
    metrics: ['100% Mobile Responsive', 'Hardware Accelerated 60 FPS Canvas', 'Zero Heavy Framework Dependencies'],
    tools: ['Three.js', 'WebGL', 'JavaScript', 'CSS3 Motion', 'HTML5 Semantic'],
    repo: 'https://github.com/BharathJD06/Rajbharath-Portfolio'
  }
};

(function initProjectSystem() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const projectCards = document.querySelectorAll('.project-3d-card');
  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');

  // Filter Buttons
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.getAttribute('data-filter');
      playSynthSound('click');

      projectCards.forEach((card) => {
        const cat = card.getAttribute('data-category') || '';
        if (filter === 'all' || cat.includes(filter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Modal Open Handler
  document.querySelectorAll('[data-detail-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-detail-modal');
      const data = PROJECTS_DATABASE[id];
      if (!data) return;

      playSynthSound('modal');

      modalBody.innerHTML = `
        <div class="modal-hero">
          <span class="modal-category-tag">${data.category}</span>
          <h2>${data.title}</h2>
        </div>
        
        <div class="modal-section-title">EXECUTIVE OVERVIEW</div>
        <p>${data.desc}</p>

        <div class="modal-section-title">CORE BUSINESS CHALLENGE</div>
        <p>${data.problem}</p>

        <div class="modal-section-title">METHODOLOGY & TECHNICAL EXECUTION</div>
        <p>${data.methodology}</p>

        <div class="modal-section-title">VERIFIED IMPACT METRICS</div>
        <div class="modal-metrics-box">
          ${data.metrics.map(m => `
            <div class="mm-item">
              <div class="mm-val">${m}</div>
              <div class="mm-lbl">MEASURED IMPACT</div>
            </div>
          `).join('')}
        </div>

        <div class="modal-section-title">TECH STACK UTILITY</div>
        <div class="card-tech-stack" style="margin-top: 8px;">
          ${data.tools.map(t => `<span>${t}</span>`).join('')}
        </div>

        <div class="modal-actions-row">
          <a href="${data.repo}" target="_blank" rel="noopener noreferrer" class="btn-primary-3d" style="width:100%; justify-content:center;">
            <span>Open Verified GitHub Repository ↗</span>
          </a>
        </div>
      `;

      modal.classList.add('active');
    });
  });

  // Close Modal
  function closeModal() {
    modal.classList.remove('active');
    playSynthSound('click');
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
})();

// ── 9. INTERACTIVE CYBER TERMINAL ENGINE ──
(function initTerminal() {
  const input = document.getElementById('term-input');
  const body = document.getElementById('term-body');
  const macroBtns = document.querySelectorAll('.macro-btn');
  if (!input || !body) return;

  const COMMANDS = {
    help: () => `
AVAILABLE COMMANDS:
  <span class="term-hl">skills</span>      - Query technical toolkit & verified benchmarks
  <span class="term-hl">projects</span>    - Summary of all 23 repositories
  <span class="term-hl">experience</span>  - Inspect professional timeline & enterprise roles
  <span class="term-hl">contact</span>     - Display verified communication endpoints
  <span class="term-hl">hire</span>        - Recruitment summary & candidate availability
  <span class="term-hl">bio</span>         - Full background & philosophy summary
  <span class="term-hl">github</span>      - Launch direct GitHub profile URL
  <span class="term-hl">clear</span>       - Clear terminal buffer
    `,
    skills: () => `
TECHNICAL TOOLKIT (VERIFIED):
  • Core: Python (Pandas, NumPy, Scikit-Learn, XGBoost, SciPy, NLTK)
  • SQL: PostgreSQL, MySQL, MSSQL, Complex CTEs, Window Functions
  • BI: Microsoft Power BI, DAX, Power Query (M), Tableau, AWS QuickSight
  • Machine Learning: Classification, Clustering, Regression, Fairness AI
  • Cloud & Tools: Azure, GCP, Git, GitHub Enterprise, Jupyter, VS Code
    `,
    projects: () => `
23 REPOSITORIES SYNCHRONIZED (@BharathJD06):
  [01] Advance-Analysis-of-Sales-Market   [13] Home-Loan-Approval-Analysis
  [02] AI-Usage-Analysis                 [14] Bank-of-Canada
  [03] Bank-Transaction-Analysis         [15] GDP-Per-Country
  [04] CrewOptimizerDW                   [16] Air-Cargo-Freight
  [05] Health-Care                       [17] POWER-BI-SMARTPHONE-MARKET
  [06] E-Commerce                        [18] Predictive-Mobile-Market
  [07] Electricity-Supply-2016-2023      [19] Mobile-Market-Analysis
  [08] Strategic-Mobile-Sales-Forecasting[20] Finance-Economic-Analysis
  [09] Real-Estate-Analysis              [21] Finance-Project
  [10] Mall-Customers                    [22] Water-Intake-Analysis
  [11] NorthWind                         [23] Rajbharath-Portfolio
  [12] Wine-Quality
    `,
    experience: () => `
CAREER JOURNEY:
  • Data Analyst & Project Manager (Co-op) | Synod Intellicare (Jan 2026 - Jun 2026)
    - 10,000+ healthcare records analyzed; ML fairness bias reduced by 15-25%.
  • Vice President (Operations) | UNF Residence (Apr 2025 - Present)
    - Directing operations for 100+ residents; +20% service efficiency.
  • Business Analyst Intern | Saiket System (Jan 2026 - Feb 2026)
    - Business process mapping; +15% operational efficiency uplift.
  • Administrative Operations Intern | Rahul Education (Jul 2023 - Dec 2024)
    - Institutional database systems and registry documentation.
    `,
    contact: () => `
TRANSMISSION CHANNELS:
  • Email: <span class="term-hl">bharathathlete81@gmail.com</span>
  • LinkedIn: <a href="https://www.linkedin.com/in/rajbharath-paramasivan-522729264/" target="_blank" style="color:#00c6ff">rajbharath-paramasivan</a>
  • GitHub: <a href="https://github.com/BharathJD06" target="_blank" style="color:#00c6ff">github.com/BharathJD06</a>
  • Current Base: <span class="term-hl">Niagara Falls, ON, Canada</span>
    `,
    hire: () => `
CANDIDATE DISPOSITION:
  • Status: <span style="color:#10b981; font-weight:bold;">OPEN TO WORK // RELOCATION / REMOTE FRIENDLY</span>
  • Primary Targets: Data Analyst, Business Analyst, BI Developer, Analytics Consultant
  • Key Edge: Rare synthesis of technical depth (Python/SQL/ML) + executive storytelling (Power BI/Tableau)
    `,
    bio: () => `
Rajbharath Paramasivan is an analytics professional who turns chaotic enterprise datasets 
into clean, actionable business clarity. Based in Niagara Falls, ON, Canada.
    `,
    github: () => {
      window.open('https://github.com/BharathJD06', '_blank');
      return `Redirecting to https://github.com/BharathJD06...`;
    },
    clear: () => {
      body.innerHTML = '';
      return null;
    }
  };

  function executeCommand(cmd) {
    const raw = cmd.trim().toLowerCase();
    if (!raw) return;

    // Echo input
    const inputEcho = document.createElement('div');
    inputEcho.className = 'term-line';
    inputEcho.innerHTML = `<span class="term-prompt">rajbharath@node:~$</span> <span style="color:#fff">${cmd}</span>`;
    body.appendChild(inputEcho);

    playSynthSound('term');

    if (raw in COMMANDS) {
      const output = COMMANDS[raw]();
      if (output) {
        const outDiv = document.createElement('div');
        outDiv.className = 'term-line';
        outDiv.innerHTML = output;
        body.appendChild(outDiv);
      }
    } else {
      const errDiv = document.createElement('div');
      errDiv.className = 'term-line output-system';
      errDiv.innerHTML = `zsh: command not found: ${raw}. Type <span class="term-hl">'help'</span> for valid directives.`;
      body.appendChild(errDiv);
    }

    body.scrollTop = body.scrollHeight;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeCommand(input.value);
      input.value = '';
    }
  });

  macroBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      executeCommand(cmd);
    });
  });
})();

// ── 10. CONTACT FORM HANDLING ──
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('form-toast');
  const btn = document.getElementById('submit-btn');
  if (!form || !toast) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    playSynthSound('click');
    btn.disabled = true;
    btn.innerHTML = `<span>Transmitting Packet...</span>`;

    setTimeout(() => {
      toast.style.display = 'block';
      btn.innerHTML = `<span>Transmission Confirmed</span>`;
      form.reset();
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = `
          <span>Dispatch Transmission</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        `;
      }, 3500);
    }, 1200);
  });
})();

// ── CERTIFICATE VIEWER MODAL ──
(function initCertViewer() {
  const modal     = document.getElementById('cert-viewer-modal');
  const backdrop  = document.getElementById('cert-viewer-backdrop');
  const closeBtn  = document.getElementById('cert-viewer-close');
  const iframe    = document.getElementById('cert-iframe');
  const titleEl   = document.getElementById('cert-viewer-title');
  const dlBtn     = document.getElementById('cert-download-btn');

  if (!modal) return;

  // Map each cert-foil-card's title to a human-friendly name
  function getCardTitle(card) {
    const h4 = card.querySelector('h4');
    const corp = card.querySelector('.cert-corp');
    if (h4 && corp) return corp.textContent.trim() + ' — ' + h4.textContent.trim();
    if (h4) return h4.textContent.trim();
    return 'Certificate';
  }

  function openCertModal(certPath, title) {
    titleEl.textContent = title;
    // <object> uses data= attribute; <embed> uses src=
    iframe.setAttribute('data', certPath);
    const embedEl = document.getElementById('cert-embed');
    if (embedEl) embedEl.src = certPath;
    // Update fallback "Open in New Tab" link
    const fallbackLink = document.getElementById('cert-fallback-link');
    if (fallbackLink) { fallbackLink.href = certPath; }
    dlBtn.href = certPath;
    dlBtn.download = certPath.split('/').pop();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    playSynthSound('modal');
  }

  function closeCertModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Clear data after transition so object unloads
    setTimeout(() => {
      iframe.setAttribute('data', '');
      const embedEl = document.getElementById('cert-embed');
      if (embedEl) embedEl.src = '';
    }, 350);
  }

  // Click any cert card
  document.querySelectorAll('.cert-foil-card[data-cert]').forEach(card => {
    card.addEventListener('click', () => {
      const certPath = card.getAttribute('data-cert');
      openCertModal(certPath, getCardTitle(card));
    });
  });

  // Close controls
  closeBtn.addEventListener('click', closeCertModal);
  backdrop.addEventListener('click', closeCertModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeCertModal();
  });
})();
