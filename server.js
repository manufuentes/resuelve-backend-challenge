const express = require('express');
const salaryCalculator = require('./calcular_sueldos');

const app = express();
app.use(express.json());
 
app.post('/get_salaries', (req, res) => {
    const JSONObj = req.body;
    res.send(salaryCalculator.setSalaries(JSONObj));
});
 
app.post('/get_salaries_w_custom_throwput', (req, res) => {
    const JSONObj = req.body;
    res.send(salaryCalculator.setSalaries(JSONObj));
});

app.listen(3000)