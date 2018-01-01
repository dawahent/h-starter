var http = require('http');
var server = http.createServer();
var c=0;

server.on('request', function(req, res){
  c = c + 1;
  console.log(c.toString());
});

server.listen(3000, "0.0.0.0", function(){
  console.log("listening...")
});
