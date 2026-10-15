import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { createApp } from './app.js';

await connectDb();
createApp().listen(env.port, () => {
  console.log(`Vitalist API listening on http://localhost:${env.port} (patient AI: ${env.patientAi.enabled ? `groq ${env.patientAi.model}` : 'scripted fallback'})`);
});
