const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const isProd = process.env.NODE_ENV === 'production';

export const env = {
  isProd,
  port: Number(process.env.PORT ?? 5000),
  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/vitalist'),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', isProd ? undefined : 'dev-access-secret-change-me'),
    refreshSecret: required('JWT_REFRESH_SECRET', isProd ? undefined : 'dev-refresh-secret-change-me'),
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS ?? 7),
  },
  patientAi: {
    // The Groq SDK reads GROQ_API_KEY itself; we only check presence to decide on the scripted fallback.
    enabled: Boolean(process.env.GROQ_API_KEY),
    model: process.env.PATIENT_MODEL ?? 'openai/gpt-oss-120b',
    reasoningEffort: process.env.PATIENT_REASONING_EFFORT ?? 'low',
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME ?? 'Faculty Admin',
  },
};
