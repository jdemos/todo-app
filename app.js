// ── State ──
const STORAGE_KEY = 'todo-app-state';
const LIST_COLORS = ['#ef4444', '#22d3ee', '#facc15', '#a78bfa', '#34d399', '#f472b6'];
const TAG_COLORS = ['#b8e6d0', '#f8c4c4', '#fde68a', '#c7d2fe', '#fbcfe8'];

const defaultState = {
  tasks: [],
  lists: [
    { id: 'personal', name: 'Personal', color: '#ef4444' },
    { id: 'work', name: 'Work', color: '#22d3ee' },
  ],
  tags: ['Tag 1', 'Tag 2'],
  currentView: 'today',
  selectedTaskId: null,
};

let state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultState, ...saved } : { ...defaultState };
  } catch { return { ...defaultState }; }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── Helpers ──
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y.slice(2)}`;
}

function isToday(dateStr) {
  return dateStr === todayStr();
}

function isUpcoming(dateStr) {
  return dateStr && dateStr >= todayStr();
}

function getFilteredTasks() {
  const search = document.getElementById('search-input').value.toLowerCase();
  let tasks = state.tasks;

  if (search) {
    tasks = tasks.filter(t => t.title.toLowerCase().includes(search));
  }

  if (state.currentView === 'today') {
    tasks = tasks.filter(t => !t.dueDate || isToday(t.dueDate));
  } else if (state.currentView === 'upcoming') {
    tasks = tasks.filter(t => t.dueDate && isUpcoming(t.dueDate));
  } else {
    // list filter
    tasks = tasks.filter(t => t.listId === state.currentView);
  }
  return tasks;
}

// ── Render ──
function render() {
  renderSidebar();
  renderTaskList();
  renderDetail();
}

function renderSidebar() {
  // Counts
  const todayCount = state.tasks.filter(t => !t.completed && (!t.dueDate || isToday(t.dueDate))).length;
  const upcomingCount = state.tasks.filter(t => !t.completed && t.dueDate && isUpcoming(t.dueDate)).length;
  document.getElementById('count-today').textContent = todayCount;
  document.getElementById('count-upcoming').textContent = upcomingCount;

  // Nav active state
  document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === state.currentView);
  });

  // Lists
  const listsEl = document.getElementById('lists-container');
  listsEl.innerHTML = '';
  state.lists.forEach(list => {
    const count = state.tasks.filter(t => !t.completed && t.listId === list.id).length;
    const btn = document.createElement('button');
    btn.className = 'nav-item' + (state.currentView === list.id ? ' active' : '');
    btn.dataset.view = list.id;
    btn.innerHTML = `<span class="list-dot" style="background:${list.color}"></span> ${list.name} <span class="nav-count">${count}</span>`;
    btn.addEventListener('click', () => { state.currentView = list.id; save(); render(); });
    listsEl.appendChild(btn);
  });

  // Tags
  const tagsEl = document.getElementById('tags-container');
  tagsEl.innerHTML = '';
  state.tags.forEach((tag, i) => {
    const pill = document.createElement('button');
    pill.className = 'tag-pill';
    pill.style.background = TAG_COLORS[i % TAG_COLORS.length];
    pill.style.color = '#333';
    pill.textContent = tag;
    tagsEl.appendChild(pill);
  });
}

function renderTaskList() {
  const tasks = getFilteredTasks();
  const listEl = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty-msg');
  const badge = document.getElementById('task-count-badge');

  // View title
  let title = 'Today';
  if (state.currentView === 'upcoming') title = 'Upcoming';
  else if (state.currentView !== 'today') {
    const list = state.lists.find(l => l.id === state.currentView);
    title = list ? list.name : 'Tasks';
  }
  document.getElementById('view-title').textContent = title;
  const mobileTitle = document.getElementById('mobile-title');
  if (mobileTitle) mobileTitle.textContent = title;
  badge.textContent = tasks.length;

  listEl.innerHTML = '';
  tasks.forEach(task => {
    const row = document.createElement('div');
    row.className = 'task-row' + (task.completed ? ' completed' : '') + (task.id === state.selectedTaskId ? ' selected' : '');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = task.completed;
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      task.completed = !task.completed;
      save(); render();
    });

    const info = document.createElement('div');
    info.className = 'task-info';
    const titleEl = document.createElement('div');
    titleEl.className = 'task-title';
    titleEl.textContent = task.title;
    info.appendChild(titleEl);

    // Meta badges
    const meta = document.createElement('div');
    meta.className = 'task-meta';
    if (task.dueDate) {
      const b = document.createElement('span');
      b.className = 'meta-badge';
      b.textContent = '📅 ' + formatDate(task.dueDate);
      meta.appendChild(b);
    }
    if (task.subtasks && task.subtasks.length) {
      const b = document.createElement('span');
      b.className = 'meta-badge';
      b.textContent = task.subtasks.length + ' Subtasks';
      meta.appendChild(b);
    }
    if (task.listId) {
      const list = state.lists.find(l => l.id === task.listId);
      if (list) {
        const b = document.createElement('span');
        b.className = 'meta-badge';
        b.innerHTML = `<span class="dot" style="background:${list.color}"></span> ${list.name}`;
        meta.appendChild(b);
      }
    }
    if (meta.children.length) info.appendChild(meta);

    const chevron = document.createElement('span');
    chevron.className = 'chevron';
    chevron.textContent = '›';

    row.append(cb, info, chevron);
    row.addEventListener('click', (e) => {
      if (e.target === cb) return;
      state.selectedTaskId = task.id;
      save(); render();
    });
    listEl.appendChild(row);
  });

  emptyEl.style.display = tasks.length === 0 ? 'block' : 'none';
}

function renderDetail() {
  const panel = document.getElementById('detail-content');
  const task = state.tasks.find(t => t.id === state.selectedTaskId);

  if (!task) {
    panel.innerHTML = '<div class="detail-placeholder">Select a task to view details</div>';
    return;
  }

  const listOptions = state.lists.map(l =>
    `<option value="${l.id}" ${task.listId === l.id ? 'selected' : ''}>${l.name}</option>`
  ).join('');

  const tagPills = (task.tags || []).map((tag, i) =>
    `<button class="tag-pill" style="background:${TAG_COLORS[i % TAG_COLORS.length]};color:#333">${tag}</button>`
  ).join('');

  const addTagOptions = state.tags.filter(t => !(task.tags || []).includes(t));

  const subtasksHtml = (task.subtasks || []).map((st, i) => `
    <div class="subtask-item ${st.done ? 'done' : ''}">
      <input type="checkbox" ${st.done ? 'checked' : ''} data-subtask="${i}" />
      <span>${st.text}</span>
    </div>
  `).join('');

  panel.innerHTML = `
    <h2>Task:</h2>
    <div class="detail-field">
      <input type="text" id="detail-title" value="${task.title.replace(/"/g, '&quot;')}" />
    </div>
    <div class="detail-field">
      <textarea id="detail-desc" placeholder="Description">${task.description || ''}</textarea>
    </div>
    <div class="detail-row">
      <label>List</label>
      <select id="detail-list">
        <option value="">None</option>
        ${listOptions}
      </select>
    </div>
    <div class="detail-row">
      <label>Due date</label>
      <input type="date" id="detail-due" value="${task.dueDate || ''}" />
    </div>
    <div class="detail-row">
      <label>Tags</label>
      <div class="detail-tags">
        ${tagPills}
        ${addTagOptions.length ? `<button class="tag-pill add-tag-pill" id="add-task-tag">+ Add Tag</button>` : ''}
      </div>
    </div>
    <div class="subtask-section">
      <h3>Subtasks:</h3>
      <button class="add-subtask-btn" id="add-subtask">+ Add New Subtask</button>
      ${subtasksHtml}
    </div>
    <div class="detail-actions">
      <button class="btn-delete" id="detail-delete">Delete Task</button>
      <button class="btn-save" id="detail-save">Save changes</button>
    </div>
  `;

  // Detail event listeners
  document.getElementById('detail-save').addEventListener('click', () => {
    task.title = document.getElementById('detail-title').value.trim() || task.title;
    task.description = document.getElementById('detail-desc').value;
    task.listId = document.getElementById('detail-list').value || null;
    task.dueDate = document.getElementById('detail-due').value || null;
    save(); render();
  });

  document.getElementById('detail-delete').addEventListener('click', () => {
    state.tasks = state.tasks.filter(t => t.id !== task.id);
    state.selectedTaskId = null;
    save(); render();
  });

  document.querySelectorAll('[data-subtask]').forEach(cb => {
    cb.addEventListener('change', () => {
      const idx = parseInt(cb.dataset.subtask);
      task.subtasks[idx].done = !task.subtasks[idx].done;
      save(); render();
    });
  });

  document.getElementById('add-subtask').addEventListener('click', () => {
    const text = prompt('Subtask name:');
    if (text && text.trim()) {
      if (!task.subtasks) task.subtasks = [];
      task.subtasks.push({ text: text.trim(), done: false });
      save(); render();
    }
  });

  const addTagBtn = document.getElementById('add-task-tag');
  if (addTagBtn) {
    addTagBtn.addEventListener('click', () => {
      const available = state.tags.filter(t => !(task.tags || []).includes(t));
      if (available.length) {
        if (!task.tags) task.tags = [];
        task.tags.push(available[0]);
        save(); render();
      }
    });
  }
}

// ── Events ──
// Nav buttons
document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.currentView = btn.dataset.view;
    save(); render();
  });
});

// Add task
document.getElementById('add-task-btn').addEventListener('click', () => {
  const title = prompt('Task name:');
  if (title && title.trim()) {
    const listId = (state.currentView !== 'today' && state.currentView !== 'upcoming')
      ? state.currentView : null;
    state.tasks.push({
      id: uid(), title: title.trim(), description: '',
      completed: false, listId, dueDate: todayStr(),
      tags: [], subtasks: [],
    });
    save(); render();
  }
});

// Add list
document.getElementById('add-list-btn').addEventListener('click', () => {
  const name = prompt('List name:');
  if (name && name.trim()) {
    state.lists.push({
      id: uid(), name: name.trim(),
      color: LIST_COLORS[state.lists.length % LIST_COLORS.length],
    });
    save(); render();
  }
});

// Add tag
document.getElementById('add-tag-btn').addEventListener('click', () => {
  const name = prompt('Tag name:');
  if (name && name.trim()) {
    state.tags.push(name.trim());
    save(); render();
  }
});

// Search
document.getElementById('search-input').addEventListener('input', () => {
  renderTaskList();
});

// Theme
function loadTheme() { return localStorage.getItem('theme') || 'light'; }

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

document.getElementById('theme-btn').addEventListener('click', () => {
  applyTheme(loadTheme() === 'dark' ? 'light' : 'dark');
});

applyTheme(loadTheme());

// Mobile sidebar toggle
const sidebar = document.querySelector('.sidebar');
const overlay = document.getElementById('sidebar-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('open');
}
function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
}

mobileMenuBtn.addEventListener('click', openSidebar);
overlay.addEventListener('click', closeSidebar);

// Close sidebar when a nav item is tapped on mobile
sidebar.addEventListener('click', (e) => {
  if (e.target.closest('.nav-item[data-view]') || e.target.closest('#add-list-btn') || e.target.closest('#add-tag-btn')) {
    closeSidebar();
  }
});

// Initial render
render();
