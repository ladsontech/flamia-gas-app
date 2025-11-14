// Supabase Edge Function: provision-seller-shop
// Creates a business and seller_shop for an approved seller application
// Expects JSON body: { shopName, categoryId, shopDescription?, shopLogoUrl? }
//
// Security model:
// - Uses anon client (with request auth header) to detect current user
// - Uses service role client for privileged writes (bypasses RLS safely on server)

// deno-lint-ignore-file no-explicit-any

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, any>;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const anon = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });
    const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const body = (await req.json()) as {
      shopName?: string;
      categoryId?: string;
      shopDescription?: string | null;
      shopLogoUrl?: string | null;
      whatsappNumber?: string | null;
    };

    const { data: auth } = await anon.auth.getUser();
    const user = auth?.user;
    if (!user) {
      return json({ error: "Unauthenticated" }, 401);
    }

    const shopName = (body.shopName || "").trim();
    const categoryId = (body.categoryId || "").trim();
    if (!shopName || !categoryId) {
      return json({ error: "Missing required fields" }, 400);
    }

    // Verify latest application is approved
    const { data: application, error: appErr } = await service
      .from("seller_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (appErr) return json({ error: appErr.message }, 500);
    if (!application || application.status !== "approved") {
      return json({ error: "Seller application is not approved" }, 403);
    }

    // If shop already exists, just update it and return
    const { data: existingShop, error: shopLookupErr } = await service
      .from("seller_shops")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (shopLookupErr) return json({ error: shopLookupErr.message }, 500);
    if (existingShop) {
      const { error: updErr } = await service
        .from("seller_shops")
        .update({
          shop_name: shopName,
          shop_description: body.shopDescription || null,
          shop_logo_url: body.shopLogoUrl || null,
          category_id: categoryId,
          whatsapp_number: body.whatsappNumber || null,
          is_active: true,
          is_approved: true,
        })
        .eq("id", existingShop.id);
      if (updErr) return json({ error: updErr.message }, 500);
      return json({ shopId: existingShop.id, shopSlug: existingShop.shop_slug });
    }

    // Generate unique slug
    const baseSlug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const { data: dup } = await service.from("seller_shops").select("shop_slug").eq("shop_slug", slug).maybeSingle();
      if (!dup) break;
      slug = `${baseSlug}-${counter++}`;
    }

    // Create business (service role bypasses RLS)
    const { data: business, error: businessErr } = await service
      .from("businesses")
      .insert({
        name: shopName,
        description: body.shopDescription || null,
        location: "Uganda",
        contact: "",
        is_active: true,
        is_featured: false,
        owner_type: "seller",
        category_id: categoryId,
      })
      .select()
      .single();
    if (businessErr) return json({ error: businessErr.message }, 500);

    // Next payment due in 30 days
    const nextPaymentDue = new Date();
    nextPaymentDue.setDate(nextPaymentDue.getDate() + 30);

    // Create seller shop
    const { data: shop, error: shopErr } = await service
      .from("seller_shops")
      .insert({
        user_id: user.id,
        business_id: business.id,
        shop_name: shopName,
        shop_slug: slug,
        category_id: categoryId,
        shop_logo_url: body.shopLogoUrl || null,
        shop_description: body.shopDescription || null,
        whatsapp_number: body.whatsappNumber || null,
        is_active: true,
        is_approved: true,
        tier: "basic",
        commission_enabled: true,
        monthly_fee: 50000,
        next_payment_due: nextPaymentDue.toISOString(),
      })
      .select()
      .single();
    if (shopErr) return json({ error: shopErr.message }, 500);

    // Back-link business to shop
    const { error: linkErr } = await service.from("businesses").update({ shop_id: shop.id }).eq("id", business.id);
    if (linkErr) return json({ error: linkErr.message }, 500);

    // Grant business_owner role (ignore duplicates)
    await service
      .from("user_roles")
      .insert({ user_id: user.id, role: "business_owner", business_id: business.id })
      .catch(() => {});

    return json({ shopId: shop.id, shopSlug: shop.shop_slug });
  } catch (e: any) {
    console.error("provision-seller-shop error:", e);
    return json({ error: e?.message || "Unexpected error" }, 500);
  }
});

function json(body: Json, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

