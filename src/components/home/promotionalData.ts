
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
    title: "Total Gas 6KG",
    description: "20% off with same day delivery",
    image: "/images/total 6KG.png",
    whatsapp: "+256787899483",
    discount: "20% OFF"
  },
  {
    id: 2,
    title: "Shell Gas 6KG",
    description: "Limited time 20% discount",
    image: "/images/shell 6KG.png",
    whatsapp: "+256787899483",
    discount: "20% OFF"
  },
  {
    id: 3,
    title: "Oryx Gas 6KG",
    description: "Special 20% off promotion",
    image: "/images/oryx 6KG.png",
    whatsapp: "+256787899483",
    discount: "20% OFF"
  },
  {
    id: 4,
    title: "Stabex Gas 6KG",
    description: "20% off with free delivery",
    image: "/images/stabex 6KG.png",
    whatsapp: "+256787899483",
    discount: "20% OFF"
  }
];
