export const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  const zodIssues = err?.issues || err?.errors?.issues;
  if (err?.name === 'ZodError' || Array.isArray(zodIssues)) {
    if (isDev) {
      console.error('Validation error (Zod):', err);
    }
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: zodIssues ?? err.issues ?? null,
      stack: isDev ? err.stack : undefined,
    });
  }

  if (err?.name === 'CastError') {
    if (isDev) {
      console.error('Cast error:', err);
    }
    return res.status(400).json({
      success: false,
      message: 'Invalid identifier',
      errors: err.errors || null,
      stack: isDev ? err.stack : undefined,
    });
  }

  if (err?.name === 'ValidationError') {
    if (isDev) {
      console.error('Mongoose validation error:', err);
    }
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors || null,
      stack: isDev ? err.stack : undefined,
    });
  }

  if (isDev) {
    console.error(err.stack || err);
  } else {
    console.error(err?.message || err);
  }

  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';

  return res.status(status).json({
    success: false,
    message,
    errors: err?.errors || null,
    stack: isDev ? err.stack : undefined,
  });
};
