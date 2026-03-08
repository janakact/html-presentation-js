# html-presentation-js

A minimalist, dependency-free HTML presentation library built on the Unix philosophy: **do one thing, and do it well**. 

Instead of dealing with heavy Virtual DOMs or complex frameworks, this library simply manages presentation state by toggling CSS classes. You bring your own HTML and CSS, and we turn it into an interactive, step-by-step presentation.

Perfect for developers, AI-generated presentations, and anyone who wants full styling control over their slides.

## Installation

### Via NPM
```bash
npm install html-presentation-js
```

```javascript
import { Presentation } from 'html-presentation-js';
```

### Via CDN (Recommended for quick usage)
You can directly include the minified script and styles in your HTML file:

```html
<!-- The Core Library -->
<script src="https://cdn.jsdelivr.net/npm/html-presentation-js@1.0.0/dist/presentation.min.js"></script>

<!-- Optional: Default animation utilities (fade, slide-up, etc.) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/html-presentation-js@1.0.0/src/presentation.css">

<!-- Optional: Pre-built Themes -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/html-presentation-js@1.0.0/theme/midnight.css"> <!-- Dark, premium -->
<!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/html-presentation-js@1.0.0/theme/daylight.css"> Light, clean -->
<!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/html-presentation-js@1.0.0/theme/academic.css"> Paper, serif -->
```

## Usage

### 1. HTML Structure

Every immediate child of your root container is treated as a slide.

```html
<!-- Define your base, visible, and hidden classes via data attributes -->
<div id="presentation-root" data-bc="slide-base" data-vc="slide-visible" data-hc="slide-hidden">
  
  <!-- Slide 1 -->
  <div>
    <h1>Welcome to My Presentation</h1>
  </div>

  <!-- Slide 2 -->
  <div>
    <h2>Why use this?</h2>
    <ul>
      <!-- Intra-slide animations: This appears on step 1 of this slide -->
      <li class="aip-init-fade 1--aip-fade-in">No heavy frameworks</li>
      <li class="aip-init-fade 2--aip-fade-in">Bring your own CSS</li>
      <li class="aip-init-fade 3--aip-fade-in">AI friendly</li>
    </ul>
  </div>

</div>
```

### 2. Initialization

Initialize the library by passing the CSS selector of your root container.

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // If using CDN:
    const p = new PresentationWindow.Presentation('#presentation-root');
    
    // If using ESM import:
    // const p = new Presentation('#presentation-root');
});
```

## Features

### Intra-Slide Animations (`step--class`)
You can trigger animations within a single slide sequentially. Add classes in the format `[step_number]--[class_name]` to any element.
When the user clicks "next", the library will apply that class to the element instead of moving to the next slide.

Example:
```html
<div class="hidden 1--visible 2--highlight">I will appear on step 1, and highlight on step 2.</div>
```

### Navigation & UI
- **Keyboard:** Use `Right Arrow` or `Space` to advance (next step, or next slide). Use `Left Arrow` to go back.
- **Click:** Clicking anywhere on the screen advances the presentation (ignores clicks on buttons and links).
- **Auto-UI:** The library automatically generates an unobtrusive bottom navigation bar with `Prev`, `Menu` (listing all your slides automatically by reading `h1/h2`), and `Next` buttons.

## API Options

You can configure the library either through HTML `data-` attributes on the root container, or by passing an options object to the constructor.

| HTML Attribute | JS Option | Default | Description |
| :--- | :--- | :--- | :--- |
| `data-bc` | `baseClass` | `""` | Class(es) applied to all slides initially. |
| `data-vc` | `visibleClass` | `"active"` | Class applied when a slide becomes active/visible. |
| `data-hc` | `hiddenClass` | `"hidden"` | Class applied when a slide is inactive/hidden. |
| | `ui` | `true` | Set to `false` in JS options to disable the auto-generated UI menu. |

## License
MIT 
