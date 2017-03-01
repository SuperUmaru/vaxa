'use strict';
const electron = require('electron');
const ipc = electron.ipcMain;
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.

require('electron-debug')({
    showDevTools: false
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let popUpWindow = null;
let popUpYoutubeWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 800,
        maximizable: false
    });
    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/main/index.html');

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    ipc.on('toggle-popup-view', function() {
        if (!popUpWindow) {
            createPopUpWindow();
        }

        return (popUpWindow.isVisible()) ? popUpWindow.hide() : popUpWindow.show();
    });

    ipc.on('toggle-youtube-view', function() {
        if (!popUpYoutubeWindow) {
            createPopUpYoutube();
        }

        return (popUpYoutubeWindow.isVisible()) ? popUpYoutubeWindow.hide() : popUpYoutubeWindow.show();
    });
});

function createPopUpWindow() {
    popUpWindow = new BrowserWindow({
        height: 700,
        width: 510,
        alwaysOnTop: true
    });

    popUpWindow.loadUrl('file://' + __dirname + '/popup/popup.html');
    popUpWindow.hide();

    popUpWindow.on('closed', function() {
        popUpWindow = null;
    });
}

function createPopUpYoutube() {
    popUpYoutubeWindow = new BrowserWindow({
        height: 110,
        width: 807,
        alwaysOnTop: true
    });

    popUpYoutubeWindow.loadUrl('file://' + __dirname + '/popup/youtube.html');
    popUpYoutubeWindow.hide();

    popUpYoutubeWindow.on('closed', function() {
        popUpYoutubeWindow = null;
    });
}