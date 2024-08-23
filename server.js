const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const PORT = 3000;
require('dotenv').config();


let uri = process.env.DATABASE_URL

let db; // Define db globally

(async () => {
    try {
        const client = new MongoClient(uri);
        await client.connect();
        db = client.db('todos');
        console.log(`Connected to ${db.databaseName} database`);

        // Start the server only after the database connection is established
        app.listen(process.env.PORT || PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    }
})();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/test', (req, res) => {
    res.send('This is a test route!');
});


app.get('/', async (request, response) => {
    try {
     
        const todoItems = await db.collection('todos').find().toArray();
        const itemsLeft = await db.collection('todos').countDocuments({ completed: false });
        response.render('index.ejs', { items: todoItems, left: itemsLeft });
       
    } catch (error) {
        console.error(error);
        response.status(500).send('Error retrieving todos');
    }
});

app.post('/addTodo', (request, response) => {
    db.collection('todos').insertOne({ thing: request.body.todoItem, completed: false, likes: 0})
        .then(result => {
            console.log('Todo Added');
            response.redirect('/');
        })
        .catch(error => {
            console.error(error);
            response.status(500).send('Error adding todo');
        });
});


app.put('/likedItem', (request, response) => {
    db.collection('todos').updateOne(
        { thing: request.body.itemFromJS },
        { $set: { likes: request.body.likesS + 1 } },
        { upsert: false }
    )
    .then(result => {
        console.log('Like Added');
        response.json('Like added');
    })
    .catch(error => {
        console.error(error);
        response.status(500).send('Error liking todo');
    });
});





app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne(
        { thing: request.body.itemFromJS },
        {
            $set: {
                completed: true  // Mark the item as completed
            }
        },
        {
            sort: { _id: -1 },
            upsert: false
        }
    )
    .then(result => {
        console.log('Marked Complete');
        response.json('Marked Complete');
    })
    .catch(error => {
        console.error(error);
        response.status(500).send('Error marking complete');
    });
});

// app.put('/markUnComplete', (request, response) => {
//     db.collection('todos').updateOne({ thing: request.body.itemFromJS }, {
//         $set: {
//             completed: false
//         }
//     }, {
//         sort: { _id: -1 },
//         upsert: false
//     })
//         .then(result => {
//             console.log('Marked Uncomplete');
//             response.json('Marked Uncomplete');
//         })
//         .catch(error => {
//             console.error(error);
//             response.status(500).send('Error marking uncomplete');
//         });
// });

app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({ thing: request.body.itemFromJS })
        .then(result => {
            console.log('Todo Deleted');
            response.json('Todo Deleted');
        })
        .catch(error => {
            console.error(error);
            response.status(500).send('Error deleting todo');
        });
});
