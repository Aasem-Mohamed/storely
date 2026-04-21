import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/auth";

/**
 * POST /api/checkout
 * Process an order:
 *   1. Validate all cart items have sufficient stock
 *   2. Decrement stock for each product
 *   3. Clear the user's cart
 *   4. Return success
 * Requires authentication
 */
export async function POST(request) {
  try {
    const authUser = verifyToken(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get user's cart
    const cart = await Cart.findOne({ user: authUser.id }).populate({
      path: "items.product",
      select: "name price stock isActive",
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    // Filter to valid items only
    const validItems = cart.items.filter(
      (item) => item.product && item.product.isActive
    );

    if (validItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid items in cart" },
        { status: 400 }
      );
    }

    // Check stock availability for all items
    const stockErrors = [];
    for (const item of validItems) {
      if (item.quantity > item.product.stock) {
        stockErrors.push(
          `"${item.product.name}" only has ${item.product.stock} in stock (requested ${item.quantity})`
        );
      }
    }

    if (stockErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient stock for some items",
          errors: stockErrors,
        },
        { status: 400 }
      );
    }

    // Decrement stock for each product
    const stockUpdates = validItems.map((item) =>
      Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      })
    );
    await Promise.all(stockUpdates);

    // Calculate order total
    const orderTotal = validItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Generate order ID
    const orderId = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Clear the cart
    cart.items = [];
    await cart.save();

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully",
        order: {
          orderId,
          items: validItems.map((item) => ({
            product: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            subtotal: item.product.price * item.quantity,
          })),
          total: orderTotal,
          status: "confirmed",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
