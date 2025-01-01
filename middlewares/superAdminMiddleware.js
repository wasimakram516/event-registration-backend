const isSuperAdmin = (req, res, next) => {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied. Super admin only." });
    }
    next();
  };
  
  module.exports = isSuperAdmin;
  