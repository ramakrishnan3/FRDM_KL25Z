var fs = require('fs');
data = fs.readFileSync('result.txt');
var startData = parseInt(data[0]);
for(var i=1;i < data.length; i++) {
    // console.log(parseInt(data[i]));
    if ((startData +1 ) === parseInt(data[i])) {
        startData = parseInt(data[i]);
    } else {
        console.log('Not Continuous');
        break;
    }
}