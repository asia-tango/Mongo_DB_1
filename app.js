const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'trainincenter';/////local_1

// Use connect method to connect to the server
MongoClient.connect(url, { useUnifiedTopology: true}, async function(err, client) {
    const db = client.db(dbName);
    const users = db.collection('users');
    const articles = db.collection('articles');
    const students = db.collection("students");

    //import students

    //agrigating (write a query that group students...)

    console.log('works :)');

    client.close();
});
