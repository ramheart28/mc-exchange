import express from "express";
import { supabase } from "../config/supabaseClient.js";

const router = express.Router();

router.get("/regions", async (req, res) => {
  const { data, error } = await supabase
    .from("regions")
    .select("shops, name, slug, bounds")
    .order("name", { ascending: false });

  if (error) return res.status(500).send(error.message);

  return res.status(200).json({ ok: true, regions: data });
});

router.get("/regions/:id/shops", async (req, res) => {
  try {
    const region_id = req.params.id;
    let b = req.body || {};
    const { data: region_data, error: region_error } = await supabase
      .from("regions")
      .select("shops")
      .eq('id', region_id)
      .single();

    if (region_error) {
      console.error('Unable to find region:', region_error);
      return res.status(400).json({ error: 'bad_request', details: region_error });
    }

    const { data: shops_data, error: shop_error } = await supabase
      .from("shops")
      .select("name, created_at, owner, region, bounds")
      .in('id', region_data.shops);

    if (shop_error) {
      console.error('Unable to find shop:', shop_error);
      return res.status(400).json({ error: 'bad_request', details: shop_error });
    }

    return res.status(201).json({ ok: true, shops: shops_data });
  } catch (e) {
    console.error('ingest error', e);
    return res.status(500).json({ error: 'server_error' });
  }
});

function validatePayload(p) {
  const errors = [];
  const needInt = (v, k) => (Number.isInteger(v) ? null : `${k} must be integer`);
  const needStr = (v, k) => (typeof v === 'string' && v.trim() ? null : `${k} required`);

  // required feilds
  [['shop', needStr]].forEach(([k, fn]) => {
    const e = fn(p[k], k); if (e) errors.push(e);
  });

  return errors;
}

router.get("/exchanges/shop", async (req, res) => {
  var b = req.body || {};

  validatePayload(b);

  const { data, error } = await supabase
    .from("shop_events")
    .select("ts, input_item_id, input_qty, output_item_id, output_qty, exchange_possible, compacted_input, compacted_output, shop")
    .eq('shop', b.shop)
    .order("ts", { ascending: false });

  if (error) return res.status(500).send(error.message);

  const json = JSON.stringify(data, null, 2)

  res.setHeader("Content-Type", "text/json");
  res.setHeader("Content-Disposition", "attachment; filename=shop_events.json");
  res.send(json);
});

export { router };
