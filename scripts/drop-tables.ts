import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { max: 1 });

async function main() {
  await sql`DROP TABLE IF EXISTS "Suggestion" CASCADE`;
  await sql`DROP TABLE IF EXISTS "Document" CASCADE`;
  await sql`DROP TABLE IF EXISTS "Vote_v2" CASCADE`;
  await sql`DROP TABLE IF EXISTS "Message_v2" CASCADE`;
  await sql`DROP TABLE IF EXISTS "Stream" CASCADE`;
  await sql`DROP TABLE IF EXISTS "Chat" CASCADE`;
  await sql`DROP TABLE IF EXISTS "Account" CASCADE`;
  await sql`DROP TABLE IF EXISTS "User" CASCADE`;
  await sql`DROP TABLE IF EXISTS "Appointment" CASCADE`;
  await sql`DROP TABLE IF EXISTS "Lead" CASCADE`;
  await sql`DROP TABLE IF EXISTS "EmailMessage" CASCADE`;
  await sql`DROP TABLE IF EXISTS "EmailThread" CASCADE`;
  await sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`;
  console.log('All tables dropped successfully');
  await sql.end();
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
