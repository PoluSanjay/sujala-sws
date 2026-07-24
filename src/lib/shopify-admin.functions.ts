import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SHOP_DOMAIN = "sujala-premium-platform-jtv09-1gw585q1.myshopify.com";
const API_VERSION = "2025-07";

async function assertAdmin(context: any) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden: admin only");
}

async function shopifyAdmin(path: string, init: RequestInit = {}) {
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!token) throw new Error("SHOPIFY_ACCESS_TOKEN missing");
  const res = await fetch(`https://${SHOP_DOMAIN}/admin/api/${API_VERSION}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg = body?.errors ? JSON.stringify(body.errors) : `Shopify ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const body = await shopifyAdmin(`/products.json?limit=250`);
    return body.products as any[];
  });

export const adminCreateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    title: string;
    body_html?: string;
    vendor?: string;
    product_type?: string;
    price: string;
    compare_at_price?: string;
    sku?: string;
    inventory_quantity?: number;
    images?: Array<{ src?: string; attachment?: string; filename?: string }>;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const body = await shopifyAdmin(`/products.json`, {
      method: "POST",
      body: JSON.stringify({
        product: {
          title: data.title,
          body_html: data.body_html || "",
          vendor: data.vendor || "Sujala",
          product_type: data.product_type || "",
          status: "active",
          images: data.images || [],
          variants: [
            {
              price: data.price,
              compare_at_price: data.compare_at_price || null,
              sku: data.sku || "",
              inventory_management: "shopify",
              inventory_quantity: data.inventory_quantity ?? 10,
            },
          ],
        },
      }),
    });
    return body.product;
  });

export const adminUpdateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id: number;
    title?: string;
    body_html?: string;
    vendor?: string;
    product_type?: string;
    status?: "active" | "draft" | "archived";
    variantId?: number;
    price?: string;
    compare_at_price?: string;
    inventory_quantity?: number;
    images?: Array<{ src?: string; attachment?: string; filename?: string }>;
    replaceImages?: boolean;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const product: any = { id: data.id };
    if (data.title !== undefined) product.title = data.title;
    if (data.body_html !== undefined) product.body_html = data.body_html;
    if (data.vendor !== undefined) product.vendor = data.vendor;
    if (data.product_type !== undefined) product.product_type = data.product_type;
    if (data.status) product.status = data.status;
    if (data.variantId && (data.price !== undefined || data.compare_at_price !== undefined)) {
      product.variants = [{
        id: data.variantId,
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.compare_at_price !== undefined ? { compare_at_price: data.compare_at_price || null } : {}),
      }];
    }
    if (data.images && data.images.length && data.replaceImages) {
      product.images = data.images;
    }
    const body = await shopifyAdmin(`/products/${data.id}.json`, {
      method: "PUT",
      body: JSON.stringify({ product }),
    });

    // Append images (if not replacing)
    if (data.images && data.images.length && !data.replaceImages) {
      for (const img of data.images) {
        await shopifyAdmin(`/products/${data.id}/images.json`, {
          method: "POST",
          body: JSON.stringify({ image: img }),
        });
      }
    }
    return body.product;
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: number }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await shopifyAdmin(`/products/${data.id}.json`, { method: "DELETE" });
    return { ok: true };
  });
