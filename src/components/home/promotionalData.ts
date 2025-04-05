
// Define the type for the promotional offers
type PromotionalOffer = {
  id: number;
  title: string;
  description: string;
  image: string;
  whatsapp: string;
  discount?: string; // This is used to store the price
};

// Array of promotional offers with their details
export const promotionalOffers: PromotionalOffer[] = [
  {
    id: 1,
    title: "Ultimate 6KG fullset",
    description: "Free burner and Grill",
    image: "/images/ultimate 6.png",
    whatsapp: "+256770477723",
    discount: "UGX 99,600"
  },
  {
    id: 2,
    title: "Ultimate 13KG full kit",
    description: "Cooker + Horse pipe + Regulator",
    image: "/images/ultimate 13.png",
    whatsapp: "+256770477723",
    discount: "UGX 270,000"
  }
];
