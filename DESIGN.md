# Rerit Design System

## Product promise

Rerit is the instant writing layer for the desktop. Select text, invoke one shortcut, and get a safe, reversible improvement without leaving the current app.

The product should feel native, quiet, exact, and fast. It must never look or behave like a generic AI dashboard.

## Product principles

1. The default rewrite takes one gesture and opens no window.
2. The original text is sacred. Every replacement is reversible.
3. The product shows latency only when latency exists.
4. Personal voice and app context matter more than tone galleries.
5. Stable muscle memory beats adaptive interface movement.
6. Settings are a control surface, not a destination.

## Aesthetic direction

- **Direction:** precision editorial utility
- **Mood:** calm authority, warm restraint, and native desktop clarity
- **Decoration:** minimal and intentional; typography, alignment, and state carry the interface
- **Memorable quality:** the interface disappears and the result arrives

Avoid purple gradients, glass pills, decorative AI sparkles, oversized metrics, generic card grids, and animated success celebrations.

## Typography

- **Display:** Satoshi, 600 weight
- **UI and body:** Satoshi, 450–550 weights
- **Data and shortcuts:** Geist Mono
- **Fallback:** `Avenir Next`, `Segoe UI`, sans-serif

Type scale: 12, 13, 14, 16, 20, 28, and 40px. Headings use tight tracking and never wrap beyond two lines.

## Color

- **Canvas:** `#F2F0EA`
- **Surface:** `#FAF9F5`
- **Raised surface:** `#FFFFFF`
- **Ink:** `#171816`
- **Muted ink:** `#6C706A`
- **Hairline:** `#DCDDD7`
- **Strong hairline:** `#C7C9C1`
- **Signal:** `#1F8A5B`
- **Signal soft:** `#DDF1E7`
- **Warning:** `#A36516`
- **Danger:** `#B33A32`

Color is rare and semantic. Signal green means ready, active, or successfully protected. It is not decoration.

## Spacing and geometry

- **Base unit:** 4px
- **Density:** compact-comfortable
- **Scale:** 4, 8, 12, 16, 20, 24, 32, 48, 64px
- **Radii:** 6px controls, 10px panels, 14px major surfaces, full only for status dots
- **Sidebar:** 216px
- **Content width:** 920px maximum

## Motion

- Keyboard invocation, palette opening, result navigation, and text replacement are instant.
- Pointer press feedback: 100ms, `scale(.97)`.
- Hover and focus color: 100ms `ease`.
- Occasional pointer-opened popover: 160ms opacity plus `scale(.98 → 1)` using `cubic-bezier(.23,1,.32,1)`.
- Settings view transitions: 180ms maximum.
- Animate only transform and opacity. Never use `transition: all`.
- Respect reduced motion and remove spatial transforms when requested.

## Accessibility

- Full keyboard operation and visible 2px focus rings
- Minimum 4.5:1 text contrast
- Never communicate state through color alone
- Transient rewrite status uses polite announcements and never steals focus
- Error states preserve the original selection and offer recovery

## Performance budgets

- Shortcut acknowledgment: p95 under 50ms
- Selection capture: p95 under 120ms
- Warm short rewrite: p50 under 1 second, p95 under 2 seconds
- Local capture and apply combined: p95 under 200ms
- Hidden idle CPU: effectively zero
