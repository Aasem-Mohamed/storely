import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { requireRole, verifyToken } from "@/lib/auth";

/**
 * GET /api/products/:id
 * Get a single product by ID
 * Public — no authentication required
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    const product = await Product.findById(id)
      .populate("seller", "name email")
      .populate("reviews.user", "name")
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    console.error("Get product error:", error);
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
 * PUT /api/products/:id
 * Full update of a product (all fields required)
 * Requires: seller (owner) or admin role
 */
export async function PUT(request, { params }) {
  try {
    const auth = requireRole(request, "seller", "admin");
    if (!auth.authorized) return auth.response;

    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    // Find the product
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Check ownership: seller can only update their own products, admin can update any
    if (
      auth.user.role !== "admin" &&
      product.seller.toString() !== auth.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only update your own products",
        },
        { status: 403 }
      );
    }

    const { name, description, price, category, images, stock } = body;

    // Validate required fields for full update
    if (!name || !description || price === undefined || !category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Full update requires name, description, price, and category",
        },
        { status: 400 }
      );
    }

    // Update all fields
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category.toLowerCase();
    product.images = images || product.images;
    product.stock = stock !== undefined ? stock : product.stock;

    await product.save();
    await product.populate("seller", "name email");

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: messages },
        { status: 400 }
      );
    }

    console.error("Update product error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/:id
 * Partial update of a product (only send changed fields)
 * Requires: seller (owner) or admin role
 */
export async function PATCH(request, { params }) {
  try {
    const auth = requireRole(request, "seller", "admin");
    if (!auth.authorized) return auth.response;

    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    // Find the product
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Check ownership
    if (
      auth.user.role !== "admin" &&
      product.seller.toString() !== auth.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only update your own products",
        },
        { status: 403 }
      );
    }

    // Only update fields that are provided
    const allowedFields = [
      "name",
      "description",
      "price",
      "category",
      "images",
      "stock",
      "isActive",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "category") {
          product[field] = body[field].toLowerCase();
        } else {
          product[field] = body[field];
        }
      }
    }

    await product.save();
    await product.populate("seller", "name email");

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: messages },
        { status: 400 }
      );
    }

    console.error("Patch product error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/:id
 * Delete a product
 * Requires: seller (owner) or admin role
 */
export async function DELETE(request, { params }) {
  try {
    const auth = requireRole(request, "seller", "admin");
    if (!auth.authorized) return auth.response;

    await dbConnect();

    const { id } = await params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Check ownership
    if (
      auth.user.role !== "admin" &&
      product.seller.toString() !== auth.user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only delete your own products",
        },
        { status: 403 }
      );
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    console.error("Delete product error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
