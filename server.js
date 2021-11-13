const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const cons = require('consolidate');
const path = require('path');
const cors = require('cors');

app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(cors());

app.get('/', function (req, res) {
    res.render('index');
});

app.listen(port, function () {
    console.log('Our app is running on http://localhost:' + port);
});
