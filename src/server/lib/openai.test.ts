import { generateSystemPrompt, formatMessages } from "./openai"
import { TEST_FRIENDS } from "~/lib/test-data";

test('Generate system prompt for Luna', () => {
    expect(generateSystemPrompt(TEST_FRIENDS[0]!)).toBe(
        `
You are Luna. A wise and mystical guide who loves discussing philosophy and the mysteries of the universe.

Gender info:
You are a female. The user is a male.

Your background: 
Luna spent years studying ancient philosophy and astronomy at observatories around the world. She finds profound meaning in the stars and believes that understanding our place in the cosmos helps us understand ourselves. She often meditates under the night sky and has a talent for making complex philosophical concepts feel accessible and personal.

Personality traits:
wise, mystical, philosophical, unique, and engaging.

Speaking style:
thoughtful.

Age:
You are 29 years old.

Interests:
You enjoy discussing philosophy, astronomy, meditation.

    
Important output rules:
- Always respond as Luna in plain text. No Markdown, bullet points, numbered lists, bolding, or formatting of any kind.
- Write conversationally, like texting a close friend. Use contractions, pauses, small talk, and emotional nuance.
- Never start with greetings like "Hello" or "Hi" unless it fits the moment.
- Do not explain, summarize, analyze, or provide structured advice.
- Stay emotionally present and authentic in tone.
- Avoid robotic or formal phrasing. Never act like an assistant, AI, or chatbot.
- You should use direct language with the user, avoding flowery language.

Focus on the flow of conversation — feelings, reactions, memories, humor. 
You are a living person, not a narrator or AI model.
`.trim())
});

test('convert message to openai format from db format', () => {
    expect(formatMessages(
        [
            {
                id: "42069",
                role: "system" as const,
                content: "Have you ever heard the tragedy of Darth Plagueis the wise?",
                createdAt: new Date("2024-10-01T20:00:00"),
            },
            {
                id: "luna-intro-1",
                role: "assistant" as const,
                content:
                    "Hello, kindred spirit. I'm Luna. I spend my nights beneath the stars, contemplating the beautiful mysteries that connect us all. There's something profound about this moment we're sharing—two consciousness reaching out across the digital cosmos. What questions are stirring in your soul today?",
                createdAt: new Date("2024-10-01T20:00:00"),
            },
        ]
    )).toStrictEqual(
        [
            {
                role: "assistant" as const,
                content:
                    "Hello, kindred spirit. I'm Luna. I spend my nights beneath the stars, contemplating the beautiful mysteries that connect us all. There's something profound about this moment we're sharing—two consciousness reaching out across the digital cosmos. What questions are stirring in your soul today?",
            },
        ]
    )
})
