import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const slug = url.searchParams.get('slug')
    const type = url.searchParams.get('type') || 'affiliate' // 'affiliate' or 'seller'

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Shop slug is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Fetch shop data
    let shopData
    if (type === 'affiliate') {
      const { data, error } = await supabaseClient
        .from('affiliate_shops')
        .select('shop_name, shop_description, shop_logo_url, shop_slug')
        .eq('shop_slug', slug)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Shop not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      shopData = data
    } else {
      const { data, error } = await supabaseClient
        .from('seller_shops')
        .select('shop_name, shop_description, shop_logo_url, shop_slug')
        .eq('shop_slug', slug)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Shop not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      shopData = data
    }

    // Generate dynamic manifest
    const manifest = {
      name: shopData.shop_name || 'My Store',
      short_name: shopData.shop_name?.substring(0, 12) || 'Store',
      description: shopData.shop_description || `Shop at ${shopData.shop_name}`,
      start_url: type === 'affiliate' 
        ? `/affiliate/${slug}?source=pwa`
        : `/shop/${slug}?source=pwa`,
      display: 'standalone',
      display_override: ['standalone', 'minimal-ui'],
      background_color: '#FFFFFF',
      theme_color: '#00b341',
      orientation: 'portrait-primary',
      categories: ['shopping', 'business'],
      icons: shopData.shop_logo_url ? [
        {
          src: shopData.shop_logo_url,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: shopData.shop_logo_url,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: shopData.shop_logo_url,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: shopData.shop_logo_url,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ] : [
        {
          src: '/images/icon.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/images/icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        }
      ],
      scope: type === 'affiliate' ? `/affiliate/${slug}/` : `/shop/${slug}/`,
      id: `${type}-${slug}-pwa`,
      lang: 'en',
      dir: 'ltr'
    }

    return new Response(
      JSON.stringify(manifest),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/manifest+json',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      }
    )
  } catch (error) {
    console.error('Error generating manifest:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

