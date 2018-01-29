const {emailRegEx} = require('../regex/regexSet.js');
require('../../mongo/config.js');//import dbcoll
const ObjectID = require('mongodb').ObjectID;
// const {matchSession} = require('./../account/verification.js');
const fs = require('fs');

/**
* template of a project JSON file
* @return {object} the pj josn template
**/
const pjTemplate = function(){
  var ret = {
    title: null,
    creatorId: null,
    creatorNickName: null,
    addDate: new Date().getTime(),
    expect: 5000, //in usd
    description: null,
    pledged: 0,
    samplePicNum: 0
  };
  return ret;
};

/**
* middleware for session matching
* @param {string} sid
* @param {string} ip
* @param {function} cb
**/
matchSession = function(sid,ip,cb){
  cb(null);
}

/**
* verify the usr can edit the project, and then execute the edit (i.e. cb)
* @param {object} drawerInfo the json file used to identify the user
* @param {string} pjid the project id
* @param {object} res the response object to end with
* @param {function} cb the callback function to exec after verification success
**/
const verifyThenProjectCb = function(drawerInfo,pjid,res,cb){
  matchSession(drawerInfo.sid, drawerInfo.ip, (usrid) => {
    if(!usrid){
      res.end(JSON.stringify({error:"not log in"}));
      return;
    }
    dbcoll("accounts").find({_id: ObjectID(usrid)}).toArray((err,data) => {
      if(data.length == 0){
        res.end(JSON.stringify({error: "usr not in db"}));
        return;
      }
      if(!data[0].verifiedDrawer){
        res.end(JSON.stringify({error: "you are not drawer"}));
        return;
      }
      dbcoll("project").find({_id: ObjectID(pjid)}).toArray((err,data) => {
        if(data.length == 0){
          res.end(JSON.stringify({error: "project not in db"}));
          return;
        }
        if(data[0].creatorId !== usrid){
          res.end(JSON.stringify({error: "you cannot modify this object"}));
          return;
        }
        //everything is fine, now trigger callback function
        cb();
      });
    });
  });
}

/**
* when the drawer clicks the create new project button, this function will be
* called, then an empty project will be inserted into db, res ends with pj id
* @param {object} drawerInfo the sid and ip of the drawer client to verify
* @param {object} res the response object to return with
**/
const createProject = function(drawerInfo, res){
  //locate info of the request send by sid and ip
  matchSession(drawerInfo.sid, drawerInfo.ip,(usrid) => {
    if(!usrid){
      res.end(JSON.stringify({error: "fail locating usr from cookie"}));
      return;
    }
    //verify if req is from a drawer
    dbcoll("accounts").find({_id: ObjectID(usrid)}).toArray((err, data) => {
      if(err){
        res.end(JSON.stringify({error: "fail on query with account collection"}));
        return;
      }
      //if no data is found
      if(data.length == 0){
        res.end(JSON.stringify({error: "usr is not located"}));
        return;
      }
      if(!data[0].verifiedDrawer){
        res.end(JSON.stringify({error: "you are not a drawer"}));
      }else {
        var toInsert = pjTemplate();
        toInsert.creatorId = usrid;
        dbcoll("project").insert(toInsert, (err,data)=>{
          if(err){
            res.end(JSON.stringify({error: "fail to insert project"}));
            return;
          }
          //if so, insert a pj into project collec, res ends w/ pj id &date
          res.end(JSON.stringify({
            error:null,
            pjid: data.ops[0]._id.toString(),
            addDate: toInsert.addDate})
          );
        });
      }
    });
  });
};

/**
* update the project infomation (only the text area)
* @param {object} drawerInfo contains the sid and ip to identify the drawer
* @param {string} pjid the project id
* @param {object} toSet the dic pass to the set //noimp: toSet validation, e.g. no set pledged!
* @param {object} res the response object to end with
**/
const updateProjectText = function(drawerInfo, pjid, toSet, res){
  verifyThenProjectCb(drawerInfo, pjid, res, () => {
    dbcoll("project").update({_id: ObjectID(pjid)}, {$set: toSet}, (err,data) => {
      if(data.nModified == 0){
        res.end(JSON.stringify({error: "fail to modify the project"}));
      }else{
        res.end(JSON.stringify({error: null, toSet, modDate: new Date().getTime()}));
      }
    });
  });
};

/**
* update the project picture and save the pic to static resource
* @param {object} drawerInfo contains the sid and ip to identify the drawer
* @param {string} pjid the project id
* @param {object} toIns the picture format, picture data and the file index //noimp: image file validation
* @param {object} res the response object to end with
**/
const updateProjectPicture = function(drawerInfo, pjid, toIns, res){
  verifyThenProjectCb(drawerInfo, pjid, res, () => {
    fs.writeFile("./client/html/samplePic/samplePic" + toIns.idx.toString() + pjid + "." + toIns.fmt,
      toIns.actData,
      'base64',
      function(err) {
        if(err){
          res.end(JSON.stringify({error: "fail to save the picture"}));
          return;
        }
        res.end(JSON.stringify({error: null}));
      });
  });
};

const updateProjectStatus = function(){

};

module.exports = {
  createProject,
  updateProjectText,
  updateProjectPicture
};
