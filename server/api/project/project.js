const {emailRegEx} = require('../regex/regexSet.js');
require('../../mongo/config.js');//import dbcoll
const ObjectID = require('mongodb').ObjectID;
const {matchSession} = require('./../account/verification.js');

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
    sampleDir: {},
    productDir: {}
  };
  return ret;
};

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
          res.end(JSON.stringify({error:null, pjid: data.ops[0]._id.toString()}));
        });
      }
    });
  });

  //if so, insert a pj into project collec, res ends w/ pj id and create date
};

const updateProjectText = function(){

};

const updateProjectPicture = function(){

};

const updateProjectStatus = function(){

};

module.exports = {
  createProject
};
