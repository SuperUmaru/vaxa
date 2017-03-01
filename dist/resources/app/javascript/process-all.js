var version = "Video AXA Player version 1.0";
var remote = require('remote'),
    dialog = remote.require('dialog');
fs = remote.require('fs');
ipc = require('electron').ipcRenderer;
var captions = document.getElementById("caption");
var toggleShow = true;
var video = null;
var ytplayer = null;
var youtubePlayer = null;
var table = null;

var cues = [];
var regions = [];
var arrayX = [, ];
var arrayY = [, ];
var arrayWidth = [, ];
var arrayHeight = [, ];
var arrayType = [, ];
var typeNum = -1;
var arrayContent = [, ];
var arrayHref = [, ];
var arrayCSS = [, ];
var run = -999;
var tagShow = [, ];
var currentID = null;
var shower = new WebVTT.Shower();
var max = "NO";
var isVideoPlayer = false;
localStorage.setItem("isNewCue", false);
localStorage.setItem("isLoadAxa", false);

var win = remote.getCurrentWindow();

win.on("maximize", function() {
    max = "max";
    switchClick();
    switchClick();
});

win.on("unmaximize", function() {
    max = "NO";
    switchClick();
    switchClick();
});

/**
 * [initialize page when load]
 */
function init() {
    localStorage.setItem("axaData", null);
    localStorage.setItem("videoW", window.innerWidth - 500);
    localStorage.setItem("videoH", window.innerHeight - 150);
    localStorage.setItem("youtubeLink", null);
    video = document.getElementById("videoPlayer");
    table = document.getElementById("cueListTable");
    ytplayer = $("iframe#ytPlayer");
    youtubePlayer = new YT.Player('ytPlayer', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

/**
 * [load Axa]
 * @param  {[string]} caption [raw information of cue]
 */
function loadAxa(caption) {
    doCaptions(caption);
    videoAddEvent();
    addEvent(null);
}

/**
 * [load Video Without Axa]
 */
function loadVideoWithoutAxa() {
    localStorage.setItem("isLoadAxa", true);
    doCaptions(null);
    videoAddEvent();
    addEvent(null);
}

/**
 * [doCaptions]
 * @param  {[string]} caption [raw information of cue]
 */
function doCaptions(caption) {
    $("#select").empty();
    cues = [];
    if (caption !== null) {
        var parser = new WebVTT.Parser(window, WebVTT.StringDecoder());
        localStorage.setItem("isLoadAxa", true);
        parser.oncue = function(cue) {
            cues.push(cue);
        };
        parser.onregion = function(region) {
            regions.push(region);
        };
        parser.onparsingerror = function(error) {
            console.log(error);
        };

        parser.parse(caption);
        parser.flush();
        var captionsArea = "";
        WebVTT.processCues(window, cues, captionsArea);

        shower.initCueList();
        editTable();
    }
}

/**
 * [add Event for player]
 */
function addEvent(player) {
    var selectCue = document.getElementById("select");
    var time;
    $(selectCue).change(function() {
        selectCueChange();
        time = time2second(table.rows[2].cells[1].innerHTML);
        goToTime(time);
    });

    $("#pos").click(function(e) {
        table.rows[7].cells[1].innerHTML = e.offsetX + ", " + e.offsetY;
        var indexCue = Number(table.rows[1].cells[1].innerHTML);
        updateCue(0);
        time = time2second(table.rows[2].cells[1].innerHTML);
        goToTime(time - 0.5);
        editTable();
        $("#pos").css("display", "none");
    });

    $("#pos").on("mousemove", function(e) {
        $("#pos")[0].innerHTML = "X: " + e.offsetX + " && Y: " + e.offsetY;
    });

    $("#cueListTable tr").click(function() {
        $(this).addClass('selected').siblings().removeClass('selected');
        var value = $(this).find('td:first').html();
    });
}

/**
 * [go to video time]
 * @param  {[int]} time [description]
 */
function goToTime(time) {
    if (isVideoPlayer) {
        video.currentTime = time;
    } else {
        player.seekTo(time, true);
    }
}

/**
 * [select Cue Change]
 */
function selectCueChange() {
    var selectCue = document.getElementById("select");
    shower.updateInformationTable(selectCue.value, 0);
    shower.showListCueInCues(selectCue.value);
    editTable();
}

/**
 * [changeStartTime]
 */
function changeStartTime() {
    start = time2second(start);
}

/**
 * [changeEndTime]
 */
function changeEndTime() {
    end = time2second(end);
}

/**
 * [changeStartSecond]
 */
function changeStartSecond() {
    start = seconds2time(start);
}

/**
 * [changeEndSecond]
 */
function changeEndSecond() {
    end = seconds2time(end);
}

/**
 * [update Cue]
 * @param  {[int]} indexType [index of cue need update]
 */
function updateCue(indexType) {
    var selectCue = document.getElementById("select");
    var selected = selectCue.value;
    shower.updateCue(selected, indexType);

    $("#select").empty();
    shower.initCueList();

    selectCue.options.selectedIndex = selected - 1;
}

/**
 * [add New Cue]
 * @param {[string]} start    [start time]
 * @param {[string]} end      [end time]
 * @param {[string]} posX     [position X]
 * @param {[string]} posY     [postion Y]
 * @param {[string]} content  [content of cue]
 * @param {[string]} href     [link of cue]
 * @param {[string]} type     [type of cue]
 * @param {[string]} width    [width size of cue]
 * @param {[string]} height   [height size of cue]
 * @param {[string]} cssClass [css class of cue]
 */
function addNewCue(start, end, posX, posY, content, href, type, width, height, cssClass) {
    captions = $("#caption");
    if (captions === null || captions.src === "") {
        localStorage.setItem("isNewCue", false);
        return;
    }
    var selectCue = document.getElementById("select");
    var selected = selectCue.value;
    shower.addNewCue(start, end, posX, posY, content, href, type, width, height, cssClass);

    $("#select").empty();
    shower.initCueList();
    selectCue.options.selectedIndex = selected;
    if (isVideoPlayer) {
        video.play();
    } else {
        updateCaption("caption");
        youtubePlayer.playVideo();
    }
}

/**
 * [add More Cue into current cue]
 */
function addMoreCue() {
    var selectCue = document.getElementById("select");
    var selected = selectCue.value;
    shower.addMoreCue(selected);

    $("#select").empty();
    shower.initCueList();

    selectCue.options.selectedIndex = selected - 1;

    shower.showListCueInCues(selected);
    shower.updateInformationTable(selected, 0);
}

/**
 * [save Caption]
 */
function saveCaption() {
    return shower.saveCue();
}

/**
 * [delete Caption]
 */
function deleteCaption() {
    var selectCue = document.getElementById("select");
    var selected = selectCue.value;
    if (selected !== null) {
        shower.deleteCue(selected - 1);
        $("#select").empty();
        shower.initCueList();
    } else {
        alert("No selected! Cannot delete");
    }
}

/**
 * [clear all cue info in screen]
 */
function clearAll() {
    shower.clearCue();
    $("#select").empty();
    $("#pos").css("display", "none");
    shower.initCueList();
    shower.removeAllTag();
}

/**
 * [add event for video player]
 */
function videoAddEvent() {
    localStorage.setItem("videoSrc", video.src);
    video.addEventListener('timeupdate', function() {
        var divArea = document.querySelector('.videoContainer');
        var selectCue = document.getElementById("select");
        var ct = video.currentTime;
        cues.filter(function(cue) {
            return cue.startTime <= ct && cue.endTime >= ct;
        }).forEach(function(cue) {
            if (run == -999 || run != cue.id) {
                shower.showData(cue.id, tagShow);
                run = cue.id;
            }
            var length = arrayType[cue.id].length;
            for (var i = 0; i < length; i++) {
                if (tagShow[i][1] !== null) {
                    if (currentID != cue.id) {
                        shower.removeAllTag();
                    }
                    divArea.insertAdjacentHTML('afterbegin', tagShow[i][1]);
                    selectCue.options.selectedIndex = cue.id - 1;
                    selectCueChange();
                    currentID = cue.id;
                    tagShow[i][1] = null;
                }
            }
        });

        cues.filter(function(cue) {
            return (cue.endTime < ct || ct < cue.startTime);
        }).forEach(function(cue) {
            if (tagShow !== null && currentID == cue.id) {
                var length = tagShow.length; //arrayType[cue.id].length;
                for (var i = 0; i < length; i++) {
                    var tagRemove = document.getElementById(tagShow[i][0]);
                    if (tagRemove !== null) {
                        tagRemove.parentNode.removeChild(tagRemove);
                        tagShow[i][0] = null;
                        run = -999;
                    }
                }
            }
        });

    });
}

/**
 * [download axa]
 * @param  {[string]} text [content of axa file]
 * @param  {[string]} name [name of axa file]
 * @param  {[string]} type [type of axa file default is .axa]
 */
function download(text, name, type) {
    var a = document.getElementById("download");
    var file = new Blob([text], {
        type: type
    });
    a.href = URL.createObjectURL(file);
    a.download = name;
}

/**
 * [validate description]
 * @param  {[type]} evt [description]
 * @return {[type]}     [description]
 */
function validate(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    var regex = /[0-9]|\./;
    if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
    }
}

/**
 * [get Total Row of table information]
 * @param  {[int]} index     [index of type array]
 * @param  {[int]} indexType [index of type array]
 */
function getTotalRow(index, indexType) {
    if (arrayType[index][indexType] == "audio") {
        return 7;
    }
    if (arrayType[index][indexType] == "text") {
        return 9;
    }
    if (arrayType[index][indexType] == "video") {
        return 9;
    }
    if (arrayType[index][indexType] == "image") {
        return 10;
    }
}

/**
 * [new cue]
 */
function newClick() {
    if (isVideoPlayer) {
        video.pause();
    } else {
        youtubePlayer.pauseVideo();
    }
    var newInterval = setInterval(function() {
        if (typeof(Storage) !== "undefined") {
            //New cue and set isNewCue = false
            if (localStorage.getItem("isNewCue") == "true") {
                localStorage.setItem("isNewCue", false);
                start = localStorage.getItem("startTime");
                end = localStorage.getItem("endTime");
                type = localStorage.getItem("typeCue");
                posX = localStorage.getItem("posX");
                posY = localStorage.getItem("posY");
                width = localStorage.getItem("width");
                height = localStorage.getItem("height");
                content = localStorage.getItem("content");
                href = localStorage.getItem("href");
                cssClass = localStorage.getItem("cssClass");

                addNewCue(start, end, posX, posY, content, href, type, width, height, cssClass);
                var selectCue = document.getElementById("select");
                selectCue.selectedIndex = -1;
                clearInterval(newInterval);
            }
        }
    }, 500);

    ipc.send('toggle-popup-view');
}

/**
 * [open video file]
 */
function openClick() {
    stopVideoPlayer();
    stopYoutubePlayer();
    clearAll();
    //Open file dialog
    dialog.showOpenDialog(function(fileNames) {
        if (fileNames === undefined) {
            return;
        }
        var fileName = fileNames[0];
        var caption = document.getElementById("caption");
        //Check video exists
        var videoSrcMp4 = fileName.indexOf(".mp4") > 0;
        var videoSrcOgg = fileName.indexOf(".ogg") > 0;
        var videoSrcWebm = fileName.indexOf(".webm") > 0;

        if (videoSrcMp4 || videoSrcOgg || videoSrcWebm) {
            video.src = fileName;
            var caption1 = (fileName.substring(0, fileName.length - 4)) + ".axa";
            var caption2 = (fileName.substring(0, fileName.length - 5)) + ".axa";
            var fileNameAxa = "";
            var isHaveAxa = false;
            //Check caption file exist
            if (fs.existsSync(caption1)) {
                caption.src = caption1;
                isHaveAxa = true;
                fileNameAxa = caption1;
            } else if (fs.existsSync(caption2)) {
                caption.src = caption2;
                isHaveAxa = true;
                fileNameAxa = caption2;
            }
            //Load caption file if have
            if (video.src !== "" && isHaveAxa) {
                fs.readFile(fileNameAxa, 'utf-8', function(err, data) {
                    loadAxa(data);
                });
            } else {
                loadVideoWithoutAxa();
            }
            $(video).css("display", "block");
            $("#ytPlayer").css("display", "none");
            isVideoPlayer = true;
        } else {
            dialog.showMessageBox({
                message: "Cannot load video !!!",
                buttons: ["OK"]
            });
        }
    });
}

/**
 * [open youtube link]
 */
function youtubeClick() {
    stopVideoPlayer();
    stopYoutubePlayer();
    clearAll();
    ipc.send('toggle-youtube-view');
    var youtubeTimer = setInterval(function() {
        var link = localStorage.getItem("youtubeLink");
        if (link !== "null" && link != "undefined") {
            $(video).css("display", "none");
            $("#ytPlayer").css("display", "block");
            var id = getIdFromLink(link);
            loadYouTubeVideo(youtubePlayer, id);
            isVideoPlayer = false;
            clearInterval(youtubeTimer);
        }
    }, 500);
}

/**
 * [save cues list]
 */
function saveClick() {
    dialog.showSaveDialog({
        filters: [{
            name: 'text',
            extensions: ['axa']
        }]
    }, function(fileName) {
        if (typeof(fileName) === 'undefined' || fileName === null) {
            return;
        }
        var data = saveCaption();
        fs.writeFile(fileName, data, function(err) {});
    });
}

/**
 * [delete cue]
 * @return {[type]} [description]
 */
function deleteClick() {
    deleteCaption();
}

/**
 * [about video axa player]
 */
function aboutClick() {
    dialog.showMessageBox({
        message: version,
        buttons: ["OK"]
    });
}

/**
 * [switch from player to no player]
 */
function switchClick() {
    var select = document.getElementById("select");
    var w, h, top;
    $(select).toggle();
    $(table).toggle();

    if (max == "max") {
        w = 1337 + 500;
        h = 867 + 150;
        top = -57;
    } else {
        w = window.innerWidth;
        h = window.innerHeight;
        top = -57;

    }

    if (toggleShow) {
        toggleShow = false;
        $(video).css("width", w - 30);
        $(video).css("height", h - 80);
        $("#ytPlayer").css("width", 1368);
        $("#ytPlayer").css("height", 705);
        if (max == "max") {
            $("#ytPlayer").css("width", 1900);
            $("#ytPlayer").css("height", 960);
        }
        $(video).css("top", 0);
        $(".videoContainer").css("left", 0);
        $(".videoContainer").css("height", h - 80);
        $("#pos").css("display", "none");
    } else {
        toggleShow = true;
        $(video).css("width", w - 500);
        $(video).css("height", h - 150);
        $(video).css("top", top);
        $(".videoContainer").css("left", 385);
        $(".videoContainer").css("width", w - 500);
        $(".videoContainer").css("height", h - 150);
        $("#ytPlayer").css("width", 884);
        $("#ytPlayer").css("height", 540);
        $("#pos").css("width", 884);
        $("#pos").css("height", 540);
        $("#pos").css("top", -611);
        if (max == "max") {
            $("#ytPlayer").css("width", 1400);
            $("#ytPlayer").css("height", 800);
            $("#pos").css("width", 1400);
            $("#pos").css("height", 800);
            if (isVideoPlayer) {
                $("#pos").css("top", -867);
            } else {
                $("#pos").css("top", -800);
            }
        }
    }
}

/**
 * [edit Table Information]
 */
function editTable() {
    $("td").dblclick(function() {
        var index = Number(table.rows[1].cells[1].innerHTML);
        var OriginalContent = $(this).text();
        if (OriginalContent == index || OriginalContent == "Property" || OriginalContent == "Value" || OriginalContent == "Start" || OriginalContent == "End" || OriginalContent == "CssClass" || OriginalContent == "Type" || OriginalContent == "Content" || OriginalContent == "Position" || OriginalContent == "Size" || OriginalContent == "Href" || OriginalContent == "Index" || OriginalContent == "Update Start Time" || OriginalContent == "Update End Time" || OriginalContent == "Update Position") {
            return;
        }
        if (isVideoPlayer) {
            video.pause();
        } else {
            youtubePlayer.pauseVideo();
        }

        $(this).addClass("cellEditing");
        $(this).html("<input type='text' value='' />");
        $(this).children().first().focus();
        $(this).children().first().keypress(function(e) {
            if (e.which == 13) {
                var newContent = $(this).val();
                $(this).parent().text(newContent);
                $(this).parent().removeClass("cellEditing");
                updateCue(0);
                var time = time2second(table.rows[2].cells[1].innerHTML);
                goToTime(time - 0.5);
                editTable();
                if (isVideoPlayer) {
                    video.play();
                } else {
                    youtubePlayer.playVideo();
                }
            }
        });

        $(this).children().first().blur(function() {
            $(this).parent().text(OriginalContent);
            $(this).parent().removeClass("cellEditing");
            video.play();
        });
    });
}

/**
 * [stop Video Player]
 */
function stopVideoPlayer() {
    if (video !== null && typeof(video) !== "undefined") {
        table.innerHTML = "";
        video.pause();
        localStorage.setItem("videoSrc", null);
        video.removeEventListener('timeupdate');
        video.src = "";
    }
}

/**
 * [stop Youtube Player]
 */
function stopYoutubePlayer() {
    if (ytplayer !== null && typeof(ytplayer) !== "undefined") {
        table.innerHTML = "";
        ytplayer.src = "";
        if (youtubePlayer !== null) {
            loadYouTubeVideo(youtubePlayer, "");
            localStorage.setItem("youtubeLink", null);
            localStorage.setItem("axaData", null);
        }
    }
}

/**
 * [updateTime]
 * @param  {[int]} index of rows in table information}
 */
function updateTime(index) {
    var cell = table.rows[index].cells[1];
    if (isVideoPlayer) {
        cell.innerHTML = seconds2time(Math.round(video.currentTime * 10) / 10);
    } else {
        cell.innerHTML = seconds2time(Math.round(youtubePlayer.getCurrentTime() * 10) / 10);
    }
    updateCue(0);
    var time = time2second(table.rows[2].cells[1].innerHTML);
    goToTime(time - 0.5);
    editTable();
}

/**
 * [update button position layout]
 */
function updatePosition() {
    if ($("#pos").css("display") == "block") {
        $("#pos").css("display", "none");
    } else {
        $("#pos").css("display", "block");
    }
    if (max == "max") {
        if (isVideoPlayer) {
            $("#pos").css("top", -867);
        } else {
            $("#pos").css("top", -800);
        }
    } else {
        if (isVideoPlayer) {
            $("#pos").css("top", -611);
        } else {
            $("#pos").css("top", -540);
        }
    }
}