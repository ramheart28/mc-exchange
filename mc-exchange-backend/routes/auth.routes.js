const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabaseClient.js');

// User registration
router.post('/register', async (req, res) => {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json({ message: 'User registered successfully', user: data.user });
});

// User login
router.post('/login', async (req, res) => {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) return res.status(401).json({ error: error.message });
        res.status(200).json({ message: 'Logged in successfully', session: data.session });
});

export { router };
