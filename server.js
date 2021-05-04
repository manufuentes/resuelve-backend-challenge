const express = require('express');
const salaryCalculator = require('./calcular_sueldos');
const { body, validationResult } = require('express-validator');

const app = express();

let config = require('./config.json');

app.use(express.json());
 
app.post('/get_salaries',
    body('jugadores').isArray({ min: 1 }),
    (req, res) => {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const JSONObj = req.body;
            const salaries = salaryCalculator.setSalaries(JSONObj, config);
            return res.status(200).send(salaries);
        }
        catch(err) { return res.status(501).send(err); } 
});
 
app.get('/reset_config', (req, res) => {
    try { 
        config = require('./config.json'); 
        return res.status(200).send(config);
    }
    catch(err) { return res.status(501).send(err); } 
});

app.get('/config', (req, res) => res.status(200).send(config));
app.post('/config',
    body('equipos').isArray({ min: 1 }),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try{
            config = req.body; 
            return res.status(200).send({"success": true}); 
        }
        catch(err) { return res.status(501).send(err); }
    }
);


app.listen(3000)