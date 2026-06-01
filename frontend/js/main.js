// frontend/js/main.js
// Shared utilities, API helpers, auth, and global functionality

// ─── API Base URL ────────────────────────────────────────────────────────────
const API_URL = 'http://localhost:5000/api';

// ─── Auth Helpers ─────────────────────────────────────────────────────────────
const Auth = {
  getToken: () => localStorage.getItem('rms_token'),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('rms_user')); }
    catch { return null; }
  },
  setSession: (token, user) => {
    localStorage.setItem('rms_token', token);
    localStorage.setItem('rms_user', JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem('rms_token');
    localStorage.removeItem('rms_user');
  },
  isLoggedIn: () => !!localStorage.getItem('rms_token'),
  isHR: () => {
    const user = Auth.getUser();
    return user && (user.role === 'hr' || user.role === 'admin');
  },
  isJobSeeker: () => {
    const user = Auth.getUser();
    return user && user.role === 'jobseeker';
  }
};

// ─── API Helper ───────────────────────────────────────────────────────────────
const API = {
  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (Auth.getToken()) {
      headers['Authorization'] = `Bearer ${Auth.getToken()}`;
    }

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Make sure the backend is running.');
      }
      throw error;
    }
  },

  get: (endpoint) => API.request(endpoint),
  post: (endpoint, body) => API.request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => API.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => API.request(endpoint, { method: 'DELETE' }),
};

// ─── Toast Notifications ─────────────────────────────────────────────────────
function showToast(message, type = 'default', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', default: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || icons.default}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
function showLoading() {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `<div class="spinner"></div>`;
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'none';
}

// ─── Format Helpers ───────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

function formatSalary(salary) {
  if (!salary || (!salary.min && !salary.max)) return 'Not specified';
  const currency = salary.currency === 'INR' ? '₹' : '$';
  const formatNum = (n) => n >= 100000
    ? `${(n / 100000).toFixed(1)}L`
    : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n;

  if (salary.min && salary.max) {
    return `${currency}${formatNum(salary.min)} - ${currency}${formatNum(salary.max)} / ${salary.period || 'yr'}`;
  }
  return `${currency}${formatNum(salary.min || salary.max)} / ${salary.period || 'yr'}`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function getStatusClass(status) {
  const map = {
    pending: 'status-pending', reviewing: 'status-reviewing',
    shortlisted: 'status-shortlisted', interviewed: 'status-interviewed',
    offered: 'status-offered', rejected: 'status-rejected',
    withdrawn: 'status-withdrawn', active: 'status-active', closed: 'status-closed'
  };
  return map[status] || 'badge-gray';
}

function getJobTypeColor(type) {
  const map = {
    'full-time': 'badge-blue', 'part-time': 'badge-yellow',
    'contract': 'badge-purple', 'internship': 'badge-cyan', 'remote': 'badge-green'
  };
  return map[type] || 'badge-gray';
}

// ─── Skills Input Handler ─────────────────────────────────────────────────────
function initSkillsInput(inputId, containerId, storageKey) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);
  if (!input || !container) return;

  let skills = [];

  const render = () => {
    container.innerHTML = '';
    skills.forEach((skill, i) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.innerHTML = `${skill} <span class="remove-skill" data-i="${i}">✕</span>`;
      container.appendChild(tag);
    });
    if (storageKey) sessionStorage.setItem(storageKey, JSON.stringify(skills));
  };

  const addSkill = (val) => {
    const cleaned = val.trim().toLowerCase();
    if (cleaned && !skills.includes(cleaned) && skills.length < 20) {
      skills.push(cleaned);
      render();
    }
    input.value = '';
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(input.value);
    }
  });

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-skill')) {
      skills.splice(parseInt(e.target.dataset.i), 1);
      render();
    }
  });

  return {
    getSkills: () => skills,
    setSkills: (arr) => { skills = arr || []; render(); }
  };
}

// ─── Navbar Setup ─────────────────────────────────────────────────────────────
function setupNavbar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  const user = Auth.getUser();
  const isLoggedIn = Auth.isLoggedIn();

  const authZone = nav.querySelector('#navAuthZone');
  if (!authZone) return;

  if (isLoggedIn && user) {
    authZone.innerHTML = `
      <div class="nav-user">
        <a href="${user.role === 'hr' ? 'hr-dashboard.html' : 'dashboard.html'}" class="btn btn-secondary btn-sm">
          Dashboard
        </a>
        <div class="nav-avatar" id="navAvatar" title="${user.name}">${getInitials(user.name)}</div>
        <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
      </div>
    `;
  } else {
    authZone.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Login</a>
      <a href="register.html" class="btn btn-primary btn-sm">Get Started</a>
    `;
  }

  // Mobile menu toggle
  const toggle = nav.querySelector('#mobileToggle');
  const links = nav.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('mobile-open');
      toggle.textContent = links.classList.contains('mobile-open') ? '✕' : '☰';
    });
  }

  // Mark active link
  const currentPage = window.location.pathname.split('/').pop();
  nav.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.classList.add('active');
  });
}

function logout() {
  Auth.clearSession();
  showToast('Logged out successfully.', 'success');
  setTimeout(() => window.location.href = 'index.html', 800);
}

// ─── Redirect if not logged in ────────────────────────────────────────────────
function requireAuth(role = null) {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html?redirect=' + window.location.pathname;
    return false;
  }
  if (role === 'hr' && !Auth.isHR()) {
    showToast('Access denied. HR role required.', 'error');
    window.location.href = 'dashboard.html';
    return false;
  }
  if (role === 'jobseeker' && !Auth.isJobSeeker()) {
    showToast('Access denied.', 'error');
    window.location.href = 'hr-dashboard.html';
    return false;
  }
  return true;
}

// ─── Chatbot ──────────────────────────────────────────────────────────────────
const ChatBot = {
  isOpen: false,
  conversationHistory: [],

  knowledge: {
    greetings: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
    apply: ['how to apply', 'apply for job', 'application process', 'apply'],
    jobs: ['find jobs', 'search jobs', 'job search', 'browse jobs'],
    profile: ['update profile', 'edit profile', 'profile', 'resume'],
    skills: ['skills', 'add skills', 'skill matching'],
    status: ['application status', 'check status', 'status'],
    hr: ['post job', 'hire', 'recruiter', 'hr', 'employer'],
    salary: ['salary', 'pay', 'compensation', 'ctc'],
    register: ['register', 'sign up', 'create account'],
    help: ['help', 'support', 'what can you do', 'how']
  },

  responses: {
    greetings: "👋 Hello! I'm HireBot, your AI recruitment assistant. How can I help you today? You can ask me about finding jobs, applying, updating your profile, or anything about our platform!",
    apply: "📝 **To apply for a job:**\n1. Go to the Jobs page\n2. Click on any job listing\n3. Click 'Apply Now'\n4. Write a cover letter\n5. Submit your application!\n\nYou can track your applications in your Dashboard.",
    jobs: "🔍 **To find jobs:**\n• Use the search bar on the Jobs page\n• Filter by location, job type, or category\n• Get AI-powered recommendations based on your skills!\n\nTip: Add your skills to your profile for better matches.",
    profile: "👤 **To update your profile:**\n1. Click 'Dashboard' in the navbar\n2. Go to 'My Profile'\n3. Add your skills, experience, and education\n4. Upload your resume\n\nA complete profile gets better job recommendations!",
    skills: "💡 **Skill Matching:**\nOur AI matches your skills with job requirements and shows a match score on each job card. Add your skills in your profile for personalized recommendations!",
    status: "📊 **Check your application status:**\n• Go to Dashboard → My Applications\n• Status can be: Pending → Reviewing → Shortlisted → Interviewed → Offered/Rejected",
    hr: "🏢 **For HR/Employers:**\n• Register as an HR user\n• Go to HR Dashboard to post jobs\n• View and filter applicants by skills\n• Update application statuses\n\nRegister with 'HR' role to get started!",
    salary: "💰 Salary information is provided by employers when posting jobs. Look for the salary range shown on job cards. You can filter jobs by type on the Jobs page.",
    register: "🚀 **To create an account:**\n1. Click 'Get Started' in the navbar\n2. Choose your role (Job Seeker or HR)\n3. Fill in your details\n4. Start exploring!",
    help: "🤖 I can help you with:\n• **Finding jobs** - search and filters\n• **Applying** - application process\n• **Profile** - updating your info\n• **Skills** - skill matching system\n• **Status** - tracking applications\n• **HR** - posting and managing jobs\n\nJust type your question!",
    default: "🤔 I'm not sure about that, but I'm here to help! You can ask me about:\n• Finding jobs\n• Applying for positions\n• Your profile and skills\n• Application status\n• HR features\n\nOr visit our Jobs page to browse opportunities!"
  },

  getResponse(input) {
    const text = input.toLowerCase();
    for (const [category, keywords] of Object.entries(this.knowledge)) {
      if (keywords.some(k => text.includes(k))) {
        return this.responses[category];
      }
    }
    return this.responses.default;
  },

  init() {
    const trigger = document.getElementById('chatbotTrigger');
    const window_ = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotClose');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSend');
    const messages = document.getElementById('chatMessages');

    if (!trigger) return;

    trigger.addEventListener('click', () => this.toggle());
    if (closeBtn) closeBtn.addEventListener('click', () => this.toggle(false));

    if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }

    // Quick reply buttons
    document.querySelectorAll('.quick-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        if (input) { input.value = btn.textContent; this.sendMessage(); }
      });
    });
  },

  toggle(forceState) {
    const window_ = document.getElementById('chatbotWindow');
    if (!window_) return;
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    window_.classList.toggle('active', this.isOpen);
    const trigger = document.getElementById('chatbotTrigger');
    if (trigger) trigger.innerHTML = this.isOpen ? '✕' : '💬';
  },

  sendMessage() {
    const input = document.getElementById('chatInput');
    const messages = document.getElementById('chatMessages');
    if (!input || !messages) return;

    const text = input.value.trim();
    if (!text) return;

    this.addMessage(text, 'user');
    input.value = '';

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot';
    typing.id = 'typingIndicator';
    typing.innerHTML = `
      <div class="chat-msg-avatar">🤖</div>
      <div class="chat-bubble">
        <span style="opacity:0.6;">typing...</span>
      </div>
    `;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const response = this.getResponse(text);
      this.addMessage(response, 'bot');
    }, 700 + Math.random() * 500);
  },

  addMessage(text, sender) {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;

    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;

    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');

    div.innerHTML = sender === 'bot'
      ? `<div class="chat-msg-avatar">🤖</div><div class="chat-bubble">${formattedText}</div>`
      : `<div class="chat-bubble">${formattedText}</div><div class="chat-msg-avatar" style="background:var(--primary);color:white;">${getInitials(Auth.getUser()?.name || 'U')}</div>`;

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
};

// ─── Chatbot HTML Builder ─────────────────────────────────────────────────────
function injectChatbot() {
  const html = `
    <button class="chatbot-trigger" id="chatbotTrigger" aria-label="Open chat">💬</button>
    <div class="chatbot-window" id="chatbotWindow">
      <div class="chatbot-header">
        <div class="chatbot-avatar">🤖</div>
        <div>
          <div class="chatbot-name">HireBot</div>
          <div class="chatbot-status">AI Recruitment Assistant • Online</div>
        </div>
        <button class="chatbot-close" id="chatbotClose">✕</button>
      </div>
      <div class="chatbot-messages" id="chatMessages">
        <div class="chat-msg bot">
          <div class="chat-msg-avatar">🤖</div>
          <div class="chat-bubble">
            👋 Hi! I'm <strong>HireBot</strong>, your AI career assistant!<br>
            How can I help you today?
          </div>
        </div>
      </div>
      <div class="quick-replies">
        <button class="quick-reply">Find Jobs</button>
        <button class="quick-reply">How to Apply</button>
        <button class="quick-reply">My Profile</button>
        <button class="quick-reply">Help</button>
      </div>
      <div class="chatbot-input">
        <input type="text" id="chatInput" placeholder="Type your question..." />
        <button id="chatSend">➤</button>
      </div>
    </div>
  `;
  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
  ChatBot.init();
}

// ─── Navbar HTML Builder ──────────────────────────────────────────────────────
function injectNavbar(activePage) {
  const user = Auth.getUser();
  const isLoggedIn = Auth.isLoggedIn();
  const isHR = Auth.isHR();

  const navLinksHtml = isLoggedIn
    ? (isHR
      ? `<a href="jobs.html" ${activePage === 'jobs' ? 'class="active"' : ''}>Jobs</a>
         <a href="hr-dashboard.html" ${activePage === 'dashboard' ? 'class="active"' : ''}>Dashboard</a>`
      : `<a href="jobs.html" ${activePage === 'jobs' ? 'class="active"' : ''}>Find Jobs</a>
         <a href="dashboard.html" ${activePage === 'dashboard' ? 'class="active"' : ''}>Dashboard</a>`)
    : `<a href="index.html" ${activePage === 'home' ? 'class="active"' : ''}>Home</a>
       <a href="jobs.html" ${activePage === 'jobs' ? 'class="active"' : ''}>Jobs</a>
       <a href="register.html?role=hr">For Employers</a>`;

  const authHtml = isLoggedIn
    ? `<a href="${isHR ? 'hr-dashboard.html' : 'dashboard.html'}" class="btn btn-secondary btn-sm">Dashboard</a>
       <div class="nav-avatar" title="${user?.name}">${getInitials(user?.name)}</div>
       <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>`
    : `<a href="login.html" class="btn btn-outline btn-sm">Login</a>
       <a href="register.html" class="btn btn-primary btn-sm">Get Started</a>`;

  const navHtml = `
    <nav class="navbar" id="mainNav">
      <div class="container nav-inner">
        <a href="index.html" class="nav-logo">
          <div class="logo-icon">💼</div>
          HireHub
        </a>
        <div class="nav-links" id="navLinks">
          ${navLinksHtml}
        </div>
        <div class="nav-actions">
          ${authHtml}
          <button class="nav-mobile-toggle" id="mobileToggle">☰</button>
        </div>
      </div>
    </nav>
  `;

  const div = document.createElement('div');
  div.innerHTML = navHtml;
  document.body.insertBefore(div.firstElementChild, document.body.firstChild);

  // Mobile toggle
  const toggle = document.getElementById('mobileToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('mobile-open');
      toggle.textContent = links.classList.contains('mobile-open') ? '✕' : '☰';
    });
  }
}

// ─── Footer HTML Builder ──────────────────────────────────────────────────────
function injectFooter() {
  const footerHtml = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="nav-logo">
              <div class="logo-icon">💼</div>
              HireHub
            </a>
            <p style="margin-top:1rem;">India's modern recruitment platform connecting talent with opportunity. Find your dream job or hire the best candidates.</p>
          </div>
          <div class="footer-col">
            <h4>For Job Seekers</h4>
            <ul>
              <li><a href="jobs.html">Browse Jobs</a></li>
              <li><a href="register.html">Create Profile</a></li>
              <li><a href="dashboard.html">My Applications</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>For Employers</h4>
            <ul>
              <li><a href="register.html?role=hr">Post Jobs</a></li>
              <li><a href="hr-dashboard.html">HR Dashboard</a></li>
              <li><a href="login.html">Login</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2024 HireHub. All rights reserved.</span>
          <span>Built with ❤️ for students & professionals</span>
        </div>
      </div>
    </footer>
  `;
  document.body.insertAdjacentHTML('beforeend', footerHtml);
}

// ─── Init on page load ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectChatbot();
});
