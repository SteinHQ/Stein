module.exports = (req, res, next) => {
  const user = res.locals.user;

  if (user && user.monthEnd) {
    const currentDate = new Date();

    // If passed the end date of accounting month, update it. Else, just add one to count
    if (currentDate > user.monthEnd) {
      user.monthEnd.setMonth(
        currentDate.getDate() >= user.monthEnd.getDate()
          ? currentDate.getMonth() + 1
          : currentDate.getMonth()
      );
      user.markModified("monthEnd");
      user.requestCount = 1;
    } else {
      user.requestCount += 1;
    }

    return user
      .save()
      .then(() => next())
      .catch(() => next());
  }

  return next();
};
