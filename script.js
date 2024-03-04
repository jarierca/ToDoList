var taskIdCounter = parseInt(localStorage.getItem("taskIdCounter")) || 0;

document.addEventListener("DOMContentLoaded", function() {
  loadTasks();
  loadTheme();
  loadOpenFilter();

});

function addTask() {
  var titleInput = document.getElementById("titleInput");
  var descriptionInput = document.getElementById("descriptionInput");
  var dueDateInput = document.getElementById("dueDateInput");
  var taskTable = document.getElementById("taskTable").getElementsByTagName('tbody')[0];

  if (titleInput.value !== "") {
    var task = {
      id: taskIdCounter,
      title: titleInput.value,
      description: descriptionInput.value,
      dueDate: dueDateInput.value,
      completed: false
    };

    saveTask(task);

    var row = createTaskRow(task);
    taskTable.appendChild(row);

    titleInput.value = "";
    descriptionInput.value = "";
    dueDateInput.value = "";

    taskIdCounter++;
    localStorage.setItem("taskIdCounter", taskIdCounter);
  } else {
    alert("Please enter a title for the task!");
  }
}

function createTaskRow(task) {
  var row = document.createElement("tr");
  row.dataset.id = task.id;

  var completed = task.completed ? "checked" : "";

  var titleCell = document.createElement("td");
  titleCell.textContent = task.title;
  row.appendChild(titleCell);

  var descriptionCell = document.createElement("td");
  descriptionCell.innerHTML = makeDescriptionClickable(task.description);
  row.appendChild(descriptionCell);

  var dueDateCell = document.createElement("td");
  dueDateCell.textContent = task.dueDate;
  row.appendChild(dueDateCell);

  var actionsCell = document.createElement("td");
  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("a-btn");
  checkbox.title = "Toggle Completed";
  checkbox.checked = task.completed;
  checkbox.onchange = function() {
    toggleCompleted(this);
  };
  actionsCell.appendChild(checkbox);

  var editButton = document.createElement("a");
  editButton.textContent = "📝";
  editButton.classList.add("a-btn");
  editButton.title = "Edit Task";
  editButton.onclick = function() {
    editTask(row);
  };
  actionsCell.appendChild(editButton);
  
  var deleteButton = document.createElement("a");
  deleteButton.textContent = "🗑️";
  deleteButton.classList.add("a-btn");
  deleteButton.title = "Clear task";
  deleteButton.onclick = function() {
    deleteTask(row);
  };
  actionsCell.appendChild(deleteButton);

  row.appendChild(actionsCell);

  if (task.completed) {
    row.classList.add("completed");
  }

  return row;
}

function makeDescriptionClickable(description) {
  return description ? description.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>') : "";
}

function editTask(row) {
  var task = {
    title: row.cells[0].textContent,
    description: row.cells[1].textContent,
    dueDate: row.cells[2].textContent,
    completed: row.classList.contains("completed")
  };

  document.getElementById("editTaskTitle").value = task.title;
  document.getElementById("editTaskDescription").value = task.description;
  document.getElementById("editTaskDueDate").value = task.dueDate;
  document.getElementById("saveEditButton").dataset.id = row.dataset.id;

  document.getElementById("editModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
  
  document.getElementById("editTaskTitle").value = "";
  document.getElementById("editTaskDescription").value = "";
  document.getElementById("editTaskDueDate").value = "";
  document.getElementById("saveEditButton").dataset.id = "";
}

function updateTask() {
  var taskId = document.getElementById("saveEditButton").dataset.id;
  var row = document.querySelector('tr[data-id="' + taskId + '"]');

  var editTaskTitle = document.getElementById("editTaskTitle");
  var editTaskDescription = document.getElementById("editTaskDescription");
  var editTaskDueDate = document.getElementById("editTaskDueDate");

  var updatedTask = {
    id: row.dataset.id,
    title: editTaskTitle.value,
    description: editTaskDescription.value,
    dueDate: editTaskDueDate.value
  };

  row.cells[0].textContent = updatedTask.title;
  row.cells[1].innerHTML = makeDescriptionClickable(updatedTask.description);
  row.cells[2].textContent = updatedTask.dueDate

  if (updatedTask.completed) {
    row.classList.add("completed");
  } else {
    row.classList.remove("completed");
  }

  var tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  var index = Array.from(row.parentNode.children).indexOf(row);
  tasks[index] = updatedTask;
  localStorage.setItem("tasks", JSON.stringify(tasks));

  closeModal();
}


function deleteTask(row) {
  var confirmation = window.confirm("Are you sure you want to remove this task?");
  if (confirmation) {
    var taskId = parseInt(row.dataset.id);

    var tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter(function(task) {
      return task.id !== taskId;
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    
    row.remove();
  }
}

function toggleCompleted(checkbox) {
  var row = checkbox.parentNode.parentNode;
  if (checkbox.checked) {
    row.classList.add("completed");
  } else {
    row.classList.remove("completed");
  }

  updateTaskStatus(row);
}


function saveTask(task) {
  var tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  var tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  var taskTable = document.getElementById("taskTable").getElementsByTagName('tbody')[0];

  tasks.forEach(function(task) {
    var row = createTaskRow(task);
    taskTable.appendChild(row);
  });
}

function updateTaskStatus(row) {
  var tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  var index = Array.from(row.parentNode.children).indexOf(row);
  tasks[index].completed = row.classList.contains("completed");
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleTheme() {
  var body = document.body;
  body.classList.toggle("dark-mode");
  saveTheme(body.classList.contains("dark-mode"));

  if (body.classList.contains("dark-mode")) {
    document.getElementsByClassName("theme-toggle")[0].text = "🌙";
  } else {
    document.getElementsByClassName("theme-toggle")[0].text = "☀️";
  }
}

function saveTheme(isDarkMode) {
  localStorage.setItem("theme", isDarkMode ? "dark" : "light");
}

function loadTheme() {
  var theme = localStorage.getItem("theme");
  if (theme === "dark" || theme === null) {
    document.body.classList.add("dark-mode");
    document.getElementsByClassName("theme-toggle")[0].text = "🌙";
  } else {
    document.body.classList.remove("dark-mode");
    document.getElementsByClassName("theme-toggle")[0].text = "☀️";
  }
}

function toggleSettings() {
  var settingsMenu = document.getElementById("settingsMenu");
  settingsMenu.classList.toggle("show");
}

function clearTable() {
  var tableBody = document.getElementById("taskTable").getElementsByTagName('tbody')[0];
  tableBody.innerHTML = "";
}

function applyFilter() {
  var tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  var filteredTasks = tasks.filter(function(task) {

    var completed = document.getElementById("filterCompleted").checked;
    if (completed && !task.completed) {
      return false;
    }

    var incomplete = document.getElementById("filterIncomplete").checked;
    if (incomplete && task.completed) {
      return false;
    }

    var filterDate = document.getElementById("filterDate").value;
    if (filterDate && task.dueDate !== filterDate) {
      return false;
    }

    var startDate = document.getElementById("filterStartDate").value;
    var endDate = document.getElementById("filterEndDate").value;
    if (startDate && endDate) {
      if (task.dueDate < startDate || task.dueDate > endDate) {
          return false;
      }
    } else if (startDate) {
      if (task.dueDate < startDate) {
          return false;
      }
    } else if (endDate) {
      if (task.dueDate > endDate) {
          return false;
      }
    }

    var filterTitle = document.getElementById("filterTitle").value.toLowerCase();
    if (filterTitle && !task.title.toLowerCase().includes(filterTitle)) {
      return false;
    }

    var filterDescription = document.getElementById("filterDescription").value.toLowerCase();
    if (filterDescription && !task.title.toLowerCase().includes(filterDescription)) {
      return false;
    }

    return true;
  });

  var taskTableBody = document.getElementById("taskTable").getElementsByTagName('tbody')[0];
  taskTableBody.innerHTML = "";

  filteredTasks.forEach(function(task) {
    var row = createTaskRow(task);
    taskTableBody.appendChild(row);
  });
}

function resetFilter() {
  clearTable();

  document.getElementById("filterCompleted").checked = false;
  document.getElementById("filterIncomplete").checked = false;
  document.getElementById("filterAll").checked = true;
  document.getElementById("filterDate").value = "";
  document.getElementById("filterStartDate").value = "";
  document.getElementById("filterEndDate").value = "";
  document.getElementById("filterTitle").value = "";
  document.getElementById("filterDescription").value = "";

  loadTasks();
}

function toggleFilter() {
  var filterOptions = document.getElementById("filterOptions");
  var toggleFilterButton = document.getElementById("toggleFilterButton");

  if (filterOptions.style.display === "none" || filterOptions.style.display === "") {
    filterOptions.style.display = "block";
    toggleFilterButton.textContent = "▲";
  } else {
    filterOptions.style.display = "none";
    toggleFilterButton.textContent = "▼";
  }
  saveFilterOpen(filterOptions.style.display === "block");
}

function saveFilterOpen(isFilterOpen) {
  localStorage.setItem("filter", isFilterOpen ? "openned" : "closed");
}

function loadOpenFilter() {
  var isOpen = localStorage.getItem("filter");
    if (isOpen === "openned") {
    filterOptions.style.display = "block";
    toggleFilterButton.textContent = "▲";
  } else {
    filterOptions.style.display = "none";
    toggleFilterButton.textContent = "▼";
  }
}

function clearAllTasks() {
  var confirmation = window.confirm("Are you sure you want to delete all tasks?");
  if (confirmation) {
    localStorage.removeItem("tasks");
    localStorage.removeItem("taskIdCounter");
    taskIdCounter = 1;

    var taskTableBody = document.getElementById("taskTable").getElementsByTagName('tbody')[0];
    taskTableBody.innerHTML = "";
  }
}

function exportTasks() {
  var tasks = localStorage.getItem("tasks");
  
  if (tasks) {
    var blob = new Blob([tasks], { type: "application/json" });
    
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tasks.json";
    
    link.click();
  } else {
    alert("No tasks to export.");
  }
}

function importTasks() {
  var input = document.createElement("input");
  input.type = "file";
  
  input.onchange = function(event) {
    var file = event.target.files[0];
    var reader = new FileReader();
    
    reader.onload = function(event) {
      var content = event.target.result;
      
      try {
        var tasks = JSON.parse(content);
        localStorage.setItem("tasks", JSON.stringify(tasks))
        location.reload();
      } catch (error) {
        alert("Error importing tasks: Invalid JSON format.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}


