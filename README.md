# Personalised web

A proof of concept demonstrating AI-powered, per-user website customization on cloudflare infrastructure.

## 🚀 Live Demo

Visit the deployed instance: [here!](https://cloudflare-bun-spa-website-art.theredxer.workers.dev) and start customising your own version of the site via the personalised input box.

## 💡 Inspiration

This project was inspired by [@threepointone's tweet](https://x.com/threepointone/status/1977822605748097241) about the future of personalized web experiences:

> "there's this line of code that I couldn't have imagined building at any point in my career that's possible today:
>
> `return new Response(generatePersonalisedPage({user})`
>
> every user gets an ai agent assigned to them, in a 15ms radius, with it's own memory and state and whatever. And for your website, for every user, you can spin up a sandbox to generate a page (real code!) based just on their own preferences and vibes (changing over time).
>
> Kind of insane. Someone should build this and kill it in the ecommerce game."

## How it works

This proof of concept demonstrates how each user can request and prompt their own personalized version of a website. The system:

- **User-specific customizations** - Each user can request a peronsalised version of the site with preferences which are generated and served to the user
- **Stores per-user customizations** - Each user's preferences and requests are remembered
- **Caches personalized pages** - Serves custom pages instantly for returning users
- **Smart re-rendering** - If the base page changes, it automatically re-applies user customizations to the new version instead of serving stale cached content


### Example Personalizations

**Person A:**
- "I don't care about offers"
- "Optimize for mobile"
- "I hate calzone"

**Person B:**
- "Show me the best deals first"
- "I am colorblind"
- "Make the text large"

Each user gets their own unique version of the site, tailored to their preferences and accessibility needs, while always reflecting the latest content.

### Cloudflare Infrastructure

Built entirely on Cloudflare's infrastructure using workers, kv, durable objects and ai gateway.

## 📦 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- An [Alchemy](https://alchemy.run/) account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ctrl-cheeb-del/cf_ai_personalisedWeb
   cd cf_ai_personalisedWeb
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file based on `env.example` and follow the [Alchemy Getting Started guide](https://github.com/alchemy-run/alchemy#getting-started) to configure your environment.

4. **Run locally**
   ```bash
   bun dev
   ```

5. **Deploy to Cloudflare**
   ```bash
   bun run deploy
   ```


This project is forked from the [bun-spa example](https://github.com/alchemy-run/alchemy/tree/main/examples/cloudflare-bun-spa) in the Alchemy repository