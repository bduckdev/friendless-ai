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
- [ ] Fancy home page with swiping cards and cool effects.

### General improvements

- [ ] Refactor tRPC routes and tests
- [ ] Refactor chat components and server action for sending stuff
- [ ] Prompt should produce actually good results.
