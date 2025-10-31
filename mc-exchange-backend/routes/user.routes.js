import express from "express";
import { supabase } from "../config/supabaseClient.js";

const router = express.Router();

//gets all regions or by slug
router.get("/regions", async (req, res) => {
  const { slug } = req.query;
  let query = supabase.from("regions").select("id, name, bounds, slug, shops");
  if (slug) query = query.eq("slug", slug);
  const { data, error } = await query.order("name", { ascending: false });
  if (error) return res.status(500).send(error.message);
  return res.status(200).json({ ok: true, regions: data });
});

router.get("/regions/:slug/shops", async (req, res) => {
  try {
    const region_slug = req.params.slug;
    let b = req.body || {};
    const { data: region_data, error: region_error } = await supabase
      .from("regions")
      .select("shops")
      .eq('slug', region_slug)
      .single();

    if (region_error) {
      console.error('Unable to find region:', region_error);
      return res.status(400).json({ error: 'bad_request', details: region_error });
    }

    const { data: shops_data, error: shop_error } = await supabase
      .from("shops")
      .select("id, name, created_at, owner, region, bounds, image")
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
  const shopId = req.query.shop;
  if (!shopId) {
    return res.status(400).json({ error: "Missing shop id" });
  }

  const { data, error } = await supabase
    .from("exchanges")
    .select("ts, input_item_id, input_qty, output_item_id, output_qty, exchange_possible, compacted_input, compacted_output, shop, input_enchantments, output_enchantments")
    .eq('shop', shopId)
    .order("ts", { ascending: false });

  if (error) return res.status(500).send(error.message);

  return res.status(200).json({ ok: true, data: data || [] });
});

function validateGetUserPayload(p) {
  const errors = [];
  const needStr = (v, k) => (typeof v === 'string' && v.trim() ? null : `${k} required`);

  // required feilds
  [['id', needStr]].forEach(([k, fn]) => {
    const e = fn(p[k], k); if (e) errors.push(e);
  });

  return errors;
}

router.get("/user", async (req, res) => {
  var b = req.body || {};

  validateGetUserPayload(b);

  const { data, error } = await supabase
    .from("users")
    .select("name")
    .eq('id', b.id)
    .single();

  if (error) return res.status(500).send(error.message);

  return res.status(201).json({ ok: true, data });
});

export { router };
