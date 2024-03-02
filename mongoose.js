const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/budgetDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const budgetEntrySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: props => `${props.value} is not a valid hexadecimal color code!`
    }
  }
});

const BudgetEntry = mongoose.model('BudgetEntry', budgetEntrySchema);

// Endpoint to fetch budget data from the database
app.get('/budget', async (req, res) => {
  try {
    const budgetData = await BudgetEntry.find();
    res.json(budgetData);
  } catch (error) {
    console.error(`Error fetching budget data: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to add new budget data
app.post('/budget', async (req, res) => {
  try {
    const { title, value, color } = req.body;
    const newBudgetEntry = new BudgetEntry({ title, value, color });
    await newBudgetEntry.save();
    res.status(201).json(newBudgetEntry);
  } catch (error) {
    console.error(`Error adding budget data: ${error.message}`);
    res.status(400).json({ error: 'Bad Request' });
  }
});

app.listen(port, () => {
  console.log(`API served at http://localhost:${port}`);
});
