const fs = require('fs');
const { desktopCapturer } = require("electron");
const log = require("electron-log")
const childProcess = require('child_process');


function captureApplicationWindow() {
    desktopCapturer.getSources({ types: ['window'] })
    .then(value => {
        value.forEach(x => {
            var png = x.thumbnail.toPNG()
            var filename = x.name;
            fs.writeFileSync('/screen' + filename + '.png', png);

            var wincode = x.id.substring(7, 11);

        })
    }) 

}

captureApplicationWindow()



