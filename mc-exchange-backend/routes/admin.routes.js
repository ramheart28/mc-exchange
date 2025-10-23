import express from "express";
import { supabase } from "../config/supabaseClient.js";

const router = express.Router();

router.get("/all", async (req, res) => {
  const { data, error } = await supabase
    .from("shop_events")
    .select("*")
    .order("ts", { ascending: false });

  if (error) return res.status(500).send(error.message);

  const json = JSON.stringify(data, null, 2)

  res.setHeader("Content-Type", "text/json");
  res.setHeader("Content-Disposition", "attachment; filename=shop_events.json");
  res.send(json);
});

router.get("/regions", async (req, res) => {
  const { data, error } = await supabase
    .from("regions")
    .select("*")
    .order("name", { ascending: false });

  if (error) return res.status(500).send(error.message);

  const json = JSON.stringify(data, null, 2)

  res.setHeader("Content-Type", "text/json");
  res.setHeader("Content-Disposition", "attachment; filename=shop_events.json");
  res.send(json);
});

function validateRegionCreatePayload(p) {
  const errors = [];
  const needStr = (v, k) => (typeof v === 'string' && v.trim() ? null : `${k} required`);
  const needInt = (v, k) => (Number.isInteger(v) ? null : `${k} must be integer`);

  // required feilds
  [['name', needStr], ['slug', needStr], ['dimension', needStr]].forEach(([k, fn]) => {
    const e = fn(p[k], k); if (e) errors.push(e);
  });

  if (!p['bounds']) {
    errors.push("bounds required");

    return errors;
  }


  if (Array.isArray(p['bounds'])) {
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


router.post("/regions", async (req, res) => {
  var b = req.body || {};

  let errs = validateRegionCreatePayload(b);
  if (errs.length) {
    console.log('Validation errors:', errs);
    return res.status(400).json({ error: 'bad_request', details: errs });
  }

  const formatted_bounds = b.bounds.map(
    (bound) => `(${bound.min_x},${bound.min_y},${bound.min_z},${bound.max_x},${bound.max_y},${bound.max_z})`
  );

  const insertData = {
    name: b.name,
    slug: b.slug,
    dimension: b.dimension,
    bounds: formatted_bounds
  }

  console.log('Attempting to insert:', JSON.stringify(insertData, null, 2));

  const { error } = await supabase
    .from('regions')
    .insert(insertData)
    .select();

  if (error) {
    console.log('Database error:', error);
    return res.status(500).json({ error: 'db_error', details: error.message });
  }

  console.log('Successfully inserted region data data');

  return res.status(201).json({ ok: true });
});

function validatePatchRegionPayload(p) {
  const errors = [];
  const optStr = (v, k) => (!v || (typeof v === 'string' && v.trim()) ? null : `${k} required`);
  const optInt = (v, k) => (Number.isInteger(v) ? null : `${k} must be integer`);

  // required feilds
  [['name', optStr], ['slug', optStr], ['owners', optStr], ['dimension', optStr]].forEach(([k, fn]) => {
    const e = fn(p[k], k); if (e) errors.push(e);
  });

  if (!p['bounds'])
    return errors;

  p.bounds = JSON.parse(p['bounds']);

  if (Array.isArray(p['bounds'])) {
    let bounds = p['bounds'];

    for (let i = 0; i < bounds.length; i++) {
      // numeric coords 
      ;['min_x', 'min_y', 'min_z',
        'max_x', 'max_y', 'max_z'].forEach(k => {
          if (bounds[i][k] !== undefined) {
            const e = optInt(bounds[i][k], k); if (e) errors.push(e);
          }
        });
    }
  }
  else {
    errors.push("bounds must be array");
  }

  return errors;
}

router.patch("/regions/:id", async (req, res) => {
  const id = req.params.id;
  const b = req.body || {};

  var errs = validatePatchRegionPayload(b);
  if (errs.length) {
    console.log('Validation errors:', errs);
    return res.status(400).json({ error: 'bad_request', details: errs });
  }

  let insertData = {};

  if (b.name)
    insertData['name'] = b.name;

  if (b.slug)
    insertData['slug'] = b.slug;

  if (b.dimension)
    insertData['dimension'] = b.dimension;

  if (b.owners)
    insertData['owners'] = b.owners;

  if (b.bounds) {
    const formatted_bounds = b.bounds.map(
      (bound) => `(${bound.min_x},${bound.min_y},${bound.min_z},${bound.max_x},${bound.max_y},${bound.max_z})`
    );
    insertData['bounds'] = formatted_bounds;
  }

  const { error } = await supabase.from('regions').update(insertData).eq('id', id);

  if (error) {
    console.log('Database error:', error);
    return res.status(500).json({ error: 'db_error', details: error.message });
  }

  console.log('Successfully updated region data id:', id);

  return res.status(201).json({ ok: true, id });
})

router.delete("/regions/:id", async (req, res) => {
  const id = req.params.id;
  const { error } = await supabase.from('regions').delete().eq('id', id);

  if (error) {
    console.log('Database error:', error);
    return res.status(500).json({ error: 'db_error', details: error.message });
  }

  return res.status(201).json({ ok: true, id });
});

async function getHalfDayCount() {
  var date = new Date();
  date.setHours(date.getHours() - 12);
  var half_day_ts = date.toISOString();
  const { data, error } = await supabase
    .from("shop_events")
    .select(
      "ts"
    )
    .gte("ts", half_day_ts);

  if (error) return res.status(500).send(error.message);
  return data.length;
}

async function getTotal() {
  const { data, error } = await supabase
    .from("shop_events")
    .select(
      "*"
    );

  if (error) return res.status(500).send(error.message);
  return data.length;
}

router.get("/stats", async (_, res) => {
  let data = { total: await getTotal(), halfday: await getHalfDayCount() };

  const json = JSON.stringify(data, null, 2)

  res.setHeader("Content-Type", "text/json");
  res.setHeader("Content-Disposition", "attachment; filename=stats.json");
  res.send(json);
})

router.get("/users", async (req, res) => {
  let b = req.body || {};

  let page = 1;
  if (b['page'] && Number.isInteger(b['page']))
    page = b['page'];

  let per_page = 1;
  if (b['per_page'] && Number.isInteger(b['per_page']))
    per_page = b['per_page'];


  const { data: { users }, auth_error } = await supabase.auth.admin.listUsers({
    page,
    perPage: per_page,
  });

  if (auth_error) {
    console.error('error getting auth users:', auth_error.message);
    return res.status(500).send(auth_error.message);
  }

  console.log('All users:', users);

  res.setHeader("Content-Type", "text/json");
  res.setHeader("Content-Disposition", "attachment; filename=users.json");
  res.send(users);
});

function validatePatchUserPayload(p) {
  const errors = [];
  const optStr = (v, k) => (!v || (typeof v === 'string' && v.trim()) ? null : `${k} required`);
  const optInt = (v, k) => (Number.isInteger(v) ? null : `${k} must be integer`);

  // required feilds
  [['name', optStr], ['role', optStr], ['regions', optStr]].forEach(([k, fn]) => {
    const e = fn(p[k], k); if (e) errors.push(e);
  });
}

router.patch("/users/:id", async (req, res) => {
  var b = req.body || {};

  var errs = validatePatchUserPayload(p);
  if (errs.length) {
    console.log('Validation errors:', errs);
    return res.status(400).json({ error: 'bad_request', details: errs });
  }

  if (b.name)
    insertData['name'] = b.name;

  if (b.slug)
    insertData['role'] = b.role;

  if (b.dimension)
    insertData['regions'] = b.regions;
});


export { router };
