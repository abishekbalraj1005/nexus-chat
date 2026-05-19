const mongoose = require('mongoose');

async function test() {
  try {
    console.log("Connecting...");
    await mongoose.connect('mongodb+srv://db_admin:123@cluster0.7972jpb.mongodb.net/?appName=Cluster0');
    console.log("SUCCESS");
    process.exit(0);
  } catch (err) {
    console.error("FAIL:", err);
    process.exit(1);
  }
}

test();
