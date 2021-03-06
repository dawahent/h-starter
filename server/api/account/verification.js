const HashTable = require('hashtable');
const {emailRegEx} = require('../regex/regexSet.js');
require('../../mongo/config.js');//import dbcoll
const sendmail = require('sendmail')();
const ObjectID = require('mongodb').ObjectID;
var usrTable = new HashTable();


//one very important thing, xxreqData should already be type of object
//before passing in as parameter. The function will not check it

/**
* match sid and ip in usrTable
* @param {string} sid the session id from cookie
* @param {string} ip the x-forward from http request header
* @param {function} cb the callback to pass with usrid or null
*/
const matchSessionInVerification = function(sid, ip, cb){
  //see if sid is in table
  var query = usrTable.get(sid);
  if(!query){
    cb(null);
  }else{
    if(g3monago(query.addDate)){
      usrTable.remove(sid);
      cb(null);
    }else{
      if(query.ip !== ip){
        cb(null);
      }else{
        cb(query.usrid);
      }
    }
  }
};

/**
* see if the specified time is more than 3 months from now
* @param {number} dt the specified date time
* @return {boolean} if dt is 3 months from now
*/
const g3monago =function(dt){
  return ((new Date().getTime()) - dt) > 7.776e+9;
}

/**
* Sign the user in with post data
* @param {object} signReqData contains the email, hashed psw
* @param {object} res is the response object directed from server
*/
const signUserIn = function(signReqData, res){
  //see if signReqData is completed
  if(!signReqData.email || !signReqData.psw || !signReqData.ip){
    res.end(JSON.stringify({error:"data not completed"}));
    return;
  }
  //see if signinusrname is valid email log_format
  if(!emailRegEx.test(signReqData.email)){
    res.end(JSON.stringify({error:"email not fit into requirement"}));
    return;
  }
  //connect to account db, see if usr name is there
  dbcoll("accounts").find({email: signReqData.email, psw: signReqData.psw}).toArray((err,data) => {
    if(err){
      console.log(err)
      res.end(JSON.stringify({error: "fail on query email"}));
      return;
    }
    if(data.length != 0){
      //if the usr name and psw matches, see if it is verifiedCust
      if(!data[0].verifiedCust){
        res.end(JSON.stringify({error: "account not verified"}));
        return;
      }
      var tempRand = (Math.random() * 1e18).toString(36);
      while(usrTable.get(tempRand)){
        tempRand = (Math.random() * 1e18).toString(36);
      }
      usrTable.put(tempRand, {
        ip: signReqData.ip,
        usrid: data[0]._id.toString(),
        addDate: new Date().getTime()
      });
      res.end(JSON.stringify({
        error: null,
        sid: tempRand,
        ifDrawer: data[0].verifiedDrawer
      }));
      return;

    }else{
      //this email is not registered or password is wrong
      res.end(JSON.stringify({error: "account not exist or password does not match"}));
      return;
    }

  })
};

/**
* register the user to db, and the send the verification email
* @param {object} regReqData contains the email, hashed psw, and name
* @param {object} res is the response object directed from server
*/
const registerUser = function(regReqData, res){
  //see if regReqData comes with email and psw
  if(!regReqData.email || !regReqData.psw){
    res.end(JSON.stringify({error:"data not completed"}));
    return;
  }
  //see if email is good
  if(!emailRegEx.test(regReqData.email)){
    res.end(JSON.stringify({error:"email not fit into requirement"}));
    return;
  }
  //see if already an email associated with it
  dbcoll("accounts").find({email: regReqData.email}).toArray((err,data) => {
    if(err){
      console.log(err)
      res.end(JSON.stringify({error: "fail on query email"}));
      return;
    }
    if(data.length == 0 /* no email associated*/){
      //add the account to db, set verify to false, send the email
      dbcoll("accounts").insert({
        email: regReqData.email,
        psw: regReqData.psw,
        date: new Date().getTime(),
        //spent: money that are charged for finished product
        //earn: money already transferred to this drawer
        payment: null, spent: 0, share: 0.3, earn: 0, verifiedCust: false,
        verifiedDrawer: false, verifiedAdmin: false, chargement: null
      }, (err,data)=>{
        if(err){
          res.end({error: JSON.stringify(err)});
          return;
        }
        //data.ops[0] is what inserted
        //append _id to vericodedb, the vericodedb _id is the code
        dbcoll("vericodes").insert({accountid: data.ops[0]._id},(err, data) => {
          if(err){
            console.log(err)
            res.end(JSON.stringify({error: "fail on retriving vericode"}));
            //db remove
            return;
          }
          //send out the code
          console.log(data.ops[0]._id.toString());
          let temp = {
            to: regReqData.email,
            from: "no-reply@x-starter.com",
            subject: "Verify Your Registration on X-starter",
            html: data.ops[0]._id.toString()
          };
          sendmail(temp, (err,data) => {
            if(err){
              console.log(err);
              res.end(JSON.stringify({error: "fail to send verification code"}));
              return;
            }
            res.end(JSON.stringify({error: null, email: regReqData.email}));
          })

        })
      })
    }else{
      //found an account registered with such email
      res.end(JSON.stringify({error: "this email has already been registered"}));
    }
  })
};

/**
* get the usr info from account db _id or session id
*/
const userProjectRelation = function(){
  console.log("noimp")
};

/**
* directly facing frontend to fetch usr info according to posted frontend
* cookies and what they want
* @param {object} reqData the posted cookie
* @param {object} res the response to end
*/
const userResp = function(reqData, res){
  //check want of reqData
  //usr priviliege
  //usr relation with certain pj
  //usr pleges
  //drawer's earning
  if(!reqData.want){
    res.end(JSON.stringify({error:"data not completed"}));
    return;
  }
  if(!reqData.sid || !reqData.ip){
    res.end(JSON.stringify({error:"data not completed"}));
    return;
  }
  //see if id and ip matched in usrTable
  let usrid = matchSession(reqData.sid, reqData.ip, (usrid) => {
    //usrid null -> not log in
      //if want is if log in, tell them no
      //if other want that require user to log in, res ends with error

    //wants that don't require log in
    if(reqData.want === "if log in"){
      res.end(JSON.stringify({error:null, ifLogin: !!usrid}));
      return;
    }

    //noimp: "project relation", null user will be treated as guest


    //this part will end with error to tell the client the usr is not log in
    if(!usrid){
      res.end(JSON.stringify({error: "user not log in"}));
      return;
    }
    //wants that require usr to log in
    if(reqData.want === "usr priviliege"){
      dbcoll("accounts").find({_id: ObjectID(usrid)}).toArray((err,data) => {
        res.end(JSON.stringify({error:null, ifDrawer: data[0].verifiedDrawer}));
      });
      return;
    }
    if(reqData.want === "pleges"){
      res.end(JSON.stringify({error:"noimp"}));
      return;
    }
    if(reqData.want === "earn"){
      dbcoll("accounts").find({_id: ObjectID(usrid)}).toArray((err,data) => {
        res.end(JSON.stringify({error:null, earn: data[0].earn}));
      });
      return;
    }
    if(reqData.want === "spent"){
      dbcoll("accounts").find({_id: ObjectID(usrid)}).toArray((err,data) => {
        res.end(JSON.stringify({error:null, spent: data[0].spent}));
      });
      return;
    }
    //no matched values from the if statements, server can't tell what want
    res.end(JSON.stringify({error:"want is with unhandled value"}));
    return;
  });
}

/**
* verify customer by the code they provide
* @param {string} code the verification code
* @param {object} res the response to end
**/
const verifyCust = function(code, res){
  dbcoll("vericodes").find({_id: ObjectID(code)}).toArray((err,data) => {
    if(data.length == 0){
      res.end(JSON.stringify({error:"Verification Code not available"}));
      return;
    }
    dbcoll("accounts").update(
      {_id: ObjectID(data[0].accountid)}, {$set : {verifiedCust: true}},
      (err,data) => {
        if(err){
          res.end(JSON.stringify({error:"cannot modify status of the user"}));
          return;
        }
        res.end(JSON.stringify({error:null}));
        return;
      }
    )
  });
}

module.exports = {
  signUserIn,
  registerUser,
  userResp,
  verifyCust,
  matchSessionInVerification
};
