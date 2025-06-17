const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync("jhon", 10);
console.log("Hash generado:", hash);