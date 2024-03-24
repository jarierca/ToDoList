var listsData = JSON.parse(localStorage.getItem("listsData")) || { default: { tasks: [], taskIdCounter: 0 } };
var currentList = localStorage.getItem("currentList") || "default";
document.addEventListener("DOMContentLoaded", function() {
  loadLists();
  switchList(currentList);
  loadTheme();
  loadTasks();
  loadFilter();
});

function addTask() {
  var titleInput = document.getElementById("titleInput");
  var descriptionInput = document.getElementById("descriptionInput");
  var dueDateInput = document.getElementById("dueDateInput");
  var taskTable = document.getElementById("taskTable").getElementsByTagName('tbody')[0];

  if (titleInput.value !== "") {
    var task = {
      id: listsData[currentList].taskIdCounter++,
      title: titleInput.value,
      description: descriptionInput.value,
      dueDate: dueDateInput.value,
      completed: false,
      subtasks: []
    };

    listsData[currentList].tasks.push(task);

    saveListsData();

    var row = createTaskRow(task);
    taskTable.appendChild(row);

    titleInput.value = "";
    descriptionInput.value = "";
    dueDateInput.value = "";
  } else {
    alert("Please enter a title for the task!");
  }
}

function saveListsData() {
  localStorage.setItem("listsData", JSON.stringify(listsData));

  listsData[currentList].filterValues = {
    completed: document.getElementById("filterCompleted").checked,
    incomplete: document.getElementById("filterIncomplete").checked,

  };
}

function createTaskRow(task) {
  var row = document.createElement("tr");
  row.dataset.id = task.id;
  row.dataset.list = currentList;

  var completed = task.completed ? "checked" : "";
  
  var subtasks = listsData[currentList].tasks[task.id].subtasks;
  var showSubtasks = listsData[currentList].tasks[task.id].showSubtasks;

  var titleCell = document.createElement("td");
  var title = document.createElement("span");
  title.textContent = task.title;

  if(subtasks){
    var toggleButton = document.createElement("a");
    toggleButton.classList.add("a-btn");
    toggleButton.classList.add("toggle-hide");
    if(showSubtasks){
      toggleButton.textContent = "▼";
    }else {
      toggleButton.textContent = "▲";
    }
    toggleButton.addEventListener("click", function() {
      toggleSubtasksVisibility(row);
    });
    titleCell.appendChild(toggleButton);
  }

  titleCell.appendChild(title);

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
    toggleCompleted(task,this);
  };
  actionsCell.appendChild(checkbox);

  var editButton = document.createElement("a");
  editButton.textContent = "📝";
  editButton.classList.add("a-action");
  editButton.title = "Edit Task";
  editButton.style.paddingRight = "5px";
  editButton.onclick = function() {
    editTask(row);
  };
  actionsCell.appendChild(editButton);
  
  var deleteButton = document.createElement("a");
  deleteButton.textContent = "🗑️";
  deleteButton.classList.add("a-action");
  deleteButton.title = "Clear task";
  deleteButton.style.paddingRight = "5px";
  deleteButton.onclick = function() {
    deleteTask(row);
  };
  actionsCell.appendChild(deleteButton);

  var addSubtaskButton = document.createElement("a");
  addSubtaskButton.textContent = "+";
  addSubtaskButton.classList.add("a-subtask")
  addSubtaskButton.classList.add("a-action");
  addSubtaskButton.title = "Add subtask";
  addSubtaskButton.style.padding = "5px";
  addSubtaskButton.onclick = function() {
    addSubtask(row);
  };
  actionsCell.appendChild(addSubtaskButton);

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
  var taskId = row.dataset.id;
  var taskIndex = listsData[currentList].tasks.findIndex(function(task) {
    return task.id == taskId;
  });

  if (taskIndex !== -1) {
    var task = listsData[currentList].tasks[taskIndex];

    document.getElementById("editTaskTitle").value = task.title;
    document.getElementById("editTaskDescription").value = task.description;
    document.getElementById("editTaskDueDate").value = task.dueDate;
    document.getElementById("saveEditButton").dataset.id = taskId;

    document.getElementById("editModal").style.display = "flex";
  }
}

function updateTask() {
  var taskId = document.getElementById("saveEditButton").dataset.id;
  var taskIndex = listsData[currentList].tasks.findIndex(function(task) {
    return task.id == taskId;
  });

  if (taskIndex !== -1) {
    var editTaskTitle = document.getElementById("editTaskTitle").value;
    var editTaskDescription = document.getElementById("editTaskDescription").value;
    var editTaskDueDate = document.getElementById("editTaskDueDate").value;

    var subtasksContainer = document.querySelector('tr[data-id="' + taskId + '"] .subtask-list tbody');
    var subtasks = [];
    if (subtasksContainer) {
      subtasksContainer.querySelectorAll('tr').forEach(function(subtaskRow) {
        subtasks.push({
          title: subtaskRow.cells[2].textContent,
          completed: subtaskRow.cells[3].querySelector('input[type="checkbox"]').checked
        });
      });
    }

    var updatedTask = {
      id: taskId,
      title: editTaskTitle,
      description: editTaskDescription,
      dueDate: editTaskDueDate,
      completed: listsData[currentList].tasks[taskIndex].completed,
      subtasks: subtasks
    };

    listsData[currentList].tasks[taskIndex] = updatedTask;

    saveListsData();

    var row = document.querySelector('tr[data-id="' + taskId + '"]');
    if (row) {
      row.cells[0].textContent = editTaskTitle;
      row.cells[1].innerHTML = makeDescriptionClickable(editTaskDescription);
      row.cells[2].textContent = editTaskDueDate;
    }
  }

  closeModal();
}

function closeModal() {
  document.getElementById("editModal").style.display = "none";
  
  document.getElementById("editTaskTitle").value = "";
  document.getElementById("editTaskDescription").value = "";
  document.getElementById("editTaskDueDate").value = "";
  document.getElementById("saveEditButton").dataset.id = "";
}

function deleteTask(row) {
  var confirmation = window.confirm("Are you sure you want to remove this task?");
  if (confirmation) {
    var taskId = parseInt(row.dataset.id);
    var currentListData = listsData[currentList];
    
    currentListData.tasks = currentListData.tasks.filter(function(task) {
      return task.id !== taskId;
    });

    saveListsData();
    
    row.remove();
  }
}


function toggleCompleted(task, checkbox) {
  var row = checkbox.parentNode.parentNode;
  if (checkbox.checked) {
    row.classList.add("completed");
  } else {
    row.classList.remove("completed");
  }

  var taskId = row.dataset.id;
  var taskIndex = listsData[currentList].tasks.findIndex(function(task) {
    return task.id == taskId;
  });

  if (taskIndex !== -1) {
    listsData[currentList].tasks[taskIndex].completed = row.classList.contains("completed");
    saveListsData();
  }
  loadTasks();
}


function saveTask(task) {
  var tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  clearTable();
  if (!listsData[currentList]) {
    listsData[currentList] = { tasks: [], taskIdCounter: 0 };
  }
  var tasks = listsData[currentList].tasks;
  var taskTable = document.getElementById("taskTable").getElementsByTagName('tbody')[0];

  tasks.forEach(function(task) {
    var row = createTaskRow(task);
    taskTable.appendChild(row);

    loadSubtasks(task);
  });
}


function switchList(listName) {
  currentList = listName;
  localStorage.setItem("currentList", currentList);
  clearTable();
  document.getElementById("listNameLink").textContent = currentList;
  document.getElementById("listNameLink").title = currentList;
  loadTasks();
}

function loadLists() {
  var listSelector = document.getElementById("listOptions");
  listSelector.innerHTML = "";

  Object.keys(listsData).forEach(function(listName) {
    var span = document.createElement("span");
    span.value = listName;
    span.classList.add("a-btn");
    span.textContent = listName;
    span.onclick = function() {
      switchList(listName);
    };

    listSelector.appendChild(span);
  });
}

function createList() {
  var newListName = document.getElementById('newListInput')
  if (newListName.value.trim() === "") {
    alert("Please enter a name for the new list!");
    return;
  }

  if (listsData[newListName.value]) {
    alert("List already exists!");
    return;
  }

  listsData[newListName.value] = { tasks: [], taskIdCounter: 0 };

  saveListsData();

  loadLists();
  switchList(newListName.value);
  newListInput.value = "";
}

function editListName() {
  var newName = prompt("Enter the new name for the current list:", currentList);
  if (newName && newName.trim() !== "") {
    var oldListName = currentList;
    currentList = newName.trim();
    localStorage.setItem("currentList", currentList);
    document.getElementById("listNameLink").textContent = currentList;
    if (listsData.hasOwnProperty(oldListName)) {
      listsData[newName] = listsData[oldListName];
      delete listsData[oldListName];
      saveListsData();
      loadLists();
      location.reload();
    }
  }
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

function hideSettings() {
    var settingsMenu = document.getElementById("settingsMenu");
    settingsMenu.classList.remove("show");
}

function clearTable() {
  var tableBody = document.getElementById("taskTable").getElementsByTagName('tbody')[0];
  tableBody.innerHTML = "";
}

function applyFilter() {
  var listTasks = listsData[currentList].tasks;
  var filteredTasks = listTasks.filter(function(task) {

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

  var taskTableBody = document.getElementById("taskList");
  taskTableBody.innerHTML = "";

  filteredTasks.forEach(function(task) {
    var row = createTaskRow(task);
    taskTableBody.appendChild(row);
  });
}

function resetFilter() {

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

function saveFilterValues() {
  var filterValues = {
      all: document.getElementById("filterAll").checked,
      completed: document.getElementById("filterCompleted").checked,
      incomplete: document.getElementById("filterIncomplete").checked,
      date: document.getElementById("filterDate").value,
      startDate: document.getElementById("filterStartDate").value,
      endDate: document.getElementById("filterEndDate").value,
      title: document.getElementById("filterTitle").value,
      description: document.getElementById("filterDescription").value
  };
  listsData[currentList].filterValues = filterValues;
  saveListsData();
}

function clearFilterValues() {
  localStorage.removeItem("filterValues");

  resetFilter();
}


function loadFilter() {
  loadOpenFilter();

  var filterValues = listsData[currentList].filterValues || {};

  if(Object.keys(filterValues).length !== 0){
    document.getElementById("filterAll").checked = filterValues.all || false;
    document.getElementById("filterCompleted").checked = filterValues.completed || false;
    document.getElementById("filterIncomplete").checked = filterValues.incomplete || false;
    document.getElementById("filterDate").value = filterValues.date || "";
    document.getElementById("filterStartDate").value = filterValues.startDate || "";
    document.getElementById("filterEndDate").value = filterValues.endDate || "";
    document.getElementById("filterTitle").value = filterValues.title || "";
    document.getElementById("filterDescription").value = filterValues.description || "";

    applyFilter()
  } else{
    resetFilter();
  }
}

function clearCurrentListTasks() {
  var confirmation = window.confirm("Are you sure you want to delete all tasks from the current list?");
  if (confirmation && listsData[currentList]) {
    listsData[currentList].tasks = [];
    delete listsData[currentList];
 
    saveListsData();
    var remainingLists = Object.keys(listsData);
    if (remainingLists.length > 0) {
      currentList = remainingLists[0];
      localStorage.setItem("currentList", currentList);
    } else {
      localStorage.removeItem("currentList");
    }
    
    loadLists();
    switchList(currentList);    
    loadTasks();
  }
}

function clearAllTasks() {
  var confirmation = window.confirm("Are you sure you want to delete all?");
  if (confirmation) {
    listsData = {};
    taskIdCounter = 0;

    localStorage.removeItem("listsData");
    localStorage.removeItem("taskIdCounter");
    localStorage.removeItem("currentList");

    var taskTableBody = document.getElementById("taskList");
    taskTableBody.innerHTML = "";

    location.reload();
  }
}

function exportTasks() {
  var dataToExport = JSON.stringify(listsData);
  
  if (dataToExport) {
    var blob = new Blob([dataToExport], { type: "application/json" });
    
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "lists.json";
    
    link.click();
  } else {
    alert("No lists to export.");
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
        var importedData = JSON.parse(content);
      
        for (var listName in importedData) {
          if (importedData.hasOwnProperty(listName)) {
            if (!listsData.hasOwnProperty(listName)) {
              listsData[listName] = importedData[listName];
            } else {
              importedData[listName].tasks.forEach(function(importedTask) {
                var existingList = listsData[listName];
                var existingTask = existingList.tasks.find(function(task) {
                  return task.id === importedTask.id;
                });
                if (!existingTask) {
                  existingList.tasks.push(importedTask);
                } else {
                  importedTask.subtasks.forEach(function(importedSubtask) {
                    if (!existingTask.subtasks.find(function(subtask) {
                      return subtask.id === importedSubtask.id;
                    })) {
                      existingTask.subtasks.push(importedSubtask);
                    }
                  });
                }
              });
            }
          }
        }
        
        saveListsData();

        loadLists();
        loadTasks();
      } catch (error) {
        alert("Error importing tasks: Invalid JSON format.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
  toggleSettings();
}

function saveListsData() {
  localStorage.setItem("listsData", JSON.stringify(listsData));
}

function sortTasksByDate() {
  var header = document.getElementById("dueDateHeader");
  var currentOrder = header.dataset.order;

  if (!currentOrder) {
    header.dataset.order = "asc";
    header.textContent = "Due Date ▲";
  } else if (currentOrder === "asc") {
    header.dataset.order = "desc";
    header.textContent = "Due Date ▼";
  } else if (currentOrder === "desc") {
    header.removeAttribute("data-order");
    header.textContent = "Due Date";
    loadTasks();
    return;
  }

  var tasks = Array.from(document.getElementById("taskList").children);

  if (currentOrder !== "") {
    tasks.sort(function(a, b) {
      var dateA = new Date(a.cells[2].textContent);
      var dateB = new Date(b.cells[2].textContent);
      return currentOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    var taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(function(task) {
      taskList.appendChild(task);
    });
  }
}

function toggleListOptions() {
    var listOptions = document.getElementById("listOptions");
    listOptions.classList.toggle("show");
}

function hideListOptions() {
    var listOptions = document.getElementById("listOptions");
    listOptions.classList.remove("show");
}

function addSubtask(row) {
  var taskId = parseInt(row.dataset.id);

  var taskIndex = listsData[currentList].tasks.findIndex(function(task) {
    return task.id == taskId;
  });

  if (taskIndex !== -1) {
    var subtaskTitle = prompt("Enter the title for the subtask:");

    if (!listsData[currentList].tasks[taskIndex].subtasks || !Array.isArray(listsData[currentList].tasks[taskIndex].subtasks)) {
      listsData[currentList].tasks[taskIndex].subtasks = [];
    }

    if (subtaskTitle) {
      var subtask = {
        id: listsData[currentList].tasks[taskIndex].subtasks.length + 1,
        title: subtaskTitle,
        completed: false
      };

      listsData[currentList].tasks[taskIndex].subtasks.push(subtask);

      saveListsData();

      loadTasks();
    }
  } else {
    console.error("Parent task not found!");
  }
}

function editSubtask(taskId, subtaskId, newTitle) {
  var taskIndex = listsData[currentList].tasks.findIndex(function(task) {
    return task.id === taskId;
  });

  if (taskIndex !== -1) {
    var subtaskIndex = listsData[currentList].tasks[taskIndex].subtasks.findIndex(function(subtask) {
      return subtask.id === subtaskId;
    });

    if (subtaskIndex !== -1) {
      listsData[currentList].tasks[taskIndex].subtasks[subtaskIndex].title = newTitle;

      saveListsData();

      loadTasks();
    }
  } else {
    console.error("Parent task not found!");
  }
}

function deleteSubtask(taskId, subtaskId) {
  var taskIndex = listsData[currentList].tasks.findIndex(function(task) {
    return task.id === taskId;
  });

  if (taskIndex !== -1) {
    var subtaskIndex = listsData[currentList].tasks[taskIndex].subtasks.findIndex(function(subtask) {
      return subtask.id === subtaskId;
    });

    if (subtaskIndex !== -1) {
      listsData[currentList].tasks[taskIndex].subtasks.splice(subtaskIndex, 1);

      saveListsData();

      loadTasks();
    }
  } else {
    console.error("Parent task not found!");
  }
}

function loadSubtasks(task) {
  var taskIndex = task.id;
  var row = document.querySelector('tr[data-id="' + taskIndex + '"]');
  var parentRow = row.parentNode;
  var subtasks = listsData[currentList].tasks[taskIndex].subtasks;

  var showSubtasks = listsData[currentList].tasks[taskIndex].showSubtasks;
    
  if(subtasks){
    var subtaskContainer = document.createElement("tr");
    subtaskContainer.setAttribute("data-id", taskIndex);
    subtaskContainer.classList.add("subtask-container");

    if(showSubtasks !== false){
      subtaskContainer.style.display = "none";    
    }
      
    var subtaskTable = document.createElement("table");
    subtaskTable.classList.add("subtask-list");
    var subtaskTableBody = document.createElement("tbody");

    subtasks.forEach(function(subtask) {
      var subtaskRow = document.createElement("tr");
        
      for (var i = 0; i < 2; i++) {
        var emptyCell = document.createElement("td");
        subtaskRow.appendChild(emptyCell);
      }
        
      var subtaskTitleCell = document.createElement("td");
      subtaskTitleCell.textContent = subtask.title;
      subtaskRow.appendChild(subtaskTitleCell);
        
      var actionsCell = document.createElement("td");
        
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      if (subtask.completed || task.completed) {
        subtaskRow.classList.add("completed");
      }
      checkbox.classList.add("a-btn");
      checkbox.title = "Toggle Completed";
      checkbox.checked = task.completed ? task.completed : subtask.completed;
      checkbox.onchange = function() {
        toggleSubtasks(taskIndex, subtask.id, this);
      };
      actionsCell.appendChild(checkbox);
      var editButton = document.createElement("a");
      editButton.textContent = "📝";
      editButton.classList.add("a-action");
      editButton.title = "Edit subtask";
      editButton.addEventListener("click", function() {
        var newTitle = prompt("Enter the new name for the subtask:", subtask.title);
        if (newTitle !== null) {
          editSubtask(taskIndex, subtask.id, newTitle);
        }
      });
      actionsCell.appendChild(editButton);
       
      var deleteButton = document.createElement("a");
      deleteButton.textContent = "🗑️";
      deleteButton.classList.add("a-action");
      deleteButton.title = "Clear subtask";
      deleteButton.addEventListener("click", function() {
        var confirmation = confirm("Are you sure you want to delete this subtask?");
        if (confirmation) {
          deleteSubtask(taskIndex, subtask.id);
        }
      });
      actionsCell.appendChild(deleteButton);

      subtaskRow.appendChild(actionsCell);

      subtaskTableBody.appendChild(subtaskRow);
    });

    subtaskTable.appendChild(subtaskTableBody);
    subtaskContainer.appendChild(subtaskTable);

    parentRow.insertBefore(subtaskContainer, row.nextSibling);
  }
}

function toggleSubtasks(taskId, subtaskId, checkbox) {
  var taskIndex = listsData[currentList].tasks.findIndex(function(task) {
    return task.id === taskId;
  });

  if (taskIndex !== -1) {
    var subtaskIndex = listsData[currentList].tasks[taskIndex].subtasks.findIndex(function(subtask) {
      return subtask.id === subtaskId;
    });
    var row = checkbox.parentNode.parentNode;
    if (checkbox.checked) {
      row.classList.add("completed");
      listsData[currentList].tasks[taskIndex].subtasks[subtaskIndex].completed = true;
    } else {
      row.classList.remove("completed");
      listsData[currentList].tasks[taskIndex].subtasks[subtaskIndex].completed = false;
    }

    saveListsData();
    loadTasks();

  } else {
    console.error("Parent task not found!");
  }
}

function toggleSubtasksVisibility(taskRow) {
  var taskId = taskRow.dataset.id;
  var subtaskContainer = taskRow.nextElementSibling;

  var task = listsData[currentList].tasks.find(function(task) {
    return task.id == taskId;
  });

  if (subtaskContainer && subtaskContainer.classList.contains("subtask-container") && (subtaskContainer.getAttribute('data-id') === taskId)) {
    var aToggleHide = taskRow.querySelector('a.toggle-hide');
    
    if (subtaskContainer.style.display === "none") {
      subtaskContainer.style.display = "block";
      aToggleHide.textContent = "▲";

    } else {
      subtaskContainer.style.display = "none";
      aToggleHide.textContent = "▼";
    }

    if (task) {
      task.showSubtasks = !task.showSubtasks;

      saveListsData();

      loadTasks();
    }
  }
}


