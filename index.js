/* ====================== [ المتغيرات العالمية ] ====================== */
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

/* الصوت الخلفي */
let backgroundAudio = document.getElementById("bgAudio");
let currentBgSound = null;

/* مودالات مختلفة */
const modalOverlay = document.getElementById("modalOverlay");
const promptModal = document.getElementById("promptModal");
const promptMessage = document.getElementById("promptMessage");
const promptInput = document.getElementById("promptInput");
const promptOkBtn = document.getElementById("promptOkBtn");
const promptCancelBtn = document.getElementById("promptCancelBtn");

const modalOverlayForBreak = document.getElementById("modalOverlayForBreak");
const promptModalForBreak = document.getElementById("promptModalForBreak");
const promptMessageForBreak = document.getElementById("promptMessageForBreak");
const promptInputForBreak = document.getElementById("promptInputForBreak");
const promptOkBtnForBreak = document.getElementById("promptOkBtnForBreak");
const promptCancelBtnForBreak = document.getElementById(
  "promptCancelBtnForBreak"
);

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

const modalAlert = document.getElementById("customModal");
const modalMessageAlert = document.getElementById("customModalMessage");
const modalOkBtnAlert = document.getElementById("customModalOkBtn");
const modalCancelBtnAlert = document.getElementById("customModalCancelBtn");

/* =========== زر موافق في المودال التنبيهي =========== */
modalOkBtnAlert.onclick = function () {
  modalAlert.style.display = "none";
};

/* 
  userCustomOrder: إذا صار true, يعني المستخدم أعاد الترتيب يدويًا بالسحب والإفلات
  ولن نعيد ترتيب المهام تلقائيًا.
*/
let userCustomOrder = false;

/* ==================== [ استرجاع الصوت المختار ] ==================== */
window.addEventListener("DOMContentLoaded", function () {
  const savedSound = localStorage.getItem("bgSound");
  if (savedSound) {
    currentBgSound = savedSound;
    backgroundAudio.src = currentBgSound + ".mp3";
  }
});

/* ===================== [ الدوال الخاصة بفرز المهام ] ===================== */
/** يعطينا قيمة رقمية حسب نوع الأولوية. قيمة أصغر = ترتيب أعلى. */
function getPriorityValue(priority) {
  switch (priority) {
    case "urgent-important":
      return 1; // عاجل ومهم
    case "urgent-not-important":
      return 2; // عاجل وغير مهم
    case "not-urgent-important":
      return 3; // غير عاجل ومهم
    case "not-urgent-not-important":
      return 4; // غير عاجل وغير مهم
    default:
      return 5; // أي شيء آخر لم يحدد بعد
  }
}

/** دالة تفرز المصفوفة tasks حسب الأولوية تصاعديًا */
function sortTasksByPriority() {
  tasks.sort((a, b) => {
    return getPriorityValue(a.priority) - getPriorityValue(b.priority);
  });
}

/* ====================== [ القائمة الصوتية ] ====================== */
function toggleSoundDropdown() {
  const dropdown = document.getElementById("soundDropdown");
  if (dropdown.style.display === "block") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
  }
}

document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("soundDropdown");
  const soundMenu = document.querySelector(".sound-menu");
  if (
    dropdown &&
    dropdown.style.display === "block" &&
    !soundMenu.contains(event.target)
  ) {
    dropdown.style.display = "none";
  }
});

function selectBackgroundSound(soundName) {
  if (currentBgSound === soundName) return;
  currentBgSound = soundName;
  backgroundAudio.src = soundName + ".mp3";
  localStorage.setItem("bgSound", currentBgSound);
  if (isTimerOn && !breakFlag) {
    backgroundAudio.play();
  }
  toggleSoundDropdown();
}

/* ====================== [ حفظ + تهيئة المهام ] ====================== */
function saveTasksToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* كل مرة نرسم المهام, إن لم يكن userCustomOrder مفعلًا, نفرز حسب الأولوية */
function updateTaskList() {
  const taskListElement = document.getElementById("taskList");
  taskListElement.innerHTML = "";

  // بناء عناصر <li> لكل مهمة
  tasks.forEach((task, index) => {
    const taskTime = convertToMinutes(task.timeSpent);
    const taskClass = task.completed ? "completed-task" : "";

    const li = document.createElement("li");
    li.style.position = "relative";
    li.style.display = "flex";
    li.style.flexDirection = "row";
    li.style.justifyContent = "space-between";

    // ========= [ أضف Events للسحب والإفلات ] =========
    li.setAttribute("draggable", "true");

    // عند بدء السحب نخزن index المهمة
    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", index);
    });

    // منع السلوك الافتراضي للسماح بالإسقاط
    li.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    // عند الإسقاط, نأخذ fromIndex ونحركه إلى toIndex
    li.addEventListener("drop", (e) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
      const toIndex = index;
      if (fromIndex !== toIndex) {
        // انقل المهمة في المصفوفة
        const movedTask = tasks.splice(fromIndex, 1)[0];
        tasks.splice(toIndex, 0, movedTask);

        // فعلنا الترتيب اليدوي:
        userCustomOrder = true;

        saveTasksToLocalStorage();
        updateTaskList();
      }
    });

    // محتوى العنصر li:
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

    // اذا كانت له اولوية محددة, غيّر واجهة العرض
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
  });

  // إظهار زر "حذف الكل" إن كان فيه مهام
  if (tasks.length > 0) {
    clearBtn.style.display = "block";
  } else {
    clearBtn.style.display = "none";
  }

  // تعطيل زر "بدأ" ما لم يحدد أولوية
  const startButtonsBig = document.getElementsByClassName("start-btn");
  for (let i = 0; i < startButtonsBig.length; i++) {
    startButtonsBig[i].disabled = true;
  }

  // اذا المؤقت شغال, نعطّل كل ازرار "بدأ" في الواجهه
  if (isTimerOn) {
    const startButtonsSmall = document.getElementsByClassName("start-btnS");
    for (let i = 0; i < startButtonsSmall.length; i++) {
      startButtonsSmall[i].disabled = true;
    }
  }
}

/* ===================== [ إضافة وحذف المهام ] ===================== */
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

    // إذا المستخدم لم يقم بترتيب يدوي, نسوي ترتيب حسب الأولوية
    if (!userCustomOrder) {
      sortTasksByPriority();
    }

    saveTasksToLocalStorage();
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

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasksToLocalStorage();
  updateTaskList();

  if (index === currentTaskId) {
    addTimeToTask();
    defaultState();
    isTimerOn = false;
    pauseResumeButton.style.display = "none";
    currentTaskId = null;
  }

  if (tasks.length === 0) {
    clearBtn.style.display = "none";
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

/* ===================== [ دوال الأولوية ] ===================== */
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

  // إذا ما عمل المستخدم ترتيب يدوي, أعد الترتيب حسب الأولوية
  if (!userCustomOrder) {
    sortTasksByPriority();
  }

  saveTasksToLocalStorage();
  updateTaskList();
}

/* ===================== [ اكتمال مهمة ] ===================== */
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
  }

  document.querySelectorAll(".start-btnS").forEach((btn) => {
    btn.disabled = false;
  });

  saveTasksToLocalStorage();
  updateTaskList();
}

/* ===================== [ تنسيق الوقت ] ===================== */
function convertToMinutes(timeInMinutes) {
  return `${timeInMinutes} دقيقة`;
}

/* ===================== [ بدء مهمة ] ===================== */
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

      // تعطيل كل ازرار "بدأ" عدا المهمة الحالية
      document.querySelectorAll(".start-btnS").forEach((btn) => {
        if (btn.dataset.index !== String(index)) btn.disabled = true;
      });

      // تشغيل الصوت إن كان مختار
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

/* ===================== [ بدء البريك ] ===================== */
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

      // إيقاف صوت الخلفية أثناء البريك
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

/* ===================== [ المؤقت ] ===================== */
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

function formatTime(m, s) {
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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
  if (!breakFlag) {
    // انتهى وقت المهمة
    addTimeToTask();
    helperFlag = false;
    togglePauseResume();
    startBreak();
    isTimerOn = false;
  } else {
    // انتهى وقت البريك
    defaultState();
    myHero.play();
  }
}

/* ===================== [ إيقاف واستئناف المؤقت ] ===================== */
function togglePauseResume() {
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

  if (pauseResumeButton.textContent === "وقف") {
    clearInterval(timer);
    pauseResumeButton.textContent = "إستمر";
    pauseResumeButton.classList.add("continue");
    backgroundAudio.pause();
    addFinishButton();
  } else if (pauseResumeButton.textContent === "إستمر") {
    startTimer();
    pauseResumeButton.textContent = "وقف";
    pauseResumeButton.classList.remove("continue");
    pauseResumeButton.classList.add("paused");

    if (currentBgSound && !breakFlag) {
      backgroundAudio.play();
    }
    removeFinishButton();
  }
}

/* ===================== [ زر إنهاء ] ===================== */
function addFinishButton() {
  const existingFinishButton = document.querySelector(".finish-button");
  if (!existingFinishButton) {
    const finishButton = document.createElement("button");
    finishButton.textContent = "إنهاء";
    finishButton.classList.add("finish-button");
    finishButton.onclick = () => {
      if (!breakFlag) {
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

function removeFinishButton() {
  const finishButton = document.querySelector(".finish-button");
  if (finishButton) {
    finishButton.remove();
  }
}

/* ===================== [ الحالة الافتراضية ] ===================== */
function defaultState() {
  removeFinishButton();
  clearInterval(timer);
  minutes = 0;
  seconds = 0;
  time.innerHTML = "أنجز !";

  const timerElement = document.getElementById("timer");
  timerElement.textContent = formatTime(minutes, seconds);

  breakGif1.style.display = "none";
  breakGif2.style.display = "none";

  breakFlag = false;
  helperFlag = true;
  isTimerOn = false;
  currentTaskId = null;
  resetOverlay();

  // إعادة أزرار "بدأ"
  document.querySelectorAll(".start-btnS").forEach((btn) => {
    btn.textContent = "بدأ";
    btn.style.backgroundColor = "darkgreen";
    btn.disabled = false;
  });

  // إخفاء زر الوقف/الاستمرار
  pauseResumeButton.style.display = "none";
  pauseResumeButton.textContent = "إبدأ";
  pauseResumeButton.classList.remove("paused", "continue");
}

/* ===================== [ إضافة وقت للمهمة ] ===================== */
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

/* ===================== [ تعديل وقت مهمة يدويًا ] ===================== */
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

/* ===================== [ تعديل اسم وأولوية مهمة ] ===================== */
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

    // لو ما في ترتيب يدوي, أعد فرزها بالأولوية
    if (!userCustomOrder) {
      sortTasksByPriority();
    }

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

/* ===================== [ التهيئة الأولى ] ===================== */
// في أول مرة, لو ما قام المستخدم بالترتيب اليدوي, نسوي فرز
if (!userCustomOrder && tasks.length > 1) {
  sortTasksByPriority();
}
updateTaskList();
