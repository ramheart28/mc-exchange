import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabaseClient.js';

// User registration
router.post('/register', async (req, res) => {
        const { email, password, username } = req.body;
        const { data, error: signup_error } = await supabase.auth.signUp({ email, password });

        var username_err = typeof username === 'string' && username.trim() ? null : `username required`;
        if (username_err)
                if (error) return res.status(400).json({ error: username_err });



        if (signup_error) { return res.status(400).json({ error: signup_error.message }); }

        var insertData = { id: data.user.id, name: username };

        console.log(insertData);
        const { error } = await supabase.from('users').insert(insertData).select();

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
