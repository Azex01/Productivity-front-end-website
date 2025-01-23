
// script.js
let timer;
let minutes = 15;
let seconds = 0;
let isPaused = false;
let enteredTime = null;

function startTimer() {
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const timerElement =
        document.getElementById('timer');
    timerElement.textContent = 
        formatTime(minutes, seconds);

    if (minutes === 0 && seconds === 0) {
        clearInterval(timer);
        alert('انتهى الوقت خذ بريييك');
    } else if (!isPaused) {
        if (seconds > 0) {
            seconds--;
        } else {
            seconds = 59;
            minutes--;
        }
    }
}

function formatTime(minutes, seconds) {
    return  `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = formatTime(minutes, seconds);

    if (minutes === 0 && seconds === 0) {
        clearInterval(timer);
        alert('انتهى الوقت خذ بريييك');
        // Play the sound when the time is up
        const sound = document.getElementById('time-up-sound');
        sound.play();
    } else if (!isPaused) {
        if (seconds > 0) {
            seconds--;
        } else {
            seconds = 59;
            minutes--;
        }
    }
}


function restartTimer() {
    clearInterval(timer);
    minutes = enteredTime || 15;
    seconds = 0;
    isPaused = false;
    const timerElement =
        document.getElementById('timer');
    timerElement.textContent =
        formatTime(minutes, seconds);
    const pauseResumeButton =
        document.querySelector('.control-buttons button');
    pauseResumeButton.textContent = 'وقف';
    startTimer();
}

function chooseTime() {
    const newTime = prompt('كم مدة إنجازك يا وحش؟');
    if (!isNaN(newTime) && newTime > 0) {
        enteredTime = parseInt(newTime);
        minutes = enteredTime;
        seconds = 0;
        isPaused = false;
        const timerElement =
            document.getElementById('timer');
        timerElement.textContent =
            formatTime(minutes, seconds);
        clearInterval(timer);
        const pauseResumeButton =
            document.querySelector('.control-buttons button');
        pauseResumeButton.textContent = 'وقف';
        startTimer();
    } else {
        alert('دخل رقم يخوي!'+
              ' لازم يكون أكبرمن صفر');
    }
}

startTimer();

