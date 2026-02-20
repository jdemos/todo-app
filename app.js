const STORAGE_KEY = 'todos';

let todos = loadTodos();

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  const list = document.getElementById('todo-list');
  const emptyMsg = document.getElementById('empty-msg');

  list.innerHTML = '';

  todos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.append(checkbox, span, deleteBtn);
    list.appendChild(li);
  });

  emptyMsg.style.display = todos.length === 0 ? 'block' : 'none';
}

function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;

  todos.push({ id: Date.now(), text, completed: false });
  saveTodos();
  render();

  input.value = '';
  input.focus();
}

function toggleTodo(id) {
  todos = todos.map((t) => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

// Event listeners
document.getElementById('add-btn').addEventListener('click', addTodo);
document.getElementById('todo-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

// Initial render
render();
