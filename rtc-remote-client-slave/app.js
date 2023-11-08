const { app, BrowserWindow, ipcMain } = require('electron')
const { v4: uuidv4 } = require('uuid');
const log = require('electron-log')
const screenshot = require('screenshot-desktop');
const sharp = require('sharp');
var robot = require("robotjs");
const path = require("path");

// var socket = require('socket.io-client')('http://172.30.1.29:5003', {
//     cors: { origin: '*' }
//   });
// var interval;

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

    // socket.on("mouse-move", function(data){
    //     log.info("mouse-move");
    //     var obj = JSON.parse(data);
    //     var x = obj.x;
    //     var y = obj.y;
    //     // robot.moveMouse(x, y);
    // })

    // socket.on("mouse-click", function(data){
    //     log.info("mouse-click");
    //     // robot.mouseClick();
    // })

    // socket.on("type", function(data){
    //     log.info("mouse-click");
    //     var obj = JSON.parse(data);
    //     var key = obj.key;

    //     // robot.keyTap(key);
    // })
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


// ipcMain.on("start-share", function(event, arg) {

//     var uuid = "test";//uuidv4();
//     socket.emit("join-message", uuid);
//     event.reply("uuid", uuid);

//     const sizePer = 0.75
//     let width = (1920 * sizePer)
//     let height = (1080 * sizePer)

//     interval = setInterval(function() {
//         screenshot().then((img) => {
//             sharp(img)
//             .resize(width, height) // 원하는 크기로 조절
//             .webp({ quality: 10 })
//             .toBuffer()
//             .then((resizedImg) => {
//                 try{
//                     console.log(resizedImg.byteLength);
//                     var imgStr = Buffer.from(resizedImg).toString('base64');
//                     var obj = {};
//                     obj.room = uuid;
//                     obj.image = imgStr;
//                     socket.emit("test", "testdata");
//                     socket.emit("screen-data", imgStr);
        
//                     // event.reply("screen", imgStr);
//                 }
//                 catch(e){
//                     log.info(e);
//                 }
    
//             });
            
//         })
//     }, 500)
// })

// ipcMain.on("stop-share", function(event, arg) {

//     clearInterval(interval);
// })
