const { app, BrowserWindow, ipcMain } = require('electron')
const log = require('electron-log')
const path = require("path");


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

