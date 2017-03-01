/**
 * [seconds2time description]
 * @param  {[type]} seconds [description]
 * @return {[type]}         [description]
 */
function seconds2time(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds - (hours * 3600)) / 60);
    seconds = (seconds - (hours * 3600) - (minutes * 60));
    seconds = Math.round(seconds * 100) / 100;
    var time = "";

    hours = (hours < 10) ? "0" + hours : String(hours);
    time = hours + ":";

    minutes = (minutes < 10 && time !== "") ? "0" + minutes : String(minutes);
    time += minutes + ":";

    if (time === "") {
        time = seconds;
    } else {
        time += (seconds < 10) ? "0" + seconds : String(seconds);
    }

    if (time.indexOf(".") > 0) {
        time += "00";
    } else {
        time += ".000";
    }
    return time;
}

/**
 * [time2second description]
 * @param  {[type]} time [description]
 * @return {[type]}      [description]
 */
function time2second(time) {
    var seconds;
    time = time.split(":");
    if (time.length == 1) {
        seconds = Number(time[0]);
    }
    if (time.length == 2) {
        seconds = Number(time[0] * 60) + Number(time[1]);
    }
    if (time.length == 3) {
        seconds = Number(time[0] * 3600) + Number(time[1] * 60) + Number(time[2]);
    }

    return seconds;
}

/**
 * [get video id from link]
 * @param  {[type]} link [youtube link]
 * @return {[type]}      [description]
 */
function getIdFromLink(link) {
    var id = link.split("=")[1];
    return id;
}