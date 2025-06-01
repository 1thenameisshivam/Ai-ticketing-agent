export const isAuthorize = (req, res, next) => {
  const user = req.user; // Assuming user info is attached to req by isAuthenticated middleware

  if (!user) {
    return res
      .status(403)
      .json({ message: "Forbidden: You do not have access to this resource" });
  }

  // Check if user has the required role
  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: You do not have the required permissions" });
  }

  next(); // User is authorized, proceed to the next middleware or route handler
};
