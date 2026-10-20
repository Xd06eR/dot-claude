---
name: frontend-a11y
description: "Accessibility rules and checklist for interactive web UI: semantic HTML, ARIA, form labeling, keyboard navigation, focus management, screen reader support. Use when building or reviewing interactive UI components or forms, or when accessibility is itself the task."
origin: ECC + impeccable
---

Accessibility rules for interactive web UI — the examples use JSX spellings (`htmlFor`, `tabIndex`); the rules are the same in any framework (`for`, `tabindex` in plain HTML, your framework's equivalents elsewhere). Native semantics first: the right element beats any ARIA, and wrong ARIA is worse than no ARIA. For focus traps and complex widgets (combobox, listbox, tabs), use a focus-trap or headless library for your framework (`focus-trap-react`, Radix, Headless UI in React) or follow the APG pattern exactly — hand-rolled versions miss edge cases. The reduced-motion gating mechanism lives in `motion-ui`.

## Checklist

Before submitting any interactive component for review:

- [ ] Every `<input>`, `<select>`, and `<textarea>` has a connected `<label>` via `htmlFor`/`id`; personal-data inputs set `autoComplete`
- [ ] Required fields use `required` plus `aria-required="true"`; any asterisk marker is wrapped in `aria-hidden="true"`
- [ ] Error messages are linked with `aria-describedby` and marked `role="alert"`
- [ ] Dynamic content updates use `aria-live` (`polite` by default; `assertive` only for urgent errors)
- [ ] No `onClick` on `<div>` or `<span>` without `role`, `tabIndex`, and `onKeyDown`
- [ ] No `aria-label` on an element without a role; no `aria-hidden="true"` on a focusable element
- [ ] No positive `tabIndex` values (they reorder the tab sequence unpredictably)
- [ ] Heading levels do not skip (h1 → h2, never h1 → h4)
- [ ] Icon-only buttons have `aria-label`
- [ ] Decorative images use `alt=""` and `aria-hidden="true"`; meaningful images get descriptive alt
- [ ] Modals restore focus on close (for full focus trapping with Tab/Shift+Tab cycling, use a library like `focus-trap-react`)
- [ ] `prefers-reduced-motion` is respected for animations (mechanism per `motion-ui`)
- [ ] Custom drag and slider controls work under touch: the drag completes rather than just starting, a scroll-axis swipe across the control scrolls the page, and a drag along the control's axis moves the control (code tells: mouse-only handlers, no `touch-action` on a pointer-event drag surface)
- [ ] Interrupted gestures recover: `pointercancel`, `lostpointercapture`, release outside the control, and window `blur` mid-drag each clear the drag state, and the next drag works without a reload
- [ ] Gesture evidence is real: screenshots and resized viewports verify layout, never a gesture; report what produced the evidence (emulated viewport, synthesized touch, physical device, and which engine, since Chromium is not Safari) and what stayed untested
- [ ] Text inputs stay at least 16px when focused on iOS Safari (smaller sizes trigger force-zoom and break form layouts)
