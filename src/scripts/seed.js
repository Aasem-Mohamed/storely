/**
 * Storely Database Seeder
 *
 * Creates test users (admin, seller, customer) and sample products.
 * Run with: node src/scripts/seed.js
 *
 * NOTE: This script uses dynamic import for ES modules compatibility
 * and loads environment variables manually since it runs outside Next.js.
 */

const { readFileSync } = require("fs");
const { resolve } = require("path");

// Load .env.local manually
function loadEnv() {
  try {
    const envPath = resolve(__dirname, "../../.env.local");
    const envContent = readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        process.env[key.trim()] = valueParts.join("=").trim();
      }
    });
  } catch (err) {
    console.error("Could not load .env.local:", err.message);
    process.exit(1);
  }
}

loadEnv();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ---- Inline schemas (since we can't easily import ES modules) ----

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: "" },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },
    addresses: [
      {
        label: { type: String, default: "Home" },
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: "Egypt" },
        isDefault: { type: Boolean, default: false },
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, lowercase: true },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, min: 0, default: 0 },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviews: [],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

// ---- Seed Data ----

const users = [
  {
    name: "Admin User",
    email: "admin@storely.com",
    password: "admin123",
    phone: "+201234567890",
    role: "admin",
  },
  {
    name: "John Seller",
    email: "seller@storely.com",
    password: "seller123",
    phone: "+201234567891",
    role: "seller",
  },
  {
    name: "Jane Customer",
    email: "customer@storely.com",
    password: "customer123",
    phone: "+201234567892",
    role: "customer",
  },
];

const productTemplates = [
  {
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium noise-cancelling wireless headphones with 30-hour battery life and crystal clear sound quality.",
    price: 1299.99,
    category: "electronics",
    images: ["https://placehold.co/400x400?text=Headphones"],
    stock: 50,
  },
  {
    name: "Cotton Crew Neck T-Shirt",
    description:
      "Comfortable 100% organic cotton t-shirt. Available in multiple colors. Perfect for everyday wear.",
    price: 249.99,
    category: "clothing",
    images: ["https://placehold.co/400x400?text=T-Shirt"],
    stock: 200,
  },
  {
    name: "Stainless Steel Water Bottle",
    description:
      "Double-wall vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. 750ml capacity.",
    price: 349.99,
    category: "home & kitchen",
    images: ["https://placehold.co/400x400?text=Water+Bottle"],
    stock: 100,
  },
  {
    name: "Smart Watch Pro",
    description:
      "Feature-packed smartwatch with heart rate monitor, GPS, sleep tracking, and 7-day battery life.",
    price: 2499.99,
    category: "electronics",
    images: ["https://placehold.co/400x400?text=Smart+Watch"],
    stock: 30,
  },
  {
    name: "Running Shoes Ultra",
    description:
      "Lightweight running shoes with responsive cushioning and breathable mesh upper. Ideal for long distance running.",
    price: 899.99,
    category: "sports",
    images: ["https://placehold.co/400x400?text=Running+Shoes"],
    stock: 75,
  },
  {
    name: "Organic Green Tea Pack",
    description:
      "Premium Japanese organic green tea. 100 biodegradable tea bags. Rich in antioxidants.",
    price: 179.99,
    category: "food & beverages",
    images: ["https://placehold.co/400x400?text=Green+Tea"],
    stock: 150,
  },
  {
    name: "Laptop Stand Adjustable",
    description:
      "Ergonomic aluminum laptop stand with adjustable height and angle. Compatible with all laptops up to 17 inches.",
    price: 599.99,
    category: "electronics",
    images: ["https://placehold.co/400x400?text=Laptop+Stand"],
    stock: 60,
  },
  {
    name: "Leather Crossbody Bag",
    description:
      "Genuine leather crossbody bag with multiple compartments. Stylish and functional for everyday use.",
    price: 1499.99,
    category: "accessories",
    images: ["https://placehold.co/400x400?text=Leather+Bag"],
    stock: 40,
  },
];

// ---- Seed Function ----

async function seed() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log("✅ Cleared existing users and products\n");

    // Create users
    console.log("👤 Creating users...");
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`   ✅ Created ${user.role}: ${user.email}`);
    }
    console.log("");

    // Get the seller user for products
    const sellerUser = createdUsers.find((u) => u.role === "seller");

    // Create products
    console.log("📦 Creating products...");
    for (const productData of productTemplates) {
      const product = await Product.create({
        ...productData,
        seller: sellerUser._id,
      });
      console.log(`   ✅ Created: ${product.name} (${product.category})`);
    }
    console.log("");

    // Summary
    console.log("═══════════════════════════════════════════");
    console.log("  🎉 SEED COMPLETED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════");
    console.log("");
    console.log("  Test Accounts:");
    console.log("  ─────────────────────────────────────────");
    console.log("  Admin:    admin@storely.com    / admin123");
    console.log("  Seller:   seller@storely.com   / seller123");
    console.log("  Customer: customer@storely.com / customer123");
    console.log("");
    console.log(`  Products created: ${productTemplates.length}`);
    console.log("═══════════════════════════════════════════");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
