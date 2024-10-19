// backend/index.js
const express = require('express');
const app = express();
app.use(express.json());

app.post('/register-arbiter', (req, res) => {
    const { arbiterAddress } = req.body;
    res.send('Arbiter registered');
});

app.listen(3000, () => {
    console.log('Backend listening on port 3000');
});
