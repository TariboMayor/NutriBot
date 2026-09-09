const nutritionKnowledge = require("../knowledge/nutritionKnowledge");

const generateReply = (message) => {
  const userMessage = message.toLowerCase().trim();

  if (userMessage.includes("hello") || userMessage.includes("hi")) {
    return "Hello! I'm Nia, your nutrition assistant. How can I help you today?";
  }

  if (userMessage.includes("calorie")) {
    return nutritionKnowledge.calories;
  }

  if (userMessage.includes("bmi")) {
    return nutritionKnowledge.bmi;
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