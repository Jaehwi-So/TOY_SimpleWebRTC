const fs = require('fs');

function captureApplicationWindow() {
    desktopCapturer.getSources({ types: ['window'] })
    .then(value => {
        value.forEach(x => {
            var png = x.thumbnail.toPNG()
            var filename = x.name;
            fs.writeFileSync(filename + '.png', png);
        })
    }) 
  }