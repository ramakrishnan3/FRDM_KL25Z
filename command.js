var SerialPort = require("serialport"); 
// const MockBinding = SerialPort.Binding;
// MockBinding.createPort('COM13');
var port = new SerialPort("COM13", {
  baudRate: 115200,
  autoOpen: false
});

function bin2String(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(parseInt(array[i], 2));
  }
  return result;
}
SerialPort.list();

port.open(function (err){
  if(err) {
    return console.log('Error message port: ',err.message);
  }else {
    console.log('port opened');
  }
  port.
  /* port._write(bin2String([126,33,1,0,2,1,3,126]), function(err){
    console.log(err.message);
  }); */
  /* port._read(1000, function(data){
    console.log(data.toString());
  }) */
}) 
/* SerialPort.on("open", function () {
  console.log('open');
  SerialPort.on('data', function(data) {
    console.log(data);
  });
}); */