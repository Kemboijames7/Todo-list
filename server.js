const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const PORT = 3000;
require('dotenv').config();
const { ObjectId } = require('mongodb');
const objectIdFromTime = ObjectId.createFromTime(Date.now() / 1000);

// const { ObjectId } = require('mongodb');


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

// app.get('/test', (req, res) => {
//     res.send('This is a test route!');
// });


app.get('/', async (request, response) => {
    try {
     
        const todoItems = await db.collection('todos')
        .find()
        .sort({ likes: -1 })
        .toArray();
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
        { $inc: { likes: 1 } },
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


app.put('/disItem', (request, response) => {
    db.collection('todos').updateOne(
        { thing: request.body.itemFromJS },
        { $inc: { dis: 1 } },  // Increment 'dis' by 1
        { upsert: false }
    )
    .then(result => {
        console.log('Dis added:');
        response.json('Dis added');
    })
    .catch(error => {
        console.error('Error Disliking todo:', error);
        response.status(500).send('Error Disliking todo');
    });
});


 
app.put('/updateTodo', (req, res) => {
    const itemId = req.body.id;
    const newTodoText = req.body.newText;

    console.log('Received request to update todo with ID:', itemId);
    console.log('New text:', newTodoText);

    // Validate the ObjectId
    if (!ObjectId.isValid(itemId)) {
        console.log('Invalid ID:', itemId);
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    // Convert itemId to ObjectId
    const objectId = new ObjectId (itemId);

    // First check if the todo exists
    db.collection('todos')
        .findOne({ _id: objectId })
        .then(todo => {
            if (!todo) {
                console.log('Todo not found for ID:', itemId);
                return res.status(404).json({ error: 'Todo not found' });
            }

            // Proceed to update the todo if it exists
            return db.collection('todos')
                .findOneAndUpdate(
                    { _id: objectId },
                    { $set: { thing: newTodoText.trim() } },
                    { returnDocument: 'after' }
                );
        })
        .then(result => {
            if (result) {
                console.log('Todo Updated Successfully:', result);
                res.json({ message: 'Success', updatedTodo: result });
            } else {
                console.log('Update failed for ID:', itemId, 'Full Result:', result);
                res.status(500).json({ error: 'Update failed for unknown reasons' });
            }
        })
        .catch(error => {
            console.error('Error updating todo:', error);
            res.status(500).json({ error: 'Error updating todo' });
        });
});



app.put('/toggleComplete', (request, response) => {
    const itemId = request.body.itemId;
    const completedStatus = request.body.completed;

    db.collection('todos').updateOne(
        { _id: new ObjectId(itemId) },
        { $set: { completed: completedStatus } }
    )
    .then(result => {
        console.log('Todo updated');
        response.json({ completed: completedStatus });
    })
    .catch(error => {
        console.error(error);
        response.status(500).send('Error updating todo');
    });
});




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

app.put('/update-progress/:id', async (req, res) => {
    try {
        // Extract itemId and newProgress from request
        const itemId = req.params.id;
        const newProgress = req.body.progress;

        console.log('Full Request URL:', req.originalUrl);
        console.log('Received itemId (from params):', itemId);
        console.log('Received newProgress (from body):', newProgress);

        // Validate the ObjectId
        if (!ObjectId.isValid(itemId)) {
            console.log('Invalid ID:', itemId);
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // Convert itemId to ObjectId
        const objectId = new ObjectId(itemId);

          // Debug: Check if the item exists in the database
          const item = await db.collection('todos').findOne({ _id: objectId });
          console.log('Item found before update:', item);
  
          if (!item) {
              console.log('Item not found for ID:', itemId);
              return res.status(404).json({ success: false, message: 'Item not found' });
          }

        // Update the item in the database
        const result = await db.collection('todos').findOneAndUpdate(
            { _id: objectId },
            { $set: { progress: newProgress } },
            { returnDocument: 'after' }
        );
 
        // Check if the item was found and updated
        if (result.value) {
            console.log('Item updated successfully:', result.value);
            res.status(200).json({ success: true, item: result.value });
        } else {
            console.log('Item not found for ID:', itemId);
            res.status(404).json({ success: false, message: 'Item not found' });
        }
    } catch (error) {
        console.error("Error in the route:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
