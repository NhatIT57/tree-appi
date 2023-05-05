const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv').config();

const routes = require('./routes');


const app = express();
try {
    mongoose.connect('mongodb+srv://vobao9898:0AyKs5H2GdNcSAGp@cluster0.j4yezcb.mongodb.net/data?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
} catch (error) {
    console.log(error.message())
}

app.use(cors())
app.use(express.json());
app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')))
app.use(routes);


app.listen(process.env.PORT || 80);



