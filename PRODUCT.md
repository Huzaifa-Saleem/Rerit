# Rerit Product Definition

## Positioning

Rerit is the instant writing layer that makes every sentence sound like you without leaving the app.

It is faster than opening an AI chat, more personal than choosing a tone, and safer than blind clipboard replacement.

## Core modes

### Instant rewrite

Select text and invoke the primary shortcut. Rerit applies the default `Clean up` action immediately, without opening a window or asking for a choice.

### Action palette

Invoke the secondary shortcut when intent is ambiguous. Search actions such as Shorter, Warmer, More direct, Fix grammar, Translate, or a custom instruction. The palette is keyboard-first and selection-anchored where the platform allows it.

### Recovery

Every operation keeps the original text until the replacement is verified. Undo last rewrite, copy the last result, or recover a result when focus changes.

## Initial release

- Instant `Clean up`
- Shorter, Warmer, More direct, and Fix grammar actions
- Atomic in-place replacement
- Exact clipboard restoration
- Cancellation and stale-response protection
- Undo last rewrite
- Delayed, non-blocking progress feedback
- Shortcut conflict detection
- Per-app enable and pause controls
- Real latency instrumentation

## Follow-up releases

- Personal voice learned from writing samples and accepted edits
- Per-app style profiles and protected vocabulary
- Native selection adapters for macOS, Windows, and Linux
- Formatting-preserving edits and visible diffs
- Translation and structured transformations

## Explicit non-goals

- A dashboard-first experience
- A gallery of equal-weight tone cards
- Model selection as a primary user decision
- Routine success notifications
- Mandatory sign-in before the first successful local interaction
- Animations on the high-frequency keyboard path
