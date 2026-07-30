const postgres = require('postgres');
const sql = postgres('postgresql://postgres:walt111@187.124.112.200:5435/postgres', { prepare: false });
async function run() {
  try {
    const res = await sql`SELECT 1 as num`;
    console.log("Connected successfully:", res);
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await sql.end();
  }
}
run();
