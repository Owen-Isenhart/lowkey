## Lowkey

Lowkey is a non-caffeinated energy drink engineered for sustained focus and "chill productivity." This repository serves as the central hub for the brand’s digital infrastructure, R&D logs, and manufacturing logic.

---

## Project Overview

Lowkey isn't just a beverage; it’s an open-spec product. We apply software engineering principles—like versioning, transparency, and optimization—to beverage formulation.

- **Status:** In-Development (Micro-batch testing)  
- **Tech Stack:** Next.js, Tailwind CSS, TypeScript, PostgreSQL  
- **Target:** Developers, students, and creators who need focus without the caffeine crash.

---

## Features

### Customer-Facing (The Digital Experience)

- **The Recipe Changelog:** A public "Commit History" of the formula. Track every tweak to the flavor profile and ingredient ratios (e.g., v1.0.2-alpha).

- **QR Batch Dashboard:** Scan a bottle to see its "Digital Twin"—live data on when it was mixed, pH levels, and specific ingredient sourcing.

- **Lowkey Focus Hub:** A minimalist web companion featuring a Deep Work timer and task-blocking tools to pair with the drink.

- **Ingredient Decoder:** An interactive UI to explore the science and peer-reviewed studies behind our nootropic and electrolyte stack.

- **Store & Event Locator:** An interactive map to find Lowkey at local pop-ups, campus events, or retail partners.

- **The Lowkey Shop:** A streamlined, high-performance e-commerce checkout for individual cans or subscription "Sprints."

---

### Internal Operations (The Home-Lab Tooling)

- **The Formula Sandbox:** Our core internal R&D tool.
  - **Cost-per-Ounce Calculator:** Real-time pricing based on raw ingredient weights.
  - **Nutritional Density Logic:** Automatically generates a label based on the current recipe iteration.
  - **Iteration Ledger:** Private logs of taste tests and batch feedback to narrow down the "Perfect Recipe."

---

## Development & Formulation

To contribute to the brand logic or view the current "Stable" recipe, refer to `/recipes/STABLE.json`.

### Running the Internal Sandbox

```bash
cd internal-tools
npm install
npm run dev
```
