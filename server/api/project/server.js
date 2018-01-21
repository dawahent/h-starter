#!/usr/bin/env node
var http = require('http');
var fs = require('fs');
var server = http.createServer();
//pre load the 404 page
var preLoad404 = fs.readFileSync('./../../../client/html/custom_404.html');

server.on('request', function(req, res){
  if(req.method === "POST"){
    req.body = [];
    req.on('data', function(chunk){
      req.body.push(chunk);
    })

    req.on('end', function(){
      let reqdata = JSON.parse(Buffer.concat(req.body).toString());


      res.end(JSON.stringify({error: "unclear action"}));
    })
    return;
  }

  //"GET" is for picture, esp. those that require ownership/priviliege to view
  res.end(preLoad404);
});

server.listen(3002, "0.0.0.0", function(){
  console.log("listening...")
});
