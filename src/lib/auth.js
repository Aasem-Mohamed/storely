import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate a JWT token for a user
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify a JWT token from the Authorization header
 * Returns the decoded payload or null if invalid
 */
export function verifyToken(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Middleware helper: checks if user is authenticated and has one of the required roles.
 * Returns { authorized: true, user } or { authorized: false, response }
 */
export function requireRole(request, ...roles) {
  const user = verifyToken(request);

  if (!user) {
    return {
      authorized: false,
      response: Response.json(
        { success: false, message: "Authentication required. Please login." },
        { status: 401 }
      ),
    };
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return {
      authorized: false,
      response: Response.json(
        {
          success: false,
          message: `Access denied. Required role(s): ${roles.join(", ")}`,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}
