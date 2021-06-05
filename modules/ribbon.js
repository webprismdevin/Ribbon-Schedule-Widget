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