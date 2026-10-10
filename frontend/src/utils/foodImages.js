// Curated high quality food photography matching food sustainability categories
export const categoryImages = {
  "Cooked meals": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  "Bakery": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  "Produce": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
  "Dairy": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
  "Packaged": "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=800&q=80",
  "Vegetarian": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
  "Default": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80"
};

export function getFoodImage(foodType, title = "") {
  if (foodType && categoryImages[foodType]) {
    return categoryImages[foodType];
  }
  const lower = (title + " " + foodType).toLowerCase();
  if (lower.includes("bread") || lower.includes("bakery") || lower.includes("buns") || lower.includes("cake")) {
    return categoryImages["Bakery"];
  }
  if (lower.includes("fruit") || lower.includes("vegetable") || lower.includes("apple") || lower.includes("produce")) {
    return categoryImages["Produce"];
  }
  if (lower.includes("milk") || lower.includes("paneer") || lower.includes("cheese") || lower.includes("dairy")) {
    return categoryImages["Dairy"];
  }
  if (lower.includes("veg") || lower.includes("salad")) {
    return categoryImages["Vegetarian"];
  }
  if (lower.includes("pack") || lower.includes("kit") || lower.includes("can")) {
    return categoryImages["Packaged"];
  }
  if (lower.includes("meal") || lower.includes("rice") || lower.includes("curry") || lower.includes("biryani")) {
    return categoryImages["Cooked meals"];
  }
  return categoryImages["Default"];
}
