import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

/**
 * POST /api/auth/register
 * Register a new user and return JWT token
 */
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, password, phone, role } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and password are required",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    // Only allow customer and seller roles during registration
    // Admin accounts should be created manually or via seed
    const allowedRoles = ["customer", "seller"];
    const userRole = allowedRoles.includes(role) ? role : "customer";

    // Create the user
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || "",
      role: userRole,
    });

    // Generate JWT token
    const token = generateToken(user);

    // Return user data without password
    const userResponse = user.toJSON();

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        token,
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle Mongoose validation errors
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

    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
