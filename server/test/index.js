require('./fakeHttp.js');
account = require('../api/account/verification.js');
project = require('../api/project/project.js');
const fs = require('fs');

randPicSet = [];
for(i = 1; i < 29; i++){
  randPicSet.push(fs.readFileSync('./server/test/randomPic/'+i.toString()+"stp.png").toString('base64'));
}

toInsTemplate = function(insIdx,randIdx){
  return({
    idx: insIdx,
    actData: randPicSet[randIdx],
    fmt: "png"
  });
}


// fs.writeFile('./coco.png',randPic,'base64',(err)=>{
//   console.log(err);
// });
