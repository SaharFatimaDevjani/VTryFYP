// this only works if protect ran first in the route chain, since it
// relies on req.user already being set
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admins only" });
  }

  next();
};
