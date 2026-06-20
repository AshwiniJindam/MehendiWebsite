import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminUsers, routes } from '../constants/routes.js';
import { fetchStudents, getCachedStudents } from '../lib/students.js';
import { SHEET_COLUMNS } from '../services/googleSheets.js';

let lightboxIndex = 0;

if (!window.__nativeScrollTo) {
  window.__nativeScrollTo = window.scrollTo.bind(window);
}

function getStudents() {
  return getCachedStudents();
}

function renderStats(students) {
  const total = students.length;
  const confirmed = students.filter((student) => student.status === 'Confirmed').length;
  const newOnes = students.filter((student) => student.status === 'New').length;
  const online = students.filter((student) => student.mode?.includes('Online')).length;
  const stats = document.getElementById('admin-stats');
  if (!stats) return;
  stats.innerHTML = `<div class="admin-stat"><div class="admin-stat-num">${total}</div><div class="admin-stat-label">Total Students</div></div><div class="admin-stat"><div class="admin-stat-num" style="color:#2e7d32">${confirmed}</div><div class="admin-stat-label">Confirmed</div></div><div class="admin-stat"><div class="admin-stat-num" style="color:#1565c0">${newOnes}</div><div class="admin-stat-label">New Applications</div></div><div class="admin-stat"><div class="admin-stat-num" style="color:#f57f17">${students.length - confirmed - newOnes}</div><div class="admin-stat-label">Pending</div></div><div class="admin-stat"><div class="admin-stat-num" style="color:#6a1b9a">${online}</div><div class="admin-stat-label">Online Students</div></div>`;
}

function renderTable(list) {
  const allStudents = getStudents();
  const tbody = document.getElementById('student-table-body');
  const noStudents = document.getElementById('no-students');
  if (!tbody || !noStudents) return;
  if (!list.length) {
    tbody.innerHTML = '';
    noStudents.style.display = 'block';
    return;
  }
  noStudents.style.display = 'none';
  tbody.innerHTML = list.map((student, index) => `<tr><td>${index + 1}</td><td style="font-weight:500;color:var(--pink)">${student.id}</td><td style="font-weight:500">${student.name}</td><td>${student.phone}</td><td style="font-size:0.8rem">${(student.type || '—').split('–')[0]}</td><td style="font-size:0.8rem">${student.batch || '—'}</td><td style="font-size:0.8rem">${student.mode?.includes('Online') ? 'Online' : 'Offline'}</td><td style="font-size:0.8rem">${student.submittedOn || '—'}</td><td><span class="status-pill ${student.status === 'Confirmed' ? 'status-confirmed' : student.status === 'New' ? 'status-new' : 'status-pending'}">${student.status}</span></td><td><button class="view-btn" onclick="viewStudent(${allStudents.indexOf(student)})">View</button></td></tr>`).join('');
}

function studentToExportRow(student) {
  return {
    Timestamp: student.submittedOn || '',
    'Full Name': student.name || '',
    Phone: student.phone || '',
    Email: student.email || '',
    Course: student.type || '',
    City: student.address || '',
    Message: [
      ['Date of Birth', student.dob],
      ['Gender', student.gender],
      ['WhatsApp', student.whatsapp],
      ['Batch', student.batch],
      ['Mode', student.mode],
      ['Start Date', student.startdate],
      ['Experience', student.experience],
      ['Prior Training', student.priorTraining],
      ['Reason', student.reason],
      ['Source', student.source],
    ]
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join(' | '),
    Status: student.status || 'New',
  };
}

export function useLegacyBridge(pendingSectionRef) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const navigateTo = (id) => {
      if (id !== 'home') pendingSectionRef.current = null;
      navigate(routes[id] || '/');
    };

    const scrollToSection = (id) => {
      pendingSectionRef.current = id;
      if (location.pathname !== '/') {
        navigate('/');
        return;
      }
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        pendingSectionRef.current = null;
      }, 150);
    };

    const handleLegacyClick = (event) => {
      const link = event.target.closest?.('a[href="#"]');
      if (link) event.preventDefault();

      const trigger = event.target.closest?.('[onclick]');
      const action = trigger?.getAttribute('onclick') || '';
      if (!action) return;

      const pageMatch = action.match(/showPage\('([^']+)'\)/);
      const sectionMatch = action.match(/scrollTo\('([^']+)'\)/);

      if (pageMatch || sectionMatch) {
        event.preventDefault();
        event.stopPropagation();
        if (pageMatch) navigateTo(pageMatch[1]);
        if (sectionMatch) scrollToSection(sectionMatch[1]);
      }
    };

    document.addEventListener('click', handleLegacyClick, true);

    window.showPage = (id) => {
      navigateTo(id);
    };

    window.scrollToSection = (id) => {
      scrollToSection(id);
    };

    window.scrollTo = (first, second) => {
      if (typeof first === 'string' && second === undefined) {
        window.scrollToSection(first);
        return;
      }
      window.__nativeScrollTo(first || 0, second || 0);
    };

    window.setLang = (lang) => {
      document.body.className = `lang-${lang}`;
      document.querySelectorAll('.lang-btn').forEach((button, index) => {
        button.classList.toggle('active', lang === 'en' ? index === 0 : index === 1);
      });
    };

    window.checkAge = () => {
      const dob = document.getElementById('f-dob')?.value;
      const guardian = document.getElementById('guardian-section');
      if (!dob || !guardian) return;
      const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000));
      guardian.style.display = age < 18 ? 'block' : 'none';
    };

    window.openLB = (index) => {
      const images = [...document.querySelectorAll('.gallery-item img')].map((img) => img.src);
      if (!images.length) return;
      lightboxIndex = index;
      const image = document.getElementById('lb-img');
      if (image) image.src = images[lightboxIndex];
      document.getElementById('lightbox')?.classList.add('open');
    };

    window.closeLB = () => {
      document.getElementById('lightbox')?.classList.remove('open');
    };

    window.lbNav = (direction) => {
      const images = [...document.querySelectorAll('.gallery-item img')].map((img) => img.src);
      if (!images.length) return;
      lightboxIndex = (lightboxIndex + direction + images.length) % images.length;
      const image = document.getElementById('lb-img');
      if (image) image.src = images[lightboxIndex];
    };

    window.filterGallery = (category, button) => {
      document.querySelectorAll('.gtab').forEach((tab) => tab.classList.remove('active'));
      button?.classList.add('active');
      document.querySelectorAll('.gallery-item').forEach((item) => {
        item.style.display = category === 'all' || item.dataset.cat === category ? '' : 'none';
      });
    };

    window.renderAdminDashboard = async () => {
      try {
        await fetchStudents();
      } catch (error) {
        console.error('Failed to load students:', error);
      }
      const students = getStudents();
      renderStats(students);
      renderTable(students);
    };

    window.filterStudents = (query = '') => {
      const batch = document.getElementById('batch-filter')?.value || '';
      const students = getStudents().filter((student) => {
        const queryMatch = !query || [student.name, student.phone, student.email, student.type].some((value) => value?.toLowerCase().includes(query.toLowerCase()));
        const batchMatch = !batch || student.batch === batch;
        return queryMatch && batchMatch;
      });
      renderTable(students);
    };

    window.filterByBatch = () => {
      window.filterStudents(document.querySelector('.search-box')?.value || '');
    };

    window.filterByCourse = (course) => {
      const students = course ? getStudents().filter((student) => student.type?.includes(course)) : getStudents();
      renderTable(students);
    };

    window.viewStudent = (index) => {
      const student = getStudents()[index];
      if (!student) return;
      const rows = [['Admission No.', student.id], ['Name', student.name], ['Date of Birth', student.dob], ['Gender', student.gender], ['Phone', student.phone], ['WhatsApp', student.whatsapp], ['Email', student.email], ['Address', student.address], ['Course', student.type], ['Batch', student.batch], ['Mode', student.mode], ['Start Date', student.startdate], ['Experience', student.experience], ['Prior Training', student.priorTraining], ['Reason', student.reason], ['Source', student.source], ['Submitted On', student.submittedOn], ['Status', student.status]];
      const modalContent = document.getElementById('modal-content');
      if (modalContent) modalContent.innerHTML = rows.filter(([, value]) => value).map(([key, value]) => `<div class="modal-row"><span class="k">${key}</span><span class="v">${value}</span></div>`).join('');
      document.getElementById('student-modal')?.classList.add('open');
    };

    window.closeModal = () => {
      document.getElementById('student-modal')?.classList.remove('open');
    };

    window.exportCSV = () => {
      const students = getStudents();
      if (!students.length) return;
      const rows = students.map(studentToExportRow);
      const csv = [SHEET_COLUMNS.join(','), ...rows.map((row) => SHEET_COLUMNS.map((column) => `"${String(row[column] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const link = document.createElement('a');
      link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
      link.download = `ashwini_mehndi_students_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    };

    window.doLogin = () => {
      const username = document.getElementById('login-user')?.value.trim() || '';
      const password = document.getElementById('login-pass')?.value || '';
      if (adminUsers[username] === password) {
        sessionStorage.setItem('admin-logged', '1');
        sessionStorage.setItem('admin-user', username);
        navigate('/admin');
      } else {
        const error = document.getElementById('login-error');
        if (error) error.style.display = 'block';
      }
    };

    window.doLogout = () => {
      sessionStorage.removeItem('admin-logged');
      navigate('/admin-login');
    };

    return () => document.removeEventListener('click', handleLegacyClick, true);
  }, [navigate, location.pathname, pendingSectionRef]);

  useEffect(() => {
    if (location.pathname === '/admin' && window.renderAdminDashboard) {
      const usernameDisplay = document.getElementById('admin-username-display');
      if (usernameDisplay) usernameDisplay.textContent = `User ${sessionStorage.getItem('admin-user') || ''}`;
      void window.renderAdminDashboard();
    }
    const pendingSection = pendingSectionRef.current;
    if (location.pathname === '/' && pendingSection) {
      setTimeout(() => {
        const el = document.getElementById(pendingSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        pendingSectionRef.current = null;
      }, 150);
      return;
    }
    window.__nativeScrollTo(0, 0);
  }, [location.pathname, pendingSectionRef]);
}
