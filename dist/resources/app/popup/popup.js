var remote = require('remote'),
    ipc = require('electron').ipcRenderer;
    dialog = remote.require('dialog');
    fs = remote.require('fs');

var typeUpdate = "";
var isGet = false;
var axaData = null;
var btnStart, btnStop, video, areaPos, w, h, youtubePlayer, youtubeInterval;
/**
 * [init function when popup load]
 * @return {[type]} [none]
 */
function init() {
    btnStart = document.getElementById("getSTime");
    btnStop = document.getElementById("getETime");
    video = document.getElementById("videoPlayer");
    areaPos = document.getElementById("areaPosition");
    w = localStorage.getItem("videoW");
    h = localStorage.getItem("videoH");
    activeEvent();
    youtubePlayer = new YT.Player('ytPlayerPopUp', {
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

/**
 * [initYoutube]
 * @return {[type]} [description]
 */
function initYoutube() {
    activeEventYoutube();
    $("#youtubeLink").focus();
}

/**
 * [getData from GUI and set data into storage]
 * @return {[type]} [none]
 */
function getData() {
    var startTime = $("#startTime")[0].value;
    var endTime = $("#endTime")[0].value;
    var typeCue = $("#typeCue")[0].value;
    var position = $("#position")[0].value;
    var href = $("#href")[0].value;
    var size = $("#size")[0].value;
    var content = $("#content")[0].value;
    var cssClass = $("#cssClass")[0].value;

    position = position.split(",");
    var posX = position[0];
    var posY = position[1];

    size = size.split(",");
    var width = size[0];
    var height = size[1];

    if (typeof(Storage) !== "undefined") {

        localStorage.setItem("isNewCue", true);
        localStorage.setItem("startTime", startTime);
        localStorage.setItem("endTime", endTime);
        localStorage.setItem("typeCue", typeCue);
        localStorage.setItem("posX", posX);
        localStorage.setItem("posY", posY);
        localStorage.setItem("width", width);
        localStorage.setItem("height", height);
        localStorage.setItem("content", content);
        localStorage.setItem("href", href);
        localStorage.setItem("cssClass", cssClass);
    }
    stopAll();
    ipc.send('toggle-popup-view');
}

/**
 * [cancel button click]
 * @return {[type]} [description]
 */
function cancel() {
    ipc.send('toggle-popup-view');
}

/**
 * [activeEvent of popup page]
 * @return {[type]} [description]
 */
function activeEvent() {
    /**
     * [event mouse move]
     * @param  {String} e) {                   areaPos.innerHTML [description]
     * @return {[type]}    [description]
     */
    $(areaPos).on("mousemove", function(e) {
        areaPos.innerHTML = "X: " + Math.round(e.offsetX / 0.3, 0) + " && Y: " + Math.round(e.offsetY / 0.3, 0);
    });

    /**
     * event click
     * @param  {[type]} [description]
     * @return {[type]} [description]
     */
    $(areaPos).on("click", function(e) {
        $(areaPos).css("display", "none");
        $("#position")[0].value = Math.round(e.offsetX / 0.3, 0) + "," + Math.round(e.offsetY / 0.3, 0);
    });

    $(video).on("timeupdate", function() {
        if (typeUpdate == "start") {
            $("#startTime")[0].value = seconds2time(video.currentTime);
        } else {
            $("#endTime")[0].value = seconds2time(video.currentTime);
        }
    });
}

/**
 * [activeEventYoutube]
 * @return {[type]} [none]
 */
function activeEventYoutube() {
    $("#youtubeLink").keypress(function(event) {
        if (event.which == 13) {
            if (this.value.indexOf("youtube") > 0) {
                openYoutube();
            } else {
                dialog.showMessageBox({
                    message: "Your link is not youtube link !!!",
                    buttons: ["OK"]
                });
            }
        }
    });
}

/**
 * [show panel get position]
 * @return {[type]} [description]
 */
function showGetPosition() {
    $(areaPos).css("display", "block");
    $(areaPos).css("width", w * 0.3);
    $(areaPos).css("height", h * 0.3);
}

/**
 * [show video get time]
 * @param  {[type]} string [type of time video Start/End]
 * @return {[type]}      [description]
 */
function showVideo(type) {
    if (isGet === true) {
        var src = localStorage.getItem("videoSrc");
        var youtubeSrc = localStorage.getItem("youtubeLink");
        clearInterval(youtubeInterval);
        if (src !== "null" && typeof(src) !== "undefined") {
            video.src = src;
            $(video).css("display", "block");
            $(video).css("width", w * 0.5);
            $(video).css("height", h * 0.5);
            video.load();
        } else if (youtubeSrc !== "null" && typeof(youtubeSrc) !== "undefined") {
            $("#ytPlayerPopUp").css("display", "block");
            $("#ytPlayerPopUp").css("width", w * 0.5);
            $("#ytPlayerPopUp").css("height", h * 0.5);
            var id = getIdFromLink(youtubeSrc);
            youtubePlayer.loadVideoById(id, 0, "large");

            youtubeInterval = setInterval(function() {
                if (typeUpdate == "start") {
                    $("#startTime")[0].value = seconds2time(youtubePlayer.getCurrentTime());
                } else {
                    $("#endTime")[0].value = seconds2time(youtubePlayer.getCurrentTime());
                }
            },100);
        } else {
            typeUpdate = type;
            return;
        }
        typeUpdate = type;
    } else {
        clearInterval(youtubeInterval);
        video.src = null;
        $(video).css("display", "none");
        $("#ytPlayerPopUp").css("display", "none");
        youtubePlayer.loadVideoById("", 0, "large");
        typeUpdate = "";
    }
}

function getVideoClick(type) {
    isGet = !isGet;
    if(typeUpdate !== "") {
        if(typeUpdate !== type) {
            if(type == "end") {
                btnStart.innerHTML = "Get Start Time";
                btnStop.innerHTML = "Stop Get Time";
                isGet = !isGet;
                showVideo(type);
            } else {
                btnStart.innerHTML = "Stop Get Time";
                btnStop.innerHTML = "Get End Time";
                isGet = !isGet;
                showVideo(type);
            }
        } else {
            buttonChange(type);
            showVideo(type);
        }
    } else {
        buttonChange(type);
        showVideo(type);
    }
}

function buttonChange(type) {
    if(type == "start") {
        btnStart.innerHTML = "Get Start Time";
        if (isGet === true) {
            btnStart.innerHTML = "Stop Get Time";
        }
    } else {
        btnStop.innerHTML = "Get End Time";
        if (isGet === true) {
            btnStop.innerHTML = "Stop Get Time";
        }
    }
}

function stopAll() {
    btnStart.innerHTML = "Get Start Time";
    btnStop.innerHTML = "Get End Time";
    isGet = false;
    video.src = null;
    $(video).css("display", "none");
    $("#ytPlayerPopUp").css("display", "none");
    youtubePlayer.loadVideoById("", 0, "large");
    typeUpdate = "";
}

function openYoutube() {
    var text = document.getElementById("youtubeLink");
    localStorage.setItem("youtubeLink", text.value);
    text.value = "";
    if(axaData !== null) {
        localStorage.setItem("axaData", axaData);
        axaData = null;
    } else {
        localStorage.setItem("axaData", null);
    }
    ipc.send('toggle-youtube-view');
}

function loadAxaYoutube() {
    //Open file dialog
    dialog.showOpenDialog(function(fileNames) {
        if (fileNames === undefined) {
            return;
        }
        var fileName = fileNames[0];
        if (fileName.indexOf(".axa") > 0) {
            fs.readFile(fileName, 'utf-8', function(err, data) {
                axaData = data;
            });
            $("#lblAxaName").innerHTML = fileName;
        } else {
            dialog.showMessageBox({
                message: "Cannot load axa !!!",
                buttons: ["OK"]
            });
        }
    });
}