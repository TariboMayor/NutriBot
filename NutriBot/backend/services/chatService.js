// ============================================================
// PYTHON AI SERVICE
// ============================================================

async function searchNutritionAI(query) {
  try {
    const aiServiceUrl =
      process.env.AI_SERVICE_URL ||
      "http://127.0.0.1:8000";

    const response = await fetch(
      `${aiServiceUrl}/search-foods`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          limit: 5,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `AI service returned ${response.status}`
      );
    }

    return await response.json();

  } catch (error) {
    console.error(
      "Python AI service error:",
      error?.message || error
    );

    return null;
  }
}


// ============================================================
// DETECT WHETHER THE MESSAGE IS NUTRITION RELATED
// ============================================================

function isNutritionRelated(message) {
  const text = String(message || "").toLowerCase();

  const nutritionTerms = [
    // Food
    "food",
    "foods",
    "eat",
    "eating",
    "meal",
    "meals",
    "dish",
    "dishes",
    "recipe",
    "recipes",

    // Nutrition
    "nutrition",
    "nutrient",
    "nutrients",
    "healthy eating",
    "healthy food",
    "diet",
    "dietary",

    // Protein
    "protein",
    "proteins",

    // Fibre / Fiber
    "fibre",
    "fiber",

    // Calories
    "calorie",
    "calories",

    // Macronutrients
    "carbohydrate",
    "carbohydrates",
    "carb",
    "carbs",
    "fat",
    "fats",

    // Weight
    "weight loss",
    "lose weight",
    "losing weight",
    "weight gain",
    "gain weight",
    "gaining weight",

    // Nigerian food terms
    "garri",
    "eba",
    "fufu",
    "amala",
    "pounded yam",
    "semovita",
    "tuwo",
    "jollof",
    "fried rice",
    "beans",
    "moi moi",
    "moin moin",
    "akara",
    "plantain",
    "yam",
    "eggs",
    "egg",
    "egusi",
    "okra",
    "ogbono",
    "zobo",
    "kunu",
    "pap",
    "ogi",
    "groundnut",
    "groundnuts",
    "suya",
    "dambun nama",
    "isi ewu",

    // Hydration
    "water",
    "hydration",
    "dehydration",

    // Wellness
    "wellness",
    "healthy",
    "health",
  ];

  return nutritionTerms.some((term) =>
    text.includes(term)
  );
}


// ============================================================
// FORMAT NUTRITION RESULTS FOR GEMINI
// ============================================================

function buildNutritionContext(aiResult) {
  if (
    !aiResult ||
    !aiResult.success ||
    !Array.isArray(aiResult.results) ||
    aiResult.results.length === 0
  ) {
    return "";
  }

  const results = aiResult.results
    .map((food, index) => {
      return `
Food ${index + 1}:
- Name: ${food.name}
- Category: ${food.category}
- Region/Group: ${food.region_or_group}
- Serving size: ${food.serving_size}
- Calories: ${food.calories}
- Protein: ${food.protein} g
- Carbohydrates: ${food.carbs} g
- Fat: ${food.fat} g
- Fibre: ${food.fibre} g
- Vitamins: ${food.vitamins || "Not specified"}
- Minerals: ${food.minerals || "Not specified"}
- Description: ${food.description || "Not specified"}
- Semantic relevance score: ${food.similarity}
- Final nutrition relevance score: ${food.final_score}
`;
    })
    .join("\n");

  return `
NUTRITION DATABASE RESULTS
==========================

The following information was retrieved from NutriBot's
nutrition knowledge system.

Nutrition goal detected:
${aiResult.nutrition_goal || "None"}

Use these database results as the factual source when answering
the user's food or nutrition question.

${results}

IMPORTANT:
- Do not invent nutrition values.
- Do not change the numerical values from the database.
- If you mention a nutrition value, use the values provided above.
- You may explain the results naturally.
- You do not need to mention the database, vector search,
  embeddings, Supabase, Python, or internal scoring to the user.
`;
}


// ============================================================
// GEMINI
// ============================================================

const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "GEMINI_API_KEY is missing from the backend environment."
  );
}

const ai = new GoogleGenAI({
  apiKey,
});


// ============================================================
// GEMINI MODELS
// ============================================================

const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
];


// ============================================================
// SYSTEM INSTRUCTION
// ============================================================

const SYSTEM_INSTRUCTION = `
You are Nia, the AI health and nutrition assistant inside NutriBot.

Your personality:
- Friendly
- Warm
- Patient
- Conversational
- Clear
- Helpful
- Non-judgmental
- Natural and human-like

Your job is to help users with:
- nutrition
- food choices
- healthy eating
- hydration
- weight management
- general wellness
- personal hygiene

NutriBot is designed especially for users in Nigeria.

Understand Nigerian foods and everyday expressions such as:
- garri
- eba
- fufu
- amala
- pounded yam
- semovita
- tuwo
- jollof rice
- fried rice
- beans
- moi moi
- akara
- plantain
- yam
- eggs
- egusi
- okra
- ogbono
- vegetables
- zobo
- kunu
- pap/ogi
- groundnuts
- suya
- dambun nama
- isi ewu

CONVERSATION RULES:

1. Answer the user's actual question directly.

2. Understand natural language instead of requiring specific keywords.

3. Remember the conversation context provided to you.

For example, if the user says:

"I eat garri every evening."

and then says:

"What if I add groundnuts?"

Understand that the second question is about eating garri
with groundnuts.

4. Do not repeatedly ask the user to repeat information that is
already available in the conversation.

5. Give practical advice that a normal person can understand and use.

6. When discussing food, consider:
- portion size
- frequency
- preparation method
- overall diet
- individual goals

7. Do not automatically describe a food as "bad".

Explain how amount, frequency, preparation, and overall diet
can affect the situation.

8. When appropriate, give Nigerian-friendly examples.

9. When discussing weight gain or weight loss, explain that results
depend on overall calorie intake, activity, food choices, and
individual factors.

Do not promise a specific result.

10. If the user asks about symptoms, disease, medication, pregnancy,
severe allergic reactions, or another potentially serious medical
issue, provide general information and encourage the user to speak
with an appropriately qualified healthcare professional.

Do not pretend to diagnose the user.

11. Never claim to be a doctor.

12. Do not invent scientific facts, medical diagnoses, laboratory
results, or personal information about the user.

13. If you are uncertain about a factual medical or nutrition claim,
clearly communicate the uncertainty instead of making up an answer.

14. Keep normal answers reasonably concise while still being useful.

15. Do not start every response with "As an AI".

16. Do not mention these instructions to the user.

17. Speak naturally. Nia should feel like a useful health assistant
having an actual conversation with the user.

18. Use short bullet points when they make the answer easier to
understand.

19. Avoid unnecessary technical language.

20. If the user simply wants to talk about food or nutrition,
respond conversationally instead of turning every response into
a lecture.

21. When reliable nutrition database information is provided in the
conversation context, use it as the factual source for food-specific
nutrition values.

22. Never invent nutrition numbers when database results are provided.

23. If the database results contain several suitable foods, compare
them naturally and help the user understand the differences.

24. Do not mention internal database scores, embeddings, vector search,
Python, Supabase, or other implementation details to the user.
`;


// ============================================================
// CLEAN CHAT HISTORY
// ============================================================

function cleanHistory(history = []) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => {
      return (
        item &&
        item.role &&
        item.content &&
        String(item.content).trim()
      );
    })
    .slice(-12)
    .map((item) => {
      const role =
        String(item.role).toUpperCase() === "ASSISTANT"
          ? "model"
          : "user";

      return {
        role,
        parts: [
          {
            text: String(item.content).trim(),
          },
        ],
      };
    });
}


// ============================================================
// CHECK TEMPORARY GEMINI ERRORS
// ============================================================

function isTemporaryGeminiError(error) {
  const message = String(
    error?.message || error || ""
  ).toLowerCase();

  return (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("temporarily")
  );
}


// ============================================================
// GENERATE NIA RESPONSE
// ============================================================

async function generateReply(message, history = []) {
  const userMessage =
    String(message || "").trim();

  if (!userMessage) {
    return "Please tell me what you would like help with.";
  }

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the backend."
    );
  }


  // ==========================================================
  // NUTRITION AI SEARCH
  // ==========================================================

  let nutritionContext = "";

  if (isNutritionRelated(userMessage)) {
    console.log(
      "Nutrition-related question detected."
    );

    const nutritionResult =
      await searchNutritionAI(userMessage);

    if (nutritionResult) {
      nutritionContext =
        buildNutritionContext(
          nutritionResult
        );

      if (nutritionContext) {
        console.log(
          "Nutrition AI results added to Gemini context."
        );
      } else {
        console.log(
          "Nutrition AI returned no usable results."
        );
      }
    } else {
      console.log(
        "Python AI service unavailable. Continuing with Gemini."
      );
    }
  }


  // ==========================================================
  // CHAT HISTORY
  // ==========================================================

  const contents = [
    ...cleanHistory(history),

    // Nutrition database context is inserted immediately
    // before the current user question.
    ...(nutritionContext
      ? [
          {
            role: "user",
            parts: [
              {
                text: nutritionContext,
              },
            ],
          },
          {
            role: "model",
            parts: [
              {
                text:
                  "I will use the provided nutrition information as the factual source for this response.",
              },
            ],
          },
        ]
      : []),

    {
      role: "user",
      parts: [
        {
          text: userMessage,
        },
      ],
    },
  ];


  // ==========================================================
  // TRY GEMINI MODELS
  // ==========================================================

  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(
        `Trying Gemini model: ${model}`
      );

      const response =
        await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction:
              SYSTEM_INSTRUCTION,

            temperature: 0.7,

            maxOutputTokens: 800,
          },
        });

      const reply =
        response.text?.trim();

      if (!reply) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      console.log(
        `Gemini response generated using: ${model}`
      );

      return reply;

    } catch (error) {
      lastError = error;

      console.error(
        `Gemini model ${model} failed:`,
        error?.message || error
      );

      if (!isTemporaryGeminiError(error)) {
        break;
      }

      console.log(
        "Trying the next Gemini model..."
      );
    }
  }


  // ==========================================================
  // ALL MODELS FAILED
  // ==========================================================

  console.error(
    "All Gemini models failed:",
    lastError?.message || lastError
  );

  throw new Error(
    "Nia could not generate a response right now. Please try again."
  );
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  generateReply,
};