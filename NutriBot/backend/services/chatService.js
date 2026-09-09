const generateReply = (message) => {
  const userMessage = message.toLowerCase().trim();

  if (userMessage.includes("hello") || userMessage.includes("hi")) {
    return "Hello! I'm Nia, your nutrition assistant. How can I help you today?";
  }

  if (userMessage.includes("calorie")) {
    return "Calories are a measure of the energy provided by food and drinks.";
  }

  if (userMessage.includes("bmi")) {
    return "BMI, or Body Mass Index, is a measurement that uses height and weight to estimate a person's weight category.";
  }

  if (userMessage.includes("protein")) {
    return "Protein is an important nutrient that helps the body build and repair tissues.";
  }

  return "I'm still learning! Please ask me a nutrition-related question.";
};

module.exports = { generateReply };