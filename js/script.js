
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const dateInput = document.getElementById("dateInput");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterInput = document.getElementById("filterInput");
const priorityFilter = document.getElementById("priorityFilter");
const themeBtn = document.getElementById("themeBtn");
const cancelBtn = document.getElementById("cancelBtn");
const submitBtn = document.getElementById("submitBtn");
const formHeading = document.getElementById("formHeading");
const formError = document.getElementById("formError");

const STORAGE_KEY = "internnova_tasks";
const THEME_KEY = "internnova_theme";

let tasks = loadTasks();
let editingId = null;

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createId() {
  return Date.now().toString() +
    Math.random().toString(36).slice(2);
}

// Add or update a task
taskForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const title = taskInput.value.trim();
  const priority = priorityInput.value;
  const dueDate = dateInput.value;

  if (title.length < 3) {
    formError.textContent =
      "Task name must contain at least 3 characters.";
    return;
  }

  formError.textContent = "";

  if (editingId !== null) {
    const task = tasks.find(t => t.id === editingId);

    if (task) {
      task.title = title;
      task.priority = priority;
      task.dueDate = dueDate;
    }
  } else {
    const newTask = {
      id: createId(),
      title: title,
      priority: priority,
      dueDate: dueDate,
      completed: false
    };

    tasks.push(newTask);
  }

  saveTasks();
  resetForm();
  renderTasks();
});

function resetForm() {
  taskForm.reset();
  editingId = null;
  submitBtn.textContent = "+ Add Task";
  formHeading.textContent = "Add New Task";
  cancelBtn.hidden = true;
  formError.textContent = "";
}

// Edit task
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingId = id;
  taskInput.value = task.title;
  priorityInput.value = task.priority;
  dateInput.value = task.dueDate;

  submitBtn.textContent = "Save Changes";
  formHeading.textContent = "Edit Task";
  cancelBtn.hidden = false;

  taskForm.scrollIntoView({ behavior: "smooth" });
  taskInput.focus();
}

// Delete task
function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  tasks = tasks.filter(task => task.id !== id);

  if (editingId === id) resetForm();

  saveTasks();
  renderTasks();
}

// Complete or uncomplete task
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);

  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

// Dashboard statistics
function updateStatistics() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;

  document.getElementById("totalTasks").textContent = total;
  document.getElementById("completedTasks").textContent =
    completed;
  document.getElementById("pendingTasks").textContent =
    total - completed;
}

// Render tasks using DOM manipulation
function renderTasks() {
  taskList.replaceChildren();

  const search = searchInput.value.toLowerCase().trim();
  const status = filterInput.value;
  const priority = priorityFilter.value;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(search);

    const matchesStatus =
      status === "all" ||
      (status === "completed" && task.completed) ||
      (status === "pending" && !task.completed);

    const matchesPriority =
      priority === "all" || task.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  document.getElementById("emptyMessage").hidden =
    filteredTasks.length > 0;

  filteredTasks.forEach(task => {
    const item = document.createElement("article");
    item.className =
      "task-item" + (task.completed ? " completed" : "");

    const info = document.createElement("div");
    info.className = "task-info";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label", "Complete " + task.title
    );
    checkbox.addEventListener("change", () =>
      toggleTask(task.id)
    );

    const details = document.createElement("div");

    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("p");
    meta.className = "task-meta";

    const prioritySpan = document.createElement("span");
    prioritySpan.className =
      "priority " + task.priority.toLowerCase();
    prioritySpan.textContent = task.priority + " Priority";

    const dateSpan = document.createElement("span");
    dateSpan.textContent =
      task.dueDate ? " | Due: " + task.dueDate : "";

    meta.append(prioritySpan, dateSpan);
    details.append(title, meta);
    info.append(checkbox, details);

    const buttons = document.createElement("div");
    buttons.className = "task-buttons";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () =>
      editTask(task.id)
    );

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () =>
      deleteTask(task.id)
    );

    buttons.append(editBtn, deleteBtn);
    item.append(info, buttons);
    taskList.appendChild(item);
  });

  updateStatistics();
}

// Search and filters
searchInput.addEventListener("input", renderTasks);
filterInput.addEventListener("change", renderTasks);
priorityFilter.addEventListener("change", renderTasks);
cancelBtn.addEventListener("click", resetForm);

// Dark mode
function updateTheme() {
  const dark = document.body.classList.contains("dark");
  themeBtn.textContent = dark ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
}

themeBtn.addEventListener("click", function() {
  document.body.classList.toggle("dark");
  updateTheme();
});

if (localStorage.getItem(THEME_KEY) === "dark") {
  document.body.classList.add("dark");
}

updateTheme();
renderTasks();
