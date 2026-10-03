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

/*
  Gemini models to try.

  If the first model is temporarily unavailable,
  we automatically try the next one.
*/
const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
];

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
`;

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

async function generateReply(message, history = []) {
  const userMessage = String(message || "").trim();

  if (!userMessage) {
    return "Please tell me what you would like help with.";
  }

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured on the backend."
    );
  }

  const contents = [
    ...cleanHistory(history),
    {
      role: "user",
      parts: [
        {
          text: userMessage,
        },
      ],
    },
  ];

  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`Trying Gemini model: ${model}`);

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

      /*
        Only continue to another model when the
        problem appears temporary.

        Other errors should not be hidden.
      */
      if (!isTemporaryGeminiError(error)) {
        break;
      }

      console.log(
        `Trying the next Gemini model...`
      );
    }
  }

  console.error(
    "All Gemini models failed:",
    lastError?.message || lastError
  );

  throw new Error(
    "Nia could not generate a response right now. Please try again."
  );
}

module.exports = {
  generateReply,
};
