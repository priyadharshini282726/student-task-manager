
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

let tasks = [];

try {
  const savedTasks = JSON.parse(
    localStorage.getItem("studentTasks") || "[]"
  );

  if (Array.isArray(savedTasks)) {
    tasks = savedTasks.filter(task =>
      task &&
      typeof task.id === "number" &&
      typeof task.title === "string" &&
      typeof task.completed === "boolean" &&
      ["High", "Medium", "Low"].includes(task.priority)
    );
  }
} catch (error) {
  tasks = [];
}

let currentFilter = "All";

function saveTasks() {
  localStorage.setItem("studentTasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "Pending") return !task.completed;
    if (currentFilter === "Completed") return task.completed;
    return true;
  });

  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("pendingCount").textContent =
    tasks.filter(task => !task.completed).length;
  document.getElementById("completedCount").textContent =
    tasks.filter(task => task.completed).length;

  document.getElementById("taskSummary").textContent =
    `${visibleTasks.length} task${visibleTasks.length === 1 ? "" : "s"}`;

  emptyMessage.hidden = visibleTasks.length > 0;
  emptyMessage.textContent = tasks.length === 0
    ? "No tasks yet. Add your first task above!"
    : "No tasks in this filter.";

  visibleTasks.forEach(task => {
    const item = document.createElement("div");
    item.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const details = document.createElement("div");
    details.className = "task-details";

    const name = document.createElement("div");
    name.className = "task-name" + (task.completed ? " done" : "");
    name.textContent = task.title;

    const priority = document.createElement("span");
    priority.className = `priority ${task.priority}`;
    priority.textContent = `${task.priority} Priority`;

    details.append(name, priority);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, details, deleteButton);
    taskList.appendChild(item);
  });
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  tasks.unshift({
    id: Date.now() + Math.random(),
    title,
    priority: priorityInput.value,
    completed: false
  });

  saveTasks();
  taskForm.reset();
  renderTasks();
  taskInput.focus();
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(filterButton => {
      const active = filterButton === button;
      filterButton.classList.toggle("active", active);
      filterButton.setAttribute("aria-pressed", String(active));
    });

    renderTasks();
  });
});

document.querySelectorAll(".filter").forEach(button => {
  button.setAttribute(
    "aria-pressed",
    String(button.dataset.filter === currentFilter)
  );
});

renderTasks();
