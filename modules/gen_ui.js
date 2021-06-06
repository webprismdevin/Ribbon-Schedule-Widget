var dayjs = require('dayjs');
const List = require('list.js');
var ribbon = require('./ribbon');

const buildDay = (d) => {
    let new_elem = document.createElement("div");
    new_elem.id = d.format("DDMMYYYY");
    new_elem.innerHTML = `<p class="day_of_week">${d.format("ddd").toUpperCase()}</p><p class="short_date">${d.format("MMM D")}</p>`;
    
    new_elem.classList.add("week_day");
    if( d.isBefore(dayjs().subtract(1, 'day')) ){
        new_elem.classList.add("in_past");
    }

    return new_elem;
}

const buildEventListContainer = () => {
    let elc = document.createElement('div');
    elc.innerHTML = "<ul class='list' id='inner_list'></ul>"
    elc.classList.add("event_list_container");
    elc.id = "event_list_container";
    return elc;
}

const buildPrevButton = () => {
    let prevButton = document.createElement("div");
    prevButton.classList.add("prevButton")
    prevButton.innerHTML = `<button onClick="bundle.toggleWeek(0)">←</button>`;

    return prevButton;
}

const buildNextButton = () => {
    let nextButton = document.createElement("div");
    nextButton.classList.add("nextButton")
    nextButton.innerHTML = `<button onClick="bundle.toggleWeek(1)">→</button>`;

    return nextButton;
}

const buildEventLineItem = (e) => {

    let live_or_location;

    if(e.online === false){
        live_or_location = e.location;
    } else live_or_location = "Livestream"

    let lineItem = document.createElement("li");
    lineItem.setAttribute("data-id", dayjs(e.dateTime).format("DDMMYYYY"));
    lineItem.setAttribute("data-online", e.online == true ? "livestream" : "in-person");
    lineItem.classList.add('schedule_item');
    lineItem.innerHTML =   `<div class="time_dur">
                                <span class="class_time">${dayjs(e.dateTime).format("hh:mm A")}</span><br>
                                <span class="class_duration">${e.duration} min</span>
                            </div>
                            <div class="class_location_container">
                                <span class="class_location">${live_or_location}</span>
                            </div>`;

    let signUpButton = document.createElement("div");
    signUpButton.innerHTML = `<a class="sign_up_button" href="${e.link}">Sign Up</a>`;

    if( e.image2 !== null){
        let teacherImg = document.createElement('div');
        teacherImg.style.backgroundImage = `url(${encodeURI(e.image2)})`;
        teacherImg.style.backgroundSize = 'cover';
        teacherImg.classList.add("teacher_img");

        lineItem.appendChild(teacherImg);
    }

    let eTitle = document.createElement("div");
    eTitle.classList.add("event_title");
    eTitle.innerHTML = `<span>${e.title}</span><br><span class="teacher_name">${e.teacher || "No Teacher"}</span>`;

    lineItem.appendChild(eTitle)

    if(dayjs(e.dateTime).isBefore(dayjs()) == false ){
        lineItem.appendChild(signUpButton);
    }

    return lineItem;
}

const returnEmptyMessage = () => {
    return `<div class="no_events"><img height='100px' width='100px' src="https://cdn.jsdelivr.net/gh/WebPrismCo/Ribbon-Schedule-Widget@latest/assets/noun_empty_glass_1245571.png" alt='empty glass by Waiyi Fung from the Noun Project'><p>No Events Today</p></div>`
}

const buildEventList = (ribbonEvents) => {
    let list_container = document.getElementById("inner_list");

    list_container.innerHTML = "";

    if(ribbonEvents.length == 0){
        list_container.innerHTML = returnEmptyMessage();
    } else {
        ribbonEvents.forEach((rEvent) => {
            list_container.appendChild(buildEventLineItem(rEvent))
        });
    }

    buildDropdowns(ribbon.getUniqueTeachers(ribbonEvents), ribbonEvents.length);
}


const createUI = (elem, week, refDay) => {
    let week_container = document.createElement("div");
    week_container.id = "week_container";

    week_container.appendChild(buildPrevButton());

    week.forEach((day) => {
        let elem = buildDay(day);

        week_container.appendChild(elem);
    });

    week_container.appendChild(buildNextButton());
    
    let today_container = document.createElement("div");
    today_container.classList.add('today_container');
    today_container.innerHTML = `<span id="selected_date">${refDay.format("dddd, MMMM D, YYYY")}</span><button onClick='bundle.backToToday()'>Today</button>`;

    let filter_container = document.createElement("div");
    filter_container.id = "filter_container";
    filter_container.classList.add("filter_container");


    elem.appendChild(week_container);

    elem.appendChild(today_container);

    elem.appendChild(filter_container);

    elem.appendChild(buildEventListContainer());

}

const buildTeacherDropdown = (t) => {
    let genSelect = document.createElement("select");
    genSelect.classList.add("list_filter");

    let selectAll = document.createElement("option");

    selectAll.value = "";
    selectAll.innerHTML = "All";

    genSelect.appendChild(selectAll);

    t.forEach((name) => {
        let genOption = document.createElement("option");

        genOption.value = name;
        genOption.innerHTML = name;

        genSelect.appendChild(genOption);
    })

    switch (t.length) {
        case 0:
            return undefined
        default:
            return genSelect
    }
}


const buildLocationDropdown = () => {
    let genSelect = document.createElement("select");
    genSelect.classList.add("list_filter");

    genSelect.innerHTML =  `<option value="">All</option><option value="in-person">In Person</option><option value="livestream">Livestream</option>`;

    return genSelect;
}

const buildDropdowns = (teachers, length) => {
    let filter_container = document.getElementById("filter_container");

    if(filter_container.innerHTML !== ""){
        filter_container.innerHTML = ""
    }

    if(length > 0){
        let teachDrop = buildTeacherDropdown(teachers);

        if(teachDrop !== undefined){
            filter_container.appendChild(teachDrop);
        }
    
        let locDrop = buildLocationDropdown();
    
        filter_container.appendChild(locDrop);
    }
}

module.exports = {
    createUI: createUI,
    buildEventList: buildEventList,
    buildDropdowns: buildDropdowns,
    returnEmptyMessage: returnEmptyMessage
}