import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

/**
 * POST /api/products/:id/reviews
 * Add a review to a product
 * Body: { rating, comment }
 * Requires authentication
 * Prevents duplicate reviews from the same user
 */
export async function POST(request, { params }) {
  try {
    const authUser = verifyToken(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please login to leave a review." },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const { rating, comment } = await request.json();

    // Validate
    if (!rating || !comment?.trim()) {
      return NextResponse.json(
        { success: false, message: "Rating and comment are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      (r) => r.user.toString() === authUser.id
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment.trim();
    } else {
      // Get user's name
      const user = await User.findById(authUser.id).select("name");
      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      // Add new review
      product.reviews.push({
        user: authUser.id,
        name: user.name,
        rating,
        comment: comment.trim(),
      });
    }

    // Save triggers the pre-save hook that recalculates averageRating
    await product.save();

    // Populate and return updated product
    await product.populate("reviews.user", "name");

    return NextResponse.json(
      {
        success: true,
        message: existingReview ? "Review updated successfully" : "Review added successfully",
        product: {
          reviews: product.reviews,
          averageRating: product.averageRating,
          numReviews: product.numReviews,
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
    console.error("Add review error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
