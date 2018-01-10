const MongoClient = require('mongodb').MongoClient;
const md5 = require('md5');
const url = 'mongodb://localhost:27017';
const dbName = 'hstarter';

MongoClient.connect(url, function(err, client) {
  console.log("Connected successfully to server");

  const db = client.db(dbName);
  const collection = db.collection('accounts');

  collection.insert({
      email: "naminoqiu@gmail.com",
      psw: md5("Dish16458!"),
      date: new Date().getTime(),
      spent: 0,
      share: 1,
      earn: 0, //how much the website has paid him/her
      payment: null,
      chargement: null,
      verifiedCust: true,
      verifiedDrawer: true,
      verifiedAdmin: true,
      getting:0 //how much the website is gonna pay him/her
  },function(err,data){
    console.log(err);
  });
  client.close();
});
