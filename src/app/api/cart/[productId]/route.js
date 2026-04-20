import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/Cart";
import { verifyToken } from "@/lib/auth";

/**
 * PATCH /api/cart/:productId
 * Update quantity of a specific item in cart
 * Body: { quantity }
 * Requires authentication
 */
export async function PATCH(request, { params }) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { productId } = await params;
    const { quantity } = await request.json();

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { success: false, message: "Valid quantity is required" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: user.id });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      // Remove item from cart
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      // Update quantity
      const item = cart.items.find(
        (item) => item.product.toString() === productId
      );
      if (!item) {
        return NextResponse.json(
          { success: false, message: "Item not found in cart" },
          { status: 404 }
        );
      }
      item.quantity = quantity;
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
        message: quantity === 0 ? "Item removed from cart" : "Quantity updated",
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
    console.error("Update cart item error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/:productId
 * Remove specific item from cart
 * Requires authentication
 */
export async function DELETE(request, { params }) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { productId } = await params;

    const cart = await Cart.findOne({ user: user.id });

    if (!cart) {
      return NextResponse.json(
        { success: false, message: "Cart not found" },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

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
        message: "Item removed from cart",
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
    console.error("Remove cart item error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
