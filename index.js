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
let helperFlag=true;
var audio = new Audio('bell sound.mp3');
var breakGif1=document.getElementById('breakGif1');
var breakGif2=document.getElementById('breakGif2');

/*
الله يستر تعديلات جديده لجعل المؤقت دقيق

*/
let startTime; // الطابع الزمني عند بدء المؤقت
let targetTime; // وقت انتهاء العد التنازلي 



document.getElementById('taskInput').addEventListener('keypress', function (event) {
    // تحقق إذا كان المفتاح المضغوط هو Enter (رمز المفتاح 13)
    if (event.key === 'Enter') {
        addTask(); // استدعاء دالة إضافة المهمة
    }
});

function updateTaskList() {
    const taskListElement = document.getElementById('taskList');
    taskListElement.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskTime = convertToMinutes(task.timeSpent);
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="task-name">${task.name}</span> 
            <span class="task-time">${taskTime}</span>
                   <button class="priority-btn" onclick="setPriority(${index}, 'urgent-important')">عاجل ومهم</button>
            <button class="priority-btn" onclick="setPriority(${index}, 'urgent-not-important')">عاجل وغير مهم</button>
            <button class="priority-btn" onclick="setPriority(${index}, 'not-urgent-important')">غير عاجل ومهم</button>
            <button class="priority-btn" onclick="setPriority(${index}, 'not-urgent-not-important')">غير عاجل وغير مهم</button>
            <button onclick="startTask(${index})">بدأ</button>
            <button class="delete-btn" onclick="deleteTask(${index})">حذف</button>
     
        `;
        taskListElement.appendChild(li);

        // Apply the saved priority text if exists
        if (task.priority) {
            const priorityText = getPriorityText(task.priority);
            li.innerHTML = `
                <span class="task-name">${task.name}</span> 
                <span class="task-time">${taskTime}</span>
                <span class="priority-text">${priorityText}</span>
                <button onclick="startTask(${index})">بدأ</button>
                <button class="delete-btn" onclick="deleteTask(${index})">حذف</button>
                
            `;
        }
    });
}

function getPriorityText(priorityClass) {
    switch (priorityClass) {
        case 'urgent-important':
            return 'عاجل ومهم';
        case 'urgent-not-important':
            return 'عاجل وغير مهم';
        case 'not-urgent-important':
            return 'غير عاجل ومهم';
        case 'not-urgent-not-important':
            return 'غير عاجل وغير مهم';
        default:
            return '';
    }
}

function setPriority(index, priorityClass) {
    const task = tasks[index];
    task.priority = priorityClass;
    saveTasksToLocalStorage();
    updateTaskList();
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
        breakGif1.style.display="none";
        breakGif2.style.display="none";
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
        breakGif1.style.display="block";
        breakGif2.style.display="block";
        pauseResumeButton.textContent="وقف";
        pauseResumeButton.classList.remove("continue");
        pauseResumeButton.classList.add("paused");


    } else {
        alert('الرجاء إدخال عدد صحيح من الدقائق أكبر من صفر');
    }
}






function updateTimer() {
    const timerElement = document.getElementById('timer');
    const now = Date.now(); // الوقت الحالي
    const remainingTime = targetTime - now; // الوقت المتبقي بالألف من الثانية

    if (remainingTime <= 0) {
        clearInterval(timer);
        minutes = 0;
        seconds = 0;
        elapsedTimeInSeconds = enteredTime * 60; // تأكد من تحديث الوقت المنقضي بالدقة
        updateTimerDisplay();
        handleTimerEnd(); // استدعاء عند انتهاء المؤقت
        return;
    }

    // تحديث الدقائق والثواني
    minutes = Math.floor((remainingTime / 1000) / 60);
    seconds = Math.floor((remainingTime / 1000) % 60);

    // تحديث الوقت المنقضي بناءً على الفرق
    elapsedTimeInSeconds = (enteredTime * 60) - Math.floor(remainingTime / 1000);

    // تحديث واجهة المستخدم
    updateTimerDisplay();

    // طباعة لمساعدتك
    console.log(`elapsedTimeInSeconds: ${elapsedTimeInSeconds}`);
}



function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = formatTime(minutes, seconds);
}

function handleTimerEnd() {
    if (breakFlag === false) {  // هذي الحاله لما ينتهي وقت المهمه الي حطيته
        addTimeToTask();
        helperFlag = false; // صار فولس
        togglePauseResume();
        startBreak();
    } else {
        togglePauseResume();
        breakFlag = false;
        helperFlag = true;
        alert("أنتهى البريك إرجع أنجز");
        breakGif1.style.display = "none";
        breakGif2.style.display = "none";
    }
}

function formatTime(minutes, seconds) {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function togglePauseResume() {
    console.log("no way")

    if (pauseResumeButton.textContent == 'إبدأ'&& (minutes===0 && seconds===0) && helperFlag===true) {
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
        breakGif1.style.display="none";
        breakGif2.style.display="none";
        breakFlag=false;
        helperFlag=true;
}

function removeFinishButton() {
    const finishButton = document.querySelector('.finish-button');
    if (finishButton) {
        finishButton.remove();
    }
}



function addTimeToTask() {
    if (currentTaskId !== null && elapsedTimeInSeconds >= 60) {
        // حساب عدد الدقائق المنقضية بشكل دقيق
        const elapsedMinutes = Math.floor(elapsedTimeInSeconds / 60);

        // إضافة الدقائق للمهمة الحالية
        tasks[currentTaskId].timeSpent += elapsedMinutes;

        // حفظ المهام وتحديث القائمة
        saveTasksToLocalStorage();
        updateTaskList();

        // إعادة تعيين المؤقت والقيم
        elapsedTimeInSeconds = 0;
        removeFinishButton();
        clearInterval(timer);
        minutes = 0;
        seconds = 0;

        // تحديث واجهة المستخدم
        const timerElement = document.getElementById('timer');
        timerElement.textContent = formatTime(minutes, seconds);

        alert(`تم إضافة ${elapsedMinutes} دقيقة إلى المهمة.`);
        console.log("this is from addtime function "+elapsedTimeInSeconds);
        console.log("this is from addtime function "+elapsedMinutes);
    } else if (elapsedTimeInSeconds < 60) {
        alert('الوقت المنقضي أقل من دقيقة! لذلك لن يتم إضافة الوقت.');
        removeFinishButton();
        clearInterval(timer);
        minutes = 0;
        seconds = 0;

        // إعادة تعيين المؤقت
        const timerElement = document.getElementById('timer');
        timerElement.textContent = formatTime(minutes, seconds);
    }
}







function startTimer() {
    startTime = Date.now();
    targetTime = startTime + (minutes * 60 + seconds) * 1000; // وقت الانتهاء بناءً على مدة المؤقت
    timer = setInterval(updateTimer, 1000); // تحديث كل ثانية
}

updateTaskList();



