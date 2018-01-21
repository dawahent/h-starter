res = new Object();
res.end = (x) => {
  if(!x){
    console.log('res ends with nothing');
  }else{
    let temp;
    try{
      temp = JSON.parse(x);
    }catch(error){
      temp = x;
    }
    console.log('res ends with ', temp);
  }
}
module.exports = {
  res
};
