import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { resolveProductType } from "./lib/product-type-mapping.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const apply = process.argv.includes("--apply");
for (const key of ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"])
  if (!process.env[key]) throw new Error(`Missing ${key}`);
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const [{ data: products, error: productError }, { data: types, error: typeError }] =
  await Promise.all([
    db.from("products").select("id,name,slug,tags,category_id,product_type_id"),
    db.from("product_types").select("id,name,slug,category_id,is_active"),
  ]);
if (productError || typeError) throw new Error(productError?.message ?? typeError.message);
const rows = [];
for (const product of products ?? []) {
  const result = resolveProductType(
    product,
    (types ?? []).filter((type) => type.is_active),
  );
  if (apply && result.status === "mapped") {
    const { error } = await db
      .from("products")
      .update({ product_type_id: result.type.id })
      .eq("id", product.id)
      .eq("category_id", result.type.category_id);
    if (error) throw new Error(`${product.name}: ${error.message}`);
  }
  rows.push({
    product_id: product.id,
    product_name: product.name,
    category_id: product.category_id ?? "",
    status: result.status,
    mapped_type_id: result.type?.id ?? "",
    candidates: (result.candidates ?? []).map((x) => `${x.name} (${x.id})`).join(" | "),
    reason: result.reason,
  });
}
const dir = path.resolve(process.cwd(), "reports/product-type-audit");
fs.mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
fs.writeFileSync(path.join(dir, `${stamp}.json`), JSON.stringify(rows, null, 2));
const headers = Object.keys(rows[0] ?? { status: "" });
const csv = [
  headers.join(","),
  ...rows.map((row) =>
    headers.map((key) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`).join(","),
  ),
].join("\n");
fs.writeFileSync(path.join(dir, `${stamp}.csv`), csv);
const counts = Object.groupBy(rows, (row) => row.status);
console.log(
  `${apply ? "Applied" : "Dry run"}: ${rows.length} products; mapped=${counts.mapped?.length ?? 0}, valid=${counts.valid?.length ?? 0}, ambiguous=${counts.ambiguous?.length ?? 0}, unmapped=${counts.unmapped?.length ?? 0}`,
);
