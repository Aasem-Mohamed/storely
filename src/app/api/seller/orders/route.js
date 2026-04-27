import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { requireRole } from "@/lib/auth";

/**
 * GET /api/seller/orders
 * Fetch orders containing products sold by the authenticated seller
 * Returns full order details with customer info (from shipping address)
 */
export async function GET(request) {
  try {
    const auth = requireRole(request, "seller", "admin");
    if (!auth.authorized) return auth.response;

    await dbConnect();

    // Find orders that contain items from this seller
    const orders = await Order.find({ "items.seller": auth.user.id })
      .populate({
        path: "items.product",
        select: "name images category",
      })
      .populate({
        path: "user",
        select: "name email phone",
      })
      .sort({ createdAt: -1 })
      .lean();

    // For each order, filter items to only show this seller's products
    // but keep the full order context (total, customer info, etc.)
    const sellerOrders = orders.map((order) => {
      const sellerItems = order.items.filter(
        (item) => item.seller.toString() === auth.user.id
      );
      const sellerTotal = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return {
        ...order,
        items: sellerItems,
        sellerTotal,
      };
    });

    return NextResponse.json(
      {
        success: true,
        orders: sellerOrders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch seller orders error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
