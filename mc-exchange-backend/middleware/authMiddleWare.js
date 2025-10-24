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

export const adminProtectRoute = async (req, res, next) => {
        if (!req.user) {
                console.log('No auth provided');
                return res.status(401).json({ error: 'bad_request', details: 'No auth provided' });
        }

        const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', req.user.id).single();

        if (error || !data) {
                console.log(`Unable to find user`);
                return res.status(401).json({ error: 'bad_request', details: 'Unable to find user' });
        }

        if (data.role !== 'admin') {
                console.log('Unauthorized admin request');
                return res.status(401).json({ error: 'bad_request', details: 'Unauthorized' });
        }

        next();
};
