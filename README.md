# friendless

friendless is an ai chat app to replace human interaction built with t3 stack.

## Current features

- CRUD functionality via postgres, tRPC, and Prisma
- Integration with OAI style APIs
- discord auth via nextauth
- next.js

## Instructions:

1. clone the repo
2. setup .env based on .env.example (openai api key, discord auth stuff, postgresdb, etc..)
3. migrate the db
4. bun install and bun dev
5. navigate to localhost:3000

## TODO:

### Planned Features

- [ ] Add subscriptions via stripe.
- [x] Stream tokens
- [x] Fancy home page with swiping cards and cool effects.
- [x] Profile Page
- [ ] Create Friend Form
- [x] Show that the friend is typing
- [x] Custom Sign In page

### General improvements

- [ ] Random types are || undefined but shouldn't be
- [x] Switch to RHF
- [ ] Actual pricing page
- [x] Message box should be a textarea
- [ ] Maybe instead of infinite scroll, swipe gallery should end on "Didn't find what you want? Make your own!"
- [ ] Make DB script not use DEFAULT_FRIENDS_TEMPLATE and instead use TEST_FRIENDS
- [ ] Refactor tRPC routes and tests
- [ ] Refactor chat components and server action for sending stuff
- [ ] Prompt should produce actually good results.

### Fixes

- [ ] ChatInput doesn't reset size properly after sent.
- [x] Excess leading and trailing whitespace in messages should be removed.

### Blocked

- [ ] Update profile page with billing info (blocked by subscription implementation
