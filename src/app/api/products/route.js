import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { requireRole } from "@/lib/auth";

/**
 * GET /api/products
 * List all products with search, filtering, and pagination
 * Public — no authentication required
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit")) || 10));
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = { isActive: true };

    // Search by name or description
    const search = searchParams.get("search");
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    const category = searchParams.get("category");
    if (category) {
      filter.category = category.toLowerCase();
    }

    // Filter by price range
    const minPrice = parseFloat(searchParams.get("minPrice"));
    const maxPrice = parseFloat(searchParams.get("maxPrice"));
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.price = {};
      if (!isNaN(minPrice)) filter.price.$gte = minPrice;
      if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }

    // Filter by seller
    const sellerId = searchParams.get("seller");
    if (sellerId) {
      filter.seller = sellerId;
    }

    // Sort
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Execute query with pagination
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate("seller", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json(
      {
        success: true,
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product
 * Requires: seller or admin role
 */
export async function POST(request) {
  try {
    // Check authentication and role
    const auth = requireRole(request, "seller", "admin");
    if (!auth.authorized) return auth.response;

    await dbConnect();

    const body = await request.json();
    const { name, description, price, category, images, stock } = body;

    // Validate required fields
    if (!name || !description || price === undefined || !category) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, description, price, and category are required",
        },
        { status: 400 }
      );
    }

    // Create product with authenticated user as seller
    const product = await Product.create({
      name,
      description,
      price,
      category: category.toLowerCase(),
      images: images || [],
      stock: stock || 0,
      seller: auth.user.id,
    });

    // Populate seller info before returning
    await product.populate("seller", "name email");

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: messages,
        },
        { status: 400 }
      );
    }

    console.error("Create product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
