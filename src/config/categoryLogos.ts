export interface CategoryLogo {
  slug: string;
  name: string;
  src: string;
}

// Add ALL logos that exist in public/images/category_logos
export const EXTRA_CATEGORY_LOGOS: CategoryLogo[] = [
  { slug: 'bags', name: 'Bags', src: '/images/category_logos/bags.png' },
  { slug: 'cameras', name: 'Cameras', src: '/images/category_logos/cameras.png' },
  { slug: 'electricals-and-lighting', name: 'Electricals & Lighting', src: '/images/category_logos/electricals_and_lighting.png' },
  { slug: 'fitness', name: 'Fitness', src: '/images/category_logos/fitness.png' },
  { slug: 'furniture', name: 'Furniture', src: '/images/category_logos/furniture.png' },
  { slug: 'gaming', name: 'Gaming', src: '/images/category_logos/gaming.png' },
  { slug: 'gas', name: 'Gas', src: '/images/category_logos/gas.png' },
  { slug: 'home-appliances', name: 'Home Appliances', src: '/images/category_logos/home_appliances.png' },
  { slug: "men's-fashion", name: "Men's Fashion", src: '/images/category_logos/men_fashion.png' },
  { slug: 'monitors', name: 'Monitors', src: '/images/category_logos/monitors.png' },
  { slug: 'motors', name: 'Motors', src: '/images/category_logos/motors.png' },
  { slug: 'network-and-routers', name: 'Network & Routers', src: '/images/category_logos/networks and routers.png' },
  { slug: 'laptops-pcs', name: 'Laptops & PCs', src: '/images/category_logos/PCs.png' },
  { slug: 'phones', name: 'Phones', src: '/images/category_logos/phones.png' },
  { slug: 'shoes', name: 'Shoes', src: '/images/category_logos/shoes_fashion.png' },
  { slug: 'tvs', name: 'TVs', src: '/images/category_logos/TVS.png' },
  { slug: 'wearables', name: 'Wearables', src: '/images/category_logos/wearables.png' },
  { slug: "women's-fashion", name: "Women's Fashion", src: '/images/category_logos/women_fashion.png' },
];


