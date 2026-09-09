const calculateBMI = (weight, height) => {
  const bmi = weight / (height * height);

  return bmi.toFixed(2);
};


module.exports = { calculateBMI };

console.log(calculateBMI(70, 1.75));