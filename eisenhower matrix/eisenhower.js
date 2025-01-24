let tasks = [];

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskPriority = document.getElementById('taskPriority');
    const taskName = taskInput.value.trim();
    const priority = taskPriority.value;

    if (taskName) {
        const newTask = {
            name: taskName,
            priority: priority
        };
        tasks.push(newTask);
        taskInput.value = '';
        updateTaskList();
    } else {
        alert('يرجى إدخال اسم المهمة');
    }
}

function updateTaskList() {
    const urgentImportantTasks = document.getElementById('urgent-important-tasks');
    const urgentNotImportantTasks = document.getElementById('urgent-not-important-tasks');
    const notUrgentImportantTasks = document.getElementById('not-urgent-important-tasks');
    const notUrgentNotImportantTasks = document.getElementById('not-urgent-not-important-tasks');

    urgentImportantTasks.innerHTML = '';
    urgentNotImportantTasks.innerHTML = '';
    notUrgentImportantTasks.innerHTML = '';
    notUrgentNotImportantTasks.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.name;

        switch (task.priority) {
            case 'urgent-important':
                urgentImportantTasks.appendChild(li);
                break;
            case 'urgent-not-important':
                urgentNotImportantTasks.appendChild(li);
                break;
            case 'not-urgent-important':
                notUrgentImportantTasks.appendChild(li);
                break;
            case 'not-urgent-not-important':
                notUrgentNotImportantTasks.appendChild(li);
                break;
        }
    });
}