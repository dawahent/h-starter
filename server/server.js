#!/usr/bin/env node
var http = require('http');
var fs = require('fs');
var server = http.createServer();
var c=0;

server.on('request', function(req, res){
  // c = c + 1;
  // console.log(c.toString());
  // console.log(req.url)
  console.log(req.method === "POST");
  if(req.method === "POST"){
    console.log("yo");
    let body = [];
    req.on('data', function(chunk){
      body.push(chunk);
    })

    req.on('end', function(){
      res.end("yoyoyo, I get post: " + Buffer.concat(body).toString())
    })
    return;
  }
  fs.readFile('./client/html/tutu.html', function(err, data){
    res.end(data);
  });
  // account.signUserIn(req,res);
});

server.listen(3000, "0.0.0.0", function(){
  console.log("listening...")
});
