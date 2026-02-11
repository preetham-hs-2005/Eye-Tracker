export const notFound = (req, res) => {
  res.status(404).json({ message: `Not found: ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    message: err.message || 'Server error',
  });
};
