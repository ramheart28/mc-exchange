import express from "express";
import { supabase } from "./config/supabaseClient.js";
import crypto from "crypto";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";


function normalizeItemId(name) {
        if (!name) return null;
        return String(name).toLowerCase().trim().replace(/\s+/g, '_');
}

function validatePayload(p) {
        const errors = [];
        const needInt = (v, k) => (Number.isInteger(v) ? null : `${k} must be integer`);
        const needStr = (v, k) => (typeof v === 'string' && v.trim() ? null : `${k} required`);

        // required fields
        [['player', needStr], ['raw', needStr], ['dimension', needStr]].forEach(([k, fn]) => {
                const e = fn(p[k], k); if (e) errors.push(e);
        });

        // numeric coords 
        ;['x', 'y', 'z'].forEach(k => { if (p[k] !== undefined) { const e = needInt(p[k], k); if (e) errors.push(e); } });

        // quantities
        ;['input_qty', 'output_qty'].forEach(k => {
                const v = p[k];
                if (!(Number.isInteger(v) && v >= 0)) errors.push(`${k} must be integer >= 0`);
        });

        // items
        if (!p.input_item_id) errors.push('input_item_id required');
        if (!p.output_item_id) errors.push('output_item_id required');

        // exchange_possible (nullable allowed) - note: chat relay sends this field name
        if (p.exchange_possible !== null && p.exchange_possible !== undefined) {
                if (!Number.isInteger(p.exchange_possible) || p.exchange_possible < 0)
                        errors.push('exchange_possible must be integer >= 0 or null');
        }

        return errors;
}

function makeBlockHash(player, raw) {
        // dedupe by player + epoch minute + exact block text
        const minute = Math.floor(Date.now() / 60000);
        return crypto.createHash('sha1').update(`${player}|${minute}|${raw}`).digest('hex');
}

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));

import { router as owner_router } from "./routes/owner.routes.js";
import { router as admin_router } from "./routes/admin.routes.js";
app.use("/owner", owner_router);
app.use("/admin", admin_router);

// simple hash for deduplication
function makeHash(raw) {
        const minute = Math.floor(Date.now() / 60000);
        return crypto.createHash("sha1").update(`${raw}|${minute}`).digest("hex");
}

// POST /api/exchanges — endpoint for chat relay
app.post('/api/exchanges', async (req, res) => {
        try {
                const b = req.body || {};

                // DEBUG: Log the incoming request body
                console.log('Received exchange data:', JSON.stringify(b, null, 2));
                // Convert dimension from minecraft namespace to simple name
                if (b.dimension === 'minecraft:overworld') {
                        b.dimension = 'overworld';
                } else if (b.dimension === 'minecraft:the_nether') {
                        b.dimension = 'nether';
                } else if (b.dimension === 'minecraft:the_end') {
                        b.dimension = 'end';
                } else if (b.dimension && b.dimension.startsWith('minecraft:')) {
                        // Remove minecraft: prefix for any other dimensions
                        b.dimension = b.dimension.replace('minecraft:', '');
                }


                b.input_item_id = normalizeItemId(b.input_item_id);
                b.output_item_id = normalizeItemId(b.output_item_id);

                b.compacted_input = Boolean(b.compacted_input);
                b.compacted_output = Boolean(b.compacted_output);

                // validate
                const errs = validatePayload(b);
                if (errs.length) {
                        console.log('Validation errors:', errs);
                        return res.status(400).json({ error: 'bad_request', details: errs });
                }

                const { data: shop_data, error: shop_find_error } = await supabase.rpc('find_shop_in_bounds', {
                        px: b.x,
                        py: b.y,
                        pz: b.z
                }).single();

                let shop_id = null;
                if (!find_shop_error) {
                        shop_id = shop_data.id;
                }

                // build dedupe hash from the full block
                const hash_id = makeBlockHash(b.player, String(b.raw).replace(/\r\n/g, '\n'));

                console.log('Generated hash_id:', hash_id);

                // write (UPSERT on hash_id)
                const insertData = {
                        ts: new Date().toISOString(),
                        player: b.player,
                        x: b.x, y: b.y, z: b.z,
                        dimension: b.dimension,
                        loc_src: 'manual',
                        input_item_id: b.input_item_id,
                        input_qty: b.input_qty,
                        output_item_id: b.output_item_id,
                        output_qty: b.output_qty,
                        exchange_possible: (b.exchange_possible ?? null),
                        compacted_input: b.compacted_input,
                        compacted_output: b.compacted_output,
                        raw: b.raw,
                        shop: shop_id,
                        hash_id
                };

                console.log('Attempting to insert:', JSON.stringify(insertData, null, 2));

                const { error } = await supabase
                        .from('shop_events')
                        .upsert(insertData, { onConflict: 'hash_id' })
                        .select();

                if (error) {
                        console.log('Database error:', error);
                        return res.status(500).json({ error: 'db_error', details: error.message });
                }

                console.log('Successfully inserted exchange data with hash_id:', hash_id);

                return res.status(201).json({ ok: true, hash_id });
        } catch (e) {
                console.error('ingest error', e);
                return res.status(500).json({ error: 'server_error' });
        }
});

// GET /export.csv → export data
app.get("/export.csv", async (_, res) => {
        const { data, error } = await supabase
                .from("shop_events")
                .select("*")
                .order("ts", { ascending: false });

        if (error) return res.status(500).send(error.message);

        const csv = [
                Object.keys(data[0] || {}).join(","),
                ...data.map(row =>
                        Object.values(row)
                                .map(v => (v === null ? "" : `"${String(v).replace(/"/g, '""')}"`))
                                .join(",")
                ),
        ].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=shop_events.csv");
        res.send(csv);
});

app.listen(process.env.PORT || 5000, () => console.log("Backend running on port", process.env.PORT || 5000));
export default app;
