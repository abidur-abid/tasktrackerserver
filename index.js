// Import necessary packages
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
let db;

const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
    db = client.db();
  })
  .catch(err => console.error('Error connecting to MongoDB', err));

  //main router
  app.get('/', (req,res) => {
    res.send('Server is Running');
  })

// Routes
// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await db.collection('tasks').find({}).toArray();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a specific task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await db.collection('tasks').findOne({ _id: new ObjectId(req.params.id) });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a task
app.post('/api/tasks', async (req, res) => {
  const { title, description, deadline, priority } = req.body;
  if (!title || !description || !deadline || !priority) { // Corrected the validation check here
    return res.status(400).json({ message: 'Please provide title, description, deadline, and priority' });
  }
  const newTask = { title, description, deadline, priority };

  try {
    const result = await db.collection('tasks').insertOne(newTask);
    newTask._id = result.insertedId;
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update a task
app.put('/api/tasks/:id', async (req, res) => {
    
    const { title, description, deadline, priority } = req.body;
    if (!title && !description && !deadline && !priority) {
      return res.status(400).json({ message: 'Please provide title, description, deadline, and priority for update' });
    }
  
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (deadline) updateFields.deadline = deadline; // Corrected assignment to deadline
    if (priority) updateFields.priority = priority; // Corrected assignment to priority
  
    try {
      const result = await db.collection('tasks').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: updateFields }
      );
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json({ message: 'Task updated' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });


// DELETE a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const result = await db.collection('tasks').deleteOne({ _id: new ObjectId(req.params.id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json({ message: 'Task deleted' });
    } catch (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });
  
  

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
