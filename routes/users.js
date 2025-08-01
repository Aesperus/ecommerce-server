const express = require('express');
const router = express.Router();

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    res.send(`Get user with ID: ${userId}`);
})

router.put('/:userId', async (req, res) => {
    const { userId } = req.params;
    const userData = req.body;
    res.send(`Update user with ID: ${userId} with data: ${JSON.stringify(userData)}`);
})

module.exports = router;