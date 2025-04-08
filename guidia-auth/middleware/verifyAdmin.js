/**
 * Middleware to verify that the user is an admin
 */
function verifyAdmin(req, res, next) {
  // Check if user exists and has admin role (roleID = 1)
  if (!req.user || req.user.roleId !== 1) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  
  next();
}

module.exports = verifyAdmin;
