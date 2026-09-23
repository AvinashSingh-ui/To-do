const addTaskForm = document.getElementById("addTaskForm");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDateInput");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptySubtitle = document.getElementById("emptySubtitle");

const searchInput = document.getElementById("searchInput");

const filterButtons = document.querySelectorAll(".filter-btn");

const countAll = document.getElementById("countAll");
const countActive = document.getElementById("countActive");
const countCompleted = document.getElementById("countCompleted");

const progressFill = document.getElementById("progressFill");
const progressStats = document.getElementById("progressStats");
const progressPercent = document.getElementById("progressPercent");

const skeletonLoader = document.getElementById("skeletonLoader");

const themeToggle = document.getElementById("themeToggle");

const shortcutBtn = document.getElementById("shortcutBtn");
const shortcutsModal = document.getElementById("shortcutsModal");
const closeModal = document.getElementById("closeModal");

const toastContainer = document.getElementById("toastContainer");

let tasks = [];
let currentFilter = "all";
let searchText = "";
let deletedTask = null;

function loadTasks() {
    const savedTasks = localStorage.getItem("taskflow-tasks");

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        tasks = [];
    }
}

function saveTasks() {
    localStorage.setItem(
        "taskflow-tasks",
        JSON.stringify(tasks)
    );
}

function createTask(title, priority, dueDate) {
    const task = {
        id: Date.now(),
        title: title,
        completed: false,
        priority: priority,
        dueDate: dueDate
    };

    tasks.push(task);

    saveTasks();
    renderTasks();
    showToast("Task added");

    taskInput.value = "";
    prioritySelect.value = "medium";
    dueDateInput.value = "";

    taskInput.focus();
}

function addTask(event) {
    event.preventDefault();

    const title = taskInput.value.trim();
    const priority = prioritySelect.value;
    const dueDate = dueDateInput.value;

    if (title === "") {
        showToast("Please enter a task");
        taskInput.focus();
        return;
    }

    createTask(title, priority, dueDate);
}

function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(function (task) {
        return task.id === taskId;
    });

    if (taskIndex === -1) {
        return;
    }

    deletedTask = tasks[taskIndex];

    tasks.splice(taskIndex, 1);

    saveTasks();
    renderTasks();
    showUndoToast("Task deleted");
}

function undoDelete() {
    if (!deletedTask) {
        return;
    }

    tasks.push(deletedTask);

    saveTasks();
    renderTasks();
    showToast("Task restored");

    deletedTask = null;
}

function toggleTask(taskId) {
    const task = tasks.find(function (task) {
        return task.id === taskId;
    });

    if (!task) {
        return;
    }

    task.completed = !task.completed;

    saveTasks();
    renderTasks();

    if (task.completed) {
        showToast("Task completed");
    } else {
        showToast("Task marked active");
    }
}

function editTask(taskId) {
    const task = tasks.find(function (task) {
        return task.id === taskId;
    });

    if (!task) {
        return;
    }

    const taskItem = document.querySelector(
        `[data-id="${taskId}"]`
    );

    if (!taskItem) {
        return;
    }

    const taskText = taskItem.querySelector(".task-text");

    const input = document.createElement("input");

    input.type = "text";
    input.value = task.title;
    input.className = "task-edit-input";
    input.maxLength = 200;

    taskText.replaceWith(input);

    input.focus();
    input.select();

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            saveEditedTask(taskId, input.value);
        }

        if (event.key === "Escape") {
            renderTasks();
        }
    });

    input.addEventListener("blur", function () {
        saveEditedTask(taskId, input.value);
    });
}

function saveEditedTask(taskId, newTitle) {
    const title = newTitle.trim();

    if (title === "") {
        renderTasks();
        showToast("Task cannot be empty");
        return;
    }

    const task = tasks.find(function (task) {
        return task.id === taskId;
    });

    if (!task) {
        return;
    }

    task.title = title;
    task.completed = false;

    saveTasks();
    renderTasks();

    showToast("Task updated");
}

function getFilteredTasks() {
    let filteredTasks = tasks;

    if (currentFilter === "active") {
        filteredTasks = tasks.filter(function (task) {
            return task.completed === false;
        });
    }

    if (currentFilter === "completed") {
        filteredTasks = tasks.filter(function (task) {
            return task.completed === true;
        });
    }

    if (searchText !== "") {
        filteredTasks = filteredTasks.filter(function (task) {
            return task.title
                .toLowerCase()
                .includes(searchText.toLowerCase());
        });
    }

    return filteredTasks;
}

function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = getFilteredTasks();

    filteredTasks.forEach(function (task) {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });

    updateCounts();
    updateProgress();
    updateEmptyState();

    if (filteredTasks.length > 0) {
        taskList.style.display = "flex";
    } else {
        taskList.style.display = "none";
    }
}

function createTaskElement(task) {
    const li = document.createElement("li");

    li.className = "task-item";
    li.dataset.id = task.id;

    if (task.completed) {
        li.classList.add("completed");
    }

    if (isOverdue(task)) {
        li.classList.add("overdue");
    }

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;

    checkbox.setAttribute(
        "aria-label",
        "Mark task complete"
    );

    checkbox.addEventListener("change", function () {
        toggleTask(task.id);
    });

    const body = document.createElement("div");

    body.className = "task-body";

    const text = document.createElement("div");

    text.className = "task-text";
    text.textContent = task.title;
    text.title = "Click to edit";

    text.addEventListener("click", function () {
        editTask(task.id);
    });

    const meta = document.createElement("div");

    meta.className = "task-meta";

    const priority = document.createElement("span");

    priority.className =
        "priority-badge priority-badge--" + task.priority;

    priority.textContent = task.priority;

    meta.appendChild(priority);

    if (task.dueDate !== "") {
        const dueDate = document.createElement("span");

        dueDate.className = "due-date-badge";

        dueDate.textContent =
            "Due " + formatDate(task.dueDate);

        if (isOverdue(task)) {
            dueDate.classList.add("overdue-badge");

            dueDate.textContent =
                "Overdue · " + formatDate(task.dueDate);
        }

        meta.appendChild(dueDate);
    }

    body.appendChild(text);
    body.appendChild(meta);

    const actions = document.createElement("div");

    actions.className = "task-actions";

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "action-btn";
    editButton.textContent = "Edit";

    editButton.setAttribute(
        "aria-label",
        "Edit task"
    );

    editButton.addEventListener("click", function () {
        editTask(task.id);
    });

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className =
        "action-btn action-btn--delete";

    deleteButton.textContent = "Delete";

    deleteButton.setAttribute(
        "aria-label",
        "Delete task"
    );

    deleteButton.addEventListener("click", function () {
        deleteTask(task.id);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    li.appendChild(checkbox);
    li.appendChild(body);
    li.appendChild(actions);

    return li;
}

function isOverdue(task) {
    if (task.dueDate === "") {
        return false;
    }

    if (task.completed) {
        return false;
    }

    const today = new Date();

    const currentDate =
        today.toISOString().split("T")[0];

    return task.dueDate < currentDate;
}

function formatDate(dateString) {
    const date = new Date(
        dateString + "T00:00:00"
    );

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

function updateCounts() {
    const completedTasks = tasks.filter(function (task) {
        return task.completed === true;
    });

    const activeTasks = tasks.filter(function (task) {
        return task.completed === false;
    });

    countAll.textContent = tasks.length;
    countActive.textContent = activeTasks.length;
    countCompleted.textContent = completedTasks.length;
}

function updateProgress() {
    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.completed === true;
    }).length;

    let percentage = 0;

    if (total > 0) {
        percentage =
            Math.round((completed / total) * 100);
    }

    progressFill.style.width =
        percentage + "%";

    progressFill.setAttribute(
        "aria-valuenow",
        percentage
    );

    progressStats.innerHTML =
        `<strong>${completed}</strong> of ${total} done`;

    progressPercent.textContent =
        percentage + "%";
}

function updateEmptyState() {
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length > 0) {
        emptyState.hidden = true;
        return;
    }

    emptyState.hidden = false;

    if (tasks.length === 0) {
        emptyTitle.textContent = "Nothing here yet";
        emptySubtitle.textContent =
            "Add your first task and start making progress.";
    } else if (searchText !== "") {
        emptyTitle.textContent = "No matching tasks";
        emptySubtitle.textContent =
            "Try a different search term.";
    } else if (currentFilter === "active") {
        emptyTitle.textContent = "All caught up";
        emptySubtitle.textContent =
            "You have no active tasks.";
    } else if (currentFilter === "completed") {
        emptyTitle.textContent =
            "Nothing completed yet";

        emptySubtitle.textContent =
            "Complete a task and it will appear here.";
    }
}

function changeFilter(filter) {
    currentFilter = filter;

    filterButtons.forEach(function (button) {
        const buttonFilter =
            button.dataset.filter;

        if (buttonFilter === filter) {
            button.classList.add("active");

            button.setAttribute(
                "aria-selected",
                "true"
            );
        } else {
            button.classList.remove("active");

            button.setAttribute(
                "aria-selected",
                "false"
            );
        }
    });

    renderTasks();
}

function searchTasks() {
    searchText = searchInput.value.trim();

    renderTasks();
}

function showToast(message) {
    const toast = document.createElement("div");

    toast.className = "toast";

    const messageElement =
        document.createElement("span");

    messageElement.className =
        "toast__message";

    messageElement.textContent = message;

    toast.appendChild(messageElement);

    toastContainer.appendChild(toast);

    setTimeout(function () {
        toast.remove();
    }, 3000);
}

function showUndoToast(message) {
    const toast = document.createElement("div");

    toast.className = "toast";

    const messageElement =
        document.createElement("span");

    messageElement.className =
        "toast__message";

    messageElement.textContent = message;

    const undoButton =
        document.createElement("button");

    undoButton.type = "button";
    undoButton.className =
        "toast__undo-btn";

    undoButton.textContent = "Undo";

    undoButton.addEventListener(
        "click",
        function () {
            undoDelete();
            toast.remove();
        }
    );

    toast.appendChild(messageElement);
    toast.appendChild(undoButton);

    toastContainer.appendChild(toast);

    setTimeout(function () {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function loadTheme() {
    const savedTheme =
        localStorage.getItem("taskflow-theme");

    if (savedTheme) {
        document.documentElement.dataset.theme =
            savedTheme;
    } else {
        document.documentElement.dataset.theme =
            "light";
    }

    updateThemeButton();
}

function toggleTheme() {
    const currentTheme =
        document.documentElement.dataset.theme;

    let newTheme = "light";

    if (currentTheme === "light") {
        newTheme = "dark";
    }

    document.documentElement.dataset.theme =
        newTheme;

    localStorage.setItem(
        "taskflow-theme",
        newTheme
    );

    updateThemeButton();
}

function updateThemeButton() {
    const currentTheme =
        document.documentElement.dataset.theme;

    if (currentTheme === "dark") {
        themeToggle.textContent = "🌙";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to light mode"
        );
    } else {
        themeToggle.textContent = "☀️";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to dark mode"
        );
    }
}

function openShortcuts() {
    shortcutsModal.hidden = false;
    closeModal.focus();
}

function closeShortcuts() {
    shortcutsModal.hidden = true;
    taskInput.focus();
}

function handleKeyboard(event) {
    const isTyping =
        event.target.tagName === "INPUT" ||
        event.target.tagName === "SELECT" ||
        event.target.tagName === "TEXTAREA";

    if (event.key === "Escape") {
        if (!shortcutsModal.hidden) {
            closeShortcuts();
            return;
        }

        renderTasks();
        return;
    }

    if (isTyping) {
        return;
    }

    if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        taskInput.focus();
        return;
    }

    if (event.key === "/") {
        event.preventDefault();
        searchInput.focus();
        return;
    }

    if (event.key.toLowerCase() === "t") {
        event.preventDefault();
        toggleTheme();
        return;
    }

    if (event.key === "?") {
        event.preventDefault();
        openShortcuts();
        return;
    }

    if (event.key === "1") {
        changeFilter("all");
        return;
    }

    if (event.key === "2") {
        changeFilter("active");
        return;
    }

    if (event.key === "3") {
        changeFilter("completed");
        return;
    }
}

addTaskForm.addEventListener(
    "submit",
    addTask
);

searchInput.addEventListener(
    "input",
    searchTasks
);

filterButtons.forEach(function (button) {
    button.addEventListener(
        "click",
        function () {
            changeFilter(
                button.dataset.filter
            );
        }
    );
});

themeToggle.addEventListener(
    "click",
    toggleTheme
);

shortcutBtn.addEventListener(
    "click",
    openShortcuts
);

closeModal.addEventListener(
    "click",
    closeShortcuts
);

shortcutsModal.addEventListener(
    "click",
    function (event) {
        if (event.target === shortcutsModal) {
            closeShortcuts();
        }
    }
);

document.addEventListener(
    "keydown",
    handleKeyboard
);

function initializeApp() {
    loadTheme();
    loadTasks();

    skeletonLoader.style.display = "flex";
    taskList.style.display = "none";
    emptyState.hidden = true;

    setTimeout(function () {
        skeletonLoader.style.display = "none";
        renderTasks();
    }, 500);
}

initializeApp();