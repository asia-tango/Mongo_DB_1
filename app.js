const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'local_1';

// Use connect method to connect to the server
MongoClient.connect(url, { useUnifiedTopology: true}, async function(err, client) {
    const db = client.db(dbName);
    const users = db.collection('users');
    const articles = db.collection('articles');
    const students = db.collection("students");

    console.log('works :)');

    //-------------------------------USERS----------------------------------


    //------------------------------ARTICLES----------------------------------

    // - Create 5 articles per each type (a, b, c)
    db.getCollection('articles').insertMany([   
        {
          name:  'Mongodb - introduction',
          description: 'Mongodb - text',
          type: 'a',
          tags: []
         },
         {
          name:  'Mongodb - introduction',
          description: 'Mongodb - text',
          type: 'a',
          tags: []
         },
         {
          name:  'Mongodb - introduction',
          description: 'Mongodb - text',
          type: 'a',
          tags: []
         },
         {
          name:  'Mongodb - introduction',
          description: 'Mongodb - text',
          type: 'b',
          tags: []
          },
          {
          name:  'Mongodb - introduction',
          description: 'Mongodb - text',
          type: 'b',
          tags: []
          },
          {
          name:  'Mongodb - introduction',
          description: 'Mongodb - text',
          type: 'b',
          tags: []
          },
          {
           name:  'Mongodb - introduction',
          description: 'Mongodb - text',
          type: 'c',
          tags: []
          },
          {
           name:  'Mongodb - introduction',
          description: 'Mongodb - text',
          type: 'c',
          tags: []
          },
          {
           name:  'Mongodb - introduction',
          description: 'Mongodb - text',
          type: 'c',
          tags: []
          }
    ])

    // - Find articles with type a, and update tag list with next value [‘tag1-a’, ‘tag2-a’, ‘tag3’]
    db.getCollection('articles').updateMany(
        {type: 'a'},
        {$push: {
            tags: { $each: [ 'tag1-a', 'tag2-a', 'tag3-a', ] } 
         }
    })

    // - Add tags [‘tag2’, ‘tag3’, ‘super’] to other articles except articles from type a
    db.getCollection('articles').updateMany(
        {type: {$ne: 'a'} },
        {$push: {
            tags: { $each: [ 'tag2', 'tag3', 'super', ] } 
         }
    })

    // - Find all articles that contains tags [tag2, tag1-a]
    db.getCollection('articles').find(
        {tags: { $in: ['tag2', 'tag1-a'] }}
    )

    // - Pull [tag2, tag1-a] from all articles
    db.getCollection('articles').updateMany(
        {},
        { $pull: {tags: { $in: [ 'tag1-a', 'tag2'] }}    }
    )


    //------------------------------STUDENTS----------------------------------

    const result = array => {
        array.forEach((val) => {
          console.log(val)
        })
    };

    //Find all students who have the worst score for homework, sort by descent
    const scoresByDescent = await students
        .find()
        .sort({ 'scores.2.score': -1 })
        .toArray();
    result(scoresByDescent);

    // - Find all students who have the best score for quiz and the worst for homework, sort by ascending
    const scoresByAscend = await students
        .find({
            'scores.1.score': { $gt: 50 }, 
            'scores.2.score': { $lt: 20 }
        })
        .sort({ 
            'scores.1': 1,
            'scores.2': 1
        })
        .toArray();
        result(scoresByAscend);

    // - Find all students who have best score for quiz and exam
    const bestByScoreAndExam = await students
    .find({
        'scores.0.score': { $gt: 71 }, 
        'scores.1.score': { $gt: 71 }
    })
    .toArray();
    result(bestByScoreAndExam);

    // - Calculate the average score for homework for all students
    const averageScore = await students
    .aggregate([
        { $unwind: '$scores' },
        { $match: { 'scores.type': 'homework' } },
        { $group: {
            _id: 'Average Score',
            average: { $avg: '$scores.score' }
            }
        }
    ])
    .toArray();
    result(averageScore);

    // - Delete all students that have homework score <= 60
    const deleteStudents = await students
    .deleteMany({
        'scores.2.type': 'homework',
        'scores.2.score': { $lte: 60 }
    })
    .toArray();
    result(deleteStudents);

    // - Mark students that have quiz score => 80
    const markStudents = await students
    .updateMany(
        { 'scores.1.score': { $gte: 80 } 
        },
        { $set: 
            { 'excellentStudents' : true } 
        }
    )
    .toArray();
    result(markStudents);

    // - Write a query that group students by 3 categories (calculate the average grade for three subjects)
    //   - a => (between 0 and 40)
    //   - b => (between 40 and 60)
    //   - c => (between 60 and 100)
    const studentsCategory = await students
    .aggregate([
        { $unwind: 
            { path: '$scores' } 
        },
        { $group: {
            _id: '$_id',
            averageScores : { $avg: '$scores.score' },
            name: { $first: '$name' }
            }
        },
        { $project: {
            name: true,
            averageScores: true,
            groupStudents: { $switch: {
                branches: [
                    { case: { $lt: ['$averageScores', 40] }, then: 'a' },
                    { case: { $gt: ['$averageScores', 60] }, then: 'b' },
                ],
                default: 'c'
                }
            }
          }
        },
        { $group: { 
            _id: '$groupStudents', 
            studentsOfGroup: { 
                $push: '$name' } 
            } 
        }
    ]);
    result(studentsCategory);

    client.close();
});

