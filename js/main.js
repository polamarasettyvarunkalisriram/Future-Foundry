/* ==========================================================================
   FUTURE FOUNDRY — site interactions
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  window.addEventListener("DOMContentLoaded", () => {
    const pre = $("#preloader");
    if (pre) setTimeout(() => pre.classList.add("hidden"), 500);
  });
  // Safety fallback if DOMContentLoaded already fired / anything hangs
  setTimeout(() => $("#preloader")?.classList.add("hidden"), 3500);

  /* ---------- Header scroll state ---------- */
  const header = $("#siteHeader");
  const backToTop = $("#backToTop");
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 24);
    backToTop?.classList.toggle("show", y > 600);
    setActiveNav();
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Active nav link ---------- */
  const sections = $$("main section[id]");
  function setActiveNav() {
    const pos = window.scrollY + 140;
    let current = "";
    sections.forEach((s) => {
      if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) current = s.id;
    });
    $$(".nav-link").forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }

  /* ---------- Mobile menu ---------- */
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");
  function closeMenu() {
    mobileMenu?.classList.remove("open");
    menuToggle?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  menuToggle?.addEventListener("click", () => {
    const open = !mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open", open);
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$(".m-link").forEach((a) => a.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1200) closeMenu();
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Animated counters ---------- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    if (prefersReduced) { el.textContent = target; return; }
    const dur = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const counters = $$(".counter");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCounter(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = parseFloat(c.dataset.target).toLocaleString()));
  }

  /* ---------- Project filtering ---------- */
  const filterBtns = $$(".filter-btn");
  const projectCards = $$(".project-card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      projectCards.forEach((card) => {
        const show = f === "all" || card.dataset.category === f;
        card.classList.toggle("hide", !show);
        if (show) {
          card.classList.remove("anim-in");
          void card.offsetWidth;
          card.classList.add("anim-in");
        }
      });
    });
  });

  /* ---------- Tech tabs ---------- */
  const techTabs = $$(".tech-tab");
  const techPanels = $$(".tech-panel");
  techTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      techTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const cat = tab.dataset.cat;
      techPanels.forEach((p) => p.classList.toggle("active", p.id === "cat-" + cat));
    });
  });

  /* ---------- FAQ accordion ---------- */
  const faqItems = $$(".faq-item");
  faqItems.forEach((item) => {
    const q = $(".faq-q", item);
    const a = $(".faq-a", item);
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach((other) => {
        other.classList.remove("open");
        $(".faq-q", other).setAttribute("aria-expanded", "false");
        $(".faq-a", other).style.maxHeight = "0px";
      });
      if (!isOpen) {
        item.classList.add("open");
        q.setAttribute("aria-expanded", "true");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- Testimonials carousel ---------- */
  const track = $("#carouselTrack");
  const dotsWrap = $("#carDots");
  const slides = track ? $$(".t-card", track) : [];
  if (track && slides.length) {
    let index = 0;
    let timer = null;
    slides.forEach((_, i) => {
      const d = document.createElement("button");
      d.className = "car-dot" + (i === 0 ? " active" : "");
      d.setAttribute("aria-label", "Go to slide " + (i + 1));
      d.addEventListener("click", () => { go(i); restart(); });
      dotsWrap.appendChild(d);
    });
    const dots = $$(".car-dot", dotsWrap);
    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("active", di === index));
    }
    function restart() {
      clearInterval(timer);
      if (!prefersReduced) timer = setInterval(() => go(index + 1), 5000);
    }
    $("#carPrev")?.addEventListener("click", () => { go(index - 1); restart(); });
    $("#carNext")?.addEventListener("click", () => { go(index + 1); restart(); });
    const carousel = $("#carousel");
    carousel?.addEventListener("mouseenter", () => clearInterval(timer));
    carousel?.addEventListener("mouseleave", restart);
    // swipe support
    let startX = 0;
    carousel?.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
    carousel?.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 48) { go(index + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });
    restart();
  }

  /* ---------- Back to top ---------- */
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" }));

  /* ---------- Forms ---------- */
  const form = $("#contactForm");
  const formNote = $("#formNote");
  function setErr(field, err) { field.classList.toggle("error", err); }
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#cf-name");
    const email = $("#cf-email");
    const subject = $("#cf-subject");
    const message = $("#cf-message");
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let ok = true;
    setErr(name, name.value.trim().length < 2); ok = ok && name.value.trim().length >= 2;
    setErr(email, !emailRe.test(email.value.trim())); ok = ok && emailRe.test(email.value.trim());
    setErr(subject, subject.value.trim().length < 3); ok = ok && subject.value.trim().length >= 3;
    setErr(message, message.value.trim().length < 10); ok = ok && message.value.trim().length >= 10;

    if (!ok) {
      formNote.textContent = "Please fix the highlighted fields.";
      formNote.className = "form-note error";
      return;
    }
    formNote.textContent = "";
    const btn = $("button[type=submit]", form);
    btn.disabled = true;
    btn.innerHTML = "Sending...";
    setTimeout(() => {
      formNote.textContent = "Thank you! Your message has been received. We'll reply within 24 hours.";
      formNote.className = "form-note";
      form.reset();
      btn.disabled = false;
      btn.innerHTML = "Send Message <svg class='btn-arrow'><use href='#i-send'/></svg>";
    }, 1200);
  });
  $$("#contactForm .field input, #contactForm .field textarea").forEach((el) => {
    el.addEventListener("input", () => setErr(el.closest(".field"), false));
  });

  $("#newsForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("input", e.target);
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    const btn = $("button", e.target);
    if (!ok) {
      input.style.borderColor = "#f87171";
      input.value = "";
      input.placeholder = "Please enter a valid email";
      return;
    }
    btn.textContent = "Subscribed ✓";
    input.value = "";
    input.placeholder = "you@email.com";
    setTimeout(() => (btn.textContent = "Subscribe"), 3000);
  });

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ==========================================================================
     PROJECT DETAIL MODAL
     ========================================================================== */
  const PROJECTS = {
    "ai-travel-planner": {
      name: "AI-Travel-Planner",
      category: "AI Projects",
      status: "Live",
      grad: "pj-1",
      overview:
        "AI-Travel-Planner is a full-stack AI travel assistant that turns a few prompts into complete, personalized itineraries. Built around an OpenAI-powered conversation layer, it combines budget, dates, and interests into a day-by-day plan — with a live demo anyone can try.",
      problem:
        "Generic travel sites return search results, not plans — users still spend hours stitching together routes, stays, and activities by hand.",
      solution:
        "We built an AI copilot that asks a few quick questions, then assembles a structured itinerary with optimized routing and budget-aware recommendations. A polished login flow and saved-trips dashboard keep everything organized.",
      features: [
        "AI itinerary generation from a chat prompt",
        "Login & saved-trips dashboard",
        "Budget-aware recommendations",
        "Attraction, stay, and dining suggestions",
        "Responsive full-stack web app",
      ],
      stack: ["Next.js", "React", "TypeScript", "OpenAI", "Node.js", "PostgreSQL"],
      screenshots: ["Login", "Itinerary", "Dashboard"],
      github: "https://github.com/polamarasettyvarunkalisriram",
      demo: "https://ai-travel-planner-ten-tan.vercel.app/login",
      timeline: [
        { phase: "Concept & UX", period: "2 weeks", desc: "Flow mapping for login, planner, and saved trips." },
        { phase: "AI Integration", period: "4 weeks", desc: "Prompt pipeline and itinerary generation logic." },
        { phase: "Frontend Build", period: "4 weeks", desc: "Responsive UI for the planning experience." },
        { phase: "Deploy", period: "2 weeks", desc: "Deployed to Vercel with live demo access." },
      ],
      members: ["Sriram PVK", "Rohit Sai", "Varun Pilla"],
      lessons: [
        "A working live demo speaks louder than screenshots — deploy early and iterate on real feedback.",
        "Structured prompts and good defaults matter more than raw model capability.",
      ],
    },
    "rag-assistant": {
      name: "Role-Aware Logistics Chat Assistant",
      category: "AI Projects",
      status: "Live",
      grad: "pj-1",
      overview:
        "An AI-powered chat assistant built for multiple logistics roles, delivering role-specific responses based on each user's responsibilities and permissions. A role-aware Retrieval-Augmented Generation (RAG) system retrieves relevant knowledge and generates accurate, context-aware answers for every role.",
      problem:
        "Warehouse, dispatch, and admin teams all need different information — a generic assistant either overshares sensitive data or gives answers too vague to act on.",
      solution:
        "We built a RAG pipeline where retrieval and generation are gated by role-based access control. Each user's permissions shape which knowledge is retrieved, so answers are always relevant, accurate, and scoped to the user's role.",
      features: [
        "Role-specific responses",
        "Role-aware RAG retrieval",
        "Role-based access control",
        "Semantic search & context retrieval",
        "Intelligent question answering",
      ],
      stack: ["Python", "FastAPI", "RAG", "LLM", "Vector Database", "LangChain", "PostgreSQL"],
      screenshots: ["Architecture", "Chat", "Access Control"],
      timeline: [
        { phase: "Data & Embeddings", period: "2 weeks", desc: "Chunking logistics knowledge and building the vector index." },
        { phase: "RAG Pipeline", period: "3 weeks", desc: "Retrieval, ranking, and LLM generation flow." },
        { phase: "Access Control", period: "2 weeks", desc: "Role-aware gating on retrieval and responses." },
        { phase: "API & Polish", period: "2 weeks", desc: "FastAPI service, evaluation, and tuning." },
      ],
      members: ["Sriram PVK", "Varun Pilla"],
      lessons: [
        "Role-awareness belongs in the retrieval layer, not just the prompt — permissions must filter context before generation.",
        "Evaluation against role-specific golden questions caught accuracy issues no generic test would.",
      ],
    },
    "shipment-planner": {
      name: "Multimodal 3PL Shipment Planner",
      category: "AI Projects",
      status: "Live",
      grad: "pj-1",
      overview:
        "A multimodal agentic AI assistant for 3PL shipment planning. Users plan and manage complex logistics workflows through natural language and multimodal interactions while AI agents automate end-to-end shipment planning end to end.",
      problem:
        "Shipment planning across carriers, constraints, and business rules is repetitive and error-prone — planners juggle spreadsheets, emails, and legacy tools to assemble a single plan.",
      solution:
        "We built agentic workflows that automate planning end to end, plus intelligent route analysis and optimization that recommend efficient shipment plans from operational constraints and business requirements.",
      features: [
        "Natural-language shipment planning",
        "Multimodal interactions",
        "Agentic end-to-end automation",
        "Route analysis & optimization",
        "Constraint-aware recommendations",
        "Multi-scenario workflow orchestration",
      ],
      stack: ["Python", "FastAPI", "Agentic AI", "Multimodal AI", "LLMs", "RAG", "Vector Database"],
      screenshots: ["Agents", "Planning", "Optimization"],
      timeline: [
        { phase: "Agent Framework", period: "3 weeks", desc: "Agent orchestration and tool design." },
        { phase: "Multimodal Inputs", period: "2 weeks", desc: "Handling docs, images, and voice-style inputs." },
        { phase: "Route Optimization", period: "3 weeks", desc: "Constraint-aware routing and recommendations." },
        { phase: "Evaluation", period: "2 weeks", desc: "Multi-scenario testing and refinement." },
      ],
      members: ["Sriram PVK", "Varun Pilla"],
      lessons: [
        "Agents only feel trustworthy when every step is explainable — we logged each decision in the plan view.",
        "Optimization quality depends on modeling constraints precisely; vague rules produce vague routes.",
      ],
    },
    "ai-resume-screener": {
      name: "AI Resume Screener",
      category: "AI Projects",
      status: "In Progress",
      grad: "pj-1",
      overview:
        "AI Resume Screener is a Next.js and Supabase web application that lets users upload resumes for AI-powered analysis. It extracts resume content, provides ATS-style feedback, highlights strengths and skill gaps, and helps improve resumes for better job opportunities — through a simple, secure, and user-friendly interface.",
      problem:
        "Resumes get rejected by ATS systems for reasons applicants can't see — formatting, missing keywords, or gaps in skills — leaving candidates guessing what to fix.",
      solution:
        "We built a secure upload flow backed by AI analysis that extracts resume content and scores it ATS-style, surfacing strengths, weaknesses, and concrete skill gaps so candidates know exactly what to improve.",
      features: [
        "Secure resume upload",
        "AI-powered content extraction",
        "ATS-style feedback & scoring",
        "Strengths & skill-gap analysis",
        "Simple, user-friendly interface",
      ],
      stack: ["Next.js", "Supabase", "PostgreSQL", "LLM", "React"],
      screenshots: ["Upload", "Analysis", "Feedback"],
      github: "https://github.com/polamarasettyvarunkalisriram/ai-resume-screener",
      timeline: [
        { phase: "Upload & Parsing", period: "in progress", desc: "Secure upload and AI content extraction." },
        { phase: "Scoring Engine", period: "next", desc: "ATS-style rubric and skill-gap analysis." },
        { phase: "Feedback UI", period: "next", desc: "Actionable, easy-to-read recommendations." },
        { phase: "Launch", period: "planned", desc: "Deploy and public access." },
      ],
      members: ["Sriram PVK", "Varun Pilla"],
      lessons: [
        "Parsing real-world resume formats is the hardest 20% — normalize early and often.",
        "Feedback only helps when it's actionable; vague scores get ignored.",
      ],
    },
    "disaster-management": {
      name: "AI Disaster Management System",
      category: "AI Projects",
      status: "In Progress",
      grad: "pj-1",
      overview:
        "An AI-powered disaster management platform that supports preparedness, response, and recovery through real-time data analysis and intelligent decision support. It combines RAG-based guidance with live weather, geospatial, and emergency data for timely alerts and actionable insights.",
      problem:
        "During emergencies, information is fragmented and slow — responders and citizens struggle to get accurate, location-specific guidance when every minute counts.",
      solution:
        "We built a platform with an AI assistant that delivers disaster guidance and emergency recommendations grounded in real-time data. Interactive dashboards monitor incidents and affected areas, while role-based access keeps the right tools in the right hands.",
      features: [
        "Real-time data analysis & alerts",
        "RAG-based disaster guidance assistant",
        "Location-specific recommendations",
        "Live weather, geospatial & emergency data",
        "Incident monitoring dashboards",
        "Role-based access for citizens, responders & admins",
      ],
      stack: ["Next.js", "Node.js", "Supabase", "PostgreSQL", "RAG", "LLMs", "Maps API"],
      screenshots: ["Alerts", "Dashboard", "Assistant"],
      timeline: [
        { phase: "Data Integrations", period: "in progress", desc: "Weather, geospatial, and emergency data feeds." },
        { phase: "RAG Assistant", period: "next", desc: "Guidance and recommendation pipeline." },
        { phase: "Dashboards", period: "next", desc: "Incident monitoring and analytics views." },
        { phase: "Access Control", period: "planned", desc: "Role-based flows for citizens, responders, admins." },
      ],
      members: ["Sriram PVK", "Varun Pilla"],
      lessons: [
        "Alert accuracy depends on data quality first — integrate reliable sources before building intelligence on top.",
        "Role-based views keep dashboards useful; a single view for everyone ends up serving no one.",
      ],
    },
    "expense-tracker": {
      name: "Expense-tracker",
      category: "Web Apps",
      status: "Live",
      grad: "pj-2",
      overview:
        "A modern full-stack Expense Tracker that helps users manage income and expenses efficiently. Built with React on the frontend, Node.js and Express on the backend, and MySQL for storage, it offers transaction tracking, expense categorization, and real-time balance updates.",
      problem:
        "Spreadsheets and manual logging make it hard to see where money actually goes — tracking gets abandoned because it feels like extra work.",
      solution:
        "We built a clean, responsive tracker where adding an income or expense instantly updates balances. Categorization and summaries make it easy to spot spending patterns without any setup.",
      features: [
        "Add & track income and expenses",
        "Expense categorization",
        "Real-time balance updates",
        "Summary & pattern insights",
        "Responsive, accessible UI",
      ],
      stack: ["React", "Node.js", "Express", "MySQL", "Bootstrap 5"],
      screenshots: ["Dashboard", "Transactions", "Categories"],
      github: "https://github.com/polamarasettyvarunkalisriram/Expense-tracker",
      demo: "https://expense-tracker-ecru-five-ru65gjt19j.vercel.app/",
      timeline: [
        { phase: "Data Model & API", period: "2 weeks", desc: "Schema design and Express REST endpoints." },
        { phase: "Frontend", period: "3 weeks", desc: "React UI with live balance updates." },
        { phase: "Features", period: "2 weeks", desc: "Categories, summaries, and validation." },
        { phase: "Deploy", period: "1 week", desc: "Deployed to Vercel with live demo access." },
      ],
      members: ["Sriram PVK", "Varun Pilla"],
      lessons: [
        "A boring-but-fast core flow beats flashy extras — users stay when adding a transaction is instant.",
        "Real-time balance updates create an immediate sense of control.",
      ],
    },
    "taskwave": {
      name: "TaskWave",
      category: "Web Apps",
      status: "Live",
      grad: "pj-8",
      overview:
        "TaskWave is a full-stack task management application that helps users organize, track, and manage tasks efficiently. It includes task creation, updates, status tracking, user authentication, and a responsive interface for better productivity and workflow management.",
      problem:
        "Notes and chat threads make it easy to create tasks but impossible to know what's actually done — progress gets lost in the noise.",
      solution:
        "We built a focused task manager where tasks live in one place with clear status tracking. Authentication keeps each user's board private, and a responsive UI makes managing work quick from any device.",
      features: [
        "Task creation & editing",
        "Status tracking",
        "User authentication",
        "Responsive interface",
        "Clean, focused workflow",
      ],
      stack: ["React", "Node.js", "Express", "MySQL", "Bootstrap"],
      screenshots: ["Dashboard", "Task Board", "Auth"],
      github: "https://github.com/polamarasettyvarunkalisriram/TaskWave-Task-Management-Application",
      demo: "https://task-wave-task-management-applicati.vercel.app/",
      timeline: [
        { phase: "API & Auth", period: "2 weeks", desc: "Task endpoints and user authentication." },
        { phase: "Frontend", period: "3 weeks", desc: "React UI with status tracking." },
        { phase: "Features", period: "2 weeks", desc: "Task editing, filters, and validation." },
        { phase: "Deploy", period: "1 week", desc: "Deployed to Vercel with live demo access." },
      ],
      members: ["Sriram PVK", "Varun Pilla"],
      lessons: [
        "Clear status tracking beats clever features — knowing what's done is the whole point.",
        "Auth early, not late; locking each user's board was the hardest retrofit to avoid.",
      ],
    },
    "social-media": {
      name: "Social Media Web App",
      category: "Web Apps",
      status: "Live",
      grad: "pj-6",
      overview:
        "A full-stack social media web application built with Next.js, Supabase, and PostgreSQL. It delivers interactive features including user authentication, post creation and sharing, image uploads, likes, comments, and real-time user engagement across desktop and mobile.",
      problem:
        "Staying connected is scattered across feeds, notifications, and chat — people wanted one place to share, react, and engage in real time.",
      solution:
        "We built a responsive social platform where users can post, upload images, and engage through likes and comments. Supabase powers secure auth, the database, and real-time updates so interaction feels instant.",
      features: [
        "User authentication",
        "Post creation & sharing",
        "Image uploads",
        "Likes & comments",
        "Real-time user engagement",
        "Responsive desktop & mobile UI",
      ],
      stack: ["Next.js", "Supabase", "PostgreSQL", "React"],
      screenshots: ["Feed", "Profile", "Real-time"],
      demo: "https://ganesh-utsav-portal.vercel.app",
      timeline: [
        { phase: "Backend & Auth", period: "2 weeks", desc: "Supabase schema, auth, and secure services." },
        { phase: "Core Features", period: "3 weeks", desc: "Posts, sharing, image uploads, likes, and comments." },
        { phase: "Real-time", period: "2 weeks", desc: "Live engagement updates and notifications." },
        { phase: "Polish & Launch", period: "2 weeks", desc: "Responsive UI refinements and public deploy." },
      ],
      members: ["Sriram PVK", "Varun Pilla"],
      lessons: [
        "Real-time engagement is the hook — every like and comment should feel instant to keep users active.",
        "Image upload handling (resize, storage, fallbacks) eats more time than expected — plan it upfront.",
      ],
    },
    "louder": {
      name: "Louder",
      category: "UI/UX Design",
      status: "Live",
      grad: "pj-3",
      overview:
        "Louder is a research-driven civic participation concept that rethinks how citizens give feedback on local decisions. Grounded in user research and experimental design, it explores playful, low-friction ways to make community voices heard.",
      problem:
        "Public feedback channels are bureaucratic and intimidating, so most citizens stay silent even on decisions that directly affect them.",
      solution:
        "We designed a lightweight participation platform that turns civic feedback into simple, visual interactions — lowering the barrier to getting involved and making responses tangible for decision-makers.",
      features: [
        "User research & journey mapping",
        "Experimental interaction patterns",
        "Low-friction feedback flows",
        "Civic decision visualization",
        "HCI-informed accessibility",
      ],
      stack: ["Figma", "User Research", "Prototyping", "HCI"],
      screenshots: ["Research", "Flows", "UI"],
      github: "https://github.com/shanmukh-pilla",
      demo: "https://shanmukh-pilla.notion.site/Louder-Designing-Civic-Participation-37e9d165ed95805da531fa60a80897a7",
      timeline: [
        { phase: "User Research", period: "3 weeks", desc: "Interviews and diary studies on civic participation." },
        { phase: "Experiments", period: "3 weeks", desc: "Testing alternative participation models." },
        { phase: "Design", period: "4 weeks", desc: "High-fidelity flows and prototypes." },
        { phase: "Validation", period: "2 weeks", desc: "Usability testing and iteration." },
      ],
      members: ["Shanmukh Pilla"],
      lessons: [
        "Making participation fun beats making it mandatory — playful triggers raised engagement dramatically.",
        "Designing for trust means showing citizens their input had an effect.",
      ],
    },
    "recipe-ui": {
      name: "Recipe-Following Interfaces",
      category: "UI/UX Design",
      status: "Live",
      grad: "pj-4",
      overview:
        "A research and design study on how people follow recipes. We analyzed cognitive load across digital cooking interfaces and redesigned instructions so home cooks can glance, act, and stay in flow.",
      problem:
        "Long recipe pages overload working memory — cooks lose their place, miss steps, and abandon dishes.",
      solution:
        "We designed glanceable, step-locked cooking interfaces with progressive disclosure, built-in timers, and voice-first actions that reduce cognitive load while cooking.",
      features: [
        "Cognitive load analysis",
        "Progressive disclosure steps",
        "Hands-free voice interactions",
        "Timing & progress cues",
        "Accessible glanceable layout",
      ],
      stack: ["Figma", "UX Research", "Prototyping", "HCI"],
      screenshots: ["Study", "Wireframes", "UI"],
      github: "https://github.com/shanmukh-pilla",
      demo: "https://shanmukh-pilla.notion.site/Recipe-Following-Interfaces-37e9d165ed9580c7b401fd6113056c0f",
      timeline: [
        { phase: "Literature & Baseline", period: "2 weeks", desc: "Cognitive-load literature review and current-interface audit." },
        { phase: "User Study", period: "3 weeks", desc: "Observation and think-aloud with 12 home cooks." },
        { phase: "Redesign", period: "3 weeks", desc: "Prototypes addressing identified load points." },
        { phase: "Evaluation", period: "2 weeks", desc: "A/B validation of task completion and errors." },
      ],
      members: ["Shanmukh Pilla"],
      lessons: [
        "The biggest win was removing scroll during active steps — context switching cost more than any feature.",
        "Voice-first modes doubled success for messy-hands contexts.",
      ],
    },
    "nepal-transport": {
      name: "Sustainable Electric Transport for Nepal",
      category: "UI/UX Design",
      status: "Live",
      grad: "pj-5",
      overview:
        "Product, mobile, and dashboard design for a sustainable electric transport initiative in Nepal — helping riders plan trips, find charging, and keep fleets running efficiently.",
      problem:
        "Electric transport adoption stalls on unclear charging access and poor trip planning across unfamiliar routes.",
      solution:
        "We designed a rider app and an operations dashboard covering route planning, charge-station discovery, and fleet telemetry to make sustainable mobility practical at scale.",
      features: [
        "Mobile ride & route planning",
        "Charge-station discovery",
        "Fleet operations dashboard",
        "Offline-safe trip data",
        "Sustainability metrics",
      ],
      stack: ["Figma", "Mobile App Design", "Dashboard Design", "Product Design"],
      screenshots: ["Mobile", "Dashboard", "Flows"],
      github: "https://github.com/shanmukh-pilla",
      demo: "https://shanmukh-pilla.notion.site/Sustainable-Electric-Transport-for-Nepal-3329d165ed9580b583c6eeb5fa96af2f",
      timeline: [
        { phase: "Field Research", period: "3 weeks", desc: "Contextual interviews with riders and operators." },
        { phase: "Product Direction", period: "3 weeks", desc: "IA, user flows, and service blueprint." },
        { phase: "UI Design", period: "4 weeks", desc: "Mobile and dashboard high-fidelity design." },
        { phase: "Handoff", period: "2 weeks", desc: "Design system and dev-ready specs." },
      ],
      members: ["Shanmukh Pilla"],
      lessons: [
        "Offline-first mattered more than any feature — network coverage drove the entire design.",
        "Operators and riders needed different mental models; separate surfaces kept both simple.",
      ],
    },
    "vista": {
      name: "Vista: Smart Home Control Ecosystem",
      category: "UI/UX Design",
      status: "Live",
      grad: "pj-6",
      overview:
        "Vista is a smart home control ecosystem concept — product, UX, and interaction design for managing connected devices through calm, intuitive control surfaces.",
      problem:
        "Smart home apps bury the most-used controls behind menus, making everyday routines harder than physical switches.",
      solution:
        "We designed a unified control ecosystem with context-aware scenes, glanceable status, and natural interaction patterns across phone, tablet, and voice.",
      features: [
        "Context-aware smart scenes",
        "Unified device control",
        "Glanceable status",
        "Voice & gesture interactions",
        "Cross-device consistency",
      ],
      stack: ["Figma", "UX Design", "Interaction Design", "Product Design"],
      screenshots: ["Ecosystem", "Scenes", "UI"],
      github: "https://github.com/shanmukh-pilla",
      demo: "https://shanmukh-pilla.notion.site/Vista-Smart-Home-Control-Ecosystem-3329d165ed95806bace0d302ecbead8c",
      timeline: [
        { phase: "Discovery", period: "2 weeks", desc: "Ecosystem audit and user routine interviews." },
        { phase: "Information Architecture", period: "2 weeks", desc: "Device and scene hierarchy modeling." },
        { phase: "Interaction Design", period: "4 weeks", desc: "Cross-device interaction patterns." },
        { phase: "UI Polish", period: "3 weeks", desc: "High-fidelity visual and motion design." },
      ],
      members: ["Shanmukh Pilla"],
      lessons: [
        "The most-used controls should be one tap away — anything deeper was effectively hidden.",
        "Calm design means the system should notify, not nag; automations outrank manual toggles.",
      ],
    },
  };

  const modal = $("#projectModal");
  const modalBody = $("#modalBody");
  const modalClose = $("#modalClose");

  const svgIcon = (id, cls = "") => `<svg class="${cls}"><use href="#${id}"/></svg>`;

  function buildModal(key) {
    const p = PROJECTS[key];
    if (!p) return;
    document.title = p.name + " — Future Foundry";

    const features = p.features.map((f) => `<li>${svgIcon("i-check")}${f}</li>`).join("");
    const tags = p.stack.map((t) => `<span>${t}</span>`).join("");
    const timeline = p.timeline
      .map((t) => `<div class="md-tl-item"><strong>${t.phase}</strong><span>${t.period} · ${t.desc}</span></div>`)
      .join("");
    const members = p.members.map((m) => `<span class="md-member">${m}</span>`).join("");
    const shots = p.screenshots
      .map((s, i) => {
        const hues = ["#6366f1", "#a855f7", "#22d3ee", "#ec4899"];
        return `<div class="md-shot" style="background:linear-gradient(135deg, ${hues[i % 4]}33, transparent 70%)">${svgIcon("i-camera")}${s}</div>`;
      })
      .join("");

    modalBody.innerHTML = `
      <div class="md-hero ${p.grad}">
        <span class="md-cat">${p.category}</span>
        <span class="md-status ${p.status === "In Progress" ? "progress" : ""}">${p.status}</span>
        <h3>${p.name}</h3>
      </div>

      <div class="md-section md-overview">
        <h4>${svgIcon("i-eye")}Overview</h4>
        <p>${p.overview}</p>
      </div>

      <div class="md-grid">
        <div class="md-section">
          <h4>${svgIcon("i-bolt")}Problem Statement</h4>
          <div class="md-mini"><p>${p.problem}</p></div>
        </div>
        <div class="md-section">
          <h4>${svgIcon("i-rocket")}Solution</h4>
          <div class="md-mini"><p>${p.solution}</p></div>
        </div>
      </div>

      <div class="md-section">
        <h4>${svgIcon("i-check")}Key Features</h4>
        <ul class="md-features">${features}</ul>
      </div>

      <div class="md-section">
        <h4>${svgIcon("i-code")}Technology Stack</h4>
        <div class="md-tags">${tags}</div>
      </div>

      <div class="md-section">
        <h4>${svgIcon("i-camera")}Screenshots</h4>
        <div class="md-shots">${shots}</div>
      </div>

      <div class="md-section">
        <h4>${svgIcon("i-layers")}Architecture</h4>
        <div class="md-mini">
          <p><strong style="display:inline;color:var(--text)">Serverless edge → API gateway → services → data layer.</strong> ${p.name} follows a modular architecture with isolated, independently deployable services and a shared observability layer.</p>
        </div>
      </div>

      <div class="md-grid">
        <div class="md-section">
          <h4>${svgIcon("i-calendar")}Timeline</h4>
          <div class="md-timeline">${timeline}</div>
        </div>
        <div>
          <div class="md-section">
            <h4>${svgIcon("i-users")}Team Members</h4>
            <div class="md-members">${members}</div>
          </div>
          <div class="md-section">
            <h4>${svgIcon("i-heart")}Lessons Learned</h4>
            <div class="md-mini">
              <ul class="md-features">
                ${p.lessons.map((l) => `<li>${svgIcon("i-check")}${l}</li>`).join("")}
              </ul>
            </div>
          </div>
        </div>
      </div>

      ${(() => {
        const githubBtn = p.github && p.github !== "#" ? `<a href="${p.github}" class="btn btn-gradient" target="_blank" rel="noopener">${svgIcon("i-github")} View on GitHub</a>` : "";
        const demoBtn = p.demo && p.demo !== "#" ? `<a href="${p.demo}" class="btn btn-ghost" target="_blank" rel="noopener">${svgIcon("i-external")} Live Demo</a>` : "";
        return githubBtn || demoBtn ? `<div class="md-actions">${githubBtn}${demoBtn}</div>` : "";
      })()}
    `;
  }

  function openModal(key) {
    buildModal(key);
    modal.classList.add("open");
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal").scrollTop = 0;
    const target = $("#modalClose");
    setTimeout(() => target?.focus(), 50);
  }
  function closeModal() {
    modal.classList.remove("open");
    setTimeout(() => (modal.hidden = true), 350);
    document.body.style.overflow = "";
    document.title = "Future Foundry — Building Innovative Digital Solutions Together";
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-project]");
    if (trigger) {
      e.preventDefault();
      openModal(trigger.dataset.project);
    }
  });
  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeMenu();
    }
  });
  modal?.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const focusables = $$("a[href], button:not([disabled])", modal).filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  onScroll();

  /* ---------- Theme toggle ---------- */
  const themeToggle = $("#themeToggle");
  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("nexora-theme", theme); } catch (e) { /* noop */ }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      themeToggle.setAttribute("aria-pressed", String(theme === "light"));
    }
  };
  themeToggle?.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    setTheme(next);
  });
})();
