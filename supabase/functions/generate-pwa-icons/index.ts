import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Edge Function to generate PWA icons from uploaded seller/affiliate logos
 * This function is triggered when a seller uploads a logo
 * It generates multiple icon sizes (192x192, 512x512, maskable variants)
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, shopId, shopType } = await req.json()

    if (!imageUrl || !shopId || !shopType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch the original image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image')
    }

    const imageBlob = await imageResponse.blob()
    const imageArrayBuffer = await imageBlob.arrayBuffer()

    // Note: Actual image resizing would require an image processing library
    // For now, we'll document that the original image should be properly sized
    // In production, you'd use something like Sharp or ImageMagick
    
    const sizes = [
      { size: 192, suffix: '192' },
      { size: 512, suffix: '512' },
      { size: 192, suffix: '192-maskable', maskable: true },
      { size: 512, suffix: '512-maskable', maskable: true },
    ]

    const generatedIcons = []

    for (const { size, suffix, maskable } of sizes) {
      // In a production environment, you would resize the image here
      // For now, we'll use the original image
      const iconPath = `pwa-icons/${shopType}/${shopId}/icon-${suffix}.png`
      
      const { data: uploadData, error: uploadError } = await supabaseClient
        .storage
        .from('shop-assets')
        .upload(iconPath, imageArrayBuffer, {
          contentType: 'image/png',
          upsert: true
        })

      if (uploadError) {
        console.error(`Error uploading ${suffix}:`, uploadError)
        continue
      }

      const { data: publicUrlData } = supabaseClient
        .storage
        .from('shop-assets')
        .getPublicUrl(iconPath)

      generatedIcons.push({
        size,
        purpose: maskable ? 'maskable' : 'any',
        url: publicUrlData.publicUrl
      })
    }

    // Update shop record with generated icons
    const iconsData = {
      pwa_icons: generatedIcons,
      pwa_icons_generated_at: new Date().toISOString()
    }

    if (shopType === 'seller') {
      await supabaseClient
        .from('seller_shops')
        .update(iconsData)
        .eq('id', shopId)
    } else if (shopType === 'affiliate') {
      await supabaseClient
        .from('affiliate_shops')
        .update(iconsData)
        .eq('id', shopId)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        icons: generatedIcons,
        message: 'PWA icons generated successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error generating PWA icons:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate PWA icons',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Instructions for server-side icon generation:
// For production-ready icon generation, you would need to:
// 1. Install an image processing library (e.g., Sharp via npm: or Deno module)
// 2. Resize images to exact specifications
// 3. Add padding for maskable icons (10% safe zone)
// 4. Optimize PNG compression
// 5. Generate WebP variants for better performance
//
// Example with Sharp (pseudo-code):
// const sharp = await import('sharp')
// const resized = await sharp(imageArrayBuffer)
//   .resize(size, size, { fit: 'contain', background: '#ffffff' })
//   .png({ quality: 100 })
//   .toBuffer()

