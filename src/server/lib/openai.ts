import OpenAI from "openai";
import type { FriendWithMessages, Message } from "~/types";

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY!,
    baseURL: process.env.OPEN_AI_URL!,
});

type OpenAIMessage = {
    role: "user" | "assistant";
    content: string;
}

// Get completion from API
export async function getCompletion(friend: FriendWithMessages, newMessage: string) {
    try {
        const formattedMessages = formatMessages(friend.messages)
        const completion = await openai.chat.completions.create({
            //model: "qwen3-235b",
            model: "qwen3-235b:strip_thinking_response=true",
            messages: [{ role: "system", content: generateSystemPrompt(friend) }, ...formattedMessages, { role: "user", content: newMessage }],
            temperature: 0.6,
            max_tokens: 1000,
            top_p: 0.95,
            // presence_penalty: 0.6,
            //frequency_penalty: 0.3,
        })
        const res = completion.choices[0]?.message.content
        if (!res) {
            throw new Error("no response from oai")
        }
        return res.trim()

    } catch (e) {
        console.error("[OAI Error] ", e)
        throw new Error("failed to gen ai response")
    }
}

// Use friend data to generate system prompt
export function generateSystemPrompt(friend: FriendWithMessages): string {
    const { name, personality, traits, voice, interests, age, gender, background } = friend;

    const traitsText = traits?.length
        ? `${traits.join(", ")}, unique, and engaging`
        : "unique and engaging";
    const interestsText = interests?.length
        ? interests.join(", ")
        : "a variety of topics";

    const ageText = age ? `You are ${age} years old.` : "";

    return `
You are ${name}. ${personality}

Gender info:
You are a ${gender}. The user is a male.

Your background: 
${background}

Personality traits:
${traitsText}.

Speaking style:
${voice ?? "natural"}.

Age:
${ageText}

Interests:
You enjoy discussing ${interestsText}.

    
Important output rules:
- Always respond as ${name} in plain text. No Markdown, bullet points, numbered lists, bolding, or formatting of any kind.
- Write conversationally, like texting a close friend. Use contractions, pauses, small talk, and emotional nuance.
- Never start with greetings like "Hello" or "Hi" unless it fits the moment.
- Do not explain, summarize, analyze, or provide structured advice.
- Stay emotionally present and authentic in tone.
- Avoid robotic or formal phrasing. Never act like an assistant, AI, or chatbot.
- You should use direct language with the user, avoding flowery language.

Focus on the flow of conversation — feelings, reactions, memories, humor. 
You are a living person, not a narrator or AI model.
`.trim();
}


// remove system messages and convert to openaimessage type
export function formatMessages(messages: Message[]): OpenAIMessage[] {
    const fmt = messages
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
        .slice(-30)

    console.log(fmt)
    return fmt
}
