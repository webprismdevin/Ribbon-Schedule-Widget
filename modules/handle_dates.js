var dayjs = require('dayjs');

//extend w/ WOY plugin
var weekOfYear = require('dayjs/plugin/weekOfYear');
dayjs.extend(weekOfYear);

const getWeekStart = (day) => {

    let dayOfWeek = day.day();

    switch (dayOfWeek) {
        case 0:
            return day;
        default:
            return day.subtract(dayOfWeek, 'day');
    }
}

const initWeek = (weekStart) => {
    let thisWeek = [];

    for(var i = 0; i <= 6; i++) {
        if(i == 0){
            thisWeek.push(weekStart);
        } else if(i > 0){
            thisWeek.push(dayjs(weekStart).add(i, 'day'));
        }
    }

    return thisWeek;
} 

const changeWeek = (iterator, day) => {
    let weekStart = getWeekStart(day);

    switch(iterator){
        case 0:
            return dayjs(weekStart).subtract(7, 'day');
        case 1:
            return dayjs(weekStart).add(7, 'day');
    }
}

const findRefDay = (d, o) => {

    let removeOldRefFlag = undefined || o;

    if(removeOldRefFlag !== undefined){
        let old_ref = document.querySelectorAll('.selected_day');
        old_ref[0].classList.remove('selected_day');

        let selectedDay = document.getElementById(d.format("DDMMYYYY"));
        selectedDay.classList.add('selected_day');
    } else {
        let selectedDay = document.getElementById(d.format("DDMMYYYY"));
        selectedDay.classList.add('selected_day');
    }
    

}

module.exports = {
    changeWeek: changeWeek,
    initWeek: initWeek,
    getWeekStart: getWeekStart,
    findRefDay: findRefDay
}