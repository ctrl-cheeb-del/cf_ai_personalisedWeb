1. can you generate me a super basic mockup site for a fake pizza store it doesnt have to be functional just a basic page with some fake pizzas listed



2. can we refactor my @PizzaPage.tsx to have the css in like @App.css etc similar to @App.tsx not just all in the one file


3. in @App.tsx when submitting the prompt and it says applying... can you have a subtle animation where it animates the ... and shows it like moving up and down wave idk or something any sunbtle effect to the applying text 

4. can we add something to my @UserAgent.ts and @server.ts so that theres a reset button on the personalise input box that clears the DO and history and also resets the page view to the base page

5. in @UserAgent.ts can you write a simple prompt for the ai to customise the page based on the user's request and also the base page html and create the body for the request too including the page name and the base html and the user's request

6. can you add somethign to my @UserAgent.ts so that on the html response it cleans up the markdown code by removing patterns like ``` and ```html etc just a simple regex to remove them


7. can you write me a readme for my project saying hwo its a proof of concept you can either visit the link  https://cloudflare-bun-spa-website-art.theredxer.workers.dev 

to visit deployed instance or clone bun install
make .env with env.example stuff follow alchemy getting started and run bun dev and bun run deploy or visit deployed link etc

Say it was inspired by this tweet

https://x.com/threepointone/status/1977822605748097241

"the site with a thousand faces
---

there's this line of code that I couldn't have imagined building at any point in my career that's possible today:

return new Response(generatePersonalisedPage({user})

every user gets an ai agent assigned to them, in a 15ms radius, with it's own memory and state and whatever. And for your wesbite, for every user, you can spin up a sandbox to generate a page (real code!) based just on their own preferences and vibes (changing over time).

Kind of insane. Someone should build this and kill it in the ecommerce game."

say that this is just a proof of concept and for an internship application but shows how each user can request and prompt their own personalised site with changes get custom pages adapted to them and it caches their website and serves it to them,

Also make sure to mention that if that the base page changes instea dof serving their cached old edited page it will reapply their prompt and requests to the the new base page so its always customised to their liking and up to date never expired

So
"yes - and each user's uniqueness is stored
what would be cool would be if you could store their requested changes but if the underlying site changes it then re-runs their changes on top of that
"

so you can say "you can do things like

Person A
"I don't care about offers"
"optimize for mobile"
"I hate calzone"

Person B
"Show me the best deals first"
"I am colorblind"
"make the text large"
"

also mentioned the base project is forked from the bun-spa example in the alchemy repo https://github.com/alchemy-run/alchemy/tree/main/examples/cloudflare-bun-spa

 