/**
 * Flamia Master SEO Keywords Configuration
 * Organized by intent and usage
 */

export const SEO_KEYWORDS = {
  // 🔥 Transactional Keywords (people ready to buy/order now)
  transactional: [
    "gas delivery Uganda",
    "cooking gas delivery Kampala",
    "home gas refill service",
    "LPG gas refill near me",
    "gas cylinder refill Kampala",
    "Oryx gas refill price",
    "Shell gas delivery",
    "Total gas refill Uganda",
    "buy gas cylinder online",
    "order gas delivery in Entebbe",
    "gas cylinder exchange",
    "gas refill home delivery",
    "3kg gas refill",
    "6kg gas refill",
    "12.5kg gas refill",
    "butane canister refill",
    "refillable gas lighter supplies",
    "gas torch flame refill",
    "fast gas delivery Uganda"
  ],

  // 💰 Commercial / Pricing Keywords
  pricing: [
    "affordable gas refill prices",
    "gas refill cost Kampala",
    "LPG gas price Uganda",
    "gas refill price list",
    "Shell gas pricing Uganda",
    "Total gas refill cost",
    "Oryx gas 13kg price",
    "cheap gas refill deals",
    "best gas prices in Kampala",
    "cost-effective gas supply"
  ],

  // 🏠 Local / Service Area Keywords
  local: [
    "gas delivery in Kampala",
    "gas refill Entebbe",
    "gas suppliers Namugongo",
    "gas refill Kira",
    "gas shop near me",
    "LPG gas delivery Kampala suburbs",
    "cooking gas supplier Uganda",
    "gas refill Wakiso",
    "gas delivery Uganda suburbs",
    // Kampala specific areas
    "gas delivery Banda",
    "gas refill Kyambogo",
    "gas delivery Kinawataka",
    "gas refill Kireka",
    "gas delivery Ntinda",
    "gas refill Kiwatule",
    "gas delivery Nakawa",
    "gas refill Mbuya",
    "gas delivery Bukoto",
    "gas refill Kisasi",
    "gas delivery Bweyogerere",
    "gas refill Bugolobi",
    "gas delivery Naguru",
    "gas refill Mutungo",
    "gas delivery Luzira",
    "gas refill Namboole",
    "gas delivery Seeta",
    "gas refill Naalya",
    "gas delivery Ntinda Stage",
    "gas refill Ministers Village",
    "gas delivery Bukasa",
    "gas refill Muyenga",
    "gas delivery Kololo",
    "gas refill Kamwokya",
    // University areas - Makerere University
    "gas delivery Wandegeya",
    "gas refill Kasubi",
    "gas delivery Kawaala",
    "gas refill Naakulabye",
    "gas delivery near Makerere University",
    "gas refill Makerere",
    // University areas - MUBS (Makerere University Business School)
    "gas delivery near MUBS",
    "gas refill MUBS Nakawa",
    // University areas - KIU (Kampala International University)
    "gas delivery near KIU",
    "gas refill KIU Kansanga",
    // Additional variations
    "LPG delivery Wandegeya",
    "cooking gas Kasubi",
    "gas cylinder Naakulabye",
    "student gas delivery Kampala",
    "university area gas refill"
  ],

  // 🧰 Product / Technical Keywords
  technical: [
    "LPG gas cylinder supply",
    "gas regulator installation",
    "oxygen cylinder refill",
    "gas leak detection system",
    "gas stove refill",
    "bulk gas supply Uganda",
    "refillable gas cylinders",
    "gas accessories Uganda",
    "home gas safety equipment",
    "gas delivery service provider"
  ],

  // 🌿 Lifestyle / Emotional Keywords
  lifestyle: [
    "spice up your kitchen moments",
    "convenient cooking solutions",
    "reliable home energy source",
    "hassle-free gas delivery",
    "cook with confidence",
    "fast, safe, affordable gas",
    "simplify your kitchen life",
    "clean energy for every home"
  ],

  // Brand-specific keywords
  brands: [
    "Total gas Uganda",
    "Shell gas Uganda",
    "Oryx gas Uganda",
    "Stabex gas Uganda",
    "Hass gas Uganda",
    "Ultimate gas Uganda",
    "C gas Uganda",
    "Taifa gas Uganda"
  ],

  // 📱 Marketplace - Electronics & Phones
  electronics: [
    "phones Black Friday sale Uganda",
    "Black Friday phone deals Uganda",
    "huge phone deals Uganda",
    "top brands massive discounts",
    "smartphones Uganda",
    "cheap phones Kampala",
    "phone sale Uganda",
    "mobile phones Uganda",
    "Android phones Uganda",
    "iPhone Uganda",
    "Samsung phones Uganda",
    "Tecno phones Uganda",
    "Infinix phones Uganda",
    "buy phones online Uganda",
    "phone shop Kampala"
  ],

  // 💻 Laptops & Computers
  computers: [
    "laptops Uganda",
    "cheap laptops Kampala",
    "laptop deals Uganda",
    "computers Uganda",
    "gaming laptops Uganda",
    "HP laptops Uganda",
    "Dell laptops Uganda",
    "Lenovo laptops Uganda",
    "MacBook Uganda",
    "buy laptop online Uganda",
    "laptop shop Kampala",
    "computer accessories Uganda"
  ],

  // 🛍️ Fashion & Lifestyle
  fashion: [
    "fashion Black Friday sale Uganda",
    "Black Friday fashion offers",
    "trendy style Uganda",
    "women's fashion Uganda",
    "men's fashion Uganda",
    "clothing Uganda",
    "shoes Uganda",
    "bags Uganda",
    "fashion deals Kampala",
    "online fashion store Uganda",
    "affordable fashion Uganda"
  ],

  // 🏠 Home & Appliances
  homeAppliances: [
    "home Black Friday Uganda",
    "home essentials Uganda",
    "Black Friday appliance sale",
    "home appliances Uganda",
    "kitchen appliances Uganda",
    "refrigerators Uganda",
    "washing machines Uganda",
    "microwaves Uganda",
    "blenders Uganda",
    "TVs Uganda",
    "home electronics Uganda",
    "appliance deals Kampala"
  ],

  // 🎯 Shopping & Deals
  shopping: [
    "Black Friday Uganda",
    "flash sale Uganda",
    "mega savings Uganda",
    "up to 80% off Uganda",
    "limited time offers Uganda",
    "treasure hunt deals",
    "biggest sale of the year",
    "online shopping Uganda",
    "shop online Kampala",
    "e-commerce Uganda",
    "buy online Uganda",
    "online marketplace Uganda",
    "verified sellers Uganda",
    "secure online shopping Uganda"
  ]
};

/**
 * Get keywords for a specific page
 */
export const getPageKeywords = (page: 'home' | 'refill' | 'order' | 'shop' | 'accessories'): string => {
  const baseKeywords = [
    ...SEO_KEYWORDS.transactional.slice(0, 15),
    ...SEO_KEYWORDS.pricing.slice(0, 5),
    ...SEO_KEYWORDS.local.slice(0, 5)
  ];

  const pageSpecific: Record<string, string[]> = {
    home: [
      ...SEO_KEYWORDS.lifestyle,
      ...SEO_KEYWORDS.brands.slice(0, 5),
      ...SEO_KEYWORDS.shopping.slice(0, 5)
    ],
    refill: [
      "home gas refill service",
      "LPG gas refill near me",
      "gas cylinder refill Kampala",
      "gas refill home delivery",
      ...SEO_KEYWORDS.pricing
    ],
    order: [
      "buy gas cylinder online",
      "order gas delivery in Entebbe",
      "gas cylinder exchange",
      "fast gas delivery Uganda"
    ],
    shop: [
      ...SEO_KEYWORDS.technical.slice(0, 5),
      ...SEO_KEYWORDS.electronics.slice(0, 8),
      ...SEO_KEYWORDS.computers.slice(0, 6),
      ...SEO_KEYWORDS.fashion.slice(0, 5),
      ...SEO_KEYWORDS.homeAppliances.slice(0, 6),
      ...SEO_KEYWORDS.shopping.slice(0, 8),
      "marketplace Uganda",
      "household materials",
      "online shopping Uganda",
      "verified sellers Uganda"
    ],
    accessories: [
      ...SEO_KEYWORDS.technical.slice(0, 8),
      "gas accessories Uganda",
      "home gas safety equipment"
    ]
  };

  return [...baseKeywords, ...(pageSpecific[page] || [])].join(', ');
};

/**
 * Get meta description for a page
 */
export const getPageDescription = (page: string): string => {
  const descriptions: Record<string, string> = {
    home: "🔥 Best gas delivery service in Uganda! Order cooking gas refill, LPG cylinder delivery in Kampala, Entebbe, Wakiso. Total, Shell, Oryx gas. Same-day delivery. Affordable prices. Cook with confidence!",
    refill: "🔥 Home gas refill service in Uganda! 3kg, 6kg, 12.5kg gas cylinder refill. Total gas refill, Shell gas delivery, Oryx gas refill price. Fast delivery in Kampala, Entebbe, Wakiso, Kira. Order now!",
    order: "🔥 Buy gas cylinder online in Uganda! Complete your order for cooking gas delivery in Kampala, Entebbe, Wakiso. Gas cylinder exchange available. Fast, safe, affordable gas delivery service.",
    shop: "🛒 Uganda's biggest online marketplace! Shop phones, laptops, fashion, home appliances at massive discounts. Gas accessories, LPG cylinder supply, electronics from verified sellers. Black Friday deals, flash sales, mega savings! Secure online shopping, fast delivery Kampala.",
    accessories: "🔧 Gas accessories Uganda - regulators, safety equipment, leak detectors, gas stove supplies. LPG gas cylinder supply, bulk gas supply. Home gas safety equipment. Fast delivery in Kampala!"
  };

  return descriptions[page] || descriptions.home;
};

/**
 * Get Open Graph title for a page
 */
export const getOGTitle = (page: string): string => {
  const titles: Record<string, string> = {
    home: "Flamia - Fast Gas Delivery Uganda | Cooking Gas Refill Kampala",
    refill: "Gas Refill Home Delivery | LPG Gas Refill Near Me",
    order: "Buy Gas Cylinder Online | Order Gas Delivery in Entebbe",
    shop: "Flamia Marketplace - Gas Accessories & Household Materials Uganda",
    accessories: "Gas Accessories Uganda | LPG Cylinder Supply | Safety Equipment"
  };

  return titles[page] || titles.home;
};

export default SEO_KEYWORDS;

