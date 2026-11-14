/* ==========================================================================
   HomeBasket — customer-facing product catalogue (customer package options supported)
   Prices, units and stock values here are working figures: confirm them with your suppliers and edit before launch.
   Supplier names/costs are NOT stored here (see business-data.js + store.js).
   stock: "in_stock" | "low_stock" | "out_of_stock"
   ========================================================================== */
window.HB_CATEGORIES = [
  { id: "foodstuffs-dry-groceries", name: "Foodstuffs & Dry Groceries", emoji: "🥫", color: "#F6EFD8", blurb: "Rice, beans, garri and dry groceries" },
  { id: "household-cleaning", name: "Household & Cleaning Essentials", emoji: "🧼", color: "#E4F3E8", blurb: "House care, bathroom care and cleaning" },
  { id: "packaging-disposables", name: "Packaging & Disposable Supplies", emoji: "📦", color: "#F1EAF7", blurb: "Takeaway packs, wraps and disposables" },
  { id: "beverages-packaged-foods", name: "Beverages & Packaged Foods", emoji: "🥤", color: "#E2EEFB", blurb: "Drinks, snacks and packaged essentials" },
  { id: "office-stationery", name: "Office & Stationery Supplies", emoji: "📚", color: "#EAF0F7", blurb: "Paper, pens, files and accessories" },
  { id: "hotel-restaurant-hospitality", name: "Hotel, Restaurant & Hospitality Supplies", emoji: "🏨", color: "#F8E9DE", blurb: "Guestroom, kitchen and hospitality essentials" }
];

window.HB_SUBCATEGORIES = [
  { id: "rice", category: "foodstuffs-dry-groceries", name: "Rice", emoji: "🍚", description: "Local, foreign and parboiled rice", image: "assets/images/hero-photo.jpg" },
  { id: "beans", category: "foodstuffs-dry-groceries", name: "Beans", emoji: "🫘", description: "Brown, white, honey and oloyin beans", image: "assets/images/hero-photo.jpg" },
  { id: "garri", category: "foodstuffs-dry-groceries", name: "Garri", emoji: "🥣", description: "White and yellow garri", image: "assets/images/hero-photo.jpg" },
  { id: "yam", category: "foodstuffs-dry-groceries", name: "Yam & Yam Products", emoji: "🍠", description: "Fresh yam and yam flour", image: "assets/images/hero-photo.jpg" },
  { id: "flour", category: "foodstuffs-dry-groceries", name: "Flour & Baking Ingredients", emoji: "🌾", description: "Wheat, cassava and semovita", image: "assets/images/hero-photo.jpg" },
  { id: "cereals", category: "foodstuffs-dry-groceries", name: "Cereals & Grains", emoji: "🌽", description: "Maize, millet and healthy grains", image: "assets/images/hero-photo.jpg" },
  { id: "pasta", category: "foodstuffs-dry-groceries", name: "Pasta & Noodles", emoji: "🍝", description: "Spaghetti, macaroni and noodles", image: "assets/images/hero-photo.jpg" },
  { id: "sugar-salt", category: "foodstuffs-dry-groceries", name: "Sugar & Salt", emoji: "🧂", description: "Seasoning essentials for the kitchen", image: "assets/images/hero-photo.jpg" },
  { id: "spices", category: "foodstuffs-dry-groceries", name: "Spices & Seasonings", emoji: "🌶️", description: "Flavorings and cooking essentials", image: "assets/images/hero-photo.jpg" },
  { id: "dried-fish", category: "foodstuffs-dry-groceries", name: "Dried Fish & Seafood", emoji: "🐟", description: "Dried fish and seafood flavours", image: "assets/images/hero-photo.jpg" },
  { id: "nuts-seeds", category: "foodstuffs-dry-groceries", name: "Nuts & Seeds", emoji: "🥜", description: "Groundnuts, seeds and snacks", image: "assets/images/hero-photo.jpg" },
  { id: "laundry", category: "household-cleaning", name: "Laundry Supplies", emoji: "🧺", description: "Detergents and washing essentials", image: "assets/images/hero-photo.jpg" },
  { id: "dishwashing", category: "household-cleaning", name: "Dishwashing Supplies", emoji: "🍽️", description: "Dish liquids and kitchen cleaning", image: "assets/images/hero-photo.jpg" },
  { id: "toilet-bathroom", category: "household-cleaning", name: "Toilet & Bathroom Cleaners", emoji: "🧼", description: "Bathroom and washroom care", image: "assets/images/hero-photo.jpg" },
  { id: "floor-surface", category: "household-cleaning", name: "Floor & Surface Cleaners", emoji: "🧹", description: "Floor care and disinfectants", image: "assets/images/hero-photo.jpg" },
  { id: "cleaning-tools", category: "household-cleaning", name: "Cleaning Tools", emoji: "🧽", description: "Mops, brushes and buckets", image: "assets/images/hero-photo.jpg" },
  { id: "tissue-paper", category: "household-cleaning", name: "Tissue & Paper Products", emoji: "🧻", description: "Toilet rolls and kitchen towels", image: "assets/images/hero-photo.jpg" },
  { id: "waste-management", category: "household-cleaning", name: "Waste Management", emoji: "🗑️", description: "Bins, liners and refuse items", image: "assets/images/hero-photo.jpg" },
  { id: "insect-control", category: "household-cleaning", name: "Insect Control", emoji: "🪲", description: "Insecticides and repellents", image: "assets/images/hero-photo.jpg" },
  { id: "bedsheets-pillowcases", category: "household-cleaning", name: "Bedsheets & Pillowcases", emoji: "🛏️", description: "Bedroom essentials and linens", image: "assets/images/hero-photo.jpg" },
  { id: "bath-mats", category: "household-cleaning", name: "Bath Mats", emoji: "🛁", description: "Bathroom mats and comfort items", image: "assets/images/hero-photo.jpg" },
  { id: "takeaway-packs", category: "packaging-disposables", name: "Takeaway Food Packs", emoji: "🥡", description: "Food packs for takeaway service", image: "assets/images/hero-photo.jpg" },
  { id: "plates-cutlery", category: "packaging-disposables", name: "Disposable Plates & Cutlery", emoji: "🍽️", description: "Plates, spoons, forks and knives", image: "assets/images/hero-photo.jpg" },
  { id: "cups", category: "packaging-disposables", name: "Disposable Cups", emoji: "🥤", description: "Hot and cold drink cups", image: "assets/images/hero-photo.jpg" },
  { id: "wrapping-foil", category: "packaging-disposables", name: "Food Wrapping & Foil", emoji: "📦", description: "Foil, cling film and wrapping", image: "assets/images/hero-photo.jpg" },
  { id: "carrier-bags", category: "packaging-disposables", name: "Carrier Bags & Nylon", emoji: "🛍️", description: "Bags, nylons and carry packs", image: "assets/images/hero-photo.jpg" },
  { id: "paper-bags", category: "packaging-disposables", name: "Paper Bags", emoji: "📦", description: "Paper packaging solutions", image: "assets/images/hero-photo.jpg" },
  { id: "storage-containers", category: "packaging-disposables", name: "Food Storage Containers", emoji: "🥡", description: "Containers for prep and storage", image: "assets/images/hero-photo.jpg" },
  { id: "cartons-boxes", category: "packaging-disposables", name: "Packaging Cartons & Boxes", emoji: "📦", description: "Cartons and storage boxes", image: "assets/images/hero-photo.jpg" },
  { id: "gloves", category: "packaging-disposables", name: "Disposable Gloves", emoji: "🧤", description: "Hygienic gloves for service use", image: "assets/images/hero-photo.jpg" },
  { id: "straws-napkins", category: "packaging-disposables", name: "Straws & Napkins", emoji: "🧻", description: "Drink, wipes and service details", image: "assets/images/hero-photo.jpg" },
  { id: "bottled-water", category: "beverages-packaged-foods", name: "Bottled Water", emoji: "💧", description: "Water packs and bottled essentials", image: "assets/images/hero-photo.jpg" },
  { id: "soft-drinks", category: "beverages-packaged-foods", name: "Soft Drinks", emoji: "🥤", description: "Coca-Cola, Pepsi, Fanta and more", image: "assets/images/hero-photo.jpg" },
  { id: "fruit-juices", category: "beverages-packaged-foods", name: "Fruit Juices", emoji: "🧃", description: "Juice options for homes and shops", image: "assets/images/hero-photo.jpg" },
  { id: "malt-energy", category: "beverages-packaged-foods", name: "Malt & Energy Drinks", emoji: "⚡", description: "Malt and energy drinks in packs", image: "assets/images/hero-photo.jpg" },
  { id: "tea-coffee", category: "beverages-packaged-foods", name: "Tea & Coffee", emoji: "☕", description: "Tea bags and coffee products", image: "assets/images/hero-photo.jpg" },
  { id: "milk-dairy", category: "beverages-packaged-foods", name: "Milk & Dairy Products", emoji: "🥛", description: "Milk, dairy and beverage mixes", image: "assets/images/hero-photo.jpg" },
  { id: "biscuits-crackers", category: "beverages-packaged-foods", name: "Biscuits & Crackers", emoji: "🍪", description: "Snacks and savoury bites", image: "assets/images/hero-photo.jpg" },
  { id: "snacks-confectionery", category: "beverages-packaged-foods", name: "Snacks & Confectionery", emoji: "🍬", description: "Treats, gums and snack packs", image: "assets/images/hero-photo.jpg" },
  { id: "canned-preserved", category: "beverages-packaged-foods", name: "Canned & Preserved Foods", emoji: "🐟", description: "Canned fish, vegetables and more", image: "assets/images/hero-photo.jpg" },
  { id: "breakfast-cereals", category: "beverages-packaged-foods", name: "Breakfast Cereals", emoji: "🌾", description: "Cereal packs and breakfast staples", image: "assets/images/hero-photo.jpg" },
  { id: "paper-printing", category: "office-stationery", name: "Paper & Printing Supplies", emoji: "📄", description: "A4, A3 and printing essentials", image: "assets/images/hero-photo.jpg" },
  { id: "writing-materials", category: "office-stationery", name: "Writing Materials", emoji: "🖊️", description: "Pens, pencils and markers", image: "assets/images/hero-photo.jpg" },
  { id: "notebooks-pads", category: "office-stationery", name: "Notebooks & Writing Pads", emoji: "📓", description: "Notebooks, pads and desk notes", image: "assets/images/hero-photo.jpg" },
  { id: "files-folders", category: "office-stationery", name: "Files & Folders", emoji: "📂", description: "Files, folders and document holders", image: "assets/images/hero-photo.jpg" },
  { id: "desk-accessories", category: "office-stationery", name: "Desk Accessories", emoji: "🧮", description: "Calculators, rulers and desk tools", image: "assets/images/hero-photo.jpg" },
  { id: "office-equipment", category: "office-stationery", name: "Office Equipment", emoji: "🖨️", description: "Printers, consumables and tools", image: "assets/images/hero-photo.jpg" },
  { id: "filing-documentation", category: "office-stationery", name: "Filing & Documentation", emoji: "🧾", description: "Receipts, invoices and filing tools", image: "assets/images/hero-photo.jpg" },
  { id: "adhesives-correction", category: "office-stationery", name: "Adhesives & Correction Supplies", emoji: "✂️", description: "Glue, tape and correction materials", image: "assets/images/hero-photo.jpg" },
  { id: "room-essentials", category: "hotel-restaurant-hospitality", name: "Hotel Room Essentials", emoji: "🏨", description: "Guestroom items and room comfort", image: "assets/images/hero-photo.jpg" },
  { id: "guest-toiletries", category: "hotel-restaurant-hospitality", name: "Guest Toiletries & Amenities", emoji: "🧴", description: "Soap, toiletries and amenities", image: "assets/images/hero-photo.jpg" },
  { id: "towels-slippers", category: "hotel-restaurant-hospitality", name: "Towels & Slippers", emoji: "🩴", description: "Towels, slippers and guest comforts", image: "assets/images/hero-photo.jpg" },
  { id: "restaurant-dining", category: "hotel-restaurant-hospitality", name: "Restaurant & Dining Supplies", emoji: "🍽️", description: "Dining packs and table service items", image: "assets/images/hero-photo.jpg" },
  { id: "kitchen-utensils", category: "hotel-restaurant-hospitality", name: "Kitchen Utensils", emoji: "🥄", description: "Utility tools and kitchenware", image: "assets/images/hero-photo.jpg" },
  { id: "food-prep", category: "hotel-restaurant-hospitality", name: "Food Preparation Supplies", emoji: "🥘", description: "Preparation and service essentials", image: "assets/images/hero-photo.jpg" },
  { id: "commercial-cleaning", category: "hotel-restaurant-hospitality", name: "Commercial Cleaning Supplies", emoji: "🧼", description: "Bulk cleaning and upkeep products", image: "assets/images/hero-photo.jpg" },
  { id: "hospitality-laundry", category: "hotel-restaurant-hospitality", name: "Laundry Supplies", emoji: "🧺", description: "Laundry essentials for hospitality", image: "assets/images/hero-photo.jpg" }
];

window.HB = window.HB || {};
window.HB_SUBCATEGORY_LOOKUP = {};
window.HB_SUBCATEGORIES.forEach(function (sub) {
  window.HB_SUBCATEGORY_LOOKUP[sub.id] = sub;
});

window.HB.getSubcategory = function (id) { return window.HB_SUBCATEGORY_LOOKUP[id] || null; };
window.HB.getSubcategoriesForCategory = function (categoryId) {
  if (!categoryId || categoryId === "all") return [];
  return window.HB_SUBCATEGORIES.filter(function (sub) { return sub.category === categoryId; });
};

window.HB_SUBCATEGORY_RULES = {
  "foodstuffs-dry-groceries": {
    rice: ["rice", "ofada", "parboiled"],
    beans: ["beans", "brown beans", "white beans", "honey beans", "oloyin"],
    garri: ["garri"],
    yam: ["yam", "elubo"],
    flour: ["flour", "cassava", "semovita", "semolina", "wheat flour", "maize flour"],
    cereals: ["maize", "millet", "guinea corn", "oats", "cornflakes"],
    pasta: ["spaghetti", "macaroni", "noodles"],
    "sugar-salt": ["sugar", "salt"],
    spices: ["seasoning", "spice", "cubes"],
    "dried-fish": ["dried fish", "crayfish", "fish"],
    "nuts-seeds": ["groundnuts", "nuts", "seeds"]
  },
  "household-cleaning": {
    laundry: ["detergent", "washing powder", "laundry"],
    dishwashing: ["dishwashing liquid", "dishwashing"],
    "toilet-bathroom": ["toilet cleaner", "bath soap", "toothpaste", "sanitiser", "sanitizer", "soap"],
    "floor-surface": ["floor cleaner", "disinfectant", "bleach"],
    "cleaning-tools": ["mop", "bucket", "broom", "brush", "dustpan", "gloves", "cleaning"],
    "tissue-paper": ["tissue", "toilet tissue", "paper towel", "kitchen paper"],
    "waste-management": ["refuse", "bin liner", "waste", "bin"],
    "insect-control": ["insecticide", "mosquito", "insect"],
    "bedsheets-pillowcases": ["bedsheets", "pillowcases"],
    "bath-mats": ["bath mat", "bath-mat", "bath mats"]
  },
  "packaging-disposables": {
    "takeaway-packs": ["takeaway", "food pack"],
    "plates-cutlery": ["plate", "spoon", "fork", "knife"],
    cups: ["cup"],
    "wrapping-foil": ["foil", "cling film", "wrapping"],
    "carrier-bags": ["carrier bag", "nylon"],
    "paper-bags": ["paper bag"],
    "storage-containers": ["container", "storage"],
    "cartons-boxes": ["carton", "box", "packaging boxes"],
    gloves: ["glove"],
    "straws-napkins": ["straw", "napkin"]
  },
  "beverages-packaged-foods": {
    "bottled-water": ["water", "bottled water"],
    "soft-drinks": ["soft drink", "coca-cola", "pepsi", "fanta", "sprite"],
    "fruit-juices": ["juice"],
    "malt-energy": ["malt", "energy drink"],
    "tea-coffee": ["tea", "coffee"],
    "milk-dairy": ["milk", "evaporated", "powdered milk"],
    "biscuits-crackers": ["biscuit", "cracker"],
    "snacks-confectionery": ["sweet", "gum", "chips", "popcorn", "snack"],
    "canned-preserved": ["sardine", "tuna", "canned", "preserved"],
    "breakfast-cereals": ["breakfast cereal", "cereal"]
  },
  "office-stationery": {
    "paper-printing": ["paper", "printing"],
    "writing-materials": ["pen", "pencil", "marker"],
    "notebooks-pads": ["notebook", "pad"],
    "files-folders": ["file", "folder"],
    "desk-accessories": ["calculator", "ruler", "scissors"],
    "office-equipment": ["ink", "toner", "printer"],
    "filing-documentation": ["receipt", "invoice", "book"],
    "adhesives-correction": ["glue", "sticky", "correction", "stapler", "staple", "clip"]
  },
  "hotel-restaurant-hospitality": {
    "room-essentials": ["room", "air freshener"],
    "guest-toiletries": ["guest soap", "guest shampoo", "shower gel", "toiletries"],
    "towels-slippers": ["towel", "slipper"],
    "restaurant-dining": ["napkin", "tablecloth", "restaurant"],
    "kitchen-utensils": ["utensil", "kitchen"],
    "food-prep": ["preparation", "tray", "serving"],
    "commercial-cleaning": ["commercial cleaning", "cleaning supplies"],
    "hospitality-laundry": ["laundry bag", "laundry"]
  }
};

window.HB.productSubcategory = function (product) {
  if (!product) return null;
  if (product.subcategory) return product.subcategory;
  var category = product.category || "";
  var name = String(product.name || "").toLowerCase();
  var rules = window.HB_SUBCATEGORY_RULES[category] || {};
  var keys = Object.keys(rules);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var words = rules[key] || [];
    for (var j = 0; j < words.length; j++) {
      if (name.indexOf(words[j]) > -1) return key;
    }
  }
  return null;
};

window.HB.getProductsForSubcategory = function (categoryId, subcategoryId) {
  var list = window.HB_PRODUCTS || [];
  return list.filter(function (product) {
    return product.category === categoryId && window.HB.productSubcategory(product) === subcategoryId;
  });
};
window.HB.subcategoryCoverImage = function (categoryId, subcategoryId) {
  var sub = window.HB.getSubcategory(subcategoryId);
  if (sub && sub.coverImage && String(sub.coverImage).trim()) return sub.coverImage;
  var products = window.HB.getProductsForSubcategory(categoryId, subcategoryId).filter(function (product) { return product && product.image; });
  if (products.length) return products[0].image;
  return "assets/images/hero-photo.jpg";
};

window.HB_PRODUCTS = [
  { id: "sugar-1kg", name: "Granulated Sugar", category: "foodstuffs-dry-groceries", unit: "1kg pack", price: 1900, emoji: "🍬", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "White granulated sugar.", options: [{ id: "500g", label: "500g", price: 1100 }, { id: "1kg", label: "1kg", price: 1900 }, { id: "2kg", label: "2kg", price: 3600 }, { id: "5kg", label: "5kg", price: 9000 }] },
  { id: "milk-400", name: "Powdered Milk", category: "beverages-packaged-foods", unit: "400g tin", price: 4800, emoji: "🥛", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Full-cream powdered milk." },
  { id: "eggs-30", name: "Table Eggs", category: "foodstuffs-dry-groceries", unit: "Crate of 30", price: 4500, emoji: "🥚", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "A full crate of table eggs.", options: [{ id: "piece", label: "1 piece", price: 170 }, { id: "6-pieces", label: "6 pieces", price: 900 }, { id: "12-pieces", label: "12 pieces", price: 1800 }, { id: "crate", label: "1 crate", price: 4500 }] },
  { id: "seasoning", name: "Seasoning Cubes", category: "foodstuffs-dry-groceries", unit: "Carton", price: 9500, emoji: "🧂", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Carton of seasoning cubes for cooking." },
  { id: "noodles-40", name: "Instant Noodles", category: "foodstuffs-dry-groceries", unit: "Carton of 40", price: 9000, emoji: "🍜", stock: "low_stock", image: "assets/images/hero-photo.jpg", description: "Quick-cook noodles in a carton." },
  { id: "tomato-50", name: "Tomato Paste", category: "foodstuffs-dry-groceries", unit: "Carton of 50 sachets", price: 10500, emoji: "🍅", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Sachet tomato paste for stews." },
  { id: "rice-25kg", name: "Parboiled Rice", category: "foodstuffs-dry-groceries", unit: "25kg bag", price: 48000, emoji: "🍚", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Long-grain parboiled rice, bag.", options: [{ id: "1kg", label: "1kg", price: 1900 }, { id: "5kg", label: "5kg", price: 9500 }, { id: "10kg", label: "10kg", price: 19500 }, { id: "25kg", label: "25kg", price: 48000 }, { id: "50kg", label: "50kg", price: 95000 }] },
  { id: "rice-10kg", name: "Parboiled Rice", category: "foodstuffs-dry-groceries", unit: "10kg bag", price: 20500, emoji: "🍚", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Long-grain parboiled rice, smaller bag.", options: [{ id: "1kg", label: "1kg", price: 1900 }, { id: "5kg", label: "5kg", price: 9500 }, { id: "10kg", label: "10kg", price: 20500 }, { id: "25kg", label: "25kg", price: 48000 }, { id: "50kg", label: "50kg", price: 95000 }] },
  { id: "beans-5kg", name: "Brown Beans", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 9500, emoji: "🫘", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Clean dried brown beans." },
  { id: "garri-5kg", name: "Garri", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 5500, emoji: "🥣", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Dry-milled cassava garri." },
  { id: "semo-5kg", name: "Semovita", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 7500, emoji: "🍲", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Semolina swallow flour." },
  { id: "yamflour-5kg", name: "Yam Flour", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 8000, emoji: "🍠", stock: "low_stock", image: "assets/images/hero-photo.jpg", description: "Yam flour (elubo)." },
  { id: "palmoil-4l", name: "Palm Oil", category: "foodstuffs-dry-groceries", unit: "4 litre gallon", price: 12000, emoji: "🫒", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Red palm oil." },
  { id: "vegoil-5l", name: "Vegetable Cooking Oil", category: "foodstuffs-dry-groceries", unit: "5 litre bottle", price: 14500, emoji: "🫒", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Refined vegetable oil.", options: [{ id: "500ml", label: "500ml", price: 1700 }, { id: "1l", label: "1 litre", price: 3000 }, { id: "2l", label: "2 litres", price: 6000 }, { id: "5l", label: "5 litres", price: 14500 }, { id: "10l", label: "10 litres", price: 29000 }] },
  { id: "spaghetti-20", name: "Spaghetti", category: "foodstuffs-dry-groceries", unit: "Carton of 20 packs", price: 17500, emoji: "🍝", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Dried spaghetti, carton." },
  { id: "water-12", name: "Bottled Water", category: "beverages-packaged-foods", unit: "Pack of 12 (75cl)", price: 2600, emoji: "💧", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Table water in 75cl bottles.", options: [{ id: "single", label: "1 bottle", price: 260 }, { id: "pack", label: "Pack (12 bottles)", price: 2600 }, { id: "carton", label: "Carton (24 bottles)", price: 5200 }] },
  { id: "malt-24", name: "Malt Drink", category: "beverages-packaged-foods", unit: "Carton of 24", price: 15500, emoji: "🥤", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Non-alcoholic malt drink.", options: [{ id: "bottle", label: "Bottle", price: 700 }, { id: "pack", label: "Pack (6 bottles)", price: 3900 }, { id: "carton", label: "Carton (24 bottles)", price: 15500 }] },
  { id: "juice-1l", name: "Fruit Juice", category: "beverages-packaged-foods", unit: "1 litre pack", price: 1900, emoji: "🧃", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Ready-to-drink fruit juice." },
  { id: "tea-100", name: "Tea Bags", category: "beverages-packaged-foods", unit: "Box of 100", price: 2700, emoji: "🍵", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Black tea bags." },
  { id: "cocoa-400", name: "Cocoa Beverage Powder", category: "beverages-packaged-foods", unit: "400g tin", price: 3800, emoji: "☕", stock: "out_of_stock", image: "assets/images/hero-photo.jpg", description: "Chocolate beverage powder." },
  { id: "soap-4", name: "Bath Soap", category: "household-cleaning", unit: "Pack of 4", price: 1900, emoji: "🧼", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Gentle everyday bathing soap." },
  { id: "toothpaste", name: "Toothpaste", category: "household-cleaning", unit: "140g tube", price: 1700, emoji: "🪥", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Fluoride toothpaste." },
  { id: "tissue-10", name: "Toilet Tissue", category: "household-cleaning", unit: "Pack of 10 rolls", price: 3400, emoji: "🧻", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Soft toilet tissue rolls." },
  { id: "pads-8", name: "Sanitary Pads", category: "household-cleaning", unit: "Pack of 8", price: 1300, emoji: "🌸", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Absorbent sanitary pads." },
  { id: "lotion-400", name: "Body Lotion", category: "household-cleaning", unit: "400ml bottle", price: 3300, emoji: "🧴", stock: "low_stock", image: "assets/images/hero-photo.jpg", description: "Moisturising body lotion." },
  { id: "detergent-2k", name: "Laundry Detergent", category: "household-cleaning", unit: "2kg pack", price: 4800, emoji: "🧺", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Powder detergent.", options: [{ id: "pack", label: "1 pack", price: 1800 }, { id: "500g", label: "500g", price: 2400 }, { id: "1kg", label: "1kg", price: 3200 }, { id: "2kg", label: "2kg", price: 4800 }] },
  { id: "bleach-1l", name: "Bleach", category: "household-cleaning", unit: "1 litre bottle", price: 1600, emoji: "🪣", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Household bleach." },
  { id: "dishwash-750", name: "Dishwashing Liquid", category: "household-cleaning", unit: "750ml bottle", price: 1900, emoji: "🍽️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Grease-cutting dish liquid." },
  { id: "floor-1l", name: "Floor Cleaner", category: "household-cleaning", unit: "1 litre bottle", price: 2400, emoji: "🧹", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Multi-surface floor cleaner." },
  { id: "sanitiser-500", name: "Hand Sanitiser", category: "household-cleaning", unit: "500ml bottle", price: 2900, emoji: "🧴", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Hand sanitiser." },
  { id: "a4-ream", name: "A4 Printing Paper", category: "office-stationery", unit: "Ream (500 sheets)", price: 6800, emoji: "📄", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "White A4 paper." },
  { id: "liners-30", name: "Bin Liners (Large)", category: "household-cleaning", unit: "Roll of 30", price: 2800, emoji: "🗑️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Large refuse liners." },
  { id: "cups-100", name: "Disposable Cups", category: "packaging-disposables", unit: "Pack of 100", price: 3400, emoji: "🥛", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Paper cups for water and hot drinks." },
  { id: "kitchen-6", name: "Kitchen Paper Towels", category: "household-cleaning", unit: "Pack of 6 rolls", price: 4200, emoji: "🧻", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Absorbent kitchen towels." },
  { id: "tissue-bulk", name: "Bulk Toilet Tissue", category: "household-cleaning", unit: "Carton of 40 rolls", price: 11500, emoji: "🧻", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Carton of toilet tissue for guesthouses and offices." },
  { id: "guest-50", name: "Guest Toiletry Sets", category: "hotel-restaurant-hospitality", unit: "Box of 50 sets", price: 14500, emoji: "🏨", stock: "low_stock", image: "assets/images/hero-photo.jpg", description: "Soap and toiletry sets for guest rooms." },
  { id: "towel-12", name: "Hand Towels", category: "hotel-restaurant-hospitality", unit: "Pack of 12", price: 9800, emoji: "🧖", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Cotton hand towels for salons and guesthouses." },
  { id: "local-rice", name: "Local Rice", category: "foodstuffs-dry-groceries", unit: "25kg bag", price: 47000, emoji: "🍚", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Local rice suitable for home and bulk cooking." },
  { id: "foreign-rice", name: "Foreign Rice", category: "foodstuffs-dry-groceries", unit: "25kg bag", price: 50000, emoji: "🍚", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Imported rice, clean and premium." },
  { id: "parboiled-rice", name: "Parboiled Rice", category: "foodstuffs-dry-groceries", unit: "25kg bag", price: 48000, emoji: "🍚", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Long-grain parboiled rice." },
  { id: "ofada-rice", name: "Ofada Rice", category: "foodstuffs-dry-groceries", unit: "25kg bag", price: 52000, emoji: "🍚", stock: "low_stock", image: "assets/images/hero-photo.jpg", description: "Traditional Ofada rice, hearty and aromatic." },
  { id: "brown-beans", name: "Brown Beans", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 9500, emoji: "🫘", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Clean dried brown beans." },
  { id: "white-beans", name: "White Beans", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 9800, emoji: "🫘", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "White bean variety for soups and stews." },
  { id: "honey-beans", name: "Honey Beans", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 10200, emoji: "🫘", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Sweet, flavourful honey beans." },
  { id: "oloyin-beans", name: "Oloyin Beans", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 9900, emoji: "🫘", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Popular Oloyin beans for household cooking." },
  { id: "white-garri", name: "White Garri", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 5500, emoji: "🥣", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Creamy white garri for eba and soaking." },
  { id: "yellow-garri", name: "Yellow Garri", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 5800, emoji: "🥣", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Golden yellow garri with rich taste." },
  { id: "yam", name: "Yam", category: "foodstuffs-dry-groceries", unit: "Bag", price: 12000, emoji: "🍠", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Fresh yam tubers for boiling and pounded yam." },
  { id: "yam-flour-elubo", name: "Yam Flour (Elubo)", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 8000, emoji: "🍠", stock: "low_stock", image: "assets/images/hero-photo.jpg", description: "Traditional yam flour (elubo)." },
  { id: "cassava-flour", name: "Cassava Flour", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 7600, emoji: "🥣", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Cassava flour for cooking and baking." },
  { id: "wheat-flour", name: "Wheat Flour", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 8500, emoji: "🌾", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "All-purpose wheat flour for baking and cooking." },
  { id: "semolina", name: "Semolina", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 7800, emoji: "🌾", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Fine semolina for pudding and porridge." },
  { id: "semovita-product", name: "Semovita", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 7500, emoji: "🍲", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Semolina swallow flour." },
  { id: "maize", name: "Maize", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 7000, emoji: "🌽", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Dry maize grains for pap and grits." },
  { id: "millet", name: "Millet", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 7200, emoji: "🌾", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Millet grains for porridge and flour." },
  { id: "guinea-corn", name: "Guinea Corn", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 7100, emoji: "🌾", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Guinea corn grains for traditional meals." },
  { id: "oats", name: "Oats", category: "foodstuffs-dry-groceries", unit: "1kg bag", price: 3600, emoji: "🌾", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Healthy oats for porridge and breakfast." },
  { id: "salt", name: "Salt", category: "foodstuffs-dry-groceries", unit: "1kg pack", price: 1100, emoji: "🧂", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Table salt for everyday cooking." },
  { id: "custard-powder", name: "Custard Powder", category: "foodstuffs-dry-groceries", unit: "500g pack", price: 2900, emoji: "🥣", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Custard powder for breakfast desserts." },
  { id: "cornflakes", name: "Cornflakes", category: "foodstuffs-dry-groceries", unit: "500g pack", price: 3300, emoji: "🌽", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Crispy breakfast cereal." },
  { id: "spaghetti-item", name: "Spaghetti", category: "foodstuffs-dry-groceries", unit: "Carton of 20 packs", price: 17500, emoji: "🍝", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Dried spaghetti, carton." },
  { id: "macaroni", name: "Macaroni", category: "foodstuffs-dry-groceries", unit: "Carton of 20 packs", price: 17000, emoji: "🍜", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Dry macaroni pieces for soups and pasta meals." },
  { id: "noodles-item", name: "Noodles", category: "foodstuffs-dry-groceries", unit: "Carton of 40", price: 9000, emoji: "🍜", stock: "low_stock", image: "assets/images/hero-photo.jpg", description: "Quick-cook noodles in a carton." },
  { id: "groundnuts", name: "Groundnuts", category: "foodstuffs-dry-groceries", unit: "5kg bag", price: 9000, emoji: "🥜", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Roasted or raw groundnuts." },
  { id: "dried-crayfish", name: "Dried Crayfish", category: "foodstuffs-dry-groceries", unit: "1kg pack", price: 6500, emoji: "🦐", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Smoked and dried crayfish for flavouring soups." },
  { id: "dried-fish", name: "Dried Fish", category: "foodstuffs-dry-groceries", unit: "1kg pack", price: 7000, emoji: "🐟", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Dried fish for authentic meals." },
  { id: "washing-powder", name: "Washing Powder", category: "household-cleaning", unit: "2kg pack", price: 4800, emoji: "🧺", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Laundry washing powder." },
  { id: "liquid-detergent", name: "Liquid Detergent", category: "household-cleaning", unit: "750ml bottle", price: 2200, emoji: "🧴", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Fabric and household liquid detergent." },
  { id: "dishwashing-liquid", name: "Dishwashing Liquid", category: "household-cleaning", unit: "750ml bottle", price: 1900, emoji: "🍽️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Grease-cutting dish liquid." },
  { id: "toilet-cleaner", name: "Toilet Cleaner", category: "household-cleaning", unit: "1 litre bottle", price: 2400, emoji: "🧼", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Effective toilet cleaner for daily hygiene." },
  { id: "floor-cleaner", name: "Floor Cleaner", category: "household-cleaning", unit: "1 litre bottle", price: 2400, emoji: "🧹", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Multi-surface floor cleaner." },
  { id: "disinfectant", name: "Disinfectant", category: "household-cleaning", unit: "1 litre bottle", price: 2800, emoji: "🧴", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Disinfecting solution for surfaces and shared areas." },
  { id: "bleach-item", name: "Bleach", category: "household-cleaning", unit: "1 litre bottle", price: 1600, emoji: "🪣", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Household bleach." },
  { id: "air-freshener", name: "Air Freshener", category: "household-cleaning", unit: "1 can", price: 1700, emoji: "🌬️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Freshens rooms and shared spaces." },
  { id: "insecticide", name: "Insecticide", category: "household-cleaning", unit: "1 bottle", price: 2600, emoji: "🪲", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Indoor insect treatment liquid." },
  { id: "mosquito-repellent", name: "Mosquito Repellent", category: "household-cleaning", unit: "1 can", price: 2100, emoji: "🦟", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Mosquito repellent for homes and rooms." },
  { id: "toilet-rolls", name: "Toilet Rolls", category: "household-cleaning", unit: "Pack of 10 rolls", price: 3400, emoji: "🧻", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Soft toilet tissue rolls." },
  { id: "paper-towels", name: "Paper Towels", category: "household-cleaning", unit: "Pack of 6 rolls", price: 4200, emoji: "🧻", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Kitchen and cleaning paper towels." },
  { id: "facial-tissue", name: "Facial Tissue", category: "household-cleaning", unit: "Pack of 12", price: 2000, emoji: "🧻", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Soft facial tissue for home use." },
  { id: "refuse-bags", name: "Refuse Bags", category: "household-cleaning", unit: "Pack of 20", price: 1800, emoji: "🗑️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Heavy-duty refuse and bin bags." },
  { id: "cleaning-sponges", name: "Cleaning Sponges", category: "household-cleaning", unit: "Pack of 4", price: 1200, emoji: "🧽", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Household cleaning sponges." },
  { id: "scouring-pads", name: "Scouring Pads", category: "household-cleaning", unit: "Pack of 5", price: 1300, emoji: "🧽", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Heavy-duty scrubbing pads." },
  { id: "mops", name: "Mops", category: "household-cleaning", unit: "1 unit", price: 5000, emoji: "🧹", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Household floor mop set." },
  { id: "buckets", name: "Buckets", category: "household-cleaning", unit: "1 unit", price: 4200, emoji: "🪣", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Durable cleaning bucket." },
  { id: "brooms", name: "Brooms", category: "household-cleaning", unit: "1 unit", price: 3200, emoji: "🧹", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Broom for sweeping floors." },
  { id: "brushes", name: "Brushes", category: "household-cleaning", unit: "1 unit", price: 2500, emoji: "🪠", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Cleaning brush for surfaces and floors." },
  { id: "dustpans", name: "Dustpans", category: "household-cleaning", unit: "1 unit", price: 2200, emoji: "🧹", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Dustpan and sweep set." },
  { id: "cleaning-gloves", name: "Cleaning Gloves", category: "household-cleaning", unit: "Pair", price: 1800, emoji: "🧤", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Protective cleaning gloves." },
  { id: "handwashing-soap", name: "Handwashing Soap", category: "household-cleaning", unit: "Pack of 4", price: 1900, emoji: "🧼", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Handwashing soap for the household." },
  { id: "waste-bins", name: "Waste Bins", category: "household-cleaning", unit: "1 unit", price: 4800, emoji: "🗑️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Waste bin for bedrooms and offices." },
  { id: "bedsheets", name: "Bedsheets", category: "household-cleaning", unit: "Set", price: 9500, emoji: "🛏️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Household bedsheets for home and guest rooms." },
  { id: "pillowcases", name: "Pillowcases", category: "household-cleaning", unit: "Pair", price: 3500, emoji: "🛏️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Soft pillowcases for bedrooms." },
  { id: "bath-mats", name: "Bath Mats", category: "household-cleaning", unit: "1 unit", price: 4200, emoji: "🛁", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Absorbent bath mats for bathroom use." },
  { id: "takeaway-food-packs", name: "Takeaway Food Packs", category: "packaging-disposables", unit: "Pack of 50", price: 5500, emoji: "🥡", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Disposable takeaway packs for meals." },
  { id: "disposable-plates", name: "Disposable Plates", category: "packaging-disposables", unit: "Pack of 50", price: 4200, emoji: "🍽️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Food service disposable plates." },
  { id: "disposable-cups", name: "Disposable Cups", category: "packaging-disposables", unit: "Pack of 100", price: 3400, emoji: "🥤", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Paper cups for water and hot drinks." },
  { id: "disposable-spoons", name: "Disposable Spoons", category: "packaging-disposables", unit: "Pack of 100", price: 2200, emoji: "🥄", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Single-use spoons." },
  { id: "disposable-forks", name: "Disposable Forks", category: "packaging-disposables", unit: "Pack of 100", price: 2200, emoji: "🍴", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Single-use forks." },
  { id: "disposable-knives", name: "Disposable Knives", category: "packaging-disposables", unit: "Pack of 100", price: 2200, emoji: "🔪", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Single-use knives." },
  { id: "aluminium-foil", name: "Aluminium Foil", category: "packaging-disposables", unit: "Roll", price: 2600, emoji: "🍽️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Heavy aluminium foil for wrapping and packing." },
  { id: "cling-film", name: "Cling Film", category: "packaging-disposables", unit: "Roll", price: 2100, emoji: "📦", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Food wrapping cling film." },
  { id: "carrier-bags", name: "Carrier Bags", category: "packaging-disposables", unit: "Pack of 50", price: 1800, emoji: "🛍️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Reusable and lightweight carrier bags." },
  { id: "paper-bags", name: "Paper Bags", category: "packaging-disposables", unit: "Pack of 50", price: 2000, emoji: "📦", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Plain paper bags for packaging." },
  { id: "nylon-packaging", name: "Nylon Packaging", category: "packaging-disposables", unit: "Roll", price: 2500, emoji: "📦", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Nylon packaging material for food items." },
  { id: "straws", name: "Straws", category: "packaging-disposables", unit: "Pack of 100", price: 1600, emoji: "🥤", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Disposable drinking straws." },
  { id: "disposable-gloves", name: "Disposable Gloves", category: "packaging-disposables", unit: "Pack of 100", price: 2500, emoji: "🧤", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Food-safe disposable gloves." },
  { id: "food-storage-containers", name: "Food Storage Containers", category: "packaging-disposables", unit: "Pack of 10", price: 6500, emoji: "🥡", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Food safe storage containers for takeaway and prep." },
  { id: "sealing-tapes", name: "Sealing Tapes", category: "packaging-disposables", unit: "Roll", price: 1700, emoji: "📦", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Packaging and sealing tape." },
  { id: "packaging-cartoons", name: "Packaging Cartons", category: "packaging-disposables", unit: "Pack of 10", price: 4200, emoji: "📦", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Carton boxes for product packaging." },
  { id: "packaging-boxes", name: "Packaging Boxes", category: "packaging-disposables", unit: "Pack of 10", price: 4300, emoji: "📦", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Sturdy packaging boxes." },
  { id: "food-wrapping-paper", name: "Food Wrapping Paper", category: "packaging-disposables", unit: "Roll", price: 2200, emoji: "📦", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Food safe wrapping paper." },
  { id: "napkins", name: "Napkins", category: "packaging-disposables", unit: "Pack of 100", price: 2600, emoji: "🧻", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Paper napkins for home or service use." },
  { id: "tissue-dispensers", name: "Tissue Dispensers", category: "packaging-disposables", unit: "1 unit", price: 4700, emoji: "🧻", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Dispensers for hand or facial tissues." },
  { id: "soft-drinks", name: "Soft Drinks", category: "beverages-packaged-foods", unit: "Pack of 12", price: 5800, emoji: "🥤", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Carbonated soft drinks." },
  { id: "fruit-juices", name: "Fruit Juices", category: "beverages-packaged-foods", unit: "1 litre pack", price: 1900, emoji: "🧃", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Ready-to-drink fruit juice." },
  { id: "malt-drinks", name: "Malt Drinks", category: "beverages-packaged-foods", unit: "Carton of 24", price: 15500, emoji: "🥤", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Non-alcoholic malt drink." },
  { id: "energy-drinks", name: "Energy Drinks", category: "beverages-packaged-foods", unit: "Pack of 12", price: 6400, emoji: "⚡", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "High-energy drink cans and bottles." },
  { id: "tea", name: "Tea", category: "beverages-packaged-foods", unit: "Box of 100", price: 2700, emoji: "🍵", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Black tea bags." },
  { id: "coffee", name: "Coffee", category: "beverages-packaged-foods", unit: "500g pack", price: 4300, emoji: "☕", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Ground coffee for hot drinks." },
  { id: "powdered-beverages", name: "Powdered Beverages", category: "beverages-packaged-foods", unit: "400g tin", price: 3800, emoji: "☕", stock: "out_of_stock", image: "assets/images/hero-photo.jpg", description: "Flavoured beverage powder." },
  { id: "biscuits", name: "Biscuits", category: "beverages-packaged-foods", unit: "Pack", price: 2200, emoji: "🍪", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Sweet biscuit snack pack." },
  { id: "crackers", name: "Crackers", category: "beverages-packaged-foods", unit: "Pack", price: 2300, emoji: "🥨", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Savory crackers and biscuits." },
  { id: "sweets", name: "Sweets", category: "beverages-packaged-foods", unit: "Pack", price: 1500, emoji: "🍬", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Family pack sweets." },
  { id: "chewing-gum", name: "Chewing Gum", category: "beverages-packaged-foods", unit: "Pack", price: 900, emoji: "🍬", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Chewing gum pack." },
  { id: "potato-chips", name: "Potato Chips", category: "beverages-packaged-foods", unit: "Pack", price: 1800, emoji: "🥔", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Crispy potato chips." },
  { id: "plantain-chips", name: "Plantain Chips", category: "beverages-packaged-foods", unit: "Pack", price: 1900, emoji: "🍌", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Crispy plantain chips." },
  { id: "popcorn", name: "Popcorn", category: "beverages-packaged-foods", unit: "Pack", price: 1600, emoji: "🍿", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Ready-to-eat popcorn." },
  { id: "groundnut-snacks", name: "Groundnut Snacks", category: "beverages-packaged-foods", unit: "Pack", price: 1700, emoji: "🥜", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Roasted and packaged groundnut snacks." },
  { id: "sardines", name: "Sardines", category: "beverages-packaged-foods", unit: "Tin", price: 2400, emoji: "🐟", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Canned sardines." },
  { id: "canned-tuna", name: "Canned Tuna", category: "beverages-packaged-foods", unit: "Tin", price: 2700, emoji: "🐟", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Canned tuna in oil or water." },
  { id: "canned-vegetables", name: "Canned Vegetables", category: "beverages-packaged-foods", unit: "Tin", price: 2500, emoji: "🥦", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Canned vegetables for convenience cooking." },
  { id: "breakfast-cereals", name: "Breakfast Cereals", category: "beverages-packaged-foods", unit: "Pack", price: 3500, emoji: "🌾", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Ready-to-eat breakfast cereal." },
  { id: "powdered-milk-item", name: "Powdered Milk", category: "beverages-packaged-foods", unit: "400g tin", price: 4800, emoji: "🥛", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Full-cream powdered milk." },
  { id: "evaporated-milk", name: "Evaporated Milk", category: "beverages-packaged-foods", unit: "Tin", price: 2600, emoji: "🥛", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Evaporated milk for drinks and recipes." },
  { id: "a4-paper", name: "A4 Paper", category: "office-stationery", unit: "Ream (500 sheets)", price: 6800, emoji: "📄", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "White A4 paper for printing and copying." },
  { id: "a3-paper", name: "A3 Paper", category: "office-stationery", unit: "Ream", price: 9200, emoji: "📄", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Large format A3 drafting and printing paper." },
  { id: "pens", name: "Pens", category: "office-stationery", unit: "Pack", price: 1200, emoji: "🖊️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Ballpoint pens for office and home use." },
  { id: "pencils", name: "Pencils", category: "office-stationery", unit: "Pack", price: 900, emoji: "✏️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Sharpened pencils for writing and sketching." },
  { id: "markers", name: "Markers", category: "office-stationery", unit: "Pack", price: 1800, emoji: "🖍️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Permanent and whiteboard markers." },
  { id: "notebooks", name: "Notebooks", category: "office-stationery", unit: "Piece", price: 1200, emoji: "📓", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "A5 and A4 notebook options." },
  { id: "writing-pads", name: "Writing Pads", category: "office-stationery", unit: "Pack", price: 1400, emoji: "📝", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Writing pads for notes and meetings." },
  { id: "envelopes", name: "Envelopes", category: "office-stationery", unit: "Pack", price: 1300, emoji: "✉️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Plain office envelopes." },
  { id: "files", name: "Files", category: "office-stationery", unit: "Pack", price: 1800, emoji: "📂", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Office files and document holders." },
  { id: "folders", name: "Folders", category: "office-stationery", unit: "Pack", price: 1600, emoji: "📁", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Ring and pocket folders." },
  { id: "staplers", name: "Staplers", category: "office-stationery", unit: "Piece", price: 2600, emoji: "📎", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Heavy-duty office stapler." },
  { id: "staples-item", name: "Staples", category: "office-stationery", unit: "Box", price: 900, emoji: "📌", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Office stapler refill staples." },
  { id: "paper-clips", name: "Paper Clips", category: "office-stationery", unit: "Box", price: 700, emoji: "📎", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Standard and decorative paper clips." },
  { id: "drawing-pins", name: "Drawing Pins", category: "office-stationery", unit: "Box", price: 600, emoji: "📌", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Push pins for display boards." },
  { id: "printing-ink", name: "Printing Ink", category: "office-stationery", unit: "Cartridge", price: 7500, emoji: "🖨️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Printer ink cartridge." },
  { id: "printer-toner", name: "Printer Toner", category: "office-stationery", unit: "Cartridge", price: 8500, emoji: "🖨️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Laser printer toner cartridge." },
  { id: "receipt-books", name: "Receipt Books", category: "office-stationery", unit: "Book", price: 2800, emoji: "🧾", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Carbonless receipt books." },
  { id: "invoice-books", name: "Invoice Books", category: "office-stationery", unit: "Book", price: 3200, emoji: "🧾", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Invoice and order books." },
  { id: "calculators", name: "Calculators", category: "office-stationery", unit: "Piece", price: 4200, emoji: "🧮", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Basic calculator for office tasks." },
  { id: "sticky-notes", name: "Sticky Notes", category: "office-stationery", unit: "Pack", price: 1000, emoji: "📌", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Coloured sticky notes." },
  { id: "whiteboard-markers", name: "Whiteboard Markers", category: "office-stationery", unit: "Pack", price: 2000, emoji: "🖍️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Dry-erase markers for boards." },
  { id: "whiteboard-erasers", name: "Whiteboard Erasers", category: "office-stationery", unit: "Piece", price: 800, emoji: "🧽", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Whiteboard cleaner and eraser." },
  { id: "rulers", name: "Rulers", category: "office-stationery", unit: "Piece", price: 700, emoji: "📏", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Plastic or metal ruler." },
  { id: "scissors", name: "Scissors", category: "office-stationery", unit: "Piece", price: 1600, emoji: "✂️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Office and craft scissors." },
  { id: "glue", name: "Glue", category: "office-stationery", unit: "Bottle", price: 1000, emoji: "🧴", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Adhesive glue for school and office use." },
  { id: "correction-fluid", name: "Correction Fluid", category: "office-stationery", unit: "Bottle", price: 1200, emoji: "🖊️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Correction fluid and correction pen." },
  { id: "hotel-towels", name: "Towels", category: "hotel-restaurant-hospitality", unit: "Pack of 12", price: 9800, emoji: "🧖", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Cotton towels for hotel and restaurant use." },
  { id: "hotel-slippers", name: "Hotel Slippers", category: "hotel-restaurant-hospitality", unit: "Pair", price: 2200, emoji: "🩴", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Guest room slippers." },
  { id: "guest-toiletries", name: "Guest Toiletries", category: "hotel-restaurant-hospitality", unit: "Box of 50 sets", price: 14500, emoji: "🏨", stock: "low_stock", image: "assets/images/hero-photo.jpg", description: "Guest toiletries for hotel rooms and suites." },
  { id: "guest-soap", name: "Guest Soap", category: "hotel-restaurant-hospitality", unit: "Pack", price: 1500, emoji: "🧼", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Single-use guest soap bars." },
  { id: "guest-shampoo", name: "Guest Shampoo", category: "hotel-restaurant-hospitality", unit: "Bottle", price: 1800, emoji: "🧴", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Guestroom shampoo servings." },
  { id: "guest-shower-gel", name: "Guest Shower Gel", category: "hotel-restaurant-hospitality", unit: "Bottle", price: 1800, emoji: "🛁", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Shower gel for guestroom amenities." },
  { id: "toilet-amenities", name: "Toilet Amenities", category: "hotel-restaurant-hospitality", unit: "Set", price: 2600, emoji: "🚽", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Guest toilet amenity set." },
  { id: "room-air-fresheners", name: "Room Air Fresheners", category: "hotel-restaurant-hospitality", unit: "Pack", price: 2000, emoji: "🌬️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Fragrant room air fresheners." },
  { id: "laundry-bags", name: "Laundry Bags", category: "hotel-restaurant-hospitality", unit: "Pack", price: 3600, emoji: "🧺", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Laundry bags for guesthouses and hotels." },
  { id: "restaurant-napkins", name: "Restaurant Napkins", category: "hotel-restaurant-hospitality", unit: "Pack of 100", price: 2600, emoji: "🧻", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Paper napkins for restaurant service." },
  { id: "tablecloths", name: "Tablecloths", category: "hotel-restaurant-hospitality", unit: "Piece", price: 3400, emoji: "🍽️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Restaurant and event table covers." },
  { id: "serving-trays", name: "Serving Trays", category: "hotel-restaurant-hospitality", unit: "Piece", price: 4200, emoji: "🍽️", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Serving trays for meals and drinks." },
  { id: "hotel-food-storage-containers", name: "Food Storage Containers", category: "hotel-restaurant-hospitality", unit: "Pack of 10", price: 6500, emoji: "🥡", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Hospitality storage containers for kitchen prep and service." },
  { id: "kitchen-cleaning-tools", name: "Kitchen Cleaning Tools", category: "hotel-restaurant-hospitality", unit: "Set", price: 4500, emoji: "🧽", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Kitchen and hotel cleaning accessories." },
  { id: "commercial-cleaning-supplies", name: "Commercial Cleaning Supplies", category: "hotel-restaurant-hospitality", unit: "Set", price: 5200, emoji: "🧴", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Bulk cleaning supplies for commercial premises." },
  { id: "food-preparation-utensils", name: "Food Preparation Utensils", category: "hotel-restaurant-hospitality", unit: "Set", price: 7000, emoji: "🍴", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Commercial kitchen utensils." },
  { id: "disposable-guest-supplies", name: "Disposable Guest Supplies", category: "hotel-restaurant-hospitality", unit: "Pack", price: 4200, emoji: "🏨", stock: "in_stock", image: "assets/images/hero-photo.jpg", description: "Single-use hospitality and guest service supplies." }
];

(function () {
  function asNumber(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function option(id, label, price) {
    return { id: String(id), label: String(label), price: asNumber(price) };
  }

  function deriveBagOptions(product, baseSizes) {
    var base = asNumber(product.price);
    if (!base || !Array.isArray(baseSizes) || !baseSizes.length) return null;
    return baseSizes.map(function (item) {
      var id = String(item.id || item.label);
      var label = String(item.label || id);
      var price = item.price != null ? item.price : Math.round(base * (item.multiplier || 1));
      return option(id, label, price);
    });
  }

  function derivePackOptions(product, count) {
    var base = asNumber(product.price);
    if (!base || !Number.isInteger(count) || count < 1) return null;
    var singlePrice = Math.max(1, Math.round(base / count));
    return [option("single", "1 unit", singlePrice), option("pack", "Pack of " + count, base)];
  }

  function deriveCaseOptions(product, count, labelPrefix) {
    var base = asNumber(product.price);
    if (!base || !Number.isInteger(count) || count < 1) return null;
    var singlePrice = Math.max(1, Math.round(base / count));
    var packLabel = labelPrefix ? labelPrefix + " of " + count : "Pack of " + count;
    return [option("single", "1 unit", singlePrice), option("pack", packLabel, base)];
  }

  window.HB_PRODUCTS = (window.HB_PRODUCTS || []).map(function (product) {
    if (!product || (Array.isArray(product.options) && product.options.length)) return product;

    var name = (product.name || "").toLowerCase();
    var unit = (product.unit || "").toLowerCase();
    var text = name + " " + unit;
    var base = asNumber(product.price);
    var derived = null;

    if (/(rice|beans|garri|semovita|yam flour|cassava flour|wheat flour|semolina|maize|millet|guinea corn|groundnuts|ofada)/.test(text)) {
      var bagSizeMatch = String(product.unit || "").match(/(\d+(?:\.\d+)?)\s*(kg|g)/i);
      var bagSize = bagSizeMatch ? Number(bagSizeMatch[1]) : null;
      if (bagSize && bagSize > 0) {
        var sizes = [];
        if (bagSize >= 25) {
          sizes = [
            { id: "1kg", label: "1kg", multiplier: 1 / 25 },
            { id: "5kg", label: "5kg", multiplier: 5 / 25 },
            { id: "10kg", label: "10kg", multiplier: 10 / 25 },
            { id: "25kg", label: "25kg", multiplier: 1 },
            { id: "50kg", label: "50kg", multiplier: 2 }
          ];
        } else if (bagSize >= 10) {
          sizes = [
            { id: "1kg", label: "1kg", multiplier: 1 / 10 },
            { id: "5kg", label: "5kg", multiplier: 0.5 },
            { id: "10kg", label: "10kg", multiplier: 1 },
            { id: "25kg", label: "25kg", multiplier: 2.5 },
            { id: "50kg", label: "50kg", multiplier: 5 }
          ];
        } else if (bagSize >= 5) {
          sizes = [
            { id: "1kg", label: "1kg", multiplier: 0.2 },
            { id: "5kg", label: "5kg", multiplier: 1 },
            { id: "10kg", label: "10kg", multiplier: 2 },
            { id: "25kg", label: "25kg", multiplier: 5 },
            { id: "50kg", label: "50kg", multiplier: 10 }
          ];
        } else if (bagSize >= 1) {
          sizes = [
            { id: "500g", label: "500g", multiplier: 0.5 },
            { id: "1kg", label: "1kg", multiplier: 1 },
            { id: "2kg", label: "2kg", multiplier: 2 },
            { id: "5kg", label: "5kg", multiplier: 5 }
          ];
        }
        derived = deriveBagOptions(product, sizes);
      }
    } else if (/(palm oil|vegetable cooking oil|cooking oil|oil)/.test(text)) {
      derived = [
        option("500ml", "500ml", Math.max(1, Math.round(base * 0.22))),
        option("1l", "1 litre", Math.max(1, Math.round(base * 0.46))),
        option("2l", "2 litres", Math.max(1, Math.round(base * 0.9))),
        option("5l", "5 litres", Math.max(1, Math.round(base * 1.8))),
        option("10l", "10 litres", Math.max(1, Math.round(base * 3.6)))
      ];
    } else if (/(powdered milk|cocoa beverage powder|milk)/.test(text)) {
      derived = [
        option("400g", "400g", base),
        option("1kg", "1kg", Math.max(1, Math.round(base * 2))),
        option("2kg", "2kg", Math.max(1, Math.round(base * 4)))
      ];
    } else if (/(water|malt drink|soft drinks|fruit juice|juice|energy drinks)/.test(text)) {
      var unitText = String(product.unit || "").toLowerCase();
      if (/pack of 12|carton of 24|pack of 6|pack/.test(unitText)) {
        derived = [
          option("single", "1 unit", Math.max(1, Math.round(base / 12))),
          option("pack", "Pack", base)
        ];
      } else {
        derived = [option("single", "1 unit", base), option("carton", "Carton", Math.max(1, Math.round(base * 4)))];
      }
    } else if (/(toilet tissue|paper towels|sanitary pads|pads|towels|rolls|toilet rolls|pack of 10 rolls|pack of 12|pack of 8|pack of 6 rolls|roll of 30|pack of 100)/.test(text)) {
      var countMatch = String(product.unit || "").match(/(\d+)/);
      if (countMatch) {
        var countValue = Number(countMatch[1]);
        if (countValue > 0) {
          derived = deriveCaseOptions(product, countValue, (String(product.unit || "").toLowerCase().indexOf("roll") > -1 ? "Roll" : (String(product.unit || "").toLowerCase().indexOf("towel") > -1 ? "Pack" : "Pack")));
        }
      }
    } else if (/(a4 paper|paper|ream|pens|pencils|markers|notebooks|files|folders|envelopes|books|staples|paper clips|pins)/.test(text)) {
      var countMatch = String(product.unit || "").match(/(\d+)/);
      if (countMatch) {
        var countValue = Number(countMatch[1]);
        derived = derivePackOptions(product, countValue);
      }
    }

    if (derived && derived.length) {
      product.options = derived;
    }

    return product;
  });
})();

window.HB_PRODUCTS.forEach(function (product) {
  if (!product.subcategory) product.subcategory = window.HB.productSubcategory(product);
});

/* Home-page "popular" picks. Chosen by us, NOT from sales data. */
window.HB_FEATURED_IDS = ["rice-25kg", "vegoil-5l", "eggs-30", "malt-24", "detergent-2k", "tissue-bulk", "water-12", "noodles-40"];
