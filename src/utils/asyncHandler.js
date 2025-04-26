// export const asyncHandler = (requestHandler) => {
//   return (req, res, next) => {
//     Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
//   };
// };

export const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (err) {
    console.log("Caught error in asyncHandler: ", err);
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
};
