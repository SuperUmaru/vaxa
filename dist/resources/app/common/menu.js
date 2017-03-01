////////
// This sample is published as part of the blog article at www.toptal.com/blog
// Visit www.toptal.com/blog and subscribe to our newsletter to read great posts
////////

var remote = require('remote'),
    Menu = remote.require('menu');
    dialog = remote.require('dialog');
    fs = remote.require('fs');
    ipc = require('electron').ipcRenderer;

module.exports = {
    create: function() {
        var appMenu = Menu.buildFromTemplate([
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New',
                        accelerator: 'CmdOrCtrl+N',
                        role: 'new',
                        click: function() {
                            ipc.send('toggle-popup-view');
                        }
                    },
                    {
                        label: 'Open',
                        accelerator: 'CmdOrCtrl+O',
                        role: 'open',
                        click: function() {
                            //Open file dialog
                            dialog.showOpenDialog(function (fileNames) {
                                if (fileNames === undefined) 
                                    return;
                                var fileName = fileNames[0];
                                var caption = document.getElementById("caption");
                                var video = document.getElementById('videoPlayer');
                                //Check video exists
                                var videoSrcMp4 = fileName.indexOf(".mp4") > 0;
                                var videoSrcOgg = fileName.indexOf(".ogg") > 0;
                                var videoSrcWebm = fileName.indexOf(".webm") > 0;

                                if(videoSrcMp4 || videoSrcOgg || videoSrcWebm) {
                                    video.src = fileName;
                                    var caption1 = (fileName.substring(0, fileName.length - 4)) + ".axa";
                                    var caption2 = (fileName.substring(0, fileName.length - 5)) + ".axa";
                                    var fileNameAxa = "";
                                    var isHaveAxa = false;
                                    //Check caption file exist
                                    if(fs.existsSync(caption1)) {
                                        caption.src = caption1;
                                        isHaveAxa = true;
                                        fileNameAxa = caption1;
                                    } else if(fs.existsSync(caption2)) {
                                        caption.src = caption2;
                                        isHaveAxa = true;
                                        fileNameAxa = caption2;
                                    }
                                    //Load caption file if have
                                    if(video.src != "" && isHaveAxa) {
                                        fs.readFile(fileNameAxa, 'utf-8', function (err, data) {
                                            loadAxa(data, video);
                                        });
                                    }
                                } else {
                                    dialog.showMessageBox({ message: "Cannot load video !!!", buttons: ["OK"] });
                                }
                            });
                        }
                    },
                    {
                        label: 'Save',
                        accelerator: 'CmdOrCtrl+S',
                        role: 'save',
                        click: function() {
                            dialog.showSaveDialog({ filters: [
                                    { name: 'text', extensions: ['axa'] }
                                ]}, function (fileName) {
                                if (fileName === undefined)
                                    return;
                                var data = saveCaption();
                                fs.writeFile(fileName, data, function (err) {   
                                });
                            }); 
                        }
                    },
                ]
            },
        ]);

        Menu.setApplicationMenu(appMenu);
    }
};
