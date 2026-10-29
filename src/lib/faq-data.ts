import { FSSAI_NUMBER } from "@/lib/config";

export interface FAQItem {
  question: string;
  answer: string;
  category: "all" | "ingredients" | "preparation" | "storage" | "shipping";
}

export const FAQ_DATA: FAQItem[] = [
  {
    category: "ingredients",
    question: "What ingredients are used in the pickle?",
    answer:
      "Mushroom, mustard oil, vinegar, salt, red chilli, coriander, mustard, fennel, fenugreek, cumin, turmeric, ajwain, ginger, garlic, permitted additives.",
  },
  {
    category: "storage",
    question: "How should I store the pickle?",
    answer:
      "Keep in a cool dry place, away from sunlight, use a clean dry spoon.",
  },
  {
    category: "ingredients",
    question: "Is the product FSSAI registered?",
    answer:
      `Licence number ${FSSAI_NUMBER}, see the Certificates page.`,
  },
  {
    category: "shipping",
    question: "Do you deliver across India?",
    answer:
      "We ship across India. Delivery time depends on your location. See the Shipping Policy page.",
  },
  {
    category: "shipping",
    question: "How do I order?",
    answer:
      "Add to cart, enter address, pay online or choose cash on delivery, or order on WhatsApp.",
  },
];
