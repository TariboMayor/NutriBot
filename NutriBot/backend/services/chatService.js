const { calculateBMI } = require("./bmiService");

const { getNutritionByTopic } = require("./nutritionService");

const generateReply = async (message) => {
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

  // Nutrition knowledge from MySQL
  if (userMessage.includes("calorie")) {
    const results = await getNutritionByTopic("calories");

    if (results.length > 0) {
      return results[0].information;
    }
  }

  if (userMessage.includes("protein")) {
    const results = await getNutritionByTopic("protein");

    if (results.length > 0) {
      return results[0].information;
    }
  }

  if (userMessage.includes("carbohydrate")) {
    const results = await getNutritionByTopic("carbohydrates");

    if (results.length > 0) {
      return results[0].information;
    }
  }

  if (userMessage.includes("vitamin")) {
    const results = await getNutritionByTopic("vitamins");

    if (results.length > 0) {
      return results[0].information;
    }
  }

  if (userMessage.includes("fibre") || userMessage.includes("fiber")) {
  const results = await getNutritionByTopic("fibre");

  if (results.length > 0) {
    return results[0].information;
  }
}

if (userMessage.includes("fat")) {
  const results = await getNutritionByTopic("fats");

  if (results.length > 0) {
    return results[0].information;
  }
}

if (userMessage.includes("mineral")) {
  const results = await getNutritionByTopic("minerals");

  if (results.length > 0) {
    return results[0].information;
  }
}

if (userMessage.includes("water")) {
  const results = await getNutritionByTopic("water");

  if (results.length > 0) {
    return results[0].information;
  }
}

if (
  userMessage.includes("healthy eating") ||
  userMessage.includes("healthy diet")
) {
  const results = await getNutritionByTopic("healthy eating");

  if (results.length > 0) {
    return results[0].information;
  }
}

if (userMessage.includes("fruit")) {
  const results = await getNutritionByTopic("fruits");

  if (results.length > 0) {
    return results[0].information;
  }
}

if (userMessage.includes("vegetable")) {
  const results = await getNutritionByTopic("vegetables");

  if (results.length > 0) {
    return results[0].information;
  }
}

  return "I'm still learning! Please ask me a nutrition-related question.";
};

module.exports = { generateReply };