module.exports = (req, res, next) => {
  const user = res.locals.user;

  if (user && user.monthEnd) {
    const currentDate = new Date();

    // If passed the end date of accounting month, update it. Else, just add one to count
    if (currentDate > user.monthEnd) {
      currentDate.setMonth(user.monthEnd.getMonth() + 1);
      user.monthEnd = currentDate;
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
