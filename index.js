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
var myHero=document.getElementById('hero');
const clearBtn = document.querySelector('.clear');
var checkSound=document.querySelector("#checkSound");
var checkSoundFlag=true;
var isTimerOn=false;
var hero2=true;




// Modal for prompt 1
const modalOverlay = document.getElementById('modalOverlay');
const promptModal = document.getElementById('promptModal');
const promptMessage = document.getElementById('promptMessage');
const promptInput = document.getElementById('promptInput');
const promptOkBtn = document.getElementById('promptOkBtn');
const promptCancelBtn = document.getElementById('promptCancelBtn');
// Modal for prompt 2
const modalOverlayForBreak = document.getElementById('modalOverlayForBreak');
const promptModalForBreak = document.getElementById('promptModalForBreak');
const promptMessageForBreak = document.getElementById('promptMessageForBreak');
const promptInputForBreak = document.getElementById('promptInputForBreak');
const promptOkBtnForBreak = document.getElementById('promptOkBtnForBreak');
const promptCancelBtnForBreak = document.getElementById('promptCancelBtnForBreak');

// Modal for prompt 2
const modalOverlayForAdjusment = document.getElementById('modalOverlayForAdjusment');
const promptModalForAdjusment = document.getElementById('promptModalForAdjusment');
const promptMessageForAdjusment = document.getElementById('promptMessageForAdjusment');
const promptInputForAdjusment = document.getElementById('promptInputForAdjusment');
const promptOkBtnForAdjusment = document.getElementById('promptOkBtnForAdjusment');
const promptCancelBtnForAdjusment = document.getElementById('promptCancelBtnForAdjusment');

//modal for alert :

const modalAlert = document.getElementById("customModal"); // The modal overlay
const modalMessageAlert = document.getElementById("customModalMessage"); // The modal message
const modalOkBtnAlert = document.getElementById("customModalOkBtn"); // OK button
const modalCancelBtnAlert = document.getElementById("customModalCancelBtn"); // Cancel button

// this is the golden clear key
modalOkBtnAlert.onclick = function() {
    modalAlert.style.display = 'none';
};

//
// document.addEventListener("click", function (event) {
//     modalAlert.style.display = 'none';;
// }); 
// may you need to add طبقه شفافه اذا ضغطت في اي مكان عليها تختفي الطبقه السوداء ويختفي الاليرت



let startTime; // الطابع الزمني عند بدء المؤقت
let targetTime; // وقت انتهاء العد التنازلي 






function updateTaskList() {
    const taskListElement = document.getElementById('taskList');
    taskListElement.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const taskTime = convertToMinutes(task.timeSpent);
        const taskClass = task.completed ? 'completed-task' : '';
        const li = document.createElement('li');
        li.style.position = 'relative';
        
        li.innerHTML = `
            <div class="progress-overlay"></div>
            <span class="task-name ${taskClass}" onclick="markTaskComplete(${index})" style="cursor: pointer;">${task.name}</span>
            <span class="task-time" onclick="adjustTaskTime(${index})" style="cursor: pointer;">${taskTime}</span>
            <div class="priority-buttons">
                <button class="priority-btn" onclick="setPriority(${index}, 'urgent-important')">عاجل ومهم</button>
                <button class="priority-btn" onclick="setPriority(${index}, 'urgent-not-important')">عاجل وغير مهم</button>
                <button class="priority-btn" onclick="setPriority(${index}, 'not-urgent-important')">غير عاجل ومهم</button>
                <button class="priority-btn" onclick="setPriority(${index}, 'not-urgent-not-important')">غير عاجل وغير مهم</button>
            </div>
            <button class="start-btn" data-index="${index}" onclick="startTask(${index})">بدأ</button>
            <button class="delete-btn" onclick="deleteTask(${index})">حذف</button>
        `;
        
        taskListElement.appendChild(li);
        var startButtons=document.getElementsByClassName("start-btnS");
                //Apply the saved priority text if exists
        if (task.priority) {
            let prioritySpan = getPrioritySpan(task.priority);
            

            if(isTimerOn==true){
                
                for(let i=0;startButtons.length>i;i++){
                    startButtons[i].disabled=true;
                    
                }
                
            }
            
            li.innerHTML = `
            <div class="progress-overlay"></div>
           <span class="task-name ${taskClass}" onclick="markTaskComplete(${index})" style="cursor: pointer;">${task.name}</span> 
            <span class="task-time" onclick="adjustTaskTime(${index})" style="cursor: pointer;">${taskTime}</span>
            ${prioritySpan} 
                ${!task.completed ? `  <button class="start-btnS" data-index="${index}" onclick="startTask(${index})">بدأ</button>` : ''}

                <button class="delete-btnS" onclick="deleteTask(${index})">حذف</button>
                
                
            `;

        }  

        if(tasks!=null){
            clearBtn.style.display="block"
        }
       
        // اذا ماحدد الاولويه مايقدر يبدأ 
        var startButtonsBig=document.getElementsByClassName("start-btn");
            for(let i=0;startButtonsBig.length>i;i++){
                startButtonsBig[i].disabled=true;
                
            }

            if(isTimerOn==true){
                
                for(let i=0;startButtons.length>i;i++){
                    startButtons[i].disabled=true;
                    
                }
                
            }
            
        
        
       
        
    });

   
}

function addTask() {
    
    const taskInput = document.getElementById('taskInput');
    const taskName = taskInput.value.trim();
    if (taskName) {
        const newTask = {
            name: taskName,
            timeSpent: 0,
            completed: false
        };
        tasks.push(newTask);
        taskInput.value = '';
        saveTasksToLocalStorage();
        clearBtn.style.display="block";
        if(isTimerOn==true){
            updateProgressOverlay();
        }
        updateTaskList();
        
        
    } else {
        
        modalMessageAlert.textContent = 'يرجى إدخال اسم المهمة';
        modalCancelBtnAlert.style.display = 'none';
        if(modalCancelBtnAlert.style.display === 'none'){
            modalOkBtnAlert.style.width = '50%';
            modalOkBtnAlert.style.margin = '0 auto';   
        }
        modalAlert.style.display = 'block';

    }
}


document.getElementById('taskInput').addEventListener('keypress', function (event) {
    // تحقق إذا كان المفتاح المضغوط هو Enter (رمز المفتاح 13)
    if (event.key === 'Enter') {
        addTask(); // استدعاء دالة إضافة المهمة
    }
});






// function markTaskComplete(index) {
    
//     tasks[index].completed = !tasks[index].completed; // تبديل حالة الإكمال
   
//     saveTasksToLocalStorage(); // حفظ المهام في التخزين المحلي
//     updateTaskList(); // إعادة تحديث قائمة المهام
//     if (index === currentTaskId) {
//     //     // إنهاء المهمة
    
//         defaultState();
//         isTimerOn=false
//         pauseResumeButton.style.display="none";
//         pauseResumeButton.textContent="إبدأ";
    
//     }

//     if(checkSoundFlag===true && tasks[index].completed){

//         checkSound.play();
//         checkSoundFlag=false;
  
//     }
//     else{
        
//         checkSoundFlag=true;
        
        
//     }
    
// }
function markTaskComplete(index) {
    tasks[index].completed = !tasks[index].completed;

        if(checkSoundFlag===true && tasks[index].completed){

        checkSound.play();
        checkSoundFlag=false;
  
    }
    else{
        
        checkSoundFlag=true;
        
        
    }

    if (index === currentTaskId && tasks[index].completed) {
        addTimeToTask(); // إنهاء المهمة
        defaultState(); // إعادة تعيين الحالة
        isTimerOn = false;
        pauseResumeButton.style.display = "none";
        currentTaskId = null;

        // تحديث زر المهمة الحالية
        const startBtn = document.querySelector(`.start-btnS[data-index="${index}"]`);
        if (startBtn) {
            startBtn.textContent = "بدأ";
            startBtn.style.backgroundColor = "darkgreen";
        }
    }

    // إعادة تمكين الأزرار
    document.querySelectorAll(".start-btnS").forEach((btn) => {
        btn.disabled = false;
    });

    saveTasksToLocalStorage(); // حفظ التعديلات
    updateTaskList(); // تحديث الواجهة
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

function getPrioritySpan(priorityClass) {
    switch (priorityClass) {
      case 'urgent-important':
        return `<span class="priority-text urgent-important">عاجل ومهم</span>`;
      case 'urgent-not-important':
        return `<span class="priority-text urgent-not-important">عاجل وغير مهم</span>`;
      case 'not-urgent-important':
        return `<span class="priority-text not-urgent-important">غير عاجل ومهم</span>`;
      case 'not-urgent-not-important':
        return `<span class="priority-text not-urgent-not-important">غير عاجل وغير مهم</span>`;
      default:
        return '';
    }
  }
  


function setPriority(index, priorityClass) {
    const task = tasks[index];
    task.priority = priorityClass;
    saveTasksToLocalStorage();
    updateTaskList();

    if(isTimerOn==true){
        updateProgressOverlay();
    }
}

function convertToMinutes(timeInMinutes) {
    return `${timeInMinutes} دقيقة`;
}

function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}



function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasksToLocalStorage();
    updateTaskList();
    if(isTimerOn==true){
        updateProgressOverlay();
    }
    if(tasks.length==0){
        clearBtn.style.display="none"
    }
}

// function clearTasks(){
//     clearBtn.style.display="none";
//     isTimerOn=false
//         pauseResumeButton.style.display="none";
//         pauseResumeButton.textContent="إبدأ";
//     localStorage.clear();
//     tasks=[];
    
//         updateTaskList();
//         defaultState();
       
//         // if you put resetoverlay here you cooked
    
// }
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


function startTask(index) {
    currentTaskId = index;
    const task = tasks[currentTaskId];

    // عرض نافذة إدخال الوقت
    promptMessage.textContent = `كم مدة إنجازك في المهمة "${task.name}" بالدقائق؟`;
    modalOverlay.style.display = 'flex';
    promptModal.style.display = 'block';
    promptInput.focus();

    function handleOk() {
        const newTimeInMinutes = parseInt(promptInput.value);
        if (!isNaN(newTimeInMinutes) && newTimeInMinutes >= 1) {
            modalOverlay.style.display = 'none';
            promptModal.style.display = 'none';
            enteredTime = newTimeInMinutes;
            minutes = newTimeInMinutes;
            seconds = 0;
            isPaused = false;
            elapsedTimeInSeconds = 0;
            clearInterval(timer);
            startTimer();
            isTimerOn = true;
                            pauseResumeButton.textContent="وقف";
                pauseResumeButton.style.display="block";
                pauseResumeButton.classList.remove("continue");
                pauseResumeButton.classList.add("paused");
                promptInput.value = '';

            // تعطيل جميع الأزرار الأخرى
            document.querySelectorAll(".start-btnS").forEach((btn) => {
                if (btn.dataset.index !== String(index)) btn.disabled = true; // تعطيل الأزرار الأخرى
            });

            // تحديث زر المهمة الحالية بناءً على data-index
            // const startBtn = document.querySelector(`.start-btnS[data-index="${index}"]`);
            // if (startBtn) {
            //     startBtn.textContent = "تم الإنجاز...";
            //     startBtn.style.backgroundColor = "darkgreen";
            // }
        } else {
            promptMessage.textContent = "لازم دقيقة واحدة على الأقل";
        }
    }

    // إضافة الحدث عند النقر على زر موافق
    promptOkBtn.onclick = handleOk;
              promptInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
               
                handleOk();
            }
          });

    // عند النقر على إلغاء
    promptCancelBtn.onclick = function () {
        modalOverlay.style.display = 'none';
        promptModal.style.display = 'none';
        promptInput.value = '';
    };
}





// function startTask(index) {
//     var startBtn=document.querySelector(".start-btnS");
//     var startButtons=document.getElementsByClassName("start-btnS");
    
    
//     currentTaskId = index;
//     const task = tasks[currentTaskId];
    

    
       
//            // Set prompt message and default input value
//            promptMessage.textContent = `كم مدة إنجازك في المهمة "${task.name}" بالدقائق؟`;
           
       
//            // Show the prompt modal
//            modalOverlay.style.display = 'flex';
//            promptModal.style.display = 'block';
//            promptInput.focus();


//            function handleOk() {
//             // the code that should run on OK
//             const newTimeInMinutes = promptInput.value;
            
        
//             if (!isNaN(newTimeInMinutes) && newTimeInMinutes >= 1) {
//                 modalOverlay.style.display = 'none';
//                 promptModal.style.display = 'none';
                
//                 modalOverlay.style.display = 'none';
//                 promptModal.style.display = 'none';
//                 enteredTime = parseInt(newTimeInMinutes);
//                 minutes = enteredTime;
//                 seconds = 0;
//                 isPaused = false;
//                 elapsedTimeInSeconds = 0;
//                 clearInterval(timer);
//                 startTimer();
//                 isTimerOn=true;
//                 // for each here :

//                 for(let i=0;startButtons.length>i;i++){
//                     startButtons[i].disabled=true;
                    
//                 }


//                 // startButtons.disabled=true;
                
                
//                 breakGif1.style.display="none";
//                 breakGif2.style.display="none";
//                 pauseResumeButton.textContent="وقف";
//                 pauseResumeButton.style.display="block";
//                 pauseResumeButton.classList.remove("continue");
//                 pauseResumeButton.classList.add("paused");
//                 promptInput.value = '';
//                 ////////////////////////////// here bro change the text of بدأ to يتم الإنجاز..
                
                
//                 startBtn.textContent="يتم الإنجاز..."
                


//             } else {
//                 promptMessage.textContent = "لازم دقيقة واحدة على الأقل";
//             }
//           }
          
//         //   promptOkBtn.addEventListener('click', handleOk);
//         promptOkBtn.addEventListener("click", function (event) {
//          modalAlert.style.display = 'none';;
//          });
//           promptInput.addEventListener('keypress', function(event) {
//             if (event.key === 'Enter') {
               
//                 handleOk();
//             }
//           });
          
           

//                 // When Cancel is clicked
//            promptCancelBtn.onclick = function() {
//             modalOverlay.style.display = 'none';
//             promptModal.style.display = 'none';
//             promptInput.value = '';
//             defaultState();
            
//         };



//            }


function startBreak() {
    var startBtn=document.querySelector(".start-btnS");
    var startButtons=document.getElementsByClassName("start-btnS");
    
    
    myHero.play();
      
    breakFlag=true;

           
            
           promptMessageForBreak.textContent = "حدد وقت البريك بالدقائق";
           modalOverlayForBreak.style.display = 'flex';
           promptModalForBreak.style.display = 'block';
           promptInputForBreak.focus();
           promptInputForBreak.value = '';

          
           
            
           function handleOk2() {
            let breakTime = promptInputForBreak.value;
            
            // the code that should run on OK
            
            
                if (!isNaN(breakTime) && breakTime >= 1) {
                

                modalOverlayForBreak.style.display = 'none';
                promptModalForBreak.style.display = 'none';
                
                // modalOverlayForBreak.style.display = 'none';
                // promptModalForBreak.style.display = 'none';
                
                enteredTime = parseInt(breakTime);
                minutes = enteredTime;
                seconds = 0;
                clearInterval(timer);
                startTimer();
                isTimerOn=true;
                for(let i=0;startButtons.length>i;i++){
                    startButtons[i].disabled=true;
                    
                }
                
                
                pauseResumeButton.textContent="وقف";
                pauseResumeButton.style.display="block";
                pauseResumeButton.classList.remove("continue");
                pauseResumeButton.classList.add("paused");
                promptInputForBreak.value = '';
                // startBtn.textContent="بريييك"
                // startBtn.style.backgroundColor="darkgoldenrod";
                }
            
                  else {
                promptMessageForBreak.textContent = "لازم دقيقة واحدة على الأقل";
                

            }
          
        }   
        
          promptOkBtnForBreak.addEventListener('click', handleOk2);
          promptInputForBreak.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                
              handleOk2();
              breakGif1.style.display="block";
              breakGif2.style.display="block";
            }
          }); 
        
         
          
               
           
           // When Cancel is clicked
           promptCancelBtnForBreak.onclick = function() {
               modalOverlayForBreak.style.display = 'none';
               promptModalForBreak.style.display = 'none';
               promptInputForBreak.value = '';

               for(let i=0;startButtons.length>i;i++){
                startButtons[i].disabled = false;
                
            }

               
               defaultState();
               
           };

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
    updateProgressOverlay(); // استدعاء الدالة لتحديث لون التراكب وحجمه كل ثانية

    // طباعة لمساعدتك
    
}



function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = formatTime(minutes, seconds);
}

function updateProgressOverlay() {
    const startBtn = document.querySelector(`.start-btnS[data-index="${currentTaskId}"]`);
    // الشرط الأول: لازم نعرف أي مهمة قيد العمل (currentTaskId).
    if (currentTaskId !== null) {
        // نأتي بكل عناصر li في قائمة المهام
        const taskListElement = document.getElementById('taskList');
        const lis = taskListElement.getElementsByTagName('li');

        // نحدّد العنصر li المطابق لـ currentTaskId
        const currentLi = lis[currentTaskId];
        if (!currentLi) return;

        // نأتي بالـ overlay عن طريق querySelector
        const overlay = currentLi.querySelector('.progress-overlay');
        if (!overlay) return;

        // حساب نسبة التقدم
        let totalSeconds = enteredTime * 60;
        let progressPercentage = (elapsedTimeInSeconds / totalSeconds) * 100;
        if (progressPercentage > 100) progressPercentage = 100; // احتياطاً

        // حدّد عرض العنصر overlay
        overlay.style.width = progressPercentage + '%';

        // حدّد لونه حسب ما إذا كنا في بريك أم لا
        if (breakFlag) {
            // بريك
            overlay.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
        } else {
            // مهمة
            overlay.style.backgroundColor = 'rgba(0, 128, 0, 0.2)';
        }
        if(hero2==true){
            if(breakFlag==false){
                startBtn.textContent="يتم الإنجاز..."
            }
            else{
                startBtn.textContent="بريييك"
                startBtn.style.backgroundColor="darkgoldenrod"
            }
        }
        
        

    }
}

function resetOverlay() {
    if (currentTaskId !== null) {
        const taskListElement = document.getElementById('taskList');
        const lis = taskListElement.getElementsByTagName('li');
        const currentLi = lis[currentTaskId];
        if (!currentLi) return;

        const overlay = currentLi.querySelector('.progress-overlay');
        if (overlay) {
            overlay.style.width = '0%';
        }
    }
}

function handleTimerEnd() {
    if (breakFlag === false) {  // هذي الحاله لما ينتهي وقت المهمه الي حطيته
        addTimeToTask();
        helperFlag = false; // صار فولس
        togglePauseResume();
        
        startBreak();
        isTimerOn=false;
        
        
    } else {
        var startBtn=document.querySelector(".start-btnS");
        var startButtons=document.getElementsByClassName("start-btnS");
        
        
        togglePauseResume();
        breakFlag = false;
        helperFlag = true;
        breakGif1.style.display = "none";
        breakGif2.style.display = "none";
        myHero.play();
        resetOverlay();
        isTimerOn=false;
        for(let i=0;startButtons.length>i;i++){
            startButtons[i].disabled = false;
            
        }
        
        startBtn.textContent="بدأ";
        startBtn.style.backgroundColor="darkgreen";
    }
}

function formatTime(minutes, seconds) {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function togglePauseResume() {
        

    if (pauseResumeButton.textContent == 'إبدأ'&& (minutes===0 && seconds===0) && helperFlag===true) {
        
        modalMessageAlert.textContent = "إبدأ مهمة كي تحدد الوقت وتبدأ الإنجاز!";
      
        modalAlert.style.display = 'block';
       
        modalCancelBtnAlert.style.display = 'none';
        if(modalCancelBtnAlert.style.display === 'none'){
            
            modalOkBtnAlert.style.width = '50%';
            modalOkBtnAlert.style.margin = '0 auto'; 
        }
        
       

        
    } 

    else if(pauseResumeButton.textContent == 'وقف'&& (minutes==0 && seconds===0)){
            pauseResumeButton.style.display="none";
            pauseResumeButton.textContent = 'إبدأ';
            pauseResumeButton.classList.remove("paused");
            pauseResumeButton.classList.add("continue");
            
    }

    else if(pauseResumeButton.textContent == 'إستمر'){
        startTimer();
        pauseResumeButton.textContent = 'وقف';
        pauseResumeButton.classList.remove("continue");
        pauseResumeButton.classList.add("paused");
         removeFinishButton();
       
    }

     else {
        
        clearInterval(timer);
            pauseResumeButton.textContent = 'إستمر';
            pauseResumeButton.classList.add("continue");
          addFinishButton();
        
     }

}

function addFinishButton() {
    
    var startBtn=document.querySelector(".start-btnS");
    var startButtons=document.getElementsByClassName("start-btnS");
    const existingFinishButton = document.querySelector('.finish-button');
    if (!existingFinishButton) {
        const finishButton = document.createElement('button');
        finishButton.textContent = 'إنهاء';
        finishButton.classList.add('finish-button');
        finishButton.onclick = () => {
            if(breakFlag===false){
                addTimeToTask();
                isTimerOn=false
                pauseResumeButton.style.display="none";
                pauseResumeButton.textContent="إبدأ";
                resetOverlay();
                startBtn.textContent="بدأ";
                startButtons.disabled = false;
                for(let i=0;startButtons.length>i;i++){
                    startButtons[i].disabled=false;
                    startButtons[i].textContent="بدأ";
                    
                }
            }
            else{
                defaultState();
                isTimerOn=false
                pauseResumeButton.style.display="none";
                pauseResumeButton.textContent="إبدأ";
                // if you put resetoverlay here you cooked
            }
            
        };
        document.querySelector('.timer-container').appendChild(finishButton);
    }
}

function defaultState() {
    removeFinishButton();
    clearInterval(timer);
    minutes = 0;
    seconds = 0;
    const timerElement = document.getElementById('timer');
    timerElement.textContent = formatTime(minutes, seconds);
    breakGif1.style.display = "none";
    breakGif2.style.display = "none";
    breakFlag = false;
    helperFlag = true;
    resetOverlay();
    currentTaskId = null;

    // Reset all start buttons
    document.querySelectorAll(".start-btnS").forEach(btn => {
        btn.textContent = "بدأ";
        btn.style.backgroundColor = "darkgreen";
        btn.disabled = false;
    });
}


// function defaultState(){
//     var startBtn=document.querySelector(".start-btnS");
//     var startButtons=document.getElementsByClassName("start-btnS");
//         removeFinishButton();
//         clearInterval(timer);
//         minutes=0;
//         seconds=0;
//         const timerElement = document.getElementById('timer');
//         timerElement.textContent = formatTime(minutes, seconds);
//         breakGif1.style.display="none";
//         breakGif2.style.display="none";
//         breakFlag=false;
//         helperFlag=true; // عشان اذا ضغطت ابدا فالبدايه مايستهبل
//         resetOverlay();
//         // startBtn.style.disabled="none";
//         if(hero2=true){
//             startBtn.textContent="بدأ";
//         startBtn.style.backgroundColor="darkgreen";
//         }
        
//         for(let i=0;startButtons.length>i;i++){
//             startButtons[i].disabled=false;
            
//         }
// }

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
        updateProgressOverlay();
        // إعادة تعيين المؤقت والقيم
        elapsedTimeInSeconds = 0;
        removeFinishButton();
        clearInterval(timer);
        minutes = 0;
        seconds = 0;

        // تحديث واجهة المستخدم
        const timerElement = document.getElementById('timer');
        timerElement.textContent = formatTime(minutes, seconds);
       
        
    } else if (elapsedTimeInSeconds < 60) {
       
        // modalMessageAlert.textContent = "الوقت المنقضي أقل من دقيقة! لذلك لن يتم إضافة الوقت.";
        // modalAlert.style.display = 'block';
       
        // modalCancelBtnAlert.style.display = 'none';
        // if(modalCancelBtnAlert.style.display === 'none'){
        //     modalOkBtnAlert.style.width = '50%';
        //     modalOkBtnAlert.style.margin = '0 auto'; 
        // }
        removeFinishButton();
        clearInterval(timer);
        minutes = 0;
        seconds = 0;

        // إعادة تعيين المؤقت
        const timerElement = document.getElementById('timer');
        timerElement.textContent = formatTime(minutes, seconds);
    }
}


function adjustTaskTime(index) {
    
    const task = tasks[index];

    // const adjustment = prompt(`الوقت الحالي: ${task.timeSpent} دقيقة\n مثال : اكتب +10 لإضافة 10 دقائق أو -10 لإنقاص 10 دقائق:`);
     // Set prompt message and default input value
     let adjustment="";
     promptMessageForAdjusment.textContent = `الوقت الحالي: ${task.timeSpent} دقيقة\n مثال : اكتب +10 لإضافة 10 دقائق أو -10 لإنقاص 10 دقائق:`;
           
       
     // Show the prompt modal
     modalOverlayForAdjusment.style.display = 'flex';
     promptModalForAdjusment.style.display = 'block';
     
     promptInputForAdjusment.focus();

    promptOkBtnForAdjusment.onclick = function() {
        handleOK3();
    }
    promptInputForAdjusment.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            
            handleOK3();
        }
        });

    function handleOK3(){
        adjustment= promptInputForAdjusment.value;
        
            const adjustmentValue = parseInt(adjustment); // تحويل المدخل إلى رقم
            if (!isNaN(adjustmentValue)) {
                // تعديل الوقت بناءً على المدخل
                const newTime = task.timeSpent + adjustmentValue;
                if (newTime >= 0) {
                    task.timeSpent = newTime;
                    saveTasksToLocalStorage(); // حفظ التعديلات
                    updateTaskList(); // تحديث واجهة المستخدم
                    updateProgressOverlay();
                    promptMessageForAdjusment.textContent = `تم تعديل الوقت إلى ${task.timeSpent} دقيقة.`; // convert it to alert
                    modalOverlayForAdjusment.style.display = 'none';
                    promptInputForAdjusment.value = '';
                    
                } else {
                    promptMessageForAdjusment.textContent = 'لا يمكن أن يكون الوقت أقل من صفر.';
                    
                }
            } else {
                promptMessageForAdjusment.textContent = 'الرجاء إدخال قيمة صحيحة (مثل +10 أو -10).';
                
            }

    }
    promptCancelBtnForAdjusment.onclick = function() {
        modalOverlayForAdjusment.style.display = 'none';
        promptModalForAdjusment.style.display = 'none';
        promptInputForAdjusment.value = '';
    }

    
}

function startTimer() {
    startTime = Date.now();
    targetTime = startTime + (minutes * 60 + seconds) * 1000; // وقت الانتهاء بناءً على مدة المؤقت
    timer = setInterval(updateTimer, 1000); // تحديث كل ثانية
}









updateTaskList(); // تحديث قائمة المهام عند تحميل الصفحة





