import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/wishlist
 * Get current user's wishlist with populated product details
 * Requires authentication
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

    const user = await User.findById(authUser.id)
      .populate({
        path: "wishlist",
        select: "name price images stock category isActive averageRating numReviews description",
      })
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Filter out inactive or deleted products
    const wishlist = (user.wishlist || []).filter(
      (product) => product && product.isActive
    );

    return NextResponse.json(
      {
        success: true,
        wishlist,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist
 * Add a product to wishlist
 * Body: { productId }
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

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, message: "Product not found or unavailable" },
        { status: 404 }
      );
    }

    const user = await User.findById(authUser.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const alreadyInWishlist = user.wishlist.some(
      (id) => id.toString() === productId
    );

    if (alreadyInWishlist) {
      return NextResponse.json(
        { success: true, message: "Product already in wishlist" },
        { status: 200 }
      );
    }

    user.wishlist.push(productId);
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Product added to wishlist",
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
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wishlist
 * Remove a product from wishlist
 * Body: { productId }
 * Requires authentication
 */
export async function DELETE(request) {
  try {
    const authUser = verifyToken(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    await User.findByIdAndUpdate(authUser.id, {
      $pull: { wishlist: productId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product removed from wishlist",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
