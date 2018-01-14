const HashTable = require('hashtable');
const {emailRegEx} = require('../regex/regexSet.js');
const {dbfind} = require('../../mongo/config.js');
const sendmail = require('sendmail')();
var usrTable = new HashTable(); //session table

/**
* match sid and ip in usrTable
* @param {string} sid the session id from cookie
* @param {string} ip the x-forward from http request header
* @return {boolean} if the sid and ip matches
*/
const matchSession = function(id, ip){
  //see if id is in table
  //if it is in, check ip
}

/**
* Sign the user in with post data
* @param {object} signReqData contains the email, hashed psw
* @param {object} res is the response object directed from server
*/
const signUserIn = function(signReqData, res){
  //connect to account db, see if usr name is there
  dbfind("accounts",{email: signReqData.email}, (err,data) => {
    if(err){
      console.log(err)
      res.end(JSON.stringify({error: "fail on query email"}));
      return;
    }


  })
  //if the usr name is there, matching the psw (hashed)
  //if psw matched, repeating generate random number (32-nary, in str) until:
    //no matching key in usrTable
    //the matching key is added more than 3 months ago
  //add the random number to usrTable as key, noting IP and date, res end
  res.end();
};

/**
* register the user to db, and the send the verification email
* @param {object} regReqData contains the email, hashed psw, and name
* @param {object} res is the response object directed from server
*/
const registerUser = function(regReqData, res){
  //see if email is good
  if(!emailRegEx.test(regReqData.email)){
    res.end(JSON.stringify({error:"email not fit into requirement"}));
    return;
  }
  //see if already an email associated with it
  dbfind("accounts",{email: regReqData.email},(err,data) => {
    if(data.length == 0 /* no email associated*/){
      //add the account to db, set verify to false, send the email
      if(err){
        console.log(err)
        res.end(JSON.stringify({error: "fail on query email"}));
        return;
      }


      dbinsert("accounts",{
        email: regReqData.email,
        psw: regReqData.psw,
        date: new Date().getTime(),
        payment: null, spent: 0, share: 0.3, earn: 0, verifiedCust: false,
        verifiedDrawer: false, verifiedAdmin: false, chargement: null
      }, (err,data)=>{
        if(err){
          res.end({error: JSON.stringify(err)});
          return;
        }
        //data.ops[0] is what inserted
        //append _id to vericodedb, the vericodedb _id is the code
        dbinsert("vericodes",{accountid: data.ops[0].id},(err, data) => {
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
* @param {string} id _id from accounts db or session table
* @param {string} option "session" or "db"
* @param {function} cb callback passed to mongodb query
*/
const getUsrInfo = function(id, option, cb){
  //if option is db

  //if option is session
  //unknow option, res end with error
};

const userProjectRelation = function(){

};



module.exports = {
  signUserIn,
  getUsrInfo,
  userProjectRelation,
  registerUser
};
