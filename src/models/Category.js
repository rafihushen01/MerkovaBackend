const mongoose = require("mongoose");

// ===================== CATEGORIES & SUBCATEGORIES =====================
const categoryList = {
  "Electronics & Appliances": [
    "Smartphones",
    "Feature Phones",
    "iPhones",
    "Phone Cases & Covers",
    "Chargers & Cables",
    "Power Banks",
    "Headphones & Earbuds",
    "Bluetooth Devices",
    "Refrigerators",
    "Microwave Ovens",
    "Air Conditioners",
    "Fans",
    "Heaters",
    "Vacuum Cleaners",
    "Washing Machines",
    "Dryers",
    "Home Appliances Accessories",
    "Smart Home Devices",
    "Projectors",
    "LED TVs",
    "OLED TVs",
    "QLED TVs",
    "Smart TVs",
    "TV Mounts"
  ],

  "Computers & Accessories": [
    "Laptops",
    "Desktops",
    "Monitors",
    "Keyboards",
    "Mouse",
    "Printers & Scanners",
    "External Storage",
    "RAM & Memory",
    "Graphic Cards",
    "Processors",
    "Motherboards",
    "Cooling Systems",
    "Networking Devices",
    "Computer Cables & Adapters",
    "Laptop Bags & Sleeves"
  ],

  "Wearables & Smart Devices": [
    "Smart Watches",
    "Fitness Trackers",
    "VR Headsets",
    "Smart Glasses",
    "Wearable Accessories",
    "Smart Rings"
  ],

  "Fashion & Apparel": [
    "Mens T-Shirts",
    "Mens Shirts",
    "Mens Jeans",
    "Mens Trousers",
    "Mens Jackets",
    "Mens Suits",
    "Mens Traditional Wear",
    "Mens Activewear",
    "Mens Underwear",
    "Womens Tops",
    "Womens Shirts",
    "Womens Dresses",
    "Womens Jeans & Pants",
    "Womens Skirts",
    "Womens Jackets & Blazers",
    "Womens Sarees",
    "Womens Abayas & Modest Fashion",
    "Womens Activewear",
    "Womens Lingerie",
    "Boys Clothing",
    "Girls Clothing",
    "Infants & Toddlers Clothing",
    "School Uniforms",
    "Boys Teens Clothing",
    "Girls Teens Clothing",
    "School Uniforms Teens",
    "Mens Plus Size Fashion",
    "Womens Plus Size Fashion"
  ],

  "Shoes & Footwear": [
    "Mens Casual Shoes",
    "Mens Formal Shoes",
    "Mens Sports Shoes",
    "Womens Heels",
    "Womens Flats",
    "Womens Sports Shoes",
    "Kids Shoes",
    "Sneakers",
    "Boots",
    "Sandals",
    "Slippers"
  ],

  "Beauty, Health & Personal Care": [
    "Makeup",
    "Skincare",
    "Hair Care",
    "Nail Care",
    "Perfumes & Fragrances",
    "Oud & ATAR",
    "Health Supplements",
    "Personal Care",
    "Medical Equipment",
    "First Aid",
    "Sexual Wellness Products",
    "Oral Care",
    "Shaving & Grooming"
  ],

  "Sports, Gym & Fitness": [
    "Gym Clothing",
    "Gym Equipment",
    "Fitness Accessories",
    "Outdoor Sports",
    "Indoor Sports",
    "Yoga & Pilates",
    "Cycling Gear",
    "Swimming Gear"
  ],

  "Toys, Kids & Baby Products": [
    "Action Figures",
    "Dolls",
    "Board Games",
    "Educational Toys",
    "Baby Clothing",
    "Baby Accessories",
    "Strollers & Car Seats",
    "Baby Feeding & Care",
    "Soft Toys",
    "Puzzles",
    "Building Blocks"
  ],

  "Grocery, Food & Beverages": [
    "Snacks",
    "Chocolates",
    "Beverages",
    "Staples",
    "Organic & Health Food",
    "Coffee & Tea",
    "Spices & Condiments",
    "Canned Food",
    "Instant Food",
    "Dairy Products"
  ],

  "Books, Music & Movies": [
    "Fiction",
    "Non-Fiction",
    "Textbooks",
    "Comics & Graphic Novels",
    "Music CDs",
    "Vinyl Records",
    "Movies & TV Shows",
    "Educational Books",
    "Self-Help Books",
    "Magazines & Journals"
  ],

  "Home & Kitchen": [
    "Kitchen Appliances",
    "Cookware & Bakeware",
    "Dinnerware",
    "Storage & Organization",
    "Home Decor",
    "Furniture",
    "Lighting",
    "Bedding & Linen",
    "Cleaning Supplies",
    "Curtains & Blinds",
    "Wall Art & Posters",
    "Home Improvement Tools"
  ],

  "Automotive & Industrial": [
    "Car Accessories",
    "Motorbike Accessories",
    "EV Vehicles & Scooters",
    "Automotive Tools",
    "Industrial Equipment",
    "Garage & Workshop",
    "Car Care & Cleaning",
    "Tyres & Wheels"
  ],

  "Pet Supplies": [
    "Dog Food",
    "Cat Food",
    "Pet Accessories",
    "Aquarium Supplies",
    "Pet Toys",
    "Pet Health & Care",
    "Bird Supplies",
    "Small Pet Supplies"
  ],

  "Jewelry & Watches": [
    "Mens Watches",
    "Womens Watches",
    "Rings",
    "Necklaces",
    "Earrings",
    "Bracelets",
    "Anklets",
    "Cufflinks",
    "Brooches"
  ],

  "Office & Stationery": [
    "Office Supplies",
    "Writing Instruments",
    "Planners & Notebooks",
    "Printers & Scanners",
    "Office Furniture",
    "Paper & Notepads",
    "Desk Organizers"
  ],

  "Hobbies, Art & Craft": [
    "Arts & Painting",
    "Craft Supplies",
    "Musical Instruments",
    "Photography",
    "DIY Kits",
    "Collectibles",
    "Model Kits",
    "Sewing & Knitting"
  ],

  "Travel & Luggage": [
    "Suitcases",
    "Backpacks",
    "Travel Accessories",
    "Travel Gadgets",
    "Duffel Bags",
    "Carry-On Bags",
    "Travel Organizers"
  ],

  "Gaming & Entertainment": [
    "Gaming Consoles",
    "PC Games",
    "Console Games",
    "Gaming Accessories",
    "Board Games",
    "VR Games",
    "Game Controllers"
  ],

  "Education & Learning": [
    "School Supplies",
    "Educational Kits",
    "Learning Books",
    "Online Courses",
    "Flash Cards",
    "STEM Kits",
    "Language Learning"
  ]
};

// ===================== MERKOVA CATEGORY SCHEMA =====================
const MerkovaCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    enum: Object.keys(categoryList), // Only main categories
    required: true
  },
  subcategory: {
    type: String,
    validate: {
      validator: function(value) {
        // Check if subcategory belongs to selected category
        if (!this.category) return false;
        return categoryList[this.category].includes(value);
      },
      message: props => `${props.value} is not a valid subcategory for ${props.instance.category}`
    },
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("MerkovaCategory", MerkovaCategorySchema);
