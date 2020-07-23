const notFound = (req, res, next) => {
  return next({ status: 404, message: "not found" });
};

module.exports = notFound;
