/* =============== [ المتغيرات العالمية ] =============== */
let timer;
let minutes = 0;
let seconds = 0;
let isPaused = false;
let enteredTime = null;
let elapsedTimeInSeconds = 0;
let currentTaskId = null;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
const pauseResumeButton = document.querySelector(".pause-btn");
let breakFlag = false;
let helperFlag = true;

var audio = new Audio("bell sound.mp3"); // صوت الجرس
var myHero = document.getElementById("hero"); // صوت آخر (hero)
var checkSound = document.querySelector("#checkSound");
var checkSoundFlag = true;
var isTimerOn = false;
let time = document.querySelector(".time");
const clearBtn = document.querySelector(".clear");
var breakGif1 = document.getElementById("breakGif1");
var breakGif2 = document.getElementById("breakGif2");

/* 
  [الصوت الخلفي الجديد]
  عنصر الصوت وأسم الصوت المختار (مطر، نار، طبيعة...)
*/
let backgroundAudio = document.getElementById("bgAudio");
let currentBgSound = null;

/* =============== [ العناصر الخاصة بالمودالات ] =============== */
// Prompt1 Modal
const modalOverlay = document.getElementById("modalOverlay");
const promptModal = document.getElementById("promptModal");
const promptMessage = document.getElementById("promptMessage");
const promptInput = document.getElementById("promptInput");
const promptOkBtn = document.getElementById("promptOkBtn");
const promptCancelBtn = document.getElementById("promptCancelBtn");

// Prompt2 Modal
const modalOverlayForBreak = document.getElementById("modalOverlayForBreak");
const promptModalForBreak = document.getElementById("promptModalForBreak");
const promptMessageForBreak = document.getElementById("promptMessageForBreak");
const promptInputForBreak = document.getElementById("promptInputForBreak");
const promptOkBtnForBreak = document.getElementById("promptOkBtnForBreak");
const promptCancelBtnForBreak = document.getElementById(
  "promptCancelBtnForBreak"
);

// Prompt3 Modal
const modalOverlayForAdjusment = document.getElementById(
  "modalOverlayForAdjusment"
);
const promptModalForAdjusment = document.getElementById(
  "promptModalForAdjusment"
);
const promptMessageForAdjusment = document.getElementById(
  "promptMessageForAdjusment"
);
const promptInputForAdjusment = document.getElementById(
  "promptInputForAdjusment"
);
const promptOkBtnForAdjusment = document.getElementById(
  "promptOkBtnForAdjusment"
);
const promptCancelBtnForAdjusment = document.getElementById(
  "promptCancelBtnForAdjusment"
);

// Custom Alert Modal
const modalAlert = document.getElementById("customModal");
const modalMessageAlert = document.getElementById("customModalMessage");
const modalOkBtnAlert = document.getElementById("customModalOkBtn");
const modalCancelBtnAlert = document.getElementById("customModalCancelBtn");

/* =============== [ إعداد المودال التنبيهي الأساسي ] =============== */
modalOkBtnAlert.onclick = function () {
  modalAlert.style.display = "none";
};

/* =============== [ استرجاع الصوت المختار من Local Storage (إن وجد) ] =============== */
window.addEventListener("DOMContentLoaded", function () {
  const savedSound = localStorage.getItem("bgSound");
  if (savedSound) {
    currentBgSound = savedSound;
    backgroundAudio.src = currentBgSound + ".mp3";
  }
});

/* 
  ========================================================
   الدالة التي تُظهر/تخفي القائمة المنسدلة لصوت الخلفية
  ========================================================
*/
function toggleSoundDropdown() {
  const dropdown = document.getElementById("soundDropdown");
  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
  }
}

/* 
  =======================================================
   إغلاق القائمة عند الضغط خارجها
  =======================================================
*/
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("soundDropdown");
  const soundMenu = document.querySelector(".sound-menu");
  // إذا القائمة ظاهرة و النقر خارج .sound-menu، نخفيها
  if (
    dropdown &&
    dropdown.style.display === "block" &&
    !soundMenu.contains(event.target)
  ) {
    dropdown.style.display = "none";
  }
});

/* 
  ===============================================================
   اختيار صوت الخلفية (مطر/نار/طبيعة) وتشغيله إن كانت مهمة شغالة
  ===============================================================
*/
function selectBackgroundSound(soundName) {
  // لو هو نفسه لا تغيّر
  if (currentBgSound === soundName) return;

  currentBgSound = soundName;
  backgroundAudio.src = soundName + ".mp3";

  // احفظ في الستورج
  localStorage.setItem("bgSound", currentBgSound);

  // إذا لدينا مهمة تعمل حالياً وليست بريك، شغّل الصوت فوراً
  if (isTimerOn && !breakFlag) {
    backgroundAudio.play();
  }

  // أغلق الدروب داون
  toggleSoundDropdown();
}

/* =============== [ دوال قائمة المهام الأساسية ] =============== */
function updateTaskList() {
  const taskListElement = document.getElementById("taskList");
  taskListElement.innerHTML = "";

  tasks.forEach((task, index) => {
    const taskTime = convertToMinutes(task.timeSpent);
    const taskClass = task.completed ? "completed-task" : "";
    const li = document.createElement("li");
    li.style.position = "relative";
    li.style.display = "flex";
    li.style.flexDirection = "row";
    li.style.justifyContent = "space-between";

    li.innerHTML = `
        <div class="progress-overlay"></div>
        <span class="task-name ${taskClass}" onclick="markTaskComplete(${index})" style="cursor: pointer;">${task.name}</span>
        <div class="priority-buttons">
            <button class="priority-btn" onclick="setPriority(${index}, 'urgent-important')">عاجل ومهم</button>
            <button class="priority-btn" onclick="setPriority(${index}, 'urgent-not-important')">عاجل وغير مهم</button>
            <button class="priority-btn" onclick="setPriority(${index}, 'not-urgent-important')">غير عاجل ومهم</button>
            <button class="priority-btn" onclick="setPriority(${index}, 'not-urgent-not-important')">غير عاجل وغير مهم</button>
            <button class="start-btn" data-index="${index}" onclick="startTask(${index})">بدأ</button>
        </div>
        
        <button class="delete-btn" onclick="deleteTask(${index})">حذف</button>
    `;

    taskListElement.appendChild(li);
    var startButtons = document.getElementsByClassName("start-btnS");

    //Apply the saved priority text if exists
    if (task.priority) {
      let prioritySpan = getPrioritySpan(task.priority);

      li.innerHTML = `
        <div class="progress-overlay"></div>
        <span class="task-name ${taskClass}" onclick="markTaskComplete(${index})" style="cursor: pointer;">${
        task.name
      }</span> 
        <span class="task-time" onclick="adjustTaskTime(${index})" style="cursor: pointer;">${taskTime}</span>
        
        <div class="buttons-container">
          ${prioritySpan} 
          ${
            !task.completed
              ? `  <button class="start-btnS" data-index="${index}" onclick="startTask(${index})">بدأ</button>`
              : ""
          }
          ${
            !task.completed
              ? `  <button class="edit-btn" onclick="editTask(${index})">تعديل</button>`
              : ""
          }
          <button class="delete-btnS" onclick="deleteTask(${index})">حذف</button>
        </div>
      `;
    }

    if (tasks != null) {
      clearBtn.style.display = "block";
    }

    // اذا ماحدد الاولويه مايقدر يبدأ
    var startButtonsBig = document.getElementsByClassName("start-btn");
    for (let i = 0; startButtonsBig.length > i; i++) {
      startButtonsBig[i].disabled = true;
    }

    if (isTimerOn == true) {
      for (let i = 0; startButtons.length > i; i++) {
        startButtons[i].disabled = true;
      }
    }
  });
}

function addTask() {
  const taskInput = document.getElementById("taskInput");
  const taskName = taskInput.value.trim();
  if (taskName) {
    const newTask = {
      name: taskName,
      timeSpent: 0,
      completed: false,
    };
    tasks.push(newTask);
    taskInput.value = "";
    saveTasksToLocalStorage();
    clearBtn.style.display = "block";
    if (isTimerOn == true) {
      updateProgressOverlay();
    }
    updateTaskList();
  } else {
    modalMessageAlert.textContent = "يرجى إدخال اسم المهمة";
    modalCancelBtnAlert.style.display = "none";
    if (modalCancelBtnAlert.style.display === "none") {
      modalOkBtnAlert.style.width = "50%";
      modalOkBtnAlert.style.margin = "0 auto";
    }
    modalAlert.style.display = "flex";
  }
}

document
  .getElementById("taskInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      addTask();
    }
  });

function markTaskComplete(index) {
  tasks[index].completed = !tasks[index].completed;

  if (checkSoundFlag === true && tasks[index].completed) {
    checkSound.play();
    checkSoundFlag = false;
  } else {
    checkSoundFlag = true;
  }

  if (index === currentTaskId && tasks[index].completed) {
    addTimeToTask();
    defaultState();
    isTimerOn = false;
    pauseResumeButton.style.display = "none";
    currentTaskId = null;

    const startBtn = document.querySelector(
      `.start-btnS[data-index="${index}"]`
    );
    if (startBtn) {
      startBtn.textContent = "بدأ";
      startBtn.style.backgroundColor = "darkgreen";
    }
  }

  document.querySelectorAll(".start-btnS").forEach((btn) => {
    btn.disabled = false;
  });

  saveTasksToLocalStorage();
  updateTaskList();
}

function getPriorityText(priorityClass) {
  switch (priorityClass) {
    case "urgent-important":
      return "عاجل ومهم";
    case "urgent-not-important":
      return "عاجل وغير مهم";
    case "not-urgent-important":
      return "غير عاجل ومهم";
    case "not-urgent-not-important":
      return "غير عاجل وغير مهم";
    default:
      return "";
  }
}

function getPrioritySpan(priorityClass) {
  switch (priorityClass) {
    case "urgent-important":
      return `<span class="priority-text urgent-important">عاجل ومهم</span>`;
    case "urgent-not-important":
      return `<span class="priority-text urgent-not-important">عاجل وغير مهم</span>`;
    case "not-urgent-important":
      return `<span class="priority-text not-urgent-important">غير عاجل ومهم</span>`;
    case "not-urgent-not-important":
      return `<span class="priority-text not-urgent-not-important">غير عاجل وغير مهم</span>`;
    default:
      return "";
  }
}

function setPriority(index, priorityClass) {
  const task = tasks[index];
  task.priority = priorityClass;
  saveTasksToLocalStorage();
  updateTaskList();

  if (isTimerOn == true) {
    updateProgressOverlay();
  }
}

function convertToMinutes(timeInMinutes) {
  return `${timeInMinutes} دقيقة`;
}

function saveTasksToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasksToLocalStorage();
  updateTaskList();
  if (isTimerOn == true) {
    updateProgressOverlay();
  }
  if (tasks.length == 0) {
    clearBtn.style.display = "none";
  }

  if (index === currentTaskId) {
    addTimeToTask();
    defaultState();
    isTimerOn = false;
    pauseResumeButton.style.display = "none";
    currentTaskId = null;
  }
}

function clearTasks() {
  localStorage.clear();
  tasks = [];
  updateTaskList();
  defaultState();
  isTimerOn = false;
  pauseResumeButton.style.display = "none";
  pauseResumeButton.textContent = "إبدأ";
  clearBtn.style.display = "none";
  currentTaskId = null;
}

/* 
  ============================
   البدء بالمهمة (startTask)
  ============================
*/
function startTask(index) {
  currentTaskId = index;
  const task = tasks[currentTaskId];

  promptMessage.textContent = `كم مدة إنجازك في المهمة "${task.name}" بالدقائق؟`;
  modalOverlay.style.display = "flex";
  promptModal.style.display = "block";
  promptInput.focus();

  function handleOk() {
    const newTimeInMinutes = parseInt(promptInput.value);
    if (!isNaN(newTimeInMinutes) && newTimeInMinutes >= 1) {
      modalOverlay.style.display = "none";
      promptModal.style.display = "none";
      enteredTime = newTimeInMinutes;
      minutes = newTimeInMinutes;
      seconds = 0;
      isPaused = false;
      elapsedTimeInSeconds = 0;
      clearInterval(timer);
      startTimer();
      isTimerOn = true;
      pauseResumeButton.textContent = "وقف";
      pauseResumeButton.style.display = "block";
      pauseResumeButton.classList.remove("continue");
      pauseResumeButton.classList.add("paused");
      promptInput.value = "";

      // تعطيل كل ازرار "بدأ" إلا زر المهمة الحالية
      document.querySelectorAll(".start-btnS").forEach((btn) => {
        if (btn.dataset.index !== String(index)) btn.disabled = true;
      });

      // [تشغيل الصوت إن كان مختاراً]
      if (currentBgSound) {
        backgroundAudio.play();
      }
    } else {
      promptMessage.textContent = "لازم دقيقة واحدة على الأقل";
    }
  }

  promptOkBtn.onclick = handleOk;
  promptInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      handleOk();
    }
  });

  promptCancelBtn.onclick = function () {
    modalOverlay.style.display = "none";
    promptModal.style.display = "none";
    promptInput.value = "";
  };
}

/* 
  =========================
    بدء البريك (startBreak)
  =========================
*/
function startBreak() {
  myHero.play();
  breakFlag = true;

  promptMessageForBreak.textContent = "حدد وقت البريك بالدقائق";
  modalOverlayForBreak.style.display = "flex";
  promptModalForBreak.style.display = "block";
  promptInputForBreak.focus();
  promptInputForBreak.value = "";

  function handleOk2() {
    let breakTime = parseInt(promptInputForBreak.value);

    if (!isNaN(breakTime) && breakTime >= 1) {
      modalOverlayForBreak.style.display = "none";
      promptModalForBreak.style.display = "none";

      enteredTime = breakTime;
      minutes = enteredTime;
      seconds = 0;
      clearInterval(timer);
      startTimer();
      isTimerOn = true;

      document.querySelectorAll(".start-btnS").forEach((btn) => {
        btn.disabled = true;
      });

      pauseResumeButton.textContent = "وقف";
      pauseResumeButton.style.display = "block";
      pauseResumeButton.classList.remove("continue");
      pauseResumeButton.classList.add("paused");

      promptInputForBreak.value = "";

      // [توقف الصوت في البريك]
      backgroundAudio.pause();
      backgroundAudio.currentTime = 0;
    } else {
      promptMessageForBreak.textContent = "لازم دقيقة واحدة على الأقل";
    }
  }

  promptOkBtnForBreak.onclick = handleOk2;
  promptInputForBreak.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      handleOk2();
    }
  });

  promptCancelBtnForBreak.onclick = function () {
    modalOverlayForBreak.style.display = "none";
    promptModalForBreak.style.display = "none";
    promptInputForBreak.value = "";

    document.querySelectorAll(".start-btnS").forEach((btn) => {
      btn.disabled = false;
    });

    defaultState();
  };
}

/* 
  ==========================================================
   دوال المؤقت الرئيسية: startTimer, updateTimer, الخ...
  ==========================================================
*/
let startTime;
let targetTime;

function startTimer() {
  startTime = Date.now();
  targetTime = startTime + (minutes * 60 + seconds) * 1000;
  timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const now = Date.now();
  const remainingTime = targetTime - now;

  if (remainingTime <= 0) {
    clearInterval(timer);
    minutes = 0;
    seconds = 0;
    elapsedTimeInSeconds = enteredTime * 60;
    updateTimerDisplay();
    handleTimerEnd();
    return;
  }

  minutes = Math.floor(remainingTime / 1000 / 60);
  seconds = Math.floor((remainingTime / 1000) % 60);
  elapsedTimeInSeconds = enteredTime * 60 - Math.floor(remainingTime / 1000);

  updateTimerDisplay();
  updateProgressOverlay();
}

function updateTimerDisplay() {
  const timerElement = document.getElementById("timer");
  timerElement.textContent = formatTime(minutes, seconds);
}

function updateProgressOverlay() {
  if (currentTaskId !== null) {
    const taskListElement = document.getElementById("taskList");
    const lis = taskListElement.getElementsByTagName("li");
    const currentLi = lis[currentTaskId];
    if (!currentLi) return;

    const overlay = currentLi.querySelector(".progress-overlay");
    if (!overlay) return;

    let totalSeconds = enteredTime * 60;
    let progressPercentage = (elapsedTimeInSeconds / totalSeconds) * 100;
    if (progressPercentage >= 100) progressPercentage = 0;

    overlay.style.width = progressPercentage + "%";

    if (breakFlag && progressPercentage !== 0) {
      overlay.style.backgroundColor = "rgba(255, 255, 0, 0.2)";
    } else {
      overlay.style.backgroundColor = "rgba(0, 128, 0, 0.2)";
    }
  }
}

function resetOverlay() {
  if (currentTaskId !== null) {
    const taskListElement = document.getElementById("taskList");
    const lis = taskListElement.getElementsByTagName("li");
    const currentLi = lis[currentTaskId];
    if (!currentLi) return;

    const overlay = currentLi.querySelector(".progress-overlay");
    if (overlay) {
      overlay.style.width = "0%";
    }
  }
}

function handleTimerEnd() {
  if (breakFlag === false) {
    // انتهى وقت المهمة
    addTimeToTask();
    helperFlag = false;
    togglePauseResume();
    startBreak();
    isTimerOn = false;
  } else {
    // انتهى وقت البريك
    // نعيد الصفحة للوضع الافتراضي
    defaultState();
    myHero.play(); // لو أردت تشغيل الصوت بعد انتهاء البريك
  }
}

function formatTime(minutes, seconds) {
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

/* 
  ============================================
   إيقاف واستئناف المؤقت + إيقاف/تشغيل الصوت
  ============================================
*/
function togglePauseResume() {
  // إذا المؤقت لم يبدأ
  if (
    pauseResumeButton.textContent == "إبدأ" &&
    minutes === 0 &&
    seconds === 0 &&
    helperFlag === true
  ) {
    modalMessageAlert.textContent = "إبدأ مهمة كي تحدد الوقت وتبدأ الإنجاز!";
    modalAlert.style.display = "block";
    modalCancelBtnAlert.style.display = "none";
    if (modalCancelBtnAlert.style.display === "none") {
      modalOkBtnAlert.style.width = "50%";
      modalOkBtnAlert.style.margin = "0 auto";
    }
    return;
  }

  // إذا المؤقت الآن في حالة "وقف" => المستخدم يريد الإيقاف المؤقت
  if (pauseResumeButton.textContent === "وقف") {
    clearInterval(timer);
    pauseResumeButton.textContent = "إستمر";
    pauseResumeButton.classList.add("continue");

    // [إيقاف الصوت إن وجد]
    backgroundAudio.pause();

    // إظهار زر "إنهاء" (إن كنت تستخدمه)
    addFinishButton();
  } else if (pauseResumeButton.textContent === "إستمر") {
    // استئناف المؤقت
    startTimer();
    pauseResumeButton.textContent = "وقف";
    pauseResumeButton.classList.remove("continue");
    pauseResumeButton.classList.add("paused");

    // [تشغيل الصوت من جديد لو لسنا في بريك]
    if (currentBgSound && !breakFlag) {
      backgroundAudio.play();
    }

    // إزالة زر "إنهاء"
    removeFinishButton();
  }
}

/* =============== [ زر "إنهاء" ] =============== */
function addFinishButton() {
  const existingFinishButton = document.querySelector(".finish-button");
  if (!existingFinishButton) {
    const finishButton = document.createElement("button");
    finishButton.textContent = "إنهاء";
    finishButton.classList.add("finish-button");
    finishButton.onclick = () => {
      if (breakFlag === false) {
        // ينهي المهمة
        addTimeToTask();
        isTimerOn = false;
        pauseResumeButton.style.display = "none";
        pauseResumeButton.textContent = "إبدأ";
        resetOverlay();
      } else {
        defaultState();
        isTimerOn = false;
        pauseResumeButton.style.display = "none";
        pauseResumeButton.textContent = "إبدأ";
      }
    };
    document.querySelector(".timer-container").appendChild(finishButton);
  }
}

function defaultState() {
  removeFinishButton();
  clearInterval(timer);
  minutes = 0;
  seconds = 0;

  // إعادة نص "أنجز !" في المؤقت
  time.innerHTML = "أنجز !";
  const timerElement = document.getElementById("timer");
  timerElement.textContent = formatTime(minutes, seconds);

  // إخفاء صور البريك
  breakGif1.style.display = "none";
  breakGif2.style.display = "none";

  // إعادة القيم المنطقية الافتراضية
  breakFlag = false;
  helperFlag = true;
  isTimerOn = false;
  currentTaskId = null;

  // إعادة شريط التقدم إلى الصفر
  resetOverlay();

  // إعادة تفعيل كل أزرار "بدأ"
  document.querySelectorAll(".start-btnS").forEach((btn) => {
    btn.textContent = "بدأ";
    btn.style.backgroundColor = "darkgreen";
    btn.disabled = false;
  });

  // إخفاء زر الوقف/الاستمرار وتهيئته لـ "إبدأ"
  pauseResumeButton.style.display = "none";
  pauseResumeButton.textContent = "إبدأ";
  pauseResumeButton.classList.remove("paused", "continue");
}

function removeFinishButton() {
  const finishButton = document.querySelector(".finish-button");
  if (finishButton) {
    finishButton.remove();
  }
}

/* 
  ============================
   إضافة الوقت للمهمة الحالية
  ============================
*/
function addTimeToTask() {
  if (currentTaskId !== null && elapsedTimeInSeconds >= 60) {
    const elapsedMinutes = Math.floor(elapsedTimeInSeconds / 60);
    tasks[currentTaskId].timeSpent += elapsedMinutes;

    saveTasksToLocalStorage();
    updateTaskList();
    updateProgressOverlay();

    elapsedTimeInSeconds = 0;
    removeFinishButton();
    clearInterval(timer);
    minutes = 0;
    seconds = 0;

    const timerElement = document.getElementById("timer");
    timerElement.textContent = formatTime(minutes, seconds);
  } else if (elapsedTimeInSeconds < 60) {
    removeFinishButton();
    clearInterval(timer);
    minutes = 0;
    seconds = 0;

    const timerElement = document.getElementById("timer");
    timerElement.textContent = formatTime(minutes, seconds);
  }
}

/* 
  ============================
   تعديل وقت المهمة يدويًا
  ============================
*/
function adjustTaskTime(index) {
  let task2 = tasks[index];

  promptMessageForAdjusment.textContent = `الوقت الحالي: ${task2.timeSpent} دقيقة\n مثال: +10 أو -10`;
  modalOverlayForAdjusment.style.display = "flex";
  promptModalForAdjusment.style.display = "block";
  promptInputForAdjusment.focus();

  function handleEnterPress(event) {
    if (event.key === "Enter") {
      handleOK3(task2);
      promptInputForAdjusment.removeEventListener("keypress", handleEnterPress);
    }
  }

  promptInputForAdjusment.addEventListener("keypress", handleEnterPress);

  promptOkBtnForAdjusment.onclick = function () {
    handleOK3(task2);
  };

  promptCancelBtnForAdjusment.onclick = function () {
    modalOverlayForAdjusment.style.display = "none";
    promptModalForAdjusment.style.display = "none";
    promptInputForAdjusment.value = "";
    promptInputForAdjusment.removeEventListener("keypress", handleEnterPress);
  };
}

function handleOK3(task2) {
  let adjustment = promptInputForAdjusment.value;
  const adjustmentValue = parseInt(adjustment);

  if (!isNaN(adjustmentValue)) {
    const newTime = task2.timeSpent + adjustmentValue;

    if (newTime >= 0) {
      task2.timeSpent = newTime;
      saveTasksToLocalStorage();
      updateTaskList();

      modalOverlayForAdjusment.style.display = "none";
      promptModalForAdjusment.style.display = "none";
      promptInputForAdjusment.value = "";
    } else {
      promptMessageForAdjusment.textContent =
        "لا يمكن أن يكون الوقت أقل من صفر.";
    }
  } else {
    promptMessageForAdjusment.textContent =
      "الرجاء إدخال قيمة صحيحة (+10 أو -10).";
  }
}

/* 
  ===================
    تعديل المهمة
  ===================
*/
function editTask(index) {
  const modalOverlayEdit = document.getElementById("modalOverlayForEdit");
  const promptModalEdit = document.getElementById("promptModalForEdit");
  const promptMessageEdit = document.getElementById("promptMessageForEdit");
  const promptInputEdit = document.getElementById("promptInputForEdit");
  const promptSelectEdit = document.getElementById("promptSelectForEdit");
  const promptOkBtnEdit = document.getElementById("promptOkBtnForEdit");
  const promptCancelBtnEdit = document.getElementById("promptCancelBtnForEdit");

  promptMessageEdit.textContent = "عدل اسم المهمة وأولويتها:";
  promptInputEdit.value = tasks[index].name || "";
  promptSelectEdit.value = tasks[index].priority || "urgent-important";

  modalOverlayEdit.style.display = "flex";
  promptModalEdit.style.display = "block";

  promptOkBtnEdit.onclick = function () {
    const newName = promptInputEdit.value.trim();
    const newPriority = promptSelectEdit.value;

    if (newName.length === 0) {
      promptMessageEdit.textContent = "لا يمكن أن يكون اسم المهمة فارغًا!";
      return;
    }
    tasks[index].name = newName;
    tasks[index].priority = newPriority;

    saveTasksToLocalStorage();
    updateTaskList();

    closeEditModal();
  };

  promptCancelBtnEdit.onclick = function () {
    closeEditModal();
  };

  function closeEditModal() {
    modalOverlayEdit.style.display = "none";
    promptModalEdit.style.display = "none";
  }
}

/* التهيئة الأولى */
updateTaskList();
