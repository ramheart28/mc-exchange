import { supabase } from '../config/supabaseClient.js';

export const protectRoute = async (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token

        if (!token) {
                return res.status(401).json({ message: 'No authorization token provided' });
        }

        const { data: { user }, signupError: error } = await supabase.auth.getUser(token);

        if (error || !user) {
                return res.status(401).json({ message: 'Invalid or expired token' });
        }

        req.user = user;
        next();
};

