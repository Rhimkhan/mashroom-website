import { Product, Review } from "./types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-mushroom-mela",
    name: "Mushroom Mela Oyster Mushroom Pickle",
    slug: "mushroom-mela-oyster-mushroom-pickle",
    subtitle: "Oyster mushroom pickle in mustard oil and spices",
    description:
      "Oyster mushroom pickle prepared by AKHIL FOODS in Village Nandsiya, Moth, Jhansi, Uttar Pradesh. Prepared with oyster mushrooms steeped in mustard oil, vinegar, and spices.",
    flavour: "Oyster Mushroom",
    rating: 0,
    reviewsCount: 0,
    image: "/images/products/mushroom-mela-front.jpg",
    gallery: [
      "/images/products/mushroom-mela-front.jpg",
      "/images/products/mushroom-mela-side.jpg",
      "/images/products/mushroom-mela-ingredients.jpg",
      "/images/products/mushroom-mela-back.jpg",
    ],
    ingredients: [
      "Mushroom",
      "Mustard Oil",
      "Vinegar",
      "Salt",
      "Red Chilli",
      "Coriander",
      "Mustard",
      "Fennel",
      "Fenugreek",
      "Cumin",
      "Turmeric",
      "Ajwain",
      "Ginger",
      "Garlic",
      "Permitted Additives",
    ],
    shelfLife: "Store in a cool, dry place, keep away from direct sunlight, use a clean dry spoon.",
    spiceLevel: "Medium",
    isFeatured: true,
    stockCount: 100,
    sizes: [
      { size: "400g", price: 399, originalPrice: 399, inStock: true },
    ],
    badges: ["Oyster Mushroom", "400g Jar", "FSSAI Registered"],
  },
];

export const REVIEWS: Review[] = [];

export const FAQS = [
  {
    question: "What ingredients are used in the pickle?",
    answer:
      "Mushroom, mustard oil, vinegar, salt, red chilli, coriander, mustard, fennel, fenugreek, cumin, turmeric, ajwain, ginger, garlic, permitted additives.",
  },
  {
    question: "How should I store the pickle?",
    answer:
      "Keep in a cool dry place, away from sunlight, use a clean dry spoon.",
  },
  {
    question: "Is the product FSSAI registered?",
    answer:
      "Licence number 22726293000001, see the Certificates page.",
  },
  {
    question: "Do you deliver across India?",
    answer:
      "We ship across India. Delivery time depends on your location. See the Shipping Policy page.",
  },
  {
    question: "How do I order?",
    answer:
      "Add to cart, enter address, pay online or choose cash on delivery, or order on WhatsApp.",
  },
];

export const PINCODES_INFO: Record<string, { city: string; state: string; days: string }> = {
  "284303": { city: "Moth, Jhansi", state: "Uttar Pradesh", days: "Dispatches locally from Moth kitchen" },
  "284001": { city: "Jhansi", state: "Uttar Pradesh", days: "Dispatches from Jhansi district" },
  "208001": { city: "Kanpur", state: "Uttar Pradesh", days: "Depends on courier transit and location" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh", days: "Depends on courier transit and location" },
  "110001": { city: "New Delhi", state: "Delhi", days: "Depends on courier transit and location" },
  "400001": { city: "Mumbai", state: "Maharashtra", days: "Depends on courier transit and location" },
  "560001": { city: "Bengaluru", state: "Karnataka", days: "Depends on courier transit and location" },
  "700001": { city: "Kolkata", state: "West Bengal", days: "Depends on courier transit and location" },
  "600001": { city: "Chennai", state: "Tamil Nadu", days: "Depends on courier transit and location" },
  "500001": { city: "Hyderabad", state: "Telangana", days: "Depends on courier transit and location" },
};
