const { app, BrowserWindow, ipcMain } = require('electron')
const log = require('electron-log')
const path = require("path");
const robotjs = require('robotjs')


function createWindow () {
    const win = new BrowserWindow({
        width: 600,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.removeMenu();
    win.loadFile('index.html')

    log.info("App Run");

    log.info(robotjs.getMousePos())
    console.log("Robot " + robotjs.getMousePos())
    robotjs.moveMouse(500, 500);
    log.info(robotjs.getMousePos())
    console.log("Robot " + robotjs.getMousePos())

    
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }


})

