let timer;
let minutes = 0;
let seconds = 0;
let isPaused = false;
let enteredTime = null;
let elapsedTimeInSeconds = 0;
let currentTaskId = null;
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const pauseResumeButton = document.querySelector('.pause-btn');
let breakFlag= false;
var audio = new Audio('sound.mp3');


function updateTaskList() {
    const taskListElement = document.getElementById('taskList');
    taskListElement.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskTime = convertToMinutes(task.timeSpent);
        const li = document.createElement('li');
        li.innerHTML = `
         <span class="task-name">   ${task.name} </span> <span class="task-time"> ${taskTime}</span>
            <button onclick="startTask(${index})">بدأ</button>
            <button class="delete-btn" onclick="deleteTask(${index})">حذف</button>
        `;
        taskListElement.appendChild(li);
    });
}

function convertToMinutes(timeInMinutes) {
    return `${timeInMinutes} دقيقة`;
}

function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskName = taskInput.value.trim();
    if (taskName) {
        const newTask = {
            name: taskName,
            timeSpent: 0
        };
        tasks.push(newTask);
        taskInput.value = '';
        saveTasksToLocalStorage();
        updateTaskList();
    } else {
        alert('يرجى إدخال اسم المهمة');
    }
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasksToLocalStorage();
    updateTaskList();
}

function startTask(index) {
    currentTaskId = index;
    const task = tasks[currentTaskId];
    const newTimeInMinutes = prompt(`كم مدة إنجازك في المهمة "${task.name}" بالدقائق؟`);
    
    if (!isNaN(newTimeInMinutes) && newTimeInMinutes > 0) {
        enteredTime = parseInt(newTimeInMinutes);
        minutes = enteredTime;
        seconds = 0;
        isPaused = false;
        elapsedTimeInSeconds = 0;
        clearInterval(timer);
        startTimer();
        pauseResumeButton.textContent="وقف";
        pauseResumeButton.classList.remove("continue");
        pauseResumeButton.classList.add("paused");

    } else {
        alert('الرجاء إدخال عدد صحيح من الدقائق أكبر من صفر');
    }
}


function startBreak() {
    breakFlag=true;
    const breakTime = prompt('بريييك , حدد وقت البريك بالدقائق');
    if (!isNaN(breakTime) && breakTime > 0) {
        enteredTime = parseInt(breakTime);
        minutes = enteredTime;
        seconds = 0;
        clearInterval(timer);
        startTimer();
        pauseResumeButton.textContent="وقف";
        pauseResumeButton.classList.remove("continue");
        pauseResumeButton.classList.add("paused");

    } else {
        alert('الرجاء إدخال عدد صحيح من الدقائق أكبر من صفر');
    }
}





function updateTimer() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = formatTime(minutes, seconds);

    if (minutes === 0 && seconds === 0) {
        clearInterval(timer);
        if(breakFlag===false){
            addTimeToTask();
            togglePauseResume();
            startBreak();
        }
        else{
            togglePauseResume(); 
            breakFlag=false;
            alert("أنتهى الريك إرجع أنجز")  
        }
        
    } else if (!isPaused) {
        if (seconds > 0) {
            seconds--;
        } else {
            seconds = 59;
            minutes--;
        }
        elapsedTimeInSeconds++;
    }
}

function formatTime(minutes, seconds) {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function togglePauseResume() {
    console.log("no way")

    if (pauseResumeButton.textContent == 'إبدأ'&& (minutes===0 && seconds===0) ) {
        alert("إبدأ مهمة كي تحدد الوقت وتبدأ الإنجاز!")
        console.log("shit");
    } 

    else if(pauseResumeButton.textContent == 'وقف'&& (minutes==0 && seconds===0)){
            pauseResumeButton.textContent = 'إبدأ';
            pauseResumeButton.classList.remove("paused");
            pauseResumeButton.classList.add("continue");
            audio.play();
    }

    else if(pauseResumeButton.textContent == 'إستمر'){
        startTimer();
        pauseResumeButton.textContent = 'وقف';
        pauseResumeButton.classList.remove("continue");
        pauseResumeButton.classList.add("paused");
         removeFinishButton();
        console.log("shit2");
    }

     else {
        
        clearInterval(timer);
            pauseResumeButton.textContent = 'إستمر';
            pauseResumeButton.classList.add("continue");
          addFinishButton();
         console.log("shit3");
     }

}

function addFinishButton() {
    const existingFinishButton = document.querySelector('.finish-button');
    if (!existingFinishButton) {
        const finishButton = document.createElement('button');
        finishButton.textContent = 'إنهاء';
        finishButton.classList.add('finish-button');
        finishButton.onclick = () => {
            if(breakFlag===false){
                addTimeToTask();
                pauseResumeButton.textContent="إبدأ";
            }
            else{
                defaultState();
                pauseResumeButton.textContent="إبدأ";
            }
            
        };
        document.querySelector('.timer-container').appendChild(finishButton);
    }
}

function defaultState(){
    removeFinishButton();
        clearInterval(timer);
        minutes=0;
        seconds=0;
        const timerElement = document.getElementById('timer');
        timerElement.textContent = formatTime(minutes, seconds);
}

function removeFinishButton() {
    const finishButton = document.querySelector('.finish-button');
    if (finishButton) {
        finishButton.remove();
    }
}

function addTimeToTask() {
    if (currentTaskId !== null && elapsedTimeInSeconds >= 60) {
        const elapsedMinutes = Math.floor(elapsedTimeInSeconds / 60);
        tasks[currentTaskId].timeSpent += elapsedMinutes;
        saveTasksToLocalStorage();
        updateTaskList();
        //alert(`تم إضافة ${elapsedMinutes} دقيقة إلى المهمة.`);
        removeFinishButton();
        clearInterval(timer);
        elapsedTimeInSeconds=0;
        minutes=0;
        seconds=0;
        const timerElement = document.getElementById('timer');
        timerElement.textContent = formatTime(minutes, seconds);
    } else if (elapsedTimeInSeconds < 60) {
        alert(' الوقت المنقضي أقل من دقيقة! لذلك لن يتم إضافة الوقت');
        removeFinishButton();
        clearInterval(timer);
        minutes=0;
        seconds=0;
        const timerElement = document.getElementById('timer');
        timerElement.textContent = formatTime(minutes, seconds);
    }
    
   
}




function startTimer() {
    timer = setInterval(updateTimer, 1000);
}

updateTaskList();