const nutritionKnowledge = require("../knowledge/nutritionKnowledge");
const { calculateBMI } = require("./bmiService");

const generateReply = (message) => {
  const userMessage = message.toLowerCase().trim();

  // Greeting
  if (userMessage.includes("hello") || userMessage.includes("hi")) {
    return "Hello! I'm Nia, your nutrition assistant. How can I help you today?";
  }

  // BMI
  if (userMessage.includes("bmi")) {
  const numbers = userMessage.match(/\d+(\.\d+)?/g);

  if (!numbers || numbers.length < 2) {
    return "Please provide your weight in kilograms and height in meters. For example: 70 kg and 1.75 m.";
  }

  const weight = parseFloat(numbers[0]);
  const height = parseFloat(numbers[1]);

  if (weight <= 0 || height <= 0) {
    return "Please provide valid weight and height values greater than zero.";
  }

  const bmi = calculateBMI(weight, height);

  return `Your calculated BMI is ${bmi}.`;
}

  // Nutrition knowledge
  if (userMessage.includes("calorie")) {
    return nutritionKnowledge.calories;
  }

  if (userMessage.includes("protein")) {
    return nutritionKnowledge.protein;
  }

  if (userMessage.includes("carbohydrate")) {
    return nutritionKnowledge.carbohydrates;
  }

  if (userMessage.includes("vitamin")) {
    return nutritionKnowledge.vitamins;
  }

  return "I'm still learning! Please ask me a nutrition-related question.";
};

module.exports = { generateReply };