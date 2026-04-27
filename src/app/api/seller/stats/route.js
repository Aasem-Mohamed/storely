import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { requireRole } from "@/lib/auth";

/**
 * GET /api/seller/stats
 * Returns dashboard statistics for the authenticated seller
 */
export async function GET(request) {
  try {
    const auth = requireRole(request, "seller", "admin");
    if (!auth.authorized) return auth.response;

    await dbConnect();

    // Get seller's products
    const products = await Product.find({ seller: auth.user.id }).lean();

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive && p.stock > 0).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;

    // Get orders containing seller's products
    const orders = await Order.find({ "items.seller": auth.user.id }).lean();

    const totalOrders = orders.length;

    // Calculate revenue from seller's items only
    let totalRevenue = 0;
    for (const order of orders) {
      for (const item of order.items) {
        if (item.seller.toString() === auth.user.id) {
          totalRevenue += item.price * item.quantity;
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalProducts,
          activeProducts,
          outOfStock,
          totalOrders,
          totalRevenue,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch seller stats error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
