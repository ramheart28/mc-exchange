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

module.exports = router;
