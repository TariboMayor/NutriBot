const normalizeRole = (role) => {
  if (!role) {
    return "";
  }

  return String(role)
    .trim()
    .toUpperCase();
};


const requireRole = (...allowedRoles) => {
  return (req, res, next) => {

    console.log(
      "\n========================================"
    );

    console.log(
      "ROLE MIDDLEWARE CHECK"
    );

    console.log(
      "========================================"
    );

    console.log(
      "req.user:",
      req.user
    );


    /*
     * Make sure the user is authenticated.
     */

    if (!req.user) {

      console.log(
        "RESULT: NO AUTHENTICATED USER"
      );

      console.log(
        "========================================\n"
      );

      return res.status(401).json({
        message:
          "Authentication required.",
      });
    }


    /*
     * Check all possible role property names.
     */

    const userRole =
      req.user.role ||
      req.user.user_role ||
      req.user.userRole ||
      req.user.type ||
      "";


    const normalizedUserRole =
      normalizeRole(
        userRole
      );


    const normalizedAllowedRoles =
      allowedRoles.map(
        normalizeRole
      );


    console.log(
      "User ID:",
      req.user.id
    );

    console.log(
      "Raw role:",
      userRole
    );

    console.log(
      "Normalized role:",
      normalizedUserRole
    );

    console.log(
      "Allowed roles:",
      normalizedAllowedRoles
    );


    /*
     * User has no role.
     */

    if (!normalizedUserRole) {

      console.log(
        "RESULT: USER HAS NO ROLE"
      );

      console.log(
        "========================================\n"
      );

      return res.status(403).json({
        message:
          "Your account does not have a valid role.",
      });
    }


    /*
     * Check permission.
     */

    if (
      !normalizedAllowedRoles.includes(
        normalizedUserRole
      )
    ) {

      console.log(
        "RESULT: ROLE PERMISSION DENIED"
      );

      console.log(
        "========================================\n"
      );

      return res.status(403).json({
        message:
          "You do not have permission to perform this action.",
      });
    }


    /*
     * Permission granted.
     */

    console.log(
      "RESULT: ROLE PERMISSION GRANTED"
    );

    console.log(
      "========================================\n"
    );


    next();
  };
};


module.exports = {
  requireRole,
};
