function Enum(...vals) {
  return Object.freeze(vals.reduce((o,s) => {
    o[s] = s;
    return o;
  }, {}));
}

export default Enum('RUSH', 'RESULT', 'RECOUNT');
