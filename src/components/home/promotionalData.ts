
// Define the type for the promotional offers
type PromotionalOffer = {
  id: number;
  title: string;
  description: string;
  image: string;
  whatsapp: string;
  discount?: string; // Optional discount property
};

// Array of promotional offers with their details
export const promotionalOffers: PromotionalOffer[] = [
  {
    id: 1,
    title: "Ultimate 6KG fullset",
    description: "Free burner and Grill",
    image: "/images/ultimate 6.png",
    whatsapp: "+256770477723",
    discount: "20% OFF"
  },
  {
    id: 2,
    title: "Ultimate 13KG full kit",
    description: "Cooker + Horse pipe + Regulator",
    image: "/images/ultimate 13.png",
    whatsapp: "+256787899483",
    discount: "20% OFF"
  }
  
];
