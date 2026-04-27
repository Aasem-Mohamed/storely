import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/orders
 * Fetch orders for the authenticated customer
 * Sorted by most recent first
 */
export async function GET(request) {
  try {
    const authUser = verifyToken(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const orders = await Order.find({ user: authUser.id })
      .populate({
        path: "items.product",
        select: "name images category",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
