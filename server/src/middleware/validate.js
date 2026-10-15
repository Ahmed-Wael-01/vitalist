import { HttpError } from '../utils/httpError.js';

/** Validate req.body against a zod schema and replace it with the parsed value. */
export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    return next(new HttpError(400, 'Validation failed', result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))));
  }
  req.body = result.data;
  next();
};
