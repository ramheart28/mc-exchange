import express from "express";
import { supabase } from "../config/supabaseClient.js"

const router = express.Router();
router.use(express.json())

function validatePayload(p) {
  const errors = [];
  const needInt = (v, k) => (Number.isInteger(v) ? null : `${k} must be integer`);
  const needStr = (v, k) => (typeof v === 'string' && v.trim() ? null : `${k} required`);

  // required feilds
  [['name', needStr], ['author', needStr], ['owner', needStr], ['dimension', needStr]].forEach(([k, fn]) => {
    const e = fn(p[k], k); if (e) errors.push(e);
  });

  if (p['bounds'] && Array.isArray(p['bounds'])) {
    let bounds = p['bounds'];

    for (let i = 0; i < bounds.length; i++) {
      // numeric coords 
      ;['min_x', 'min_y', 'min_z',
        'max_x', 'max_y', 'max_z'].forEach(k => {
          if (bounds[i][k] !== undefined) {
            const e = needInt(bounds[i][k], k); if (e) errors.push(e);
          }
        });
    }
  }
  else {
    errors.push("bounds must be array");
  }
  return errors;
}

router.post("/createShop", async (req, res) => {
  try {
    let b = req.body || {};

    const errs = validatePayload(b);
    if (errs.length) {
      console.log('Validation errors:', errs);
      return res.status(400).json({ error: 'bad_request', details: errs });
    }

    let bounds = new Array();
    for (let i = 0; i < b.bounds.length; i++) {
      bounds[i] = {
        min_x: b.bounds[i].min_x, min_y: b.bounds[i].min_y, min_z: b.bounds[i].min_z,
        max_x: b.bounds[i].max_x, max_y: b.bounds[i].max_y, max_z: b.bounds[i].max_z
      }
    }

    const insertData = {
      name: b.name,
      author: b.author,
      owner: b.owner,
      dimension: b.dimension,
      bounds: JSON.stringify(bounds)
    }

    console.log('Attempting to insert:', JSON.stringify(insertData, null, 2));

    const { error } = await supabase
      .from('shops')
      .upsert(insertData, { onConflict: 'name' })
      .select();

    if (error) {
      console.log('Database error:', error);
      return res.status(500).json({ error: 'db_error', details: error.message });
    }

    console.log('Successfully inserted exchange data with name:', b.name);

    return res.status(201).json({ ok: true, hash_id });

  } catch (e) {
    console.error('ingest error', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

router.get("/shops", (req, res) => {

});

export { router };
