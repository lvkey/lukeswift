# Project: Luke Swift Personal Portfolio (lukeswift.net)

## 1. Tech Stack & Core Philosophy
- **Stack:** React/Vite, Tailwind CSS, and shadcn/ui.
- **Project Type:** Personal landing page acting as a directory for my blog and active projects (Ledgr, Langfolio, etc.).
- **UI Architecture:** Keep the design minimalist, premium, and fast. All standard UI elements MUST use installed `shadcn/ui` primitives (Cards, Buttons, Avatars, etc.). 
- **Theme:** The site must support both Light and Dark modes using semantic CSS variables (`var(--background)`, `var(--foreground)`).

## 2. Content & Naming Constraints
- **The "Imersio" Retirement Rule:** The project previously known as "Imersio" is officially retired. It must ALWAYS be referred to as **Langfolio**. 
- **Project Links:** The outbound link for Langfolio must strictly point to `https://mylangfolio.com`.

## 3. Testing Protocol (Claude-in-Chrome)
- **Mandatory Visual Testing:** Before presenting a completed feature or layout, you MUST use `claude-in-chrome` to test the UI locally.
- **Verification Checklist:**
  1. Verify the layout collapses gracefully on mobile (320px - 390px) and expands cleanly on desktop.
  2. Verify contrast and visibility in BOTH Light and Dark modes.
  3. Verify the Langfolio link routes correctly.