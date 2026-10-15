// Seeds the faculty admin account (from ADMIN_* env vars), a demo trainee in development,
// and the sample scenarios. Safe to re-run: scenarios are upserted by slug.
import { connectDb, disconnectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { User, Scenario } from '../models/index.js';
import { scenarioSchema } from '../controllers/admin.controller.js';
import dementia from './scenarios/dementia.js';
import breakingBadNews from './scenarios/breaking-bad-news.js';
import chestPain from './scenarios/chest-pain-acs.js';
import otitisMedia from './scenarios/otitis-media.js';
import pneumonia from './scenarios/pneumonia.js';
import ironDeficiencyAnaemia from './scenarios/iron-deficiency-anaemia.js';

const SCENARIOS = [dementia, breakingBadNews, chestPain, otitisMedia, pneumonia, ironDeficiencyAnaemia];

async function upsertUser({ email, password, name, role }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`  user exists: ${email} (${existing.role})`);
    return existing;
  }
  const user = await User.create({ email, name, role, passwordHash: await User.hashPassword(password) });
  console.log(`  created ${role}: ${email}`);
  return user;
}

async function main() {
  await connectDb();
  console.log('Seeding users…');
  let admin = null;
  if (env.admin.email && env.admin.password) {
    admin = await upsertUser({ email: env.admin.email, password: env.admin.password, name: env.admin.name, role: 'admin' });
  } else {
    console.warn('  ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin account');
  }
  if (!env.isProd) {
    await upsertUser({ email: 'student@vitalist.local', password: 'Student123!', name: 'Demo Student', role: 'student' });
  }

  console.log('Seeding scenarios…');
  for (const raw of SCENARIOS) {
    const data = scenarioSchema.parse(raw); // same validation as the admin API
    await Scenario.findOneAndUpdate(
      { slug: data.slug },
      { ...data, ...(admin && { createdBy: admin._id }) },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
    );
    console.log(`  ✓ ${data.slug}`);
  }
  await disconnectDb();
}

main().catch(async (err) => {
  console.error(err);
  await disconnectDb();
  process.exit(1);
});
