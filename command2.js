var SerialPort = require("serialport");
// const MockBinding = SerialPort.Binding;
// MockBinding.createPort('COM13');
var port = new SerialPort("COM13", {
  baudRate: 115200,
  autoOpen: false
});
var fs = require('fs');
var filePath = 'result.txt';
// fs.writeFileSync(filePath,'Hi Hello');
var readCmd = [126,36,1,0,3,224,13,1,126];
var streamStart = [126,33,1,0,2,1,3,126];
var streamStop = [126,33,1,0,2,2,1,126];
var writeCmd = [126,35,1,0,3,224,42,25,126];

function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}

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
  // console.log('Written : ', port.write(pack(writeCmd)));
});

port.on('open', function() {
  console.log("Opened the port!")
});

// Switches the port into "flowing mode"
// port.on('data', function (data) {
  // console.log('Data:', data);
  // var buffer = port.read();
  // console.log('LENGTH : ', data.length, port.baudRate);
// });

// Read data that is available but keep the stream from entering "flowing mode"
var data = [];
port.on('readable', function () {
  setTimeout(function() {
    // console.log('Data1:', port.read());
    var buffer = port.read();
    console.log(buffer);
    var ar = [];
    for (var i=0; i < buffer.length; i++) {
      if (buffer[i].toString(16) === '7e') {
        if (isStartBit(buffer, i)) {
            // If it is a start bit
            var startbit = i+2;
            var stopbit = findStopbit(buffer, i+1);
            if (startbit && stopbit) 
              appendData(buffer, startbit, stopbit);
            else if (startbit && stopbit === undefined)
              appendData(buffer, startbit, buffer.length);
        }
      }
    }
    fs.appendFileSync(filePath, data);
  }, 1000);
});

function isStartBit(buffer, i) {
  if (buffer[i-1] && buffer[i-1].toString(16) === '7e')
    return true;
  return false;
}

// function isStopBit(buffer, index) {
//   if (buffer[i+1] && buffer[i+1].toString(16) === '7e')
//     return true;
//   return false;
// }

function findStopbit(buffer, i) {
  for(var j=i;j < buffer.length; j++) {
    if (buffer[j].toString(16) === '7e') {
      return j;
    }
  }
}

function appendData(buffer, startIndex, stopIndex) {
  var str = '';
  for (let k = startIndex; k < stopIndex; k++) {
    str += buffer[k].toString(16) + ' ';
  }
  data.push(str);
}
