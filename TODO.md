# Future Improvements

### Branding & Identity
- [ ] **Decide on a final name** for the project (current working name: `html-presentation-js`).

### Documentation & Website
- [ ] **Create a documentation website.**
  - Standalone, regular webpage (not a presentation itself).
  - Include an interactive tutorial.
  - Load different presentation examples in `<iframe>` elements to demonstrate capabilities without taking over the whole screen.

### PDF Export & Printing
- [ ] **Implement PDF Export / Print Stylesheet.**
  - When a user prints the page (`Ctrl+P`), format the output automatically using CSS `@media print`.
  - **Option 1 (Slide by Slide):** One physical printed page equals one slide. Final state of all animations is shown.
  - **Option 2 (Step by Step):** One physical printed page equals one *transition step*. The library needs to clone the slide DOM for every single step configuration and append them sequentially so the PDF shows the visual build-up of the slide.

### Additional Features to Consider
- [ ] **Presenter Mode:** A dual-window setup. One window shows the current slide full screen for the audience. The other window shows the presenter the current slide, the *next* slide/animation step, a timer, and hidden speaker notes (`<aside class="notes">`).
- [ ] **URL Hash Routing:** Update the URL hash (`#slide-1-step-2`) automatically as the presentation advances, so users can bookmark or share a direct link to a specific slide and animation step.
- [ ] **Progress Bar:** An optional, auto-generated progress bar at the top or bottom of the screen showing how far along the presentation is.

### Low Priority
- [ ] **Touch/Swipe Support:** Add mobile-friendly swipe gestures (swipe left for next, swipe right for previous) to navigate on tablets or phones.
- [ ] **Markdown Support (Plugin):** A wrapper or pre-processor script that allows users to write slides in Markdown, which gets compiled into the required HTML structure before initialization.
- [ ] **Configuration Export:** Allow users to pass a JSON object into the constructor to define global hotkeys or disable specific UI elements (e.g., disable keyboard nav, change default transition timing).