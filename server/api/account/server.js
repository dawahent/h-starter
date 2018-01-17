#!/usr/bin/env node
var http = require('http');
var fs = require('fs');
var server = http.createServer();
const {registerUser, signUserIn} = require("./verification.js");
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

  //we don't give a shit to get method
  res.end(preLoad404);
});

server.listen(3000, "0.0.0.0", function(){
  console.log("listening...")
});
