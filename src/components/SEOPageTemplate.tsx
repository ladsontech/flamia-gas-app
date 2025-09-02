import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface SEOPageTemplateProps {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  h1: string;
  content: {
    sections: Array<{
      heading: string;
      content: string;
    }>;
  };
  ctaText?: string;
  ctaLink?: string;
}

const SEOPageTemplate: React.FC<SEOPageTemplateProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  h1,
  content,
  ctaText = "Order Gas Now",
  ctaLink = "/refill"
}) => {
  const handleCTAClick = () => {
    window.location.href = ctaLink;
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Flamia Gas Delivery" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        
        {/* SEO Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="geo.region" content="UG" />
        <meta name="geo.placename" content="Kampala" />
        <meta name="language" content="en" />
        <meta name="author" content="Flamia Gas Delivery" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Flamia Gas Delivery",
            "description": description,
            "url": canonicalUrl,
            "telephone": "+256-XXX-XXXXXX",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "UG",
              "addressRegion": "Central Uganda",
              "addressLocality": "Kampala"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "0.3476",
              "longitude": "32.5825"
            },
            "openingHours": "Mo-Su 08:00-20:00",
            "priceRange": "$$",
            "servesCuisine": [],
            "areaServed": ["Kampala", "Wakiso", "Mukono", "Entebbe"]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-20 md:pt-24">
        <div className="px-3 sm:px-4 lg:px-32 xl:px-48 2xl:px-64 py-4 sm:py-6 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <header className="text-center mb-8 lg:mb-12">
              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
                {h1}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                {description}
              </p>
            </header>

            <main className="space-y-8 lg:space-y-12">
              {content.sections.map((section, index) => (
                <motion.section
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg p-6 lg:p-8"
                >
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-4">
                    {section.heading}
                  </h2>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    {section.content.split('\n').map((paragraph, pIndex) => (
                      <p key={pIndex} className="mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.section>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-8 lg:p-12"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to Order?
                </h2>
                <p className="text-lg mb-6 opacity-90">
                  Get your gas delivered today with Flamia's fast and reliable service.
                </p>
                <Button
                  onClick={handleCTAClick}
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                >
                  {ctaText}
                </Button>
              </motion.div>
            </main>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SEOPageTemplate;