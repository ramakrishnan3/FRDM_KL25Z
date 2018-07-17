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
port.on('readable', function () {
  setTimeout(function() {
    // console.log('Data1:', port.read());
    var buffer = port.read();
    fs.appendFileSync(filePath, buffer.toString('hex').split(' '));
    // console.log('LENGTH : ', buffer.length, port.baudRate);
    console.log(buffer.toString('hex'));
  }, 1000);
});

