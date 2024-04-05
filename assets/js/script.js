// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// card containers
const todoCardsEl = document.querySelector('#todo-cards')
const inProgressCardsEl = document.querySelector('#in-progress-cards')
const doneCardsEl = document.querySelector('#done-cards')

// Todo: create a function to generate a unique task id
function generateTaskId() {
    const targetId = nextId
    nextId++
    localStorage.setItem('nextId', nextId)
    return targetId
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    const card = document.createElement('div')

    let cardBg = ''
    
    if (task.status !== 'done') {
        if (dayjs.unix(task.due).isSame(dayjs(dayjs().format("YYYY-MM-DD")))) {
            // today
            cardBg = 'text-bg-warning'
        } else if (dayjs.unix(task.due).isBefore(dayjs(dayjs().format("YYYY-MM-DD"))) ) {
            // past due
            cardBg = 'text-bg-danger'
        }
    }
    
    card.innerHTML = `
        <div class="card card-draggable m-2 ${cardBg}" data-task-id="${task.id}">
            <div class="card-header d-flex justify-content-between align-items-center">
                <span>${task.title}</span>
                <button class="btn btn-danger btn-sm" id="delete-task">Delete</button>
            </div>
            <div class="card-body">
                <p class="card-text">${task.desc}</p>
            </div>
            <p class="card-text"><small class="text-body-secondary">Due ${dayjs.unix(task.due).format('MM-DD-YYYY')}</small></p>
        </div>
    `

    return card
}

function renderTodoCards() {
    console.log('render todo cards')

    todoCardsEl.innerHTML = ''
    for (const currentEntry of Object.values(taskList)) {
        if (currentEntry.status === 'todo') {
            todoCardsEl.appendChild(createTaskCard(currentEntry))
        }
    }
}

function renderInProgressCards() {
    inProgressCardsEl.innerHTML = ''
    for (const currentEntry of Object.values(taskList)) {
        if (currentEntry.status === 'inProgress') {
            inProgressCardsEl.appendChild(createTaskCard(currentEntry))
        }
    }
}

function renderDoneCards() {
    doneCardsEl.innerHTML = ''
    for (const currentEntry of Object.values(taskList)) {
        if (currentEntry.status === 'done') {
            doneCardsEl.appendChild(createTaskCard(currentEntry))
        }
    }
}

const renderLane = {
    todo: renderTodoCards,
    inProgress: renderInProgressCards,
    done: renderDoneCards
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList(lane) {
    // refresh the local storage data
    taskList = JSON.parse(localStorage.getItem("tasks"));

    if (!taskList) return

    if (lane) {
        renderLane[lane]()
    } else {
        renderTodoCards()
        renderInProgressCards()
        renderDoneCards()
    }

    
    $('.card-draggable').draggable({
        snap: ".lane",
        snapMode: 'inner'
    })
}

function convertDatepickerToDayjs(value) {
    return dayjs(value)
}

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(taskList))
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault()

    if (!taskList) taskList = {}
    
    const taskId = generateTaskId()
    const task = {
        id: taskId,
        title: document.querySelector('#task-title-input').value,
        due: convertDatepickerToDayjs(document.querySelector('#task-duedate-input').value).unix(),
        desc: document.querySelector('#task-desc-input').value,
        status: 'todo'
    }
    
    event.srcElement.reset() // reset form values
    
    // add task to list
    taskList[taskId] = task

    // save to local storage
    saveToLocalStorage()

    renderTaskList()
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){    
    delete (taskList[event.target.dataset.taskId])
    saveToLocalStorage()
    renderTaskList()
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const droppedCardTaskId = ui.helper[0].dataset.taskId
    const droppedLaneStatus = event.target.dataset.laneStatus

    console.log(droppedLaneStatus)

    taskList[droppedCardTaskId].status = droppedLaneStatus
    saveToLocalStorage()
    renderTaskList(droppedLaneStatus)

    ui.helper[0].remove()
}

function initializeLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify({}));
    localStorage.setItem('nextId', '0');

    tasks = {}
    nextId = 0
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    if ((!taskList) || (nextId === null || nextId === undefined)) initializeLocalStorage()

    renderTaskList()

    document.querySelector("#add-task-form").addEventListener('submit', handleAddTask)
    
    for (const currentEntry of document.querySelectorAll('#delete-task')) {
        currentEntry.addEventListener('click', handleDeleteTask)
    }

    $('.lane').droppable({
        drop: handleDrop,
        hoverClass: 'drop-glow'
    })
});

