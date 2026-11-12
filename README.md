You are building a small dashboard using a micro frontend mindset. Instead of hardcoding UI, the dashboard reads a JSON configuration and renders widgets dynamically. Each widget acts like an independent micro frontend that could later be owned by a different team.
For this task, you will build one widget: a Weather Widget that pulls live data for Dallas.
🎯 Goal
Create a Next.js page that:
Reads a JSON config describing which widgets to render.
Dynamically renders each widget based on its type.
For the weather widget, fetches live data through the BFF API and displays it in a card.
🌦️ Data Source
The browser calls the app's BFF endpoint, `GET /api/weather?city=Dallas`.
The route resolves the city and fetches the forecast from Open-Meteo on the
server. Components should not call Open-Meteo or another weather provider
directly.
📦 JSON Config to Drive the UI
Your page must render based on this config (do not hardcode the UI):

[ { "type": "weather", "title": "Dallas Weather", "source": "/api/weather?city=Dallas" } ]

Requirements (Step by Step)
Create a Next.js page (e.g. pages/index.js or app/page.js).
Store the JSON config in a variable or separate file.
Build a WidgetRenderer component that:
Takes a widget config as a prop.
Looks at type and decides which component to render.
Build a WeatherWidget component that:
Requests its city from `/api/weather` and consumes the normalized response.
Displays city, temperature, feels-like, humidity, and condition in a card.
Loop over the JSON array and render each widget through WidgetRenderer.
🧠 Rules / Constraints
The main page must not know anything about weather logic — it only loops the JSON and delegates to WidgetRenderer.
Adding a new widget later should only require adding to the JSON and creating a new component — no changes to the main page.
Keep components small and reusable.
🌟 Bonus (Optional)
Show a loading state while fetching.
Show an error state if the fetch fails.
Handle an unknown widget type gracefully (e.g. "Widget not supported").
Show a fallback UI if the JSON config is empty.
