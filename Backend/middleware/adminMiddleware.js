// Backend/middleware/adminMiddleware.js
export const adminOnly = (req, res, next) => {
  // protect middleware must run before this (so req.user exists)
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admins only" });
  }

  next();
};
