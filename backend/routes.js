// backend/routes.js
const express = require('express');
const router = express.Router();

router.post('/register-arbiter', async (req, res) => {
  const { arbiterAddress } = req.body;

  try {
    const contract = await getContract();
    await contract.methods.registerArbiter().send({ from: arbiterAddress });
    res.status(200).send('Arbiter registered successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering arbiter');
  }
});

module.exports = router;
