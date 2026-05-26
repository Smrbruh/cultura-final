/* ============================================================
   Cultural Studies Prep Hub — script.js
   Production-quality interactive JavaScript
   ============================================================ */

/* ============================================================
   DOM READY
   ============================================================ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initTheme();
    initSidebarNav();
    initActiveSectionTracking();
    initExpandCollapse();
    initStudyProgress();
    initDashboard();
    initSearch();
    initFlashcards();
    initQuiz();
    initBackToTop();
    initRevealAnimations();
    initTableResponsiveness();
    initAccessibility();
    initThemeToggleButton();
    initMarkStudied();
    updateDashboard();
  }

  /* ============================================================
     ELEMENT SELECTORS — Cached references
     ============================================================ */
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ============================================================
     THEME TOGGLE
     ============================================================ */
  function initTheme() {
    const stored = localStorage.getItem('culturalHub_theme');
    if (stored) {
      document.body.setAttribute('data-theme', stored);
    }
    // Default is dark (already set on body in HTML)
  }

  function initThemeToggleButton() {
    // Create and inject the theme toggle button into the header
    const headerMeta = qs('.header-meta');
    if (!headerMeta) return;

    const btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.className = 'badge badge-course';
    btn.setAttribute('aria-label', 'Toggle light/dark theme');
    btn.setAttribute('type', 'button');
    btn.style.cssText = `
      cursor: pointer;
      background: none;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-family: var(--font-sans);
      font-size: 0.675rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 0.2rem 0.65rem;
      border-radius: 20px;
      transition: all 250ms ease;
      white-space: nowrap;
    `;
    btn.innerHTML = currentTheme() === 'dark' ? '&#9788; Light' : '&#9790; Dark';

    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', next);
      localStorage.setItem('culturalHub_theme', next);
      btn.innerHTML = next === 'dark' ? '&#9788; Light' : '&#9790; Dark';
    });

    headerMeta.prepend(btn);
  }

  function currentTheme() {
    return document.body.getAttribute('data-theme') || 'dark';
  }

  /* ============================================================
     SIDEBAR NAVIGATION — Smooth scrolling + active state
     ============================================================ */
  function initSidebarNav() {
    const navLinks = qsa('.nav-link');

    navLinks.forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = qs(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update active immediately on click
        setActiveNavLink(link);
      });

      // Keyboard: Enter / Space
      link.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          link.click();
        }
      });
    });
  }

  function setActiveNavLink(activeLink) {
    qsa('.nav-link').forEach(l => l.classList.remove('active'));
    if (activeLink) activeLink.classList.add('active');
  }

  /* ============================================================
     ACTIVE SECTION TRACKING — IntersectionObserver for nav
     ============================================================ */
  function initActiveSectionTracking() {
    const sections = qsa('.lecture-section, .dashboard-section, #all-scholars, #all-exam-questions, #all-flashcards');
    if (!sections.length) return;

    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const activeLink = qs(`.nav-link[href="#${id}"]`);
            if (activeLink) setActiveNavLink(activeLink);
          }
        });
      },
      {
        rootMargin: `-${headerH + 20}px 0px -60% 0px`,
        threshold: 0,
      }
    );

    sections.forEach(sec => observer.observe(sec));
  }

  /* ============================================================
     EXPAND / COLLAPSE CONTENT
     ============================================================ */
  function initExpandCollapse() {
    // All <details> elements get tracked
    qsa('details').forEach(details => {
      const summary = qs('summary', details);
      if (!summary) return;

      // Sync aria-expanded
      updateAriaExpanded(details);

      details.addEventListener('toggle', () => {
        updateAriaExpanded(details);
      });

      // Smooth animation
      details.addEventListener('toggle', () => {
        if (details.open) {
          const content = details.querySelector(':not(summary)');
          if (content) {
            content.style.animation = 'fadeIn 0.25s ease both';
          }
        }
      });
    });

    // Inject "Expand All / Collapse All" button before each expanded-notes section
    qsa('.expanded-notes').forEach(notesSection => {
      const article = notesSection.closest('.lecture-article');
      if (!article) return;

      const container = document.createElement('div');
      container.className = 'expand-controls';
      container.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:0.75rem;';

      const expandBtn = createControlBtn('Expand All', () => {
        qsa('details', notesSection).forEach(d => { d.open = true; });
      });
      const collapseBtn = createControlBtn('Collapse All', () => {
        qsa('details', notesSection).forEach(d => { d.open = false; });
      });

      container.appendChild(expandBtn);
      container.appendChild(collapseBtn);
      notesSection.before(container);
    });
  }

  function createControlBtn(label, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.style.cssText = `
      padding: 0.2rem 0.7rem;
      font-size: 0.68rem;
      font-family: var(--font-sans);
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: 1px solid var(--border);
      border-radius: 20px;
      background: var(--surface-raised);
      color: var(--text-muted);
      cursor: pointer;
      transition: all 150ms ease;
    `;
    btn.addEventListener('mouseover', () => {
      btn.style.borderColor = 'var(--accent)';
      btn.style.color = 'var(--accent)';
    });
    btn.addEventListener('mouseout', () => {
      btn.style.borderColor = 'var(--border)';
      btn.style.color = 'var(--text-muted)';
    });
    btn.addEventListener('click', onClick);
    return btn;
  }

  function updateAriaExpanded(details) {
    const summary = qs('summary', details);
    if (summary) summary.setAttribute('aria-expanded', String(details.open));
  }

  /* ============================================================
     MARK AS STUDIED / STUDY PROGRESS
     ============================================================ */
  function initMarkStudied() {
    const STORAGE_KEY = 'culturalHub_completed';
    const completed = getCompleted();

    qsa('.lecture-section[data-lecture]').forEach(section => {
      const lectureNum = section.getAttribute('data-lecture');
      const header = qs('.lecture-header', section);
      if (!header) return;

      // Create button
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mark-studied-btn';
      btn.setAttribute('data-lecture', lectureNum);
      btn.setAttribute('aria-pressed', completed.includes(lectureNum) ? 'true' : 'false');

      const isCompleted = completed.includes(lectureNum);
      styleStudiedBtn(btn, isCompleted);

      btn.addEventListener('click', () => {
        const current = getCompleted();
        let next;
        if (current.includes(lectureNum)) {
          next = current.filter(n => n !== lectureNum);
          styleStudiedBtn(btn, false);
          btn.setAttribute('aria-pressed', 'false');
        } else {
          next = [...current, lectureNum];
          styleStudiedBtn(btn, true);
          btn.setAttribute('aria-pressed', 'true');
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        updateDashboard();
        updateNavCompletionDots(next);
      });

      header.appendChild(btn);

      // Show initial dots
      updateNavCompletionDots(completed);
    });
  }

  function styleStudiedBtn(btn, isComplete) {
    if (isComplete) {
      btn.textContent = '✓ Studied';
      btn.style.cssText = `
        margin-top: 1rem;
        padding: 0.4rem 1rem;
        font-size: 0.75rem;
        font-family: var(--font-sans);
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        border: 1px solid rgba(74, 168, 120, 0.5);
        border-radius: 20px;
        background: rgba(74, 168, 120, 0.15);
        color: #62c48a;
        cursor: pointer;
        transition: all 200ms ease;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      `;
    } else {
      btn.textContent = '○ Mark as Studied';
      btn.style.cssText = `
        margin-top: 1rem;
        padding: 0.4rem 1rem;
        font-size: 0.75rem;
        font-family: var(--font-sans);
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        border: 1px solid var(--border);
        border-radius: 20px;
        background: var(--surface-raised);
        color: var(--text-muted);
        cursor: pointer;
        transition: all 200ms ease;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      `;
    }
  }

  function getCompleted() {
    try {
      return JSON.parse(localStorage.getItem('culturalHub_completed') || '[]');
    } catch {
      return [];
    }
  }

  function updateNavCompletionDots(completedArr) {
    qsa('.nav-link[data-lecture]').forEach(link => {
      const num = link.getAttribute('data-lecture');
      const existingDot = qs('.nav-complete-dot', link);
      if (existingDot) existingDot.remove();

      if (completedArr.includes(num)) {
        const dot = document.createElement('span');
        dot.className = 'nav-complete-dot';
        dot.textContent = '✓';
        dot.style.cssText = `
          font-size: 0.6rem;
          color: #62c48a;
          margin-left: auto;
          flex-shrink: 0;
        `;
        link.appendChild(dot);
      }
    });
  }

  /* ============================================================
     STUDY PROGRESS TRACKER
     ============================================================ */
  function initStudyProgress() {
    // Handled within updateDashboard
  }

  /* ============================================================
     DASHBOARD UPDATES
     ============================================================ */
  function updateDashboard() {
    const completed = getCompleted();
    const totalLectures = qsa('.lecture-section[data-lecture]').length;
    const completedCount = completed.length;
    const pct = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

    // Update stat elements
    safeSetText('stat-total-lectures', String(totalLectures || 10));
    safeSetText('stat-completed', String(completedCount));

    // Update progress bar
    const progressBar = qs('#progress-bar-completed');
    if (progressBar) {
      progressBar.setAttribute('data-progress', String(pct));
      progressBar.setAttribute('aria-label', `${completedCount} of ${totalLectures} lectures marked complete`);
      progressBar.style.background = `linear-gradient(90deg, var(--accent) ${pct}%, var(--border-subtle) ${pct}%)`;
    }

    // Count scholars dynamically
    const scholarCount = qsa('.scholar-card').length;
    if (scholarCount > 0) safeSetText('stat-total-scholars', `${scholarCount}+`);

    // Count concepts
    const conceptCount = qsa('.definition-item').length;
    if (conceptCount > 0) safeSetText('stat-total-concepts', `${conceptCount}+`);

    // Count exam questions
    const examCount = qsa('.exam-question').length;
    if (examCount > 0) safeSetText('stat-exam-questions', `${examCount}+`);
  }

  function initDashboard() {
    // Animate progress bars on load
    qsa('.progress-indicator[data-progress]').forEach(bar => {
      const pct = parseInt(bar.getAttribute('data-progress') || '0');
      if (bar.id === 'progress-bar-completed') return; // handled by updateDashboard
      bar.style.background = `linear-gradient(90deg, var(--accent) ${pct}%, var(--border-subtle) ${pct}%)`;
    });
  }

  function safeSetText(id, text) {
    const el = qs(`#${id}`);
    if (el) el.textContent = text;
  }

  /* ============================================================
     GLOBAL SEARCH
     ============================================================ */
  function initSearch() {
    // Inject search bar into the sidebar
    const sidebar = qs('.sidebar');
    if (!sidebar) return;

    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'sidebar-section';
    searchWrapper.style.cssText = 'padding: 0 1rem 1rem;';

    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.id = 'global-search';
    searchInput.placeholder = '🔍 Search lectures, concepts...';
    searchInput.setAttribute('aria-label', 'Search all content');
    searchInput.style.cssText = `
      width: 100%;
      padding: 0.5rem 0.85rem;
      font-size: 0.8rem;
      font-family: var(--font-sans);
      background: var(--bg-primary);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      outline: none;
      transition: border-color 200ms ease, box-shadow 200ms ease;
    `;

    searchInput.addEventListener('focus', () => {
      searchInput.style.borderColor = 'var(--accent)';
      searchInput.style.boxShadow = '0 0 0 2px var(--accent-soft)';
    });

    searchInput.addEventListener('blur', () => {
      searchInput.style.borderColor = 'var(--border-subtle)';
      searchInput.style.boxShadow = 'none';
    });

    // Results container
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'search-results';
    resultsContainer.style.cssText = `
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 220px;
      overflow-y: auto;
    `;

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = '× Clear';
    clearBtn.style.cssText = `
      display: none;
      margin-top: 0.35rem;
      font-size: 0.7rem;
      font-family: var(--font-sans);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0;
      text-align: left;
    `;
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearch();
      clearBtn.style.display = 'none';
    });

    searchWrapper.appendChild(searchInput);
    searchWrapper.appendChild(clearBtn);
    searchWrapper.appendChild(resultsContainer);

    // Insert before nav
    const firstSection = qs('.sidebar-section', sidebar);
    if (firstSection) sidebar.querySelector('.sidebar-nav').prepend(searchWrapper);

    // Search logic
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const query = searchInput.value.trim();

      if (!query) {
        clearSearch();
        clearBtn.style.display = 'none';
        return;
      }

      clearBtn.style.display = 'block';
      searchTimeout = setTimeout(() => performSearch(query, resultsContainer), 200);
    });
  }

  function performSearch(query, container) {
    container.innerHTML = '';
    clearHighlights();

    const lower = query.toLowerCase();
    const results = [];

    // Searchable elements
    const searchTargets = [
      { selector: '.term-name', typeLabel: 'Concept' },
      { selector: '.term-definition', typeLabel: 'Definition' },
      { selector: '.scholar-name', typeLabel: 'Scholar' },
      { selector: '.exam-question', typeLabel: 'Exam Q' },
      { selector: '.lecture-title', typeLabel: 'Lecture' },
      { selector: '.article-heading', typeLabel: 'Section' },
    ];

    searchTargets.forEach(({ selector, typeLabel }) => {
      qsa(selector).forEach(el => {
        const text = el.textContent.toLowerCase();
        if (text.includes(lower)) {
          const section = el.closest('.lecture-section') || el.closest('section');
          const sectionId = section ? section.id : null;
          const lectureTitle = section ? (qs('.lecture-title', section) || qs('[id$="-heading"]', section)) : null;
          const lectureLabel = lectureTitle ? lectureTitle.textContent.trim().substring(0, 35) : typeLabel;

          results.push({
            el,
            sectionId,
            label: el.textContent.trim().substring(0, 50),
            type: typeLabel,
            lectureLabel,
          });

          highlightText(el, query);
        }
      });
    });

    if (results.length === 0) {
      const noResult = document.createElement('div');
      noResult.style.cssText = 'font-size:0.75rem;color:var(--text-muted);font-family:var(--font-sans);padding:0.35rem 0;';
      noResult.textContent = 'No results found.';
      container.appendChild(noResult);
      return;
    }

    // Show up to 8 results
    results.slice(0, 8).forEach(result => {
      const item = document.createElement('button');
      item.type = 'button';
      item.style.cssText = `
        display: block;
        width: 100%;
        text-align: left;
        padding: 0.4rem 0.6rem;
        font-size: 0.74rem;
        font-family: var(--font-sans);
        background: var(--bg-primary);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 150ms ease;
        line-height: 1.3;
      `;

      item.innerHTML = `<span style="color:var(--accent);font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">${result.type}</span><br>${result.label}...`;

      item.addEventListener('mouseover', () => {
        item.style.background = 'var(--accent-soft)';
        item.style.borderColor = 'var(--border)';
      });
      item.addEventListener('mouseout', () => {
        item.style.background = 'var(--bg-primary)';
        item.style.borderColor = 'var(--border-subtle)';
      });

      item.addEventListener('click', () => {
        result.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        result.el.style.transition = 'background 300ms ease';
        result.el.style.background = 'var(--accent-soft)';
        setTimeout(() => {
          result.el.style.background = '';
        }, 1500);
      });

      container.appendChild(item);
    });

    if (results.length > 8) {
      const more = document.createElement('div');
      more.style.cssText = 'font-size:0.72rem;color:var(--text-muted);font-family:var(--font-sans);padding:0.3rem 0.4rem;';
      more.textContent = `+${results.length - 8} more results`;
      container.appendChild(more);
    }
  }

  function clearSearch() {
    clearHighlights();
    const container = qs('#search-results');
    if (container) container.innerHTML = '';
  }

  function highlightText(el, query) {
    // Simple visual highlight via outline
    el.setAttribute('data-search-highlighted', 'true');
    el.style.outline = '1px dashed var(--accent)';
    el.style.outlineOffset = '2px';
    el.style.borderRadius = '3px';
  }

  function clearHighlights() {
    qsa('[data-search-highlighted]').forEach(el => {
      el.removeAttribute('data-search-highlighted');
      el.style.outline = '';
      el.style.outlineOffset = '';
    });
  }

  /* ============================================================
     FLASHCARDS — Click to flip
     ============================================================ */
  function initFlashcards() {
    const STORAGE_KEY = 'culturalHub_flashcards';
    const flipped = getFlashcardState();

    qsa('.flashcard').forEach((card, idx) => {
      const cardId = getCardId(card, idx);

      // Restore state
      if (flipped[cardId]) {
        card.setAttribute('aria-pressed', 'true');
      }

      card.addEventListener('click', () => toggleFlashcard(card, cardId));

      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFlashcard(card, cardId);
        }
      });
    });

    // Add "Flip All" / "Reset All" controls per flashcard-container
    qsa('.flashcard-container').forEach(container => {
      const controls = document.createElement('div');
      controls.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:0.65rem;flex-wrap:wrap;';

      const flipAllBtn = createControlBtn('Flip All', () => {
        qsa('.flashcard', container).forEach((card, idx) => {
          const cid = getCardId(card, idx);
          card.setAttribute('aria-pressed', 'true');
          saveFlashcardState(cid, true);
        });
      });

      const resetBtn = createControlBtn('Reset All', () => {
        qsa('.flashcard', container).forEach((card, idx) => {
          const cid = getCardId(card, idx);
          card.setAttribute('aria-pressed', 'false');
          saveFlashcardState(cid, false);
        });
      });

      controls.appendChild(flipAllBtn);
      controls.appendChild(resetBtn);
      container.before(controls);
    });
  }

  function toggleFlashcard(card, cardId) {
    const isFlipped = card.getAttribute('aria-pressed') === 'true';
    card.setAttribute('aria-pressed', String(!isFlipped));
    saveFlashcardState(cardId, !isFlipped);
  }

  function getCardId(card, fallbackIdx) {
    const container = card.closest('[data-lecture]');
    const lectureId = container ? container.getAttribute('data-lecture') : 'global';
    const cardNum = card.getAttribute('data-card') || fallbackIdx;
    return `${lectureId}_card_${cardNum}`;
  }

  function getFlashcardState() {
    try {
      return JSON.parse(localStorage.getItem('culturalHub_flashcards') || '{}');
    } catch {
      return {};
    }
  }

  function saveFlashcardState(cardId, state) {
    const current = getFlashcardState();
    current[cardId] = state;
    localStorage.setItem('culturalHub_flashcards', JSON.stringify(current));
  }

  /* ============================================================
     QUIZ PLACEHOLDER LOGIC
     ============================================================ */
  function initQuiz() {
    const STORAGE_KEY = 'culturalHub_quiz';
    const quizScores = getQuizScores();

    qsa('.quiz-container').forEach(container => {
      const lectureNum = container.getAttribute('data-lecture');
      const questions = qsa('.quiz-question-placeholder', container);
      if (!questions.length) return;

      // Track answers per quiz
      const state = {
        answers: {},
        score: quizScores[lectureNum] || { correct: 0, total: 0 },
      };

      // Score display
      const scoreBadge = document.createElement('div');
      scoreBadge.className = 'quiz-score-badge';
      scoreBadge.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.3rem 0.75rem;
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: 20px;
        font-size: 0.74rem;
        font-family: var(--font-sans);
        color: var(--text-muted);
        margin-bottom: 0.85rem;
      `;
      scoreBadge.textContent = `Score: —`;
      container.prepend(scoreBadge);

      let totalAnswered = 0;
      let totalCorrect = 0;

      questions.forEach((qBlock, qIdx) => {
        const options = qsa('.quiz-option', qBlock);
        let answered = false;

        options.forEach(opt => {
          opt.style.cursor = 'pointer';
          opt.setAttribute('role', 'button');
          opt.setAttribute('tabindex', '0');

          const handleAnswer = () => {
            if (answered) return;
            answered = true;
            totalAnswered++;

            const isCorrect = opt.getAttribute('data-correct') === 'true';
            if (isCorrect) totalCorrect++;

            // Visual feedback
            options.forEach(o => {
              const correct = o.getAttribute('data-correct') === 'true';
              if (correct) {
                o.style.background = 'rgba(74, 168, 120, 0.2)';
                o.style.borderColor = 'rgba(74, 168, 120, 0.5)';
                o.style.color = '#62c48a';
              } else if (o === opt) {
                o.style.background = 'rgba(196, 113, 74, 0.15)';
                o.style.borderColor = 'rgba(196, 113, 74, 0.4)';
                o.style.color = 'var(--accent2)';
              }
              o.style.cursor = 'default';
            });

            // Update score badge
            scoreBadge.textContent = `Score: ${totalCorrect}/${totalAnswered}`;
            const pct = Math.round((totalCorrect / totalAnswered) * 100);
            scoreBadge.style.color = pct >= 70 ? '#62c48a' : pct >= 40 ? 'var(--accent)' : 'var(--accent2)';

            // Persist quiz score
            const scores = getQuizScores();
            scores[lectureNum] = { correct: totalCorrect, total: totalAnswered, pct };
            localStorage.setItem('culturalHub_quiz', JSON.stringify(scores));

            // Update dashboard quiz score
            updateQuizScoreDashboard();
          };

          opt.addEventListener('click', handleAnswer);
          opt.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleAnswer();
            }
          });
        });
      });
    });

    updateQuizScoreDashboard();
  }

  function getQuizScores() {
    try {
      return JSON.parse(localStorage.getItem('culturalHub_quiz') || '{}');
    } catch {
      return {};
    }
  }

  function updateQuizScoreDashboard() {
    const scores = getQuizScores();
    const vals = Object.values(scores);
    if (!vals.length) return;

    const totalCorrect = vals.reduce((a, b) => a + (b.correct || 0), 0);
    const totalQ = vals.reduce((a, b) => a + (b.total || 0), 0);

    if (totalQ === 0) return;

    const pct = Math.round((totalCorrect / totalQ) * 100);
    safeSetText('stat-quiz-score', `${pct}%`);

    const bar = qs('#progress-bar-quiz');
    if (bar) {
      bar.setAttribute('data-progress', String(pct));
      bar.setAttribute('aria-label', `Quiz score: ${pct}%`);
      bar.style.background = `linear-gradient(90deg, var(--accent) ${pct}%, var(--border-subtle) ${pct}%)`;
    }
  }

  /* ============================================================
     BACK TO TOP BUTTON
     ============================================================ */
  function initBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '&#8679;';
    btn.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--accent);
      color: var(--text-inverse);
      border: none;
      font-size: 1.3rem;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-md);
      opacity: 0;
      transform: translateY(12px) scale(0.85);
      transition: opacity 300ms ease, transform 300ms ease;
      z-index: 200;
      pointer-events: none;
    `;

    document.body.appendChild(btn);

    let visible = false;

    const show = () => {
      if (!visible) {
        visible = true;
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0) scale(1)';
        btn.style.pointerEvents = 'auto';
      }
    };

    const hide = () => {
      if (visible) {
        visible = false;
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(12px) scale(0.85)';
        btn.style.pointerEvents = 'none';
      }
    };

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          window.scrollY > 400 ? show() : hide();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  }

  /* ============================================================
     SECTION REVEAL ANIMATIONS — IntersectionObserver
     ============================================================ */
  function initRevealAnimations() {
    // Only animate elements that haven't been seen
    const revealTargets = [
      '.definition-item',
      '.scholar-card',
      '.example-card',
      '.memorize-item',
      '.mnemonic-card',
      '.flashcard',
      '.exam-question',
    ].join(', ');

    const elements = qsa(revealTargets);

    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // Small delay for stagger effect
            const idx = elements.indexOf(el);
            const delay = Math.min((idx % 6) * 40, 200);
            setTimeout(() => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05,
      }
    );

    elements.forEach(el => observer.observe(el));
  }

  /* ============================================================
     TABLE RESPONSIVENESS HELPERS
     ============================================================ */
  function initTableResponsiveness() {
    qsa('.table-wrapper').forEach(wrapper => {
      const table = qs('table', wrapper);
      if (!table) return;

      // Scroll shadow indicators
      const updateShadows = () => {
        const atStart = wrapper.scrollLeft <= 2;
        const atEnd = wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 2;

        wrapper.style.boxShadow = [
          !atStart ? 'inset 8px 0 12px -8px rgba(0,0,0,0.3)' : '',
          !atEnd ? 'inset -8px 0 12px -8px rgba(0,0,0,0.3)' : '',
        ]
          .filter(Boolean)
          .join(', ') || 'none';
      };

      wrapper.addEventListener('scroll', updateShadows, { passive: true });

      // Check on load if table overflows
      requestAnimationFrame(() => {
        if (table.scrollWidth > wrapper.clientWidth) {
          updateShadows();
          // Add a "scroll to see more" hint
          if (!qs('.table-scroll-hint', wrapper.parentElement)) {
            const hint = document.createElement('p');
            hint.className = 'table-scroll-hint';
            hint.style.cssText = `
              font-size: 0.7rem;
              color: var(--text-muted);
              font-family: var(--font-sans);
              margin-top: 0.25rem;
              max-width: none;
            `;
            hint.textContent = '← Scroll to see full table →';
            wrapper.after(hint);
          }
        }
      });
    });
  }

  /* ============================================================
     ACCESSIBILITY
     ============================================================ */
  function initAccessibility() {
    // Add role/aria to interactive elements that might be missing it
    qsa('.quiz-option').forEach(opt => {
      if (!opt.getAttribute('role')) opt.setAttribute('role', 'button');
      if (!opt.getAttribute('tabindex')) opt.setAttribute('tabindex', '0');
    });

    // Make scholar cards keyboard-navigable for accessibility
    qsa('.scholar-card').forEach(card => {
      if (!card.getAttribute('tabindex')) card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'article');
    });

    // Focus trap is NOT needed here (no modals), but we manage focus on nav click
    qsa('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        // After scrolling, briefly focus the target section heading for screen readers
        const href = link.getAttribute('href');
        if (!href) return;
        const target = qs(href);
        if (!target) return;
        setTimeout(() => {
          const heading = qs('h2', target);
          if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus({ preventScroll: true });
          }
        }, 600);
      });
    });

    // Announce quiz results to screen readers
    qsa('.quiz-container').forEach(container => {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
      container.appendChild(liveRegion);
    });
  }

  /* ============================================================
     UTILITY
     ============================================================ */
  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

})();
