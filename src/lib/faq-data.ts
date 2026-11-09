export interface FAQItem {
  question: string;
  answer: string;
  category: "all" | "ingredients" | "preparation" | "storage" | "shipping";
}

export const FAQ_DATA: FAQItem[] = [
  {
    category: "ingredients",
    question: "What ingredients are used in Mushroom Mela Oyster Mushroom Pickle?",
    answer:
      "As stated on our product label: Mushroom, Mustard Oil, Vinegar, Salt, Red Chilli, Coriander, Mustard, Fennel, Fenugreek, Cumin, Turmeric, Ajwain, Ginger, Garlic, and Permitted Additives. Net quantity is 400 g.",
  },
  {
    category: "ingredients",
    question: "Are Akhil Foods mushroom pickles vegetarian?",
    answer:
      "Yes. All ingredients listed on our label are plant-based and vegetarian: oyster mushrooms, mustard oil, vinegar, salt, and spices.",
  },
  {
    category: "preparation",
    question: "Where is AKHIL FOODS based and where is the pickle made?",
    answer:
      "AKHIL FOODS is located in Village Nandsiya, Karguwan Road, Near Ambedkar Murti, Moth, Jhansi, Uttar Pradesh 284303. All our mushroom pickles are prepared and packed right here.",
  },
  {
    category: "ingredients",
    question: "Is AKHIL FOODS officially certified by FSSAI and registered with the Government?",
    answer:
      "Yes. AKHIL FOODS is registered with the Government of India. Our Food Safety and Standards Authority of India registration is FSSAI Lic. No. 22726293000001 (valid until 31-12-2026). Our GSTIN registration is 09FTOPD3011E1ZZ, and our MSME enterprise registration is UDYAM-UP-39-0059446.",
  },
  {
    category: "storage",
    question: "How should I store the pickle?",
    answer:
      "As printed on the jar label: Store in a cool, dry place. Keep away from direct sunlight. Always use a clean, dry spoon.",
  },
  {
    category: "storage",
    question: "Does the pickle need to be refrigerated after opening?",
    answer:
      "Refrigeration is not mandatory. Keep the jar in a cool, dry place, keep away from direct sunlight, and always use a clean, dry spoon. Ensure the lid is closed tightly.",
  },
  {
    category: "shipping",
    question: "How do you pack jars so they don't break during courier transit?",
    answer:
      "Every 400 g jar is packed with protective cushioning in sturdy cartons to help prevent damage during courier transit.",
  },
  {
    category: "shipping",
    question: "How long does delivery take across India?",
    answer:
      "We do not promise specific delivery days. Delivery time depends on the courier partner and your delivery location and pin code.",
  },
  {
    category: "shipping",
    question: "How can I order Mushroom Mela pickle?",
    answer:
      "You can place an order directly on our website checkout (with Cash on Delivery, Pay by UPI QR, or Online Payment) or message us directly on WhatsApp at +91 63864 23865 (wa.me/916386423865).",
  },
  {
    category: "shipping",
    question: "Can I order directly on WhatsApp?",
    answer:
      "Yes. You can message us on WhatsApp at +91 63864 23865 (wa.me/916386423865) to place your order directly with our team in Jhansi.",
  },
];
