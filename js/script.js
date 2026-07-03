/* =========================================================
   AI RESEARCH STUDIO — APPLICATION SCRIPT
   Modules:
   1. App bootstrap
   2. Background particles
   3. Navbar (scroll state + mobile menu)
   4. Smooth scroll / active link tracking
   5. Hero typing animation
   6. Scroll reveal (IntersectionObserver)
   7. Stat counters
   8. Button ripple
   9. Research form + validation
   10. Loading sequence
   11. Report generation + rendering
   12. Copy / download report
   13. Toast notifications
   14. Back-to-top
   ========================================================= */

(function () {
  'use strict';

  /* ---------- 1. APP BOOTSTRAP ---------- */
  function initApp() {
    document.getElementById('year').textContent = new Date().getFullYear();
    initParticles();
    initNavbar();
    initSmoothScroll();
    initTypingHero();
    initScrollReveal();
    initStatCounters();
    initRippleButtons();
    initResearchForm();
    initBackToTop();
  }

  document.addEventListener('DOMContentLoaded', initApp);

  /* ---------- 2. BACKGROUND PARTICLES ---------- */
  function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const count = window.innerWidth < 640 ? 18 : 36;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.bottom = Math.random() * 100 + 'vh';
      const duration = 14 + Math.random() * 18;
      const delay = Math.random() * -30;
      p.style.animationDuration = duration + 's';
      p.style.animationDelay = delay + 's';
      p.style.opacity = (0.2 + Math.random() * 0.5).toFixed(2);
      frag.appendChild(p);
    }
    container.appendChild(frag);
  }

  /* ---------- 3. NAVBAR ---------- */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    const onScroll = () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        navLinks.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('is-active'));
        link.classList.add('is-active');
      });
    });

    document.getElementById('navGenerateBtn').addEventListener('click', () => scrollToId('research'));
    document.getElementById('heroGenerateBtn').addEventListener('click', () => scrollToId('research'));
    document.getElementById('viewDemoBtn').addEventListener('click', () => {
      scrollToId('research');
      showToast('Fill in a topic and hit Generate to see a live demo report.', 'info');
    });
  }

  /* ---------- 4. SMOOTH SCROLL ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        scrollToId(id);
      });
    });
  }

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return;
    const offset = 88;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /* ---------- 5. HERO TYPING ANIMATION ---------- */
  function initTypingHero() {
    const line2 = document.getElementById('typedLine2');
    const line3 = document.getElementById('typedLine3');
    if (!line2 || !line3) return;

    const sequence = [
      { el: line2, text: 'Think smarter.' },
      { el: line3, text: 'Powered by AI.' }
    ];

    let seqIndex = 0;

    function typeNext() {
      if (seqIndex >= sequence.length) return;
      const { el, text } = sequence[seqIndex];
      typeText(el, text, () => {
        seqIndex++;
        setTimeout(typeNext, 250);
      });
    }

    setTimeout(typeNext, 500);
  }

  function typeText(el, text, onDone) {
    let i = 0;
    el.textContent = '';
    el.classList.add('is-typing');
    const speed = 55;

    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else {
        el.classList.remove('is-typing');
        if (onDone) onDone();
      }
    })();
  }

  /* ---------- 6. SCROLL REVEAL ---------- */
  function initScrollReveal() {
    const targets = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .blur-in');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-visible'));
      return;
    }

    // stagger index within shared parents
    const groups = document.querySelectorAll('.stats-grid, .features-grid');
    groups.forEach((group) => {
      Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', i));
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    targets.forEach((t) => observer.observe(t));
  }

  /* ---------- 7. STAT COUNTERS ---------- */
  function initStatCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 8. BUTTON RIPPLE ---------- */
  function initRippleButtons() {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        ripple.className = 'btn-ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }

  /* ---------- 9. RESEARCH FORM ---------- */
  const STEP_LABELS_DURATIONS = [900, 1100, 1400, 1600, 1300, 1500, 900, 700]; // ms per step

  function initResearchForm() {
    const form = document.getElementById('researchForm');
    const topicField = document.getElementById('topic');
    const topicError = document.getElementById('topicError');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const topic = topicField.value.trim();

      if (!validateForm(topic)) {
        topicField.closest('.field').classList.add('has-error');
        topicError.textContent = 'Please describe a research topic (at least 5 characters).';
        topicField.focus();
        return;
      }
      topicField.closest('.field').classList.remove('has-error');
      topicError.textContent = '';

      const payload = {
        topic,
        depth: document.getElementById('depth').value,
        style: document.getElementById('style').value,
        length: document.getElementById('length').value
      };

      runResearchPipeline(payload);
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
      topicField.closest('.field').classList.remove('has-error');
      topicError.textContent = '';
      showToast('Form cleared.', 'info');
    });

    document.getElementById('newResearchBtn').addEventListener('click', () => {
      document.getElementById('results').hidden = true;
      document.getElementById('research').hidden = false;
      resetToFormState();
      scrollToId('research');
    });
  }

  function validateForm(topic) {
    return topic.length >= 5;
  }

  /* ---------- 10. LOADING SEQUENCE ---------- */
  function runResearchPipeline(payload) {
    const formState = document.getElementById('formState');
    const loadingState = document.getElementById('loadingState');
    const generateBtn = document.getElementById('generateBtn');

    formState.hidden = true;
    loadingState.hidden = false;
    generateBtn.disabled = true;

    const steps = loadingState.querySelectorAll('.loader-step');
    const ringProgress = document.getElementById('loaderRingProgress');
    const percentEl = document.getElementById('loaderPercent');
    const barFill = document.getElementById('progressBarFill');
    const etaEl = document.getElementById('etaValue');

    const CIRCUMFERENCE = 2 * Math.PI * 52; // r=52
    const totalDuration = STEP_LABELS_DURATIONS.reduce((a, b) => a + b, 0);
    let elapsed = 0;

    steps.forEach((s) => s.classList.remove('is-active', 'is-done'));

    function runStep(index) {
      if (index >= steps.length) {
        setTimeout(() => {
          finishResearch(payload);
        }, 300);
        return;
      }

      steps.forEach((s) => s.classList.remove('is-active'));
      steps[index].classList.add('is-active');

      const stepDuration = STEP_LABELS_DURATIONS[index];
      const stepStart = elapsed;
      const stepStartTime = performance.now();

      function animateProgress(now) {
        const localElapsed = now - stepStartTime;
        const localProgress = Math.min(localElapsed / stepDuration, 1);
        const overallElapsed = stepStart + localElapsed;
        const overallProgress = Math.min(overallElapsed / totalDuration, 1);

        updateProgressUI(overallProgress);

        if (localProgress < 1) {
          requestAnimationFrame(animateProgress);
        } else {
          steps[index].classList.remove('is-active');
          steps[index].classList.add('is-done');
          elapsed += stepDuration;
          runStep(index + 1);
        }
      }
      requestAnimationFrame(animateProgress);
    }

    function updateProgressUI(progress) {
      const pct = Math.round(progress * 100);
      percentEl.textContent = pct + '%';
      barFill.style.width = pct + '%';
      ringProgress.style.strokeDasharray = String(CIRCUMFERENCE);
      ringProgress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - progress));
      const remainingMs = Math.max(totalDuration - progress * totalDuration, 0);
      etaEl.textContent = Math.ceil(remainingMs / 1000) + 's';
    }

    runStep(0);
  }

  function resetToFormState() {
    document.getElementById('formState').hidden = false;
    document.getElementById('loadingState').hidden = true;
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('researchForm').reset();

    const steps = document.querySelectorAll('.loader-step');
    steps.forEach((s) => s.classList.remove('is-active', 'is-done'));
    document.getElementById('loaderPercent').textContent = '0%';
    document.getElementById('progressBarFill').style.width = '0%';
  }

  /* ---------- 11. REPORT GENERATION + RENDERING ---------- */
  function finishResearch(payload) {
    const report = buildReportData(payload);
    renderReport(report);

    document.getElementById('research').hidden = true;
    const resultsSection = document.getElementById('results');
    resultsSection.hidden = false;

    // reset reveal state for report cards so they animate in
    resultsSection.querySelectorAll('.fade-up').forEach((el) => el.classList.remove('is-visible'));
    requestAnimationFrame(() => {
      resultsSection.querySelectorAll('.fade-up').forEach((el, i) => {
        setTimeout(() => el.classList.add('is-visible'), i * 60);
      });
    });

    scrollToId('results');
    showToast('Your research report is ready.', 'success');
    resetToFormState();
  }

  function buildReportData(payload) {
    const topic = payload.topic;
    const domain = capitalize(topic.split(' ').slice(-1)[0] || 'this field');

    return {
      topic,
      meta: [capitalize(payload.depth) + ' depth', capitalize(payload.style) + ' style', capitalize(payload.length) + ' length', new Date().toLocaleDateString()],
      summary: `This report examines "${topic}", synthesizing current sources to map the landscape, ` +
        `surface the strongest evidence, and translate findings into concrete next steps. ` +
        `The research draws on recent, credible sources and weighs competing perspectives before reaching its conclusions.`,
      findings: [
        `Adoption of ${topic.toLowerCase()} is accelerating faster than most public forecasts anticipated.`,
        `The strongest evidence points to efficiency gains as the primary near-term driver of change.`,
        `Regulatory and ethical questions remain the largest source of uncertainty going forward.`,
        `Early movers are already reporting measurable, if uneven, returns on investment.`
      ],
      stats: [
        { value: '73%', label: 'Organizations exploring adoption' },
        { value: '2.4x', label: 'Average efficiency gain reported' },
        { value: '41%', label: 'Citing cost as the top barrier' }
      ],
      challenges: [
        `Data quality and availability continue to limit how far ${topic.toLowerCase()} can scale reliably.`,
        `Talent and skills gaps slow implementation even where budget is available.`,
        `Governance frameworks have not kept pace with the rate of technical change.`
      ],
      trends: [
        { period: 'Near term (0–12 months)', text: 'Consolidation around a small number of dominant approaches and platforms.' },
        { period: 'Mid term (1–3 years)', text: 'Regulatory frameworks mature, shifting competitive advantage toward compliant, well-governed players.' },
        { period: 'Long term (3+ years)', text: `${domain}-specific standards emerge, and the technology becomes an assumed baseline rather than a differentiator.` }
      ],
      recommendations: [
        `Run a small, time-boxed pilot before committing to a full rollout of ${topic.toLowerCase()}.`,
        `Invest in data quality and governance ahead of tooling — it is the more common bottleneck.`,
        `Track the regulatory landscape closely; early compliance is cheaper than retrofitting it later.`
      ],
      references: [
        { title: 'Industry outlook and adoption survey', domain: 'source-report.org' },
        { title: 'Peer-reviewed analysis of recent developments', domain: 'journal-archive.edu' },
        { title: 'Market data and forecasts', domain: 'research-data.com' },
        { title: 'Regulatory and policy tracker', domain: 'policy-watch.gov' }
      ]
    };
  }

  function renderReport(report) {
    document.getElementById('resultTopicTitle').textContent = truncate(report.topic, 60);
    document.getElementById('reportTopicText').textContent = report.topic;

    const metaEl = document.getElementById('reportMeta');
    metaEl.innerHTML = '';
    report.meta.forEach((m) => {
      const span = document.createElement('span');
      span.textContent = m;
      metaEl.appendChild(span);
    });

    document.getElementById('reportSummary').textContent = report.summary;

    const findingsEl = document.getElementById('reportFindings');
    findingsEl.innerHTML = '';
    report.findings.forEach((f) => {
      const li = document.createElement('li');
      li.textContent = f;
      findingsEl.appendChild(li);
    });

    const statsEl = document.getElementById('reportStats');
    statsEl.innerHTML = '';
    report.stats.forEach((s) => {
      const div = document.createElement('div');
      div.className = 'mini-stat';
      div.innerHTML = `<span class="mini-stat-value">${s.value}</span><span class="mini-stat-label">${escapeHtml(s.label)}</span>`;
      statsEl.appendChild(div);
    });

    const challengesEl = document.getElementById('reportChallenges');
    challengesEl.innerHTML = '';
    report.challenges.forEach((c) => {
      const li = document.createElement('li');
      li.textContent = c;
      challengesEl.appendChild(li);
    });

    const trendsEl = document.getElementById('reportTrends');
    trendsEl.innerHTML = '';
    report.trends.forEach((t) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="timeline-period">${escapeHtml(t.period)}</span><p>${escapeHtml(t.text)}</p>`;
      trendsEl.appendChild(li);
    });

    const recEl = document.getElementById('reportRecommendations');
    recEl.innerHTML = '';
    report.recommendations.forEach((r) => {
      const li = document.createElement('li');
      li.textContent = r;
      recEl.appendChild(li);
    });

    const refEl = document.getElementById('reportReferences');
    refEl.innerHTML = '';
    report.references.forEach((r) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.addEventListener('click', (e) => e.preventDefault());
      a.innerHTML = `<span>${escapeHtml(r.title)}</span><span class="ref-domain">${escapeHtml(r.domain)}</span>`;
      li.appendChild(a);
      refEl.appendChild(li);
    });

    window.__currentReport = report;

    document.getElementById('openDocBtn').onclick = () => showToast('Opening Google Document…', 'info');
  }

  /* ---------- 12. COPY / DOWNLOAD REPORT ---------- */
  function initCopyDownload() {
    ['copyReportBtn', 'copyReportBtn2'].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', copyReportToClipboard);
    });
    ['downloadReportBtn', 'downloadReportBtn2'].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', downloadReportAsText);
    });
  }

  function reportToPlainText(report) {
    if (!report) return '';
    const lines = [];
    lines.push(report.topic.toUpperCase());
    lines.push('');
    lines.push('EXECUTIVE SUMMARY');
    lines.push(report.summary);
    lines.push('');
    lines.push('KEY FINDINGS');
    report.findings.forEach((f) => lines.push('- ' + f));
    lines.push('');
    lines.push('CHALLENGES');
    report.challenges.forEach((c) => lines.push('- ' + c));
    lines.push('');
    lines.push('FUTURE TRENDS');
    report.trends.forEach((t) => lines.push(t.period + ': ' + t.text));
    lines.push('');
    lines.push('RECOMMENDATIONS');
    report.recommendations.forEach((r) => lines.push('- ' + r));
    lines.push('');
    lines.push('REFERENCES');
    report.references.forEach((r) => lines.push('- ' + r.title + ' (' + r.domain + ')'));
    return lines.join('\n');
  }

  async function copyReportToClipboard() {
    const report = window.__currentReport;
    if (!report) return;
    const text = reportToPlainText(report);
    try {
      await navigator.clipboard.writeText(text);
      showToast('Report copied to clipboard.', 'success');
    } catch (err) {
      showToast('Could not copy automatically — please select and copy manually.', 'error');
    }
  }

  function downloadReportAsText() {
    const report = window.__currentReport;
    if (!report) return;
    const text = reportToPlainText(report);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-report.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Report downloaded.', 'success');
  }

  /* ---------- 13. TOAST NOTIFICATIONS ---------- */
  function showToast(message, type) {
    const stack = document.getElementById('toastStack');
    if (!stack) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');

    const icons = { success: '✓', info: 'i', error: '!' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${escapeHtml(message)}</span>`;
    stack.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('is-leaving');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3200);
  }

  /* ---------- 14. BACK TO TOP ---------- */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    const onScroll = () => btn.classList.toggle('is-visible', window.scrollY > 500);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- UTILITIES ---------- */
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function truncate(str, max) {
    return str.length > max ? str.slice(0, max - 1) + '…' : str;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // wire up copy/download once DOM is ready (elements exist before results shown)
  document.addEventListener('DOMContentLoaded', initCopyDownload);
})();