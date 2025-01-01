const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

const seedSuperAdmin = async () => {
  const existingSuperAdmin = await Admin.findOne({ role: "superadmin" });
  if (!existingSuperAdmin) {
    const superAdmin = new Admin({
      username: "superadmin",
      password: "SuperAdmin@WWDS#2025",
      role: "superadmin",
    });
    await superAdmin.save();
    console.log("Super admin created!");
  }
};

module.exports = seedSuperAdmin;
