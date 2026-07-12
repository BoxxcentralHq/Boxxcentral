---

name: personal-gym-trainer-design
description: "Use this skill when designing a website for a personal gym trainer. This design features a dark, high-energy theme with a vibrant red primary color (#e51e37) and bold \"Anton\" display typography. It aims to motivate users and convey a premium, trustworthy feel, utilizing `primary-glow` shadows and uppercase button labels for a powerful impact."

```yaml
brand: Personal Gym Trainer
mood: The design exudes a powerful, high-energy atmosphere aimed at motivating individuals to take their fitness seriously, creating an intense, premium feel that builds trust and inspires action.
scheme: dark

colors:
  primary: "#e51e37"
  primary-bright: "#f13c52"
  primary-deep: "#c3182d"
  on-primary: "#ffffff"
  ink: "#ffffff"
  ink-soft: "#b3b3b3"
  on-ink: "#141414"
  canvas: "#141414"
  paper: "#1e1e1e"
  hairline: "#333333"
  link: "#b3b3b3"
  link-pressed: "#e51e37"

typography:
  display-xl:
    {
      fontFamily: "Anton, sans-serif",
      fontSize: 88px,
      fontWeight: 900,
      lineHeight: 1.1,
      letterSpacing: 1px,
      textTransform: uppercase,
    }
  display-lg:
    {
      fontFamily: "Anton, sans-serif",
      fontSize: 48px,
      fontWeight: 900,
      lineHeight: 1.2,
      textTransform: uppercase,
    }
  body-md:
    {
      fontFamily: "Poppins, sans-serif",
      fontSize: 18px,
      fontWeight: 400,
      lineHeight: 1.6,
    }
  button-md:
    {
      fontFamily: "Poppins, sans-serif",
      fontSize: 16px,
      fontWeight: 700,
      lineHeight: 1,
      textTransform: uppercase,
      letterSpacing: 0.5px,
    }
  caption-md:
    {
      fontFamily: "Poppins, sans-serif",
      fontSize: 14px,
      fontWeight: 500,
      lineHeight: 1.4,
    }
  label-sm:
    {
      fontFamily: "Poppins, sans-serif",
      fontSize: 12px,
      fontWeight: 700,
      lineHeight: 1,
      textTransform: uppercase,
      letterSpacing: 0.5px,
    }

rounded:
  sm: 8px
  md: 12px
  lg: 16px
  pill: 9999px

spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 64px
  section: 128px

shadows:
  none: "none"
  primary-glow: "0px 5px 25px rgba(229, 30, 55, 0.25)"

motion:
  duration-fast: 150ms
  duration-base: 300ms
  ease-standard: cubic-bezier(0.4, 0, 0.2, 1)
  transition-fast: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)"
  transition-base: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    color: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm} {spacing.lg}"
    typography: "{typography.button-md}"
    shadow: "{shadows.primary-glow}"
    border: "none"
    cursor: "pointer"
  button-primary-hover:
    backgroundColor: "{colors.primary-bright}"
    transform: "scale(1.05)"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    border: "1px solid {colors.hairline}"
    shadow: "{shadows.none}"
  nav-link:
    color: "{colors.link}"
    typography: "{typography.body-md}"
    padding: "{spacing.xs} {spacing.sm}"
    cursor: "pointer"
    textDecoration: "none"
  nav-link-hover:
    color: "{colors.ink}"
  nav-link-active:
    color: "{colors.primary}"
  input-underline:
    backgroundColor: "transparent"
    color: "{colors.ink}"
    border: "none"
    borderBottom: "1px solid {colors.hairline}"
    padding: "{spacing.sm} 0"
    typography: "{typography.body-md}"
    cursor: "text"
  input-underline-focus:
    borderBottomColor: "{colors.primary}"
  badge:
    backgroundColor: "{colors.primary}"
    color: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs}"
    typography: "{typography.label-sm}"
```

## Visual Theme & Atmosphere

This design system cultivates an atmosphere of intense focus and elite performance. It is unapologetically bold, using a stark, dark theme to eliminate distractions and channel energy toward action. The mood is motivational and premium, akin to a high-end, exclusive gym where results are paramount. The high-contrast palette, dominated by a deep `{colors.canvas}` black and brilliant `{colors.ink}` white, is punctuated by a single, vibrant `{colors.primary}` red. This red is not merely an accent; it is a jolt of energy, a call to action, and a symbol of the passion and power inherent in the brand. Typography reinforces this intensity, with the condensed, impactful `Anton` font used for all headlines, demanding attention with its uppercase `{typography.display-xl}` style.

Key Characteristics:

- **High-Energy Contrast:** The interplay between the dark `{colors.canvas}` background, bright `{colors.ink}` text, and the fiery `{colors.primary}` creates a visually stimulating and energetic experience.
- **Minimalist Palette:** The color scheme is deliberately restricted to enhance focus. Every color serves a distinct purpose, preventing visual clutter.
- **Bold Typographic Statements:** Headings are architectural elements. `{typography.display-xl}` and `{typography.display-lg}` are not just text; they are powerful graphic devices.
- **Flat & Focused:** The UI is predominantly flat, using color and containment rather than shadows for depth. The only exception is the `{shadows.primary-glow}` on key buttons, treating them as luminous focal points.
- **Geometric Precision:** Layouts are structured and clean, relying on a strict `{spacing}` scale and defined component shapes, like the `{rounded.pill}` buttons and `{rounded.lg}` cards.
- **Premium & Confident:** The overall aesthetic feels polished and self-assured, conveying expertise and building user trust.
- **Action-Oriented:** Every element is designed to guide the user towards a goal, from the prominent CTAs to the clear typographic hierarchy.

## Color Usage Rules

The brand's color palette is intentionally minimal to maintain a premium, focused, and high-energy aesthetic. An agent must adhere strictly to the defined tokens, as the power of the design lies in its restraint. The core working palette consists of `{colors.canvas}`, `{colors.paper}`, `{colors.ink}`, `{colors.ink-soft}`, and `{colors.primary}`.

- **Primary Red (`{colors.primary}`):** This is the most powerful color and must be used with extreme prejudice. Reserve it exclusively for the single most important call-to-action (CTA) on a given screen (e.g., "Join Now," "Get Started"). It may also be used for critical status indicators or to highlight an active navigation state. Never use `{colors.primary}` for body text or decorative elements that are not interactive. A viewport should contain at most one or two instances of `{colors.primary}` in an interactive capacity.

- **Surfaces (`{colors.canvas}`, `{colors.paper}`):** The base background for all pages is `{colors.canvas}`. This deep black establishes the immersive, focused mood. For contained sections of content that require subtle emphasis, such as pricing tiers or feature summaries, use cards with a `{colors.paper}` background. This creates a gentle separation from the main canvas without resorting to shadows. Do not introduce other background shades.

- **Text & Ink (`{colors.ink}`, `{colors.ink-soft}`):** The default text color for all primary content, including headings and body paragraphs, is `{colors.ink}` (white). This ensures maximum readability against the dark surfaces. For secondary information, metadata, placeholder text, or inactive UI elements, use `{colors.ink-soft}`. This creates a clear visual hierarchy between primary and secondary content.

- **Borders (`{colors.hairline}`):** All borders in the system are subtle and structural. Use `{colors.hairline}` for borders on cards and underlines for inputs. This provides definition without adding visual noise. Do not use `{colors.primary}` for borders unless it's for a focus state on an input.

- **No New Colors:** Never introduce a color that is not a defined token. The system's effectiveness relies on the disciplined application of this limited palette. Emphasis is achieved through typography, spacing, and the strategic use of `{colors.primary}`, not by adding new hues.

- **Flat by Default:** This is a flat design system. Do not apply shadows to components. The only sanctioned shadow is `{shadows.primary-glow}`, which is exclusively for the primary button component to give it a unique, radiant emphasis.

## Typography Hierarchy

The typographic system is built on a clear duality of two font families to create a strong hierarchy and reinforce the brand's personality. All headings use the **Anton** font family for its bold, condensed, and impactful presence. All body copy, UI labels, navigation, and other text elements use the **Poppins** font family for its excellent readability and clean, geometric form. This separation is non-negotiable.

| Role           | Token                     | Use                                                                    |
| -------------- | ------------------------- | ---------------------------------------------------------------------- |
| Display XL     | `{typography.display-xl}` | Reserved for the main hero headline on a page. Always uppercase.       |
| Display LG     | `{typography.display-lg}` | For major section titles. Always uppercase.                            |
| Body Medium    | `{typography.body-md}`    | The default style for all paragraph text and long-form content.        |
| Button Medium  | `{typography.button-md}`  | For all primary and secondary button labels. Uppercase and bold.       |
| Caption Medium | `{typography.caption-md}` | For secondary text, helper text, and metadata associated with content. |
| Label Small    | `{typography.label-sm}`   | For small, high-emphasis labels like badges. Uppercase and bold.       |

**Typographic Principles:**

1.  **Uppercase for Impact:** Key headings (`{typography.display-xl}`, `{typography.display-lg}`) and labels (`{typography.button-md}`, `{typography.label-sm}`) must be set in `text-transform: uppercase`. This is a core part of the brand's voice—confident, direct, and strong.
2.  **Contrast is King:** All text must have sufficient contrast. Use `{colors.ink}` on `{colors.canvas}` or `{colors.paper}` for primary readability. Use `{colors.ink-soft}` sparingly to de-emphasize, but verify it meets accessibility standards.
3.  **Breathe with Line Height:** The generous line height in `{typography.body-md}` (`1.6`) is essential for comfortable reading of longer text passages on the dark background. Do not reduce it.
4.  **Strict Family Roles:** Never use Anton for body copy or Poppins for major headlines. The visual distinction between the two families is fundamental to the design's structure and rhythm.
5.  **Rhythm and Scale:** The difference in size between `{typography.display-xl}` and `{typography.body-md}` is intentional and dramatic. Maintain this scale to create dynamic and visually interesting layouts.

## Component Patterns

Components are the building blocks of the UI, composed from the defined tokens to ensure consistency.

**Primary Button (`button-primary`)**
The primary button is the system's most powerful interactive element. It is used for the single most important action on a screen. It is styled with a vibrant `{colors.primary}` background, `{colors.on-primary}` text using `{typography.button-md}`, and a distinctive `{rounded.pill}` shape. It uniquely features a `{shadows.primary-glow}` to make it luminous and draw the user's eye. On hover, the background brightens to `{colors.primary-bright}` and the button scales up slightly, governed by `{motion.transition-fast}`. The `cursor` must be set to `pointer`.

**Card (`card`)**
Cards are used to contain and elevate related sets of content, such as pricing plans or feature lists. They use a `{colors.paper}` background to sit subtly above the `{colors.canvas}`. Their structure is defined by `{rounded.lg}` corners, generous `{spacing.lg}` padding, and a crisp `1px solid {colors.hairline}` border. Cards are intentionally flat and must never have a box-shadow; their separation is achieved purely through color and border.

**Navigation Link (`nav-link`)**
Navigation links are designed to be clear but subordinate to the main content. In their default state, they use `{colors.link}` (`#b3b3b3`), which is equivalent to `{colors.ink-soft}`. On hover, their color changes to `{colors.ink}` over `{motion.duration-fast}` to provide clear feedback. An active or current page link is highlighted with `{colors.primary}`. Navigation links always have a `cursor` of `pointer`.

**Underline Input (`input-underline`)**
Text inputs are minimalist to avoid clutter. They have a transparent background and use a simple `1px solid {colors.hairline}` bottom border for definition. The input text color is `{colors.ink}` set in `{typography.body-md}`. On focus, the bottom border color changes to `{colors.primary}`, providing a sharp, focused state indicator. The transition for the border color should use `{motion.transition-fast}`. The `cursor` for the input area is `text`.

**Badge (`badge`)**
Badges are used to attach a small, high-visibility label to another element, such as the "Most Popular" tag on a pricing card. They grab attention using a `{colors.primary}` background with `{colors.on-primary}` text. The text is set in the compact, uppercase `{typography.label-sm}` style, and the container has `{rounded.sm}` corners and tight `{spacing.xs}` padding.

## Layout & Spacing

The layout is governed by a strict, rhythmic spacing scale that creates a sense of order, balance, and deliberate pacing. All dimensions—margins, padding, and gaps—must use tokens from the `{spacing}` scale. This ensures a consistent visual rhythm and eliminates arbitrary, "magic number" values.

The system is built on an 8px base unit.

- **Micro-spacing (`{spacing.xs}`):** Use 8px for tight spacing between small elements, like an icon and its text label, or for the padding within a `{badge}`.
- **Component Gaps (`{spacing.sm}`):** Use 16px for padding within most components (like buttons) and for small gaps between related elements.
- **Content Padding (`{spacing.md}`):** Use 24px for standard content padding inside containers.
- **Block Spacing (`{spacing.lg}`):** Use 48px to separate distinct components or blocks of content, such as between a headline and the subsequent card grid.
- **Large Spacing (`{spacing.xl}`):** Use 64px for separating larger, unrelated content groups.
- **Section Spacing (`{spacing.section}`):** Use 128px as the primary vertical margin between major page sections (e.g., between the hero and the "features" section). This generous spacing allows each section to breathe and stand on its own.

Most page layouts employ a single-column, centered structure with a maximum width of approximately 1200px on desktop. This focuses the user's attention. Grids, such as for pricing cards, should use `{spacing.lg}` as their gap value to ensure each item is clearly distinct.

## Do's and Don'ts

**Do's:**

1.  **Do** use `Anton` exclusively for headings (`{typography.display-xl}`, `{typography.display-lg}`) and `Poppins` for all other text to maintain the core typographic identity.
2.  **Do** build all layouts using the defined spacing scale: `{spacing.xs}`, `{spacing.sm}`, `{spacing.md}`, `{spacing.lg}`, `{spacing.xl}`, and `{spacing.section}`.
3.  **Do** compose all surfaces from `{colors.canvas}` and `{colors.paper}`; do not introduce new background hues.
4.  **Do** reserve `{colors.primary}` for primary CTAs, active states, and critical highlights to maximize its impact.
5.  **Do** ensure every single clickable element—buttons, links, clickable cards—explicitly sets `cursor: pointer`.
6.  **Do** apply the `{shadows.primary-glow}` only to the main call-to-action button to preserve its special status.
7.  **Do** use `text-transform: uppercase` for all headlines and button text to match the brand's confident tone.
8.  **Do** use `{colors.hairline}` for all borders and dividers to maintain a subtle, premium finish.

**Don'ts:**

1.  **Don't** ever add a box-shadow unless it maps to a real `{shadows.*}` token. This system is flat; respect its principles.
2.  **Don't** ever leave the browser-default arrow cursor on a link, button, or tab. Every interactive element must have a `pointer` cursor.
3.  **Don't** introduce new colors. The provided palette is intentional and complete. Reuse beats inventing.
4.  **Don't** use arbitrary values for padding or margins like `15px` or `30px`. Stick to the `{spacing}` scale.
5.  **Don't** use `{colors.primary}` for paragraphs or non-interactive headings. It is for action, not decoration.
6.  **Don't** use `Anton` for body paragraphs or `Poppins` for major headlines. The font-family roles are strict.
7.  **Don't** make primary action buttons square or subtly rounded. They must use `{rounded.pill}`.
8.  **Don't** neglect hover and focus states. Every interactive element must provide clear visual feedback using the defined tokens and `{motion}` transitions.

## Responsive Behavior

The design is fluid and adapts across all screen sizes, maintaining its bold aesthetic and readability. Core principles are content stacking, typographic scaling, and preserving touch-target accessibility.

| Breakpoint    | Range         | Strategy                                                                                                                                                                                                                                                                          |
| ------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile        | < 768px       | Single-column layout. Hero stacks vertically. `{typography.display-xl}` scales down significantly (e.g., to 48px-56px). Grid layouts (like pricing cards) stack into a single vertical list. Nav collapses to a hamburger menu. `{spacing.section}` is reduced to `{spacing.xl}`. |
| Tablet        | 768px–1023px  | Layout may begin to introduce two columns for secondary content. Card grids may reflow to 2-per-row. Hero text size increases. Horizontal spacing remains generous.                                                                                                               |
| Desktop       | 1024px–1279px | The standard desktop experience. Max-width container is enforced. Multi-column layouts (2 or 3 columns) are common. Full horizontal navigation is displayed. `{typography}` and `{spacing}` tokens are used at their native scale.                                                |
| Desktop-Large | ≥1280px       | The layout remains centered and constrained by the max-width. Margins on the left and right of the main content container will increase, preserving the focused reading experience. No changes to core component or text sizes.                                                   |

**Touch Targets:** All interactive elements must have a minimum touch target size of 44x44px on mobile devices. For `{button-primary}`, the vertical padding of `{spacing.sm}` (16px) combined with the `{typography.button-md}` line height ensures this target is met.

**Image Behavior:** Hero background images should use `background-size: cover` and `background-position: center center` to ensure the most important parts of the image remain visible as the viewport changes. A dark overlay using `rgba(20, 20, 20, 0.5)` is often applied to ensure text contrast remains high.

## Iteration Guide

An agent iterating on UI in this style should follow these steps to ensure brand consistency and quality:

1.  **Establish the Foundation:** Begin every new layout with a `{colors.canvas}` background. Define your page structure with large vertical gaps of `{spacing.section}` between major content zones.
2.  **Build the Hierarchy:** Place your main headline using `{typography.display-xl}` (for heroes) or `{typography.display-lg}` (for sections). Ensure it's uppercase and uses the Anton font. Populate body content with `{typography.body-md}` using the Poppins font.
3.  **Contain with Cards:** For logically grouped content like feature lists or testimonials, use the `card` component. Apply its `{colors.paper}` background, `{rounded.lg}` corners, and `{colors.hairline}` border. Arrange cards in a grid using `{spacing.lg}` for gaps.
4.  **Apply Rhythmic Spacing:** Use the `{spacing}` scale for all padding and margins. Use `{spacing.md}` for internal card padding and `{spacing.lg}` to separate elements on the page. Be precise and consistent.
5.  **Identify the Prime Directive:** Determine the single most important action for the user on the screen. Implement this using the `button-primary` component, complete with its `{colors.primary}` fill, `{rounded.pill}` shape, and `{shadows.primary-glow}`. All other links or buttons should be visually subordinate.
6.  **Refine with Subtle Contrast:** Use `{colors.ink}` for essential text and `{colors.ink-soft}` for secondary details like dates, sub-labels, or inactive states. This creates depth without adding complexity.
7.  **Implement Interaction States:** Ensure every interactive element has a clear hover and focus state that follows the component definitions (e.g., `nav-link` color changing to `{colors.ink}`). All state changes must use `{motion.transition-fast}` for a responsive feel and have `cursor: pointer`.
8.  **Flatten and Focus:** Review the entire layout and remove any shadows that are not the sanctioned `{shadows.primary-glow}`. The design's strength comes from its flat, graphic nature.
9.  **Validate and Test:** Check the design at all responsive breakpoints (`Mobile`, `Tablet`, `Desktop`). Ensure text is readable, layouts reflow logically, and all touch targets are adequately sized on mobile.

## Suggested Packages

Packages that help implement this skill well. Install them with your package manager (examples use pnpm).

- **clsx** — Tiny utility for conditionally joining class names. `pnpm add clsx`
- **tailwind-merge** — Merge Tailwind classes without style conflicts. `pnpm add tailwind-merge`
- **class-variance-authority** — Type-safe component style variants (CVA). `pnpm add class-variance-authority`

Also worth considering (verify before installing):

- **react** — Core React library for building the UI components.. `pnpm add react`
- **react-dom** — For rendering React components to the DOM.. `pnpm add react-dom`
- **postcss** — For processing CSS with PostCSS plugins, essential for Tailwind CSS.. `pnpm add postcss`
- **autoprefixer** — Autoprefixes CSS, necessary for cross-browser compatibility.. `pnpm add autoprefixer`
- **tailwindcss** — For utility-first CSS and building the design system's styling.. `pnpm add tailwindcss`
