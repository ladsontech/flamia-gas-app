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
    let slug = url.searchParams.get('slug')
    let type = url.searchParams.get('type') || 'seller' // 'affiliate' or 'seller'
    
    // Check if request is from subdomain
    const hostname = url.hostname
    const subdomainMatch = hostname.match(/^([a-z0-9-]+)\.flamia\.store$/i)
    
    if (subdomainMatch && !['www', 'app', 'admin', 'api'].includes(subdomainMatch[1].toLowerCase())) {
      slug = subdomainMatch[1]
      type = 'seller' // Subdomains are for sellers
    }

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
    let shopData: any
    if (type === 'affiliate') {
      const { data, error } = await supabaseClient
        .from('affiliate_shops')
        .select('shop_name, description, logo_url, slug, theme_color')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Affiliate shop not found' }),
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
        .select('shop_name, description, logo_url, slug, theme_color')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Seller shop not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      shopData = data
    }

    // Determine if this is a subdomain request
    const isSubdomain = !!subdomainMatch
    const baseUrl = isSubdomain ? '/' : (type === 'affiliate' ? `/affiliate/${slug}` : `/shop/${slug}`)
    
    // Generate dynamic manifest
    const storeName = shopData.shop_name || 'My Store'
    const storeDescription = shopData.description || `Shop at ${storeName}`
    const themeColor = shopData.theme_color || '#FF4D00'
    
    const manifest = {
      name: `${storeName} - ${type === 'affiliate' ? 'Affiliate' : 'Online'} Store`,
      short_name: storeName.substring(0, 12),
      description: storeDescription,
      start_url: `${baseUrl}?source=pwa`,
      display: 'standalone',
      display_override: ['tabbed', 'window-controls-overlay', 'standalone', 'minimal-ui'],
      background_color: '#FFFFFF',
      theme_color: themeColor,
      orientation: 'portrait-primary',
      categories: ['shopping', 'business', 'utilities'],
      icons: shopData.logo_url ? [
        {
          src: shopData.logo_url,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: shopData.logo_url,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: shopData.logo_url,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: shopData.logo_url,
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
      scope: isSubdomain ? '/' : `${baseUrl}/`,
      id: isSubdomain ? `${slug}-store-pwa` : `${type}-${slug}-pwa`,
      lang: 'en',
      dir: 'ltr',
      shortcuts: [
        {
          name: 'View Products',
          url: baseUrl,
          icons: [{ src: shopData.logo_url || '/images/icon.png', sizes: '96x96' }]
        }
      ]
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

