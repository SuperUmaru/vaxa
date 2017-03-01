var youtubeTimerEvent;
var remote = require('remote'),
    dialog = remote.require('dialog');

var player;
var caption;
var run = -999;
/**
 * [load video from youtube]
 * @return {[type]} [NONE]
 */
function loadYouTubeVideo(ytplayer, ytSrc) {
    player = ytplayer;
    if(ytSrc == "") {
        clearInterval(youtubeTimerEvent);
        player.loadVideoById(ytSrc, 0, "large");
    } else {
        player.loadVideoById(ytSrc, 0, "large");
        caption = localStorage.getItem("axaData");
        localStorage.setItem("axaData", null);
        if(caption == "null") {
            caption = null;
            localStorage.setItem("isLoadAxa", true);
        }
        doCaptions(caption);
        addEvent(player);
    }
}

function updateCaption(content) {
    if(youtubeTimerEvent !== 0) {
        this.caption = content;
    }
}

function onPlayerReady(event) {
    event.target.playVideo();
}

function stopVideo() {
    player.stopVideo();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && caption !== null) {
        caption = null;
        youtubeTimerEvent = setInterval(function() {
            eventYoutubeTimeChange();
        },100);
    }
}

function eventYoutubeTimeChange() {
    var divArea = document.querySelector('.videoContainer');
    var selectCue = document.getElementById("select");
    var ct = player.getCurrentTime();
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
}