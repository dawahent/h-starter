res = new Object();
res.end = (x) => {
  if(!x){
    console.log('res ends with nothing');
  }else{
    console.log('res ends with ', JSON.parse(x))
  }
}
module.exports = {
  res
};
