# friendless

Friendless is a dystopian ai chat app designed to replace human communication built with next, trpc, tailwind, and prisma.

## Instructions:

1. clone the repo
2. setup .env based on .env.example (openai api key, discord auth stuff, postgresdb, etc..)
3. migrate the db
4. bun install and bun dev
5. navigate to localhost:3000

## TODO:

### Planned Features

- [x] Stream tokens
- [x] Fancy home page with swiping cards and cool effects.
- [x] Profile Page
- [ ] Edit button on message
- [ ] Create Friend Form
- [ ] Friend profile popup in chat with edit function
- [x] Show that the friend is typing
- [x] Custom Sign In page
- [ ] ensure idempotent requests

### General improvements

- [x] Random types are || undefined but shouldn't be
- [x] Switch to RHF
- [x] Message box should be a textarea
- [x] Make DB script not use DEFAULT_FRIENDS_TEMPLATE and instead use TEST_FRIENDS
- [ ] Refactor tRPC routes and tests

### Fixes

- [ ] ChatInput doesn't reset size properly after sent.
- [x] Excess leading and trailing whitespace in messages should be removed.
