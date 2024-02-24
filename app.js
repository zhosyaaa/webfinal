const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const routes = require('./routes/routes');
const cookieParser = require('cookie-parser');

const fs = require('fs');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use('/uploads', express.static('uploads'));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

mongoose.connect("mongodb+srv://zhosya:zhosya@cluster0.gkkghab.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.on("connected", () => {
  console.log("Mongo db established");
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));



function loadTranslation(language) {
  const translation = fs.readFileSync(`languages/${language}.json`);
  return JSON.parse(translation);
}
app.use((req, res, next) => {
  const language =  req.query.lang  || 'en';
  const translation = loadTranslation(language);
  req.session.language = language; 
  res.locals.translation = translation;
  res.locals.currentLanguage = language;
  next();
});

app.use('/', routes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
