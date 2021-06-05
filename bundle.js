(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bundle = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var dates = require('./modules/handle_dates');
var ribbon = require('./modules/ribbon');
var ui = require('./modules/gen_ui');
var dayjs = require('dayjs');
var customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

//basic state
let refDay = dayjs();
let weekStart = dates.getWeekStart(refDay);
let week = dates.initWeek(weekStart);
let container = document.getElementById("ribbon-schedule");
let ribbonEvents, 
    eventsThisWeek,
    refDayEvents;
//end basic state

const initRibbon = async () => {
    let ribbonData = await ribbon.getRibbonData();

    return ribbonData;
}

const setWeekEvents = (data) => {
    eventsThisWeek = ribbon.getWeekEvents(data, week[0], week[6]);
    refDayEvents = ribbon.getRefDayEvents(data, refDay);
}

const resetEventList = () => {
    setWeekEvents(ribbonEvents);
    ui.buildEventList(refDayEvents);
}

const addListeners = () => {
    let wd_elems = document.querySelectorAll(".week_day");

    wd_elems.forEach((el) => {
        el.addEventListener('click', (e) => {
            setRefDay(e.target.id);
            resetEventList()
        })
    })
}

const initSchedule = () => {
    ui.createUI(container, week, refDay);
    dates.findRefDay(refDay);
    setWeekEvents(ribbonEvents);
    ui.buildEventList(refDayEvents);
    addListeners();
}

const resetSchedule = (w) => {
    week = dates.initWeek(w);
    
    container.innerHTML = "";
    initSchedule();
}

const backToToday = () => {
    refDay = dayjs();
    resetSchedule(dates.getWeekStart(refDay));
}

const toggleWeek = (iterator) => {
    let newWeekStart = dates.changeWeek(iterator, refDay);
    refDay = newWeekStart;
    
    resetSchedule(newWeekStart);
}

const setRefDay = (d) => {
    let new_refDay = dayjs(d, "DDMMYYYY");

    refDay = new_refDay;
    dates.findRefDay(new_refDay, 1);

    console.log("setting ref day");

    document.getElementById("selected_date").innerHTML = dayjs(d, "DDMMYYYY").format("dddd, MMMM DD, YYYY")
}

initRibbon().then((data) => {
    ribbonEvents = data;
    initSchedule();
});

module.exports = {
    toggleWeek: toggleWeek,
    backToToday: backToToday,
    setRefDay: setRefDay
}
},{"./modules/gen_ui":2,"./modules/handle_dates":3,"./modules/ribbon":4,"dayjs":5,"dayjs/plugin/customParseFormat":6}],2:[function(require,module,exports){
var dayjs = require('dayjs');

const buildDay = (d) => {
    let new_elem = document.createElement("div");
    new_elem.id = d.format("DDMMYYYY");
    new_elem.innerHTML = `<p>${d.format("dddd")}</p><p>${d.format("MMM DD")}</p>`;
    
    new_elem.classList.add("week_day");
    if( d.isBefore(dayjs().subtract(1, 'day')) ){
        new_elem.classList.add("in_past");
    }

    return new_elem;
}

const buildEventListContainer = () => {
    let elc = document.createElement('div');
    elc.classList.add("event_list_container");
    elc.id = "event_list_container";
    return elc;
}

const buildPrevButton = () => {
    let prevButton = document.createElement("div");
    prevButton.classList.add("prevButton")
    prevButton.innerHTML = `<button onClick="bundle.toggleWeek(0)"><<</button>`;

    return prevButton;
}

const buildNextButton = () => {
    let nextButton = document.createElement("div");
    nextButton.classList.add("nextButton")
    nextButton.innerHTML = `<button onClick="bundle.toggleWeek(1)">>></button>`;

    return nextButton;
}

const buildEventLineItem = (e) => {
    let lineItem = document.createElement("div");
    lineItem.classList.add('schedule_item');
    lineItem.innerHTML =   `<div class="time_dur">
                                <span class="class_time">${dayjs(e.dateTime).format("hh:mm A")}</span><br>
                                <span>${e.duration} min</span>
                            </div>
                            <div>
                                <span>${e.teacher || ""}</span>
                            </div>`;

    let signUpButton = document.createElement("div");
    signUpButton.innerHTML = `<a class="sign_up_button" href="${e.link}">Sign Up</a>`;

    if( e.image2 !== null){
        let teacherImg = document.createElement('img');
        teacherImg.src = e.image2;
        teacherImg.classList.add("teacher_img");

        lineItem.appendChild(teacherImg);
    }

    let eTitle = document.createElement("div");
    eTitle.classList.add("event_title");
    eTitle.innerHTML = `<h1>${e.title}</h1>`;

    lineItem.appendChild(eTitle)

    if(dayjs(e.dateTime).isBefore(dayjs()) == false ){
        lineItem.appendChild(signUpButton);
    }

    return lineItem;
}

const buildEventList = (ribbonEvents) => {
    let list_container = document.getElementById("event_list_container");

    list_container.innerHTML = "";

    if(ribbonEvents.length == 0){
        list_container.innerHTML = "<div><img height='100px' width='100px src='' alt='empty glass by Waiyi Fung from the Noun Project'><p>No Events Today</p></div>"
    } else {
        ribbonEvents.forEach((rEvent) => {
            list_container.appendChild(buildEventLineItem(rEvent))
        });
    }
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

    elem.appendChild(week_container);

    elem.appendChild(today_container);

    elem.appendChild(buildEventListContainer());
}

module.exports = {
    createUI: createUI,
    buildEventList: buildEventList
}
},{"dayjs":5}],3:[function(require,module,exports){
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
},{"dayjs":5,"dayjs/plugin/weekOfYear":7}],4:[function(require,module,exports){
var dayjs = require('dayjs');
var customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);


const getRibbonData = async () => {
    const ribbonRes = fetch("https://api.withribbon.com/api/v1/Events?hostId=6014&token=54ffc5cb91")
    .then(response => response.json())
    .then(data => { return data } )
    .catch((err) => console.log(err));

    return ribbonRes
}

const getRefDayEvents = (data, refDay) => {
    let todaysEvents = data.filter(event => {
        return dayjs(event.dateTime).isSame(refDay, 'day');
    });

    return todaysEvents;
}

const getWeekEvents = (data, first, last) => {
    let week_data = [];

    data.forEach((d) => {
        if(dayjs(d.dateTime).isAfter(first) && dayjs(d.dateTime).isBefore(last)){
            week_data.push(d);
        }
    });

    return week_data;
}

module.exports = {
    getRibbonData: getRibbonData,
    getWeekEvents: getWeekEvents,
    getRefDayEvents: getRefDayEvents
}
},{"dayjs":5,"dayjs/plugin/customParseFormat":6}],5:[function(require,module,exports){
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).dayjs=e()}(this,(function(){"use strict";var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",s="minute",u="hour",a="day",o="week",f="month",h="quarter",c="year",d="date",$="Invalid Date",l=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,M={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},m=function(t,e,n){var r=String(t);return!r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},g={s:m,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return(e<=0?"+":"-")+m(r,2,"0")+":"+m(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return-t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,f),s=n-i<0,u=e.clone().add(r+(s?-1:1),f);return+(-(r+(n-i)/(s?i-u:u-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:f,y:c,w:o,d:a,D:d,h:u,m:s,s:i,ms:r,Q:h}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},D="en",v={};v[D]=M;var p=function(t){return t instanceof _},S=function(t,e,n){var r;if(!t)return D;if("string"==typeof t)v[t]&&(r=t),e&&(v[t]=e,r=t);else{var i=t.name;v[i]=t,r=i}return!n&&r&&(D=r),r||!n&&D},w=function(t,e){if(p(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new _(n)},O=g;O.l=S,O.i=p,O.w=function(t,e){return w(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var _=function(){function M(t){this.$L=S(t.locale,null,!0),this.parse(t)}var m=M.prototype;return m.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(O.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match(l);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.$x=t.x||{},this.init()},m.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},m.$utils=function(){return O},m.isValid=function(){return!(this.$d.toString()===$)},m.isSame=function(t,e){var n=w(t);return this.startOf(e)<=n&&n<=this.endOf(e)},m.isAfter=function(t,e){return w(t)<this.startOf(e)},m.isBefore=function(t,e){return this.endOf(e)<w(t)},m.$g=function(t,e,n){return O.u(t)?this[e]:this.set(n,t)},m.unix=function(){return Math.floor(this.valueOf()/1e3)},m.valueOf=function(){return this.$d.getTime()},m.startOf=function(t,e){var n=this,r=!!O.u(e)||e,h=O.p(t),$=function(t,e){var i=O.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(a)},l=function(t,e){return O.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},y=this.$W,M=this.$M,m=this.$D,g="set"+(this.$u?"UTC":"");switch(h){case c:return r?$(1,0):$(31,11);case f:return r?$(1,M):$(0,M+1);case o:var D=this.$locale().weekStart||0,v=(y<D?y+7:y)-D;return $(r?m-v:m+(6-v),M);case a:case d:return l(g+"Hours",0);case u:return l(g+"Minutes",1);case s:return l(g+"Seconds",2);case i:return l(g+"Milliseconds",3);default:return this.clone()}},m.endOf=function(t){return this.startOf(t,!1)},m.$set=function(t,e){var n,o=O.p(t),h="set"+(this.$u?"UTC":""),$=(n={},n[a]=h+"Date",n[d]=h+"Date",n[f]=h+"Month",n[c]=h+"FullYear",n[u]=h+"Hours",n[s]=h+"Minutes",n[i]=h+"Seconds",n[r]=h+"Milliseconds",n)[o],l=o===a?this.$D+(e-this.$W):e;if(o===f||o===c){var y=this.clone().set(d,1);y.$d[$](l),y.init(),this.$d=y.set(d,Math.min(this.$D,y.daysInMonth())).$d}else $&&this.$d[$](l);return this.init(),this},m.set=function(t,e){return this.clone().$set(t,e)},m.get=function(t){return this[O.p(t)]()},m.add=function(r,h){var d,$=this;r=Number(r);var l=O.p(h),y=function(t){var e=w($);return O.w(e.date(e.date()+Math.round(t*r)),$)};if(l===f)return this.set(f,this.$M+r);if(l===c)return this.set(c,this.$y+r);if(l===a)return y(1);if(l===o)return y(7);var M=(d={},d[s]=e,d[u]=n,d[i]=t,d)[l]||1,m=this.$d.getTime()+r*M;return O.w(m,this)},m.subtract=function(t,e){return this.add(-1*t,e)},m.format=function(t){var e=this;if(!this.isValid())return $;var n=t||"YYYY-MM-DDTHH:mm:ssZ",r=O.z(this),i=this.$locale(),s=this.$H,u=this.$m,a=this.$M,o=i.weekdays,f=i.months,h=function(t,r,i,s){return t&&(t[r]||t(e,n))||i[r].substr(0,s)},c=function(t){return O.s(s%12||12,t,"0")},d=i.meridiem||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r},l={YY:String(this.$y).slice(-2),YYYY:this.$y,M:a+1,MM:O.s(a+1,2,"0"),MMM:h(i.monthsShort,a,f,3),MMMM:h(f,a),D:this.$D,DD:O.s(this.$D,2,"0"),d:String(this.$W),dd:h(i.weekdaysMin,this.$W,o,2),ddd:h(i.weekdaysShort,this.$W,o,3),dddd:o[this.$W],H:String(s),HH:O.s(s,2,"0"),h:c(1),hh:c(2),a:d(s,u,!0),A:d(s,u,!1),m:String(u),mm:O.s(u,2,"0"),s:String(this.$s),ss:O.s(this.$s,2,"0"),SSS:O.s(this.$ms,3,"0"),Z:r};return n.replace(y,(function(t,e){return e||l[t]||r.replace(":","")}))},m.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},m.diff=function(r,d,$){var l,y=O.p(d),M=w(r),m=(M.utcOffset()-this.utcOffset())*e,g=this-M,D=O.m(this,M);return D=(l={},l[c]=D/12,l[f]=D,l[h]=D/3,l[o]=(g-m)/6048e5,l[a]=(g-m)/864e5,l[u]=g/n,l[s]=g/e,l[i]=g/t,l)[y]||g,$?D:O.a(D)},m.daysInMonth=function(){return this.endOf(f).$D},m.$locale=function(){return v[this.$L]},m.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=S(t,e,!0);return r&&(n.$L=r),n},m.clone=function(){return O.w(this.$d,this)},m.toDate=function(){return new Date(this.valueOf())},m.toJSON=function(){return this.isValid()?this.toISOString():null},m.toISOString=function(){return this.$d.toISOString()},m.toString=function(){return this.$d.toUTCString()},M}(),b=_.prototype;return w.prototype=b,[["$ms",r],["$s",i],["$m",s],["$H",u],["$W",a],["$M",f],["$y",c],["$D",d]].forEach((function(t){b[t[1]]=function(e){return this.$g(e,t[0],t[1])}})),w.extend=function(t,e){return t.$i||(t(e,_,w),t.$i=!0),w},w.locale=S,w.isDayjs=p,w.unix=function(t){return w(1e3*t)},w.en=v[D],w.Ls=v,w.p={},w}));
},{}],6:[function(require,module,exports){
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).dayjs_plugin_customParseFormat=e()}(this,(function(){"use strict";var t={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},e=/(\[[^[]*\])|([-:/.()\s]+)|(A|a|YYYY|YY?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,n=/\d\d/,r=/\d\d?/,i=/\d*[^\s\d-_:/()]+/,o={};var s=function(t){return function(e){this[t]=+e}},a=[/[+-]\d\d:?(\d\d)?|Z/,function(t){(this.zone||(this.zone={})).offset=function(t){if(!t)return 0;if("Z"===t)return 0;var e=t.match(/([+-]|\d\d)/g),n=60*e[1]+(+e[2]||0);return 0===n?0:"+"===e[0]?-n:n}(t)}],f=function(t){var e=o[t];return e&&(e.indexOf?e:e.s.concat(e.f))},h=function(t,e){var n,r=o.meridiem;if(r){for(var i=1;i<=24;i+=1)if(t.indexOf(r(i,0,e))>-1){n=i>12;break}}else n=t===(e?"pm":"PM");return n},u={A:[i,function(t){this.afternoon=h(t,!1)}],a:[i,function(t){this.afternoon=h(t,!0)}],S:[/\d/,function(t){this.milliseconds=100*+t}],SS:[n,function(t){this.milliseconds=10*+t}],SSS:[/\d{3}/,function(t){this.milliseconds=+t}],s:[r,s("seconds")],ss:[r,s("seconds")],m:[r,s("minutes")],mm:[r,s("minutes")],H:[r,s("hours")],h:[r,s("hours")],HH:[r,s("hours")],hh:[r,s("hours")],D:[r,s("day")],DD:[n,s("day")],Do:[i,function(t){var e=o.ordinal,n=t.match(/\d+/);if(this.day=n[0],e)for(var r=1;r<=31;r+=1)e(r).replace(/\[|\]/g,"")===t&&(this.day=r)}],M:[r,s("month")],MM:[n,s("month")],MMM:[i,function(t){var e=f("months"),n=(f("monthsShort")||e.map((function(t){return t.substr(0,3)}))).indexOf(t)+1;if(n<1)throw new Error;this.month=n%12||n}],MMMM:[i,function(t){var e=f("months").indexOf(t)+1;if(e<1)throw new Error;this.month=e%12||e}],Y:[/[+-]?\d+/,s("year")],YY:[n,function(t){t=+t,this.year=t+(t>68?1900:2e3)}],YYYY:[/\d{4}/,s("year")],Z:a,ZZ:a};function d(n){var r,i;r=n,i=o&&o.formats;for(var s=(n=r.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(e,n,r){var o=r&&r.toUpperCase();return n||i[r]||t[r]||i[o].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(t,e,n){return e||n.slice(1)}))}))).match(e),a=s.length,f=0;f<a;f+=1){var h=s[f],d=u[h],c=d&&d[0],l=d&&d[1];s[f]=l?{regex:c,parser:l}:h.replace(/^\[|\]$/g,"")}return function(t){for(var e={},n=0,r=0;n<a;n+=1){var i=s[n];if("string"==typeof i)r+=i.length;else{var o=i.regex,f=i.parser,h=t.substr(r),u=o.exec(h)[0];f.call(e,u),t=t.replace(u,"")}}return function(t){var e=t.afternoon;if(void 0!==e){var n=t.hours;e?n<12&&(t.hours+=12):12===n&&(t.hours=0),delete t.afternoon}}(e),e}}return function(t,e,n){n.p.customParseFormat=!0;var r=e.prototype,i=r.parse;r.parse=function(t){var e=t.date,r=t.utc,s=t.args;this.$u=r;var a=s[1];if("string"==typeof a){var f=!0===s[2],h=!0===s[3],u=f||h,c=s[2];h&&(c=s[2]),o=this.$locale(),!f&&c&&(o=n.Ls[c]),this.$d=function(t,e,n){try{var r=d(e)(t),i=r.year,o=r.month,s=r.day,a=r.hours,f=r.minutes,h=r.seconds,u=r.milliseconds,c=r.zone,l=new Date,m=s||(i||o?1:l.getDate()),M=i||l.getFullYear(),Y=0;i&&!o||(Y=o>0?o-1:l.getMonth());var v=a||0,p=f||0,D=h||0,g=u||0;return c?new Date(Date.UTC(M,Y,m,v,p,D,g+60*c.offset*1e3)):n?new Date(Date.UTC(M,Y,m,v,p,D,g)):new Date(M,Y,m,v,p,D,g)}catch(t){return new Date("")}}(e,a,r),this.init(),c&&!0!==c&&(this.$L=this.locale(c).$L),u&&e!==this.format(a)&&(this.$d=new Date("")),o={}}else if(a instanceof Array)for(var l=a.length,m=1;m<=l;m+=1){s[1]=a[m-1];var M=n.apply(this,s);if(M.isValid()){this.$d=M.$d,this.$L=M.$L,this.init();break}m===l&&(this.$d=new Date(""))}else i.call(this,t)}}}));
},{}],7:[function(require,module,exports){
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).dayjs_plugin_weekOfYear=t()}(this,(function(){"use strict";var e="week",t="year";return function(i,n,r){var f=n.prototype;f.week=function(i){if(void 0===i&&(i=null),null!==i)return this.add(7*(i-this.week()),"day");var n=this.$locale().yearStart||1;if(11===this.month()&&this.date()>25){var f=r(this).startOf(t).add(1,t).date(n),s=r(this).endOf(e);if(f.isBefore(s))return 1}var a=r(this).startOf(t).date(n).startOf(e).subtract(1,"millisecond"),o=this.diff(a,e,!0);return o<0?r(this).startOf("week").week():Math.ceil(o)},f.weeks=function(e){return void 0===e&&(e=null),this.week(e)}}}));
},{}]},{},[1])(1)
});
