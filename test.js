var fs = require('fs');
var data = fs.readFileSync('./result.txt', 'utf8');
var flag = true;
data = data.split(',');
var startData = parseInt(data[0]);
for(var i=1;i < data.length -1; i++) {
    if ((parseInt(startData) +1 ) === parseInt(data[i])) {
        startData = parseInt(data[i]);
    } else if ((parseInt(startData) +1 ) - parseInt(data[i]) === 65536) {
        startData = parseInt(data[i]);
    }
    else {
        console.log(parseInt(startData) + 1 , parseInt(data[i]));
        console.log('Not Continuous', parseInt(data[i-1]),' = ' , i);
        startData = parseInt(data[i]);
        flag = false;
    }
}

if(flag){
    console.log("Test Success");
}