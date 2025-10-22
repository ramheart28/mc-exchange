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

function validateRegionCreatePayload(p) {
  const errors = [];
  const needStr = (v, k) => (typeof v === 'string' && v.trim() ? null : `${k} required`);

  // required feilds
  [['name', needStr], ['slug', needStr], ['owner', needStr], ['dimension', needStr]].forEach(([k, fn]) => {
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

router.post("/regions", async (req, res) => {
  var b = req.body || {};

  let errs = validateRegionCreatePayload(b);
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
    slug: b.slug,
    author: b.author,
    dimension: b.dimension,
    owner: b.owner,
    bounds: JSON.stringify(bounds)
  }

  console.log('Attempting to insert:', JSON.stringify(insertData, null, 2));
})


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


export { router };
