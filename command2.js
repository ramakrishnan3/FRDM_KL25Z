var SerialPort = require("serialport");
var server = require('http').createServer();
var io = require("socket.io")(server);
var port = new SerialPort("COM6", {
  baudRate: 576000,
  autoOpen: false
});
server.listen(3000);
var fs = require('fs');
var filePath = 'result.txt';
var readCmd = [126,36,1,0,3,224,13,1,126];
var streamStart = [126,33,1,0,2,1,3,126];
var streamStop = [126,33,1,0,2,2,1,126];
var writeCmd = [126,35,1,0,3,224,42,25,126];

function pack(bytes) {
  var str = "";
// You could make it faster by reading bytes.length once.
  for(var i = 0; i < bytes.length; i += 2) {
// If you're using signed bytes, you probably need to mask here.
      var char = bytes[i] << 8;
// (undefined | 0) === 0 so you can save a test here by doing
//     var char = (bytes[i] << 8) | (bytes[i + 1] & 0xff);
      if (bytes[i + 1])
          char |= bytes[i + 1];
// Instead of using string += you could push char onto an array
// and take advantage of the fact that String.fromCharCode can
// take any number of arguments to do
//     String.fromCharCode.apply(null, chars);
      str += String.fromCharCode(char);
  }
  return str;
}

port.open(function (err){
  if(err) {
    return console.log('Error message port: ',err.message);
  }
  port.write(pack(writeCmd));
});

port.on('open', function() {
  console.log("Opened the port!")
});

// Read data that is available but keep the stream from entering "flowing mode"
var data = [];
var excessBits = [];
var startTime = new Date();
port.on('readable', function () {
  setTimeout(function() {    
    // var ar = [0, 255,126, 126, 0, 80, 221, 126,126, 0, 81, 221, 126,126, 0, 100, 216, 126, 126, 0, 93, 165, 126,126, 0, 92, 165, 126];
    // var buffer = Buffer.from(ar);
    var buffer = Buffer.concat([ Buffer.from(excessBits), port.read() ]);
    excessBits = [];
    data = [];
    for (var i=0; i < buffer.length; i++) {
      if (buffer[i].toString(16) === '7e') {
            var startbit = i+2;
            var stopbit = findStopbit(buffer, i+1);
            if ( startbit > 0 && stopbit > 0 && (stopbit - startbit > 1)) {
              appendData(buffer, startbit, stopbit);
              i = stopbit;
            }
            else if (startbit && stopbit === undefined)
              appendDatatoExcessBits(buffer, startbit, buffer.length);
      }
    }
    io.emit('data', data);
    fs.appendFileSync(filePath, data + ',');
  }, 50);
});

function findStopbit(buffer, i) {
  for(var j=i;j < buffer.length; j++) {
    if (buffer[j].toString(16) === '7e') {
      return j;
    }
  }
}


function appendData(buffer, startIndex, stopIndex) {
  var str = '';
  for (let k = stopIndex-1; k >= startIndex; k--) {
	if(buffer[k] < 16)
		str += '0' + buffer[k].toString(16);
	else
		str += buffer[k].toString(16);
  }
  data.push(parseInt(replaceWithOriginal(str), 16));
  if(data[data.length - 1] - data[data.length - 2] !== 1){

  }
}

function appendDatatoExcessBits(buffer, startIndex, stopIndex) {
  excessBits  = [];
  for (let k = startIndex - 2; k < stopIndex; k++)
    excessBits.push(buffer[k]);
}

function replaceWithOriginal(str) {
  if (str.includes('5d7d') && str.length > 4) {
    str = str.replace(/5d7d/g, '7d');
  }
  if (str.includes('5e7d')  && str.length > 4) {
    str = str.replace(/5e7d/g, '7e');
  }
  return str;
}
