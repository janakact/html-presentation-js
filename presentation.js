/**
 * Presentation Library
 * Unix philosophy: Do one thing well - manage presentation state via classes.
 */
class Presentation {
  constructor(containerSelector, options = {}) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.error(`Presentation: Container '${containerSelector}' not found.`);
      return;
    }

    // Read classes from container data attributes, fallback to options
    this.visibleClass = this.container.getAttribute('data-vc') || options.visibleClass || 'active';
    this.hiddenClass = this.container.getAttribute('data-hc') || options.hiddenClass || 'hidden';
    this.baseClass = this.container.getAttribute('data-bc') || options.baseClass || '';
    this.showUI = options.ui !== false; // defaults to true

    // Direct children are slides
    this.slides = Array.from(this.container.children);

    // Auto-apply base and hidden classes to all slides initially
    this.slides.forEach(slide => {
      if (this.baseClass) {
        // Handle multiple base classes separated by space
        const baseClasses = this.baseClass.split(' ').filter(c => c.trim() !== '');
        if (baseClasses.length > 0) slide.classList.add(...baseClasses);
      }
      slide.classList.add(this.hiddenClass);
    });

    this.currentSlideIndex = 0;
    this.currentStepIndex = 0; // step inside the current slide

    // Parse steps for each slide
    this.slideData = this.slides.map(slide => this._parseSlideSteps(slide));

    this._init();
  }

  _parseSlideSteps(slide) {
    const steps = []; // Array of step objects
    // Find all elements that have a class matching the pattern {number}--{className}
    // We'll iterate through all descendants and their classes.
    const elements = slide.querySelectorAll('*');
    const stepRegex = /^(\d+)--(.+)$/;

    elements.forEach(el => {
      Array.from(el.classList).forEach(cls => {
        const match = cls.match(stepRegex);
        if (match) {
          const stepNumber = parseInt(match[1], 10);
          const classNameToAdd = match[2];

          if (!steps[stepNumber]) {
            steps[stepNumber] = [];
          }
          steps[stepNumber].push({ element: el, className: classNameToAdd, originalClass: cls });

          // Optionally, we can remove the '1--class' binding from the DOM to keep it clean, 
          // but leaving it is fine too, as it doesn't affect standard CSS rules unless defined.
        }
      });
    });

    // Make steps array dense and sequential starting from step 1
    // (We'll assume step 0 is the base state of the slide without any new step classes added)
    const maxStep = steps.length > 0 ? steps.length - 1 : 0;

    return {
      element: slide,
      maxStep: maxStep,
      steps: steps // sparse array where index is step number
    };
  }

  _init() {
    this._render();
    if (this.slides.length > 0) {
      if (this.showUI) {
        this._buildUI();
      }
      this.bindKeyboard();
      this.bindClick();
    }
  }

  _buildUI() {
    // Create UI Container
    this.uiContainer = document.createElement('div');
    this.uiContainer.className = 'aip-ui-container';

    // Prev Button
    this.btnPrev = document.createElement('button');
    this.btnPrev.className = 'aip-btn aip-prev';
    this.btnPrev.innerHTML = '&#8592; Prev';
    this.btnPrev.addEventListener('click', (e) => { e.stopPropagation(); this.prev(); });

    // Menu Button
    this.btnMenu = document.createElement('button');
    this.btnMenu.className = 'aip-btn aip-menu-btn';
    this.btnMenu.innerText = 'Menu';

    // Next Button
    this.btnNext = document.createElement('button');
    this.btnNext.className = 'aip-btn aip-next';
    this.btnNext.innerHTML = 'Next &#8594;';
    this.btnNext.addEventListener('click', (e) => { e.stopPropagation(); this.next(); });

    // Menu Popup
    this.menuPopup = document.createElement('div');
    this.menuPopup.className = 'aip-menu';
    const ul = document.createElement('ul');

    // Populate Menu Items
    this.menuItems = [];
    this.slides.forEach((slide, index) => {
      // Find first h1, h2, or h3
      const heading = slide.querySelector('h1, h2, h3');
      const title = heading ? heading.innerText : `Slide ${index + 1}`;

      const li = document.createElement('li');
      li.innerText = title;
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        this.goToSlide(index);
        this.menuPopup.classList.remove('active');
      });
      this.menuItems.push(li);
      ul.appendChild(li);
    });

    this.menuPopup.appendChild(ul);

    // Toggle menu
    this.btnMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      this.menuPopup.classList.toggle('active');
    });

    // Close menu on outside click
    document.addEventListener('click', () => {
      this.menuPopup.classList.remove('active');
    });

    this.uiContainer.appendChild(this.btnPrev);
    this.uiContainer.appendChild(this.btnMenu);
    this.uiContainer.appendChild(this.btnNext);
    this.uiContainer.appendChild(this.menuPopup);

    // Attempt to append to parent of container so it's not hidden by slide overflows
    if (this.container.parentElement) {
      this.container.parentElement.appendChild(this.uiContainer);
    } else {
      this.container.appendChild(this.uiContainer);
    }

    // Initial UI update
    this._updateUIState();
  }

  _updateUIState() {
    if (!this.showUI || !this.uiContainer) return;

    // Prev button state
    if (this.currentSlideIndex === 0 && this.currentStepIndex === 0) {
      this.btnPrev.classList.add('disabled');
    } else {
      this.btnPrev.classList.remove('disabled');
    }

    // Next button state
    const currentData = this.slideData[this.currentSlideIndex];
    if (this.currentSlideIndex === this.slides.length - 1 && this.currentStepIndex === currentData.maxStep) {
      this.btnNext.classList.add('disabled');
    } else {
      this.btnNext.classList.remove('disabled');
    }

    // Update active menu item
    this.menuItems.forEach((li, idx) => {
      if (idx === this.currentSlideIndex) {
        li.classList.add('active');
      } else {
        li.classList.remove('active');
      }
    });
  }

  _render() {
    this.slides.forEach((slide, index) => {
      // Manage slide visibility
      if (index === this.currentSlideIndex) {
        slide.classList.add(this.visibleClass);
        slide.classList.remove(this.hiddenClass);
      } else {
        slide.classList.remove(this.visibleClass);
        slide.classList.add(this.hiddenClass);
      }

      // Manage steps for the current slide
      if (index === this.currentSlideIndex) {
        const data = this.slideData[index];
        // For the current slide, ensure classes up to currentStepIndex are added,
        // and classes beyond are removed.
        for (let s = 1; s <= data.maxStep; s++) {
          if (!data.steps[s]) continue;

          data.steps[s].forEach(action => {
            if (s <= this.currentStepIndex) {
              action.element.classList.add(action.className);
            } else {
              action.element.classList.remove(action.className);
            }
          });
        }
      } else {
        // For non-current slides, reset all steps (remove all step classes)
        const data = this.slideData[index];
        for (let s = 1; s <= data.maxStep; s++) {
          if (!data.steps[s]) continue;
          data.steps[s].forEach(action => {
            action.element.classList.remove(action.className);
          });
        }
      }
    });

    this._updateUIState();
  }

  next() {
    const currentData = this.slideData[this.currentSlideIndex];
    if (this.currentStepIndex < currentData.maxStep) {
      // Advance step in current slide
      this.currentStepIndex++;
      this._render();
    } else if (this.currentSlideIndex < this.slides.length - 1) {
      // Advance to next slide
      this.currentSlideIndex++;
      this.currentStepIndex = 0;
      this._render();
    }
  }

  prev() {
    if (this.currentStepIndex > 0) {
      // Reverse step in current slide
      this.currentStepIndex--;
      this._render();
    } else if (this.currentSlideIndex > 0) {
      // Go to previous slide, and we can start at step 0 of that slide.
      // (Optionally, could start at maxStep of previous slide, but starting at 0 is standard)
      this.currentSlideIndex--;
      this.currentStepIndex = 0;
      this._render();
    }
  }

  goToSlide(index) {
    if (index >= 0 && index < this.slides.length) {
      this.currentSlideIndex = index;
      this.currentStepIndex = 0;
      this._render();
    }
  }

  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        this.next();
      } else if (e.key === 'ArrowLeft') {
        this.prev();
      }
    });
  }

  bindClick() {
    // Optional: simple click to advance, though users might want custom UI
    // We bind it document-wide but users can disable this if they build custom controls.
    // For now, let's keep it simple: click on the container goes next.
    this.container.addEventListener('click', (e) => {
      // Ignore clicks on anchors or buttons if the user has interactive elements
      if (e.target.tagName.toLowerCase() !== 'a' && e.target.tagName.toLowerCase() !== 'button') {
        this.next();
      }
    });
  }
}

// Export to window for CDN/script usage
window.Presentation = Presentation;
