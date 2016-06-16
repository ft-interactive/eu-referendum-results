export default Object.freeze({
  // No data
  NONE: 0,

  // Partial reports
  TURNOUT: 1,
  RUNNING_TOTAL: 1,

  // We know the outcome (Leave/Remain) but data is incomplete
  OUTCOME: 2,

  // we know the outcome and have all the data
  RESULT: 3,

  // we have the outcome but we have a message
  // from the PA saying corrections will follow
  RESULT_OLD: 4
});
