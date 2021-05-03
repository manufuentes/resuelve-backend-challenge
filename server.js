const express = require('express');
const salaryCalculator = require('./calcular_sueldos');

const app = express();

let config = require('./config.json');

app.use(express.json());
 
app.post('/get_salaries', (req, res) => {
    const JSONObj = req.body;
    res.send(salaryCalculator.setSalaries(JSONObj, config));
});
 
// TODO: IMPLEMENTAR JSON VERIFY
app.get('/reset_config', (req, res) => {
    config = require('./config.json');
    res.send('ok');
});

app.get('/config', (req, res) => res.send(config));
app.post('/config', (req, res) => {
    config = req.body;
    res.send('ok');
});


app.listen(3000)