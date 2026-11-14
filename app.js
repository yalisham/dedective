// STAR OR PLANET? - Interactive Astronomical Web Engine
// Based on NASA data and the 6-stage evidence-based methodology

document.addEventListener('DOMContentLoaded', () => {
  initStarCanvas();
  initCalculators();
  initClassifier();
  initFAQ();
});

// --- 1. Star Background Canvas Animation ---
function initStarCanvas() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, stars = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars = [];
    const count = Math.floor((width * height) / 3200);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
        color: ['#ffffff', '#38bdf8', '#fbbf24', '#c084fc'][Math.floor(Math.random() * 4)]
      });
    }
  }

  window.addEventListener('resize', resize);
  resize();

  function animate(t) {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(s => {
      s.phase += s.speed;
      const currentAlpha = s.alpha * (0.6 + 0.4 * Math.sin(s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = currentAlpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// --- 2. Interactive Scientific Calculators ---
function initCalculators() {
  // A. Kepler 3rd Law Calculator
  const aInput = document.getElementById('kepler-a');
  const pInput = document.getElementById('kepler-p');
  const keplerResult = document.getElementById('kepler-result');
  const keplerPresetBtn = document.getElementById('kepler-preset-jupiter');

  function calculateKepler() {
    if (!aInput || !pInput || !keplerResult) return;
    const a_km = parseFloat(aInput.value);
    const p_days = parseFloat(pInput.value);

    if (isNaN(a_km) || isNaN(p_days) || a_km <= 0 || p_days <= 0) {
      keplerResult.innerHTML = `<span class="text-rose-400">Düzgün müsbət ədədlər daxil edin.</span>`;
      return;
    }

    const a_m = a_km * 1000;
    const p_sec = p_days * 86400;
    const G = 6.67430e-11;

    // M = 4 * pi^2 * a^3 / (G * P^2)
    const M_kg = (4 * Math.PI * Math.PI * Math.pow(a_m, 3)) / (G * Math.pow(p_sec, 2));
    const M_sun = M_kg / 1.9884e30;

    keplerResult.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700">
          <div class="text-xs text-slate-400">Mərkəzi Kütlə (kq):</div>
          <div class="text-lg font-bold text-sky-400 font-mono">${M_kg.toExponential(4)} kq</div>
        </div>
        <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700">
          <div class="text-xs text-slate-400">Günəş Kütləsi ilə:</div>
          <div class="text-lg font-bold text-amber-400 font-mono">${M_sun.toFixed(4)} M<sub>&#9737;</sub></div>
        </div>
      </div>
      <div class="mt-2 text-xs text-slate-400">
        Kepler qanunu ətrafında fırlanılan <strong>mərkəzi cismin</strong> (hostun) kütləsini verir.
      </div>
    `;
  }

  if (aInput && pInput) {
    aInput.addEventListener('input', calculateKepler);
    pInput.addEventListener('input', calculateKepler);
    calculateKepler();
  }

  if (keplerPresetBtn) {
    keplerPresetBtn.addEventListener('click', () => {
      aInput.value = '778479000'; // 778.479 x 10^6 km
      pInput.value = '4332.589';   // 4332.589 days
      calculateKepler();
    });
  }

  // B. Density Calculator
  const densityMInput = document.getElementById('density-m');
  const densityRInput = document.getElementById('density-r');
  const densityResult = document.getElementById('density-result');

  function calculateDensity() {
    if (!densityMInput || !densityRInput || !densityResult) return;
    const M_kg = parseFloat(densityMInput.value);
    const R_km = parseFloat(densityRInput.value);

    if (isNaN(M_kg) || isNaN(R_km) || M_kg <= 0 || R_km <= 0) {
      densityResult.innerHTML = `<span class="text-rose-400">Düzgün müsbət ədədlər daxil edin.</span>`;
      return;
    }

    const R_m = R_km * 1000;
    // rho = 3M / (4 * pi * R^3)
    const rho = (3 * M_kg) / (4 * Math.PI * Math.pow(R_m, 3));

    let comparison = '';
    if (rho < 2000) {
      comparison = 'Qaz nəhəngi / Əsas ardıcıllıq ulduzu aralığı (Günəş 1408 kq/m³, Yupiter 1326 kq/m³)';
    } else if (rho < 7000) {
      comparison = 'Yer tipli qayalı planet aralığı (Yer ~5515 kq/m³)';
    } else {
      comparison = 'Yüksək sıxlıqlı / qəhvəyi cırtdan və ya kompakt cisim';
    }

    densityResult.innerHTML = `
      <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-700 text-left">
        <div class="text-xs text-slate-400">Orta Sıxlıq (&rho;):</div>
        <div class="text-xl font-bold text-sky-400 font-mono">${rho.toFixed(1)} kq/m³</div>
        <div class="text-xs text-emerald-400 mt-1">${comparison}</div>
      </div>
    `;
  }

  if (densityMInput && densityRInput) {
    densityMInput.addEventListener('input', calculateDensity);
    densityRInput.addEventListener('input', calculateDensity);
    calculateDensity();
  }

  // C. Transit Simulator
  const rpSlider = document.getElementById('transit-rp');
  const rsSlider = document.getElementById('transit-rs');
  const transitVal = document.getElementById('transit-val');
  const transitCanvas = document.getElementById('transit-canvas');

  function drawTransit() {
    if (!rpSlider || !rsSlider || !transitCanvas) return;
    const Rp = parseFloat(rpSlider.value);
    const Rs = parseFloat(rsSlider.value);

    // delta = (Rp / Rs)^2
    const delta = Math.pow(Rp / Rs, 2);
    const deltaPercent = (delta * 100).toFixed(3);

    if (transitVal) {
      transitVal.innerHTML = `&delta; = <strong class="text-sky-400 font-mono">${deltaPercent}%</strong> (Rp: ${Rp.toLocaleString()} km, Rs: ${Rs.toLocaleString()} km)`;
    }

    const ctx = transitCanvas.getContext('2d');
    const w = transitCanvas.width;
    const h = transitCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw baseline grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, 20); ctx.lineTo(30, h - 25);
    ctx.moveTo(30, h - 25); ctx.lineTo(w - 20, h - 25);
    ctx.stroke();

    // Baseline 1.00 flux level
    const baseY = 35;
    const dipDepth = Math.min((h - 70) * (delta * 12), h - 70);
    const dipY = baseY + Math.max(dipDepth, 15);

    // Draw light curve path
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;

    // Pre-transit
    ctx.moveTo(35, baseY);
    ctx.lineTo(w * 0.35, baseY);
    // Ingress
    ctx.lineTo(w * 0.40, dipY);
    // Bottom
    ctx.lineTo(w * 0.60, dipY);
    // Egress
    ctx.lineTo(w * 0.65, baseY);
    // Post-transit
    ctx.lineTo(w - 25, baseY);
    ctx.stroke();

    // Add glow
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px JetBrains Mono';
    ctx.fillText('1.000', 5, baseY + 4);
    ctx.fillText((1 - delta).toFixed(3), 5, dipY + 4);
    ctx.fillText('-0.4', w * 0.2, h - 10);
    ctx.fillText('0.0 (Tranzit)', w * 0.47, h - 10);
    ctx.fillText('+0.4', w * 0.78, h - 10);

    // Depth indicator arrow
    ctx.strokeStyle = '#fbbf24';
    ctx.fillStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, baseY);
    ctx.lineTo(w * 0.5, dipY);
    ctx.stroke();
  }

  if (rpSlider && rsSlider) {
    rpSlider.addEventListener('input', drawTransit);
    rsSlider.addEventListener('input', drawTransit);
    drawTransit();
  }

  // D. Doppler Simulator
  const dopplerMpSlider = document.getElementById('doppler-mp');
  const dopplerCanvas = document.getElementById('doppler-canvas');
  const dopplerVal = document.getElementById('doppler-val');

  function drawDoppler() {
    if (!dopplerMpSlider || !dopplerCanvas) return;
    const Mp_jup = parseFloat(dopplerMpSlider.value);
    // K proportional to Mp
    const K = (12.46 * Mp_jup).toFixed(2);
    const deltaLambda = (4.16e-8 * Mp_jup * 500).toFixed(4); // nm for 500nm

    if (dopplerVal) {
      dopplerVal.innerHTML = `Semi-amplituda K = <strong class="text-amber-400 font-mono">${K} m/san</strong>, &Delta;&lambda; = <span class="text-sky-400 font-mono">${deltaLambda}&times;10⁻⁵ nm</span> (@500 nm)`;
    }

    const ctx = dopplerCanvas.getContext('2d');
    const w = dopplerCanvas.width;
    const h = dopplerCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Center line
    const midY = h / 2;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, midY);
    ctx.lineTo(w - 20, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw sine wave
    const amp = Math.min((h / 2 - 20) * (Mp_jup / 10), h / 2 - 15);
    ctx.beginPath();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;

    for (let x = 30; x <= w - 20; x++) {
      const angle = ((x - 30) / (w - 50)) * Math.PI * 2;
      const y = midY - Math.sin(angle) * amp;
      if (x === 30) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Amplitude markers
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px JetBrains Mono';
    ctx.fillText(`+${K} m/s`, 5, midY - amp - 4);
    ctx.fillText(`0 m/s`, 5, midY + 4);
    ctx.fillText(`-${K} m/s`, 5, midY + amp + 12);
  }

  if (dopplerMpSlider) {
    dopplerMpSlider.addEventListener('input', drawDoppler);
    drawDoppler();
  }
}

// --- 3. Six-Stage Interactive Classifier ---
function initClassifier() {
  const form = document.getElementById('classifier-form');
  const resultCard = document.getElementById('classifier-result');
  const stepsContainer = document.getElementById('classifier-steps');
  const presetBtns = document.querySelectorAll('[data-preset]');

  const presets = {
    sun: {
      name: 'Günəş (İstinad Ulduz)',
      mass: 1047.6,
      massType: 'true',
      radius: 9.95,
      hostBound: 'host_itself',
      fusion: 'steady_h',
      spectrum: 'star_like'
    },
    jupiter: {
      name: 'Yupiter (İstinad Planet)',
      mass: 1.0,
      massType: 'true',
      radius: 1.0,
      hostBound: 'bound',
      fusion: 'no_fusion',
      spectrum: 'reflected'
    },
    brown_dwarf: {
      name: 'Qəhvəyi Cırtdan (20 MJ Hipotetik)',
      mass: 20.0,
      massType: 'true',
      radius: 1.0,
      hostBound: 'bound',
      fusion: 'partial',
      spectrum: 'cold_faint'
    },
    unresolved_msini: {
      name: 'Radial Sürət Namizədi (Yalnız M sin i)',
      mass: 12.0,
      massType: 'msini',
      radius: 0.9,
      hostBound: 'bound',
      fusion: 'no_fusion',
      spectrum: 'none'
    },
    free_floating: {
      name: 'Sərbəst Üzən Cisim (Hostsuz)',
      mass: 8.0,
      massType: 'true',
      radius: 1.1,
      hostBound: 'free_floating',
      fusion: 'no_fusion',
      spectrum: 'none'
    }
  };

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-preset');
      const p = presets[key];
      if (!p) return;

      document.getElementById('input-mass').value = p.mass;
      document.getElementById('input-mass-type').value = p.massType;
      document.getElementById('input-radius').value = p.radius;
      document.getElementById('input-host').value = p.hostBound;
      document.getElementById('input-fusion').value = p.fusion;
      document.getElementById('input-spectrum').value = p.spectrum;

      classify();
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      classify();
    });
    // Live update on input changes
    form.addEventListener('change', classify);
    form.addEventListener('input', classify);
  }

  function classify() {
    const mass = parseFloat(document.getElementById('input-mass').value);
    const massType = document.getElementById('input-mass-type').value;
    const radius = parseFloat(document.getElementById('input-radius').value);
    const hostBound = document.getElementById('input-host').value;
    const fusion = document.getElementById('input-fusion').value;
    const spectrum = document.getElementById('input-spectrum').value;

    if (isNaN(mass) || isNaN(radius) || mass <= 0 || radius <= 0) {
      return;
    }

    // Pipeline Steps evaluation
    const steps = [
      {
        title: 'Mərhələ 1: Məlumatların Toplanması',
        status: 'pass',
        desc: `NASA Arxiv və sorğu məlumatları qəbul edildi. Giriş: Kütlə = ${mass} MJ (${massType === 'true' ? 'Həqiqi kütlə' : 'Yalnız M sin i'}), Radius = ${radius} RJ.`
      },
      {
        title: 'Mərhələ 2: Fiziki Parametrlər & Sıxlıq',
        status: 'pass',
        desc: `Orta sıxlıq &rho; hesabatı: ${(1326 * (mass / Math.pow(radius, 3))).toFixed(1)} kq/m³ (Yupiter sıxlığına nisbətən ${(mass / Math.pow(radius, 3)).toFixed(2)}x).`
      },
      {
        title: 'Mərhələ 3: Spektral Analiz',
        status: spectrum === 'none' ? 'missing' : 'pass',
        desc: spectrum === 'star_like'
          ? 'Spektr davamlı nüvə sintezi aparan ulduza tam uyğundur.'
          : spectrum === 'reflected'
          ? 'Əks olunmuş işıq rejimi (daxili işıqlıq mənbəyi müşahidə olunmur).'
          : spectrum === 'cold_faint'
          ? 'Soyuq, zəif infraqırmızı şüalanma; tam ulduz spektri deyil.'
          : 'Çatışmır: Spektr və ya işıqlıq məlumatı arxivdə mövcud deyil.'
      },
      {
        title: 'Mərhələ 4: Kütlə və Sıxlıq Uyğunluğu',
        status: massType === 'msini' ? 'warning' : 'pass',
        desc: massType === 'msini'
          ? 'Xəbərdarlıq: Yalnız minimum kütlə (M sin i) məlumdur! Meyllik bucağı (i) bilinmədən həqiqi kütlə qəti sayıla bilməz.'
          : `Həqiqi kütlə aralığı: ${mass} MJ. ${mass >= 75 ? 'Ulduz zonası (≥75 MJ)' : mass <= 15 ? 'Planet zonası (≤15 MJ)' : 'Sərhəd / Qəhvəyi cırtdan zonası (15–75 MJ)'}.`
      },
      {
        title: 'Mərhələ 5: Sintez Sübutu Analizi',
        status: fusion === 'unknown' ? 'missing' : 'pass',
        desc: fusion === 'steady_h'
          ? 'Nüvəsində hidrogen heliuma çevrilir (Davamlı H-sintezi təsdiqlənib).'
          : fusion === 'no_fusion'
          ? 'Daxili sintez yoxdur; cisim əks olunan işıqla və ya istilik qalıqları ilə parlayır.'
          : fusion === 'partial'
          ? 'Yalnız deyterium sintezi mümkün ola bilər, davamlı hidrogen sintezi getmir.'
          : 'Çatışmır: Enerji mənbəyi və sintez varlığı sübut edilməyib.'
      },
      {
        title: 'Mərhələ 6: Qərar Qaydası və Yekun',
        status: 'pass',
        desc: 'NASA sübuta əsaslanan protokolunun tətbiqi.'
      }
    ];

    // Determine Final Classification
    let decision = 'UNCLASSIFIED';
    let decisionTitle = 'TƏSNİF EDİLMƏYİB';
    let decisionClass = 'border-purple-500 bg-purple-950/40 text-purple-300';
    let badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    let missingReasons = [];

    // Check ULDUZ criteria:
    // mass >= 75 MJ, true mass, steady H fusion, star-like spectrum
    if (mass >= 75 && massType === 'true' && fusion === 'steady_h' && spectrum === 'star_like') {
      decision = 'STAR';
      decisionTitle = 'ULDUZ';
      decisionClass = 'border-amber-500 bg-amber-950/40 text-amber-300';
      badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    // Check PLANET criteria:
    // mass <= 15 MJ, true mass (not just msini), no fusion, bound to host
    else if (mass <= 15 && massType === 'true' && fusion === 'no_fusion' && hostBound === 'bound') {
      decision = 'PLANET';
      decisionTitle = 'PLANET';
      decisionClass = 'border-sky-500 bg-sky-950/40 text-sky-300';
      badgeClass = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    }
    // Otherwise UNCLASSIFIED
    else {
      decision = 'UNCLASSIFIED';
      decisionTitle = 'TƏSNİF EDİLMƏYİB';

      if (massType === 'msini') {
        missingReasons.push('Yalnız minimum kütlə (M sin i) məlumdur. Meyllik bucağını (i) təyin etmək üçün tranzit və ya astrometrik müşahidə lazımdır.');
      }
      if (mass > 15 && mass < 75) {
        missingReasons.push(`Kütlə (${mass} MJ) 15–75 MJ qeyri-müəyyənlik / qəhvəyi cırtdan aralığına düşür. Həm planet, həm ulduz testlərindən keçmir.`);
      }
      if (hostBound === 'free_floating') {
        missingReasons.push('Cisim heç bir ulduzla bağlı deyil (sərbəst üzən cisimdir). NASA Exoplanet Archive meyarlarına görə planet sayıla bilməz.');
      }
      if (hostBound === 'unknown') {
        missingReasons.push('Cismin host ulduzla cazibə bağlılığı sübut olunmayıb.');
      }
      if (fusion === 'unknown') {
        missingReasons.push('Daxili enerji mənbəyi (hidrogen sintezinin olub-olmaması) naməlumdur.');
      }
      if (spectrum === 'none') {
        missingReasons.push('Spektral analiz və ya effektiv temperatur (Teff) məlumatı çatışmır.');
      }
      if (mass >= 75 && fusion !== 'steady_h') {
        missingReasons.push('Kütlə ulduz zonasına uyğundur, lakin davamlı hidrogen sintezi sübut edilməyib.');
      }
      if (mass <= 15 && fusion === 'steady_h') {
        missingReasons.push('Ziddiyyət: Kütlə planetar ölçüdədir, lakin daxili sintez iddiası var (fiziki olaraq qeyri-mümkündür, təkrari ölçmə tələb olunur).');
      }
    }

    // Render Steps
    stepsContainer.innerHTML = steps.map((s, idx) => {
      let iconColor = s.status === 'pass' ? 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40'
        : s.status === 'warning' ? 'text-amber-400 bg-amber-950/50 border-amber-500/40'
        : 'text-rose-400 bg-rose-950/50 border-rose-500/40';
      let iconSymbol = s.status === 'pass' ? '✓' : s.status === 'warning' ? '!' : '✗';
      return `
        <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 transition-all hover:border-slate-700">
          <div class="w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${iconColor}">
            ${iconSymbol}
          </div>
          <div class="flex-1 text-left text-xs">
            <div class="font-semibold text-slate-200 text-sm">${s.title}</div>
            <div class="text-slate-400 mt-0.5 leading-relaxed">${s.desc}</div>
          </div>
        </div>
      `;
    }).join('');

    // Render Final Decision Card
    resultCard.className = `p-6 rounded-2xl border-2 backdrop-blur-md transition-all ${decisionClass}`;
    resultCard.innerHTML = `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div class="text-xs uppercase tracking-widest text-slate-400">Yekun Elmi Təsnifat</div>
          <div class="text-3xl font-extrabold tracking-tight mt-1">${decisionTitle}</div>
        </div>
        <span class="px-3.5 py-1.5 rounded-full text-xs font-bold border tracking-wide uppercase ${badgeClass}">
          ${decision === 'STAR' ? 'Davamlı Sintez Ulduzu' : decision === 'PLANET' ? 'Təsdiqlənmiş Planet' : 'Sübut Çatışmır'}
        </span>
      </div>

      <div class="mt-4 text-sm text-slate-300 leading-relaxed text-left">
        ${decision === 'STAR'
          ? 'Bütün zəruri şərtlər ödənildi: Həqiqi kütlə &ge; 75 MJ, davamlı hidrogen sintezi və spektr ulduzla tam uyğundur.'
          : decision === 'PLANET'
          ? 'Bütün zəruri şərtlər ödənildi: Həqiqi kütlə &le; 15 MJ, daxili sintez yoxdur, ulduzla bağlıdır və yalnış müsbət riski aradan qaldırılıb.'
          : 'NASA elmi metoduna görə çatışmayan məlumat heç vaxt təxminlə doldurulmur. Cismin ulduz və ya planet olduğunu qəti demək üçün aşağıdakı sübutlar çatışmır:'
        }
      </div>

      ${missingReasons.length > 0 ? `
        <div class="mt-4 pt-3 border-t border-white/10 text-left">
          <div class="text-xs font-semibold uppercase tracking-wider text-purple-300 mb-2">Çatışmayan / Həll Olunmamış Sübutlar:</div>
          <ul class="space-y-1.5 text-xs text-slate-300">
            ${missingReasons.map(r => `<li class="flex items-start gap-2"><span class="text-purple-400 font-bold">&#8226;</span><span>${r}</span></li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `;
  }

  // Initial classification run
  classify();
}

// --- 4. Interactive FAQ Accordion ---
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-btn');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (btn && content) {
      btn.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');
        // Close all
        document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
        document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));

        if (!isOpen) {
          content.classList.remove('hidden');
          if (icon) icon.classList.add('rotate-180');
        }
      });
    }
  });
}
