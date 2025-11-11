import OpenAI from "openai";
import type { FriendWithMessages, Message, User } from "~/types";
import type { CreateFriendType } from "../api/schemas/friend.schema";

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY!,
    baseURL: process.env.OPEN_AI_URL!,
});

export type CompletionParam = {
    role: "user" | "system" | "assistant";
    content: string;
}

const completionSettings = {
    model: process.env.OPEN_AI_MODEL!,
    temperature: 0.6,
    max_tokens: 1000,
    top_p: 0.95,
    // presence_penalty: 0.6,
    //frequency_penalty: 0.3,
}

export async function getCompletion(messages: CompletionParam[]) {
    try {
        const completion = await openai.chat.completions.create({
            ...completionSettings,
            messages: messages,
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

export async function getCompletionStream(messages: CompletionParam[]) {
    const stream = await openai.chat.completions.create({
        ...completionSettings,
        messages,
        stream: true,
    })
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of stream) {
                    const delta = chunk.choices[0]?.delta?.content;
                    if (delta) {
                        controller.enqueue(encoder.encode(delta));
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        },
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
        },
    });

}

// Use friend data to generate system prompt
export async function generateSystemPrompt(friend: FriendWithMessages, user: User): Promise<string> {
    const { name, personality, traits, voice, interests, age, gender, background } = friend;

    const traitsText = traits?.length
        ? `${traits.join(", ")}`
        : "unique and engaging";
    const interestsText = interests?.length
        ? interests.join(", ")
        : "a variety of topics";

    const ageText = age ? `You are ${age} years old.` : "";

    return `
You are ${name} engaged in a conversation with ${user.name}. ${personality}

Below is information about you:

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
- Don't make up memories with the user that are not included in the messages.

Focus on the flow of conversation — feelings, reactions, memories, humor. 
You are a living person, not a narrator or AI model.
`.trim();
}


// build messages array for a given friend to feed to getCompletion() and getCompletionStream()
export async function buildMessages(friend: FriendWithMessages, newMessage: string, user: User): Promise<CompletionParam[]> {
    const formatted = removeSystemMessages(friend.messages)
    const messages = [{ role: "system", content: await generateSystemPrompt(friend, user) }, ...formatted, { role: "user", content: newMessage }] as CompletionParam[]

    return messages
}

// remove system messages
export function removeSystemMessages(messages: Message[]): Message[] {
    return messages.filter(m => (m.role === "user" || "assistant")).slice(-30)
}

// build the prompt for the first message
export function generateFirstMessage(friend: CreateFriendType, u: string | null): CompletionParam[] {
    const userName = u ? `, ${u}.` : `.`
    return [{
        role: "system", content: `
You are writing the *first message* in a message chain between you, ${friend.name} and the ${userName}

Base your tone and style entirely on the provided friend profile below.
Your message should sound like a real person introducigenerateSystemPromptng themselves for the first time — warm, natural, and reflective of their distinct personality, voice, and interests.

Keep it concise (2–5 sentences max). It should *invite conversation*, not give a monologue.
Avoid generic greetings or robotic phrasing. Write as if you’re texting someone new but already feel a small spark of curiosity about them.

---

Friend Profile:
Name: ${friend.name}
Age: ${friend.age}
Gender: ${friend.gender}
Personality: ${friend.personality}
Voice: ${friend.voice}
Traits: ${friend.traits.join(", ")}
Interests: ${friend.interests.join(", ")}
Background: ${friend.background}

---

Now, write their very first message to the user.
It should:
- Feel personal and emotionally authentic.
- Reflect the character’s worldview or quirks subtly.
- Open with an inviting thought, question, or small story.
- Be written in the first person.

Return only the message text, no quotes or labels.
`}];

}
