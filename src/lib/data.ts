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
      { size: "400 g", price: 399, originalPrice: 399, inStock: true },
    ],
    badges: ["Oyster Mushroom", "400 g Jar", "FSSAI Registered"],
  },
];

export const REVIEWS: Review[] = [];

export const FAQS = [
  {
    question: "Where is AKHIL FOODS located?",
    answer:
      "AKHIL FOODS is based in Village Nandsiya, Karguwan Road, Near Ambedkar Murti, Moth, Jhansi, Uttar Pradesh 284303. All our mushroom pickles are prepared and packed right here.",
  },
  {
    question: "What ingredients are used in Mushroom Mela Oyster Mushroom Pickle?",
    answer:
      "As stated on the label: Mushroom, Mustard Oil, Vinegar, Salt, Red Chilli, Coriander, Mustard, Fennel, Fenugreek, Cumin, Turmeric, Ajwain, Ginger, Garlic, and Permitted Additives. Net quantity is 400 g.",
  },
  {
    question: "How should I store the pickle?",
    answer:
      "Store in a cool, dry place. Keep away from direct sunlight. Always use a clean, dry spoon.",
  },
  {
    question: "Is AKHIL FOODS FSSAI certified and registered?",
    answer:
      "Yes, AKHIL FOODS holds FSSAI Lic. No. 22726293000001 (valid till 31-12-2026), GSTIN 09FTOPD3011E1ZZ, and Udyam Reg. No. UDYAM-UP-39-0059446.",
  },
  {
    question: "Do you deliver across India and how long does it take?",
    answer:
      "Yes, we ship across India. We do not promise fixed delivery days; delivery time depends on the courier partner and your delivery location and pin code.",
  },
  {
    question: "How can I place an order?",
    answer:
      "You can order directly on our website checkout (Cash on Delivery, Pay by UPI QR, or Online Payment) or message us directly on WhatsApp at +91 63864 23865 (wa.me/916386423865).",
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
