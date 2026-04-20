import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/cart
 * Get current user's cart with populated product details
 * Requires authentication
 */
export async function GET(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    let cart = await Cart.findOne({ user: user.id }).populate({
      path: "items.product",
      select: "name price images stock category isActive",
    });

    if (!cart) {
      cart = { items: [] };
    }

    // Filter out items where product no longer exists or is inactive
    const validItems = (cart.items || []).filter(
      (item) => item.product && item.product.isActive
    );

    return NextResponse.json(
      {
        success: true,
        cart: {
          items: validItems,
          totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: validItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          ),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Add item to cart (or increase quantity if already exists)
 * Body: { productId, quantity? }
 * Requires authentication
 */
export async function POST(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Verify product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, message: "Product not found or unavailable" },
        { status: 404 }
      );
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: user.id });
    if (!cart) {
      cart = new Cart({ user: user.id, items: [] });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      // Cap at stock
      if (existingItem.quantity > product.stock) {
        existingItem.quantity = product.stock;
      }
    } else {
      const qty = Math.min(quantity, product.stock);
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();

    // Return populated cart
    await cart.populate({
      path: "items.product",
      select: "name price images stock category isActive",
    });

    const validItems = cart.items.filter(
      (item) => item.product && item.product.isActive
    );

    return NextResponse.json(
      {
        success: true,
        message: "Item added to cart",
        cart: {
          items: validItems,
          totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: validItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          ),
        },
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
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Clear entire cart
 * Requires authentication
 */
export async function DELETE(request) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    await Cart.findOneAndUpdate(
      { user: user.id },
      { items: [] },
      { returnDocument: "after" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Cart cleared",
        cart: { items: [], totalItems: 0, totalPrice: 0 },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
