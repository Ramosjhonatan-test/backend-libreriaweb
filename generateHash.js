const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync("admin123", 10);
console.log("Hash generado:", hash);