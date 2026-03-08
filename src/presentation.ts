interface PresentationOptions {
    visibleClass?: string;
    hiddenClass?: string;
    baseClass?: string;
    ui?: boolean;
}

interface StepAction {
    element: Element;
    className: string;
    originalClass: string;
}

interface SlideData {
    element: Element;
    maxStep: number;
    steps: StepAction[][];
}

/**
 * Presentation Library
 * Unix philosophy: Do one thing well - manage presentation state via classes.
 */
export class Presentation {
    private container: HTMLElement | null;
    private visibleClass: string = 'active';
    private hiddenClass: string = 'hidden';
    private baseClass: string = '';
    private showUI: boolean = true;

    private slides: Element[] = [];
    private slideData: SlideData[] = [];

    private currentSlideIndex: number = 0;
    private currentStepIndex: number = 0;

    private uiContainer?: HTMLDivElement;
    private btnPrev?: HTMLButtonElement;
    private btnNext?: HTMLButtonElement;
    private btnMenu?: HTMLButtonElement;
    private menuPopup?: HTMLDivElement;
    private menuItems: HTMLLIElement[] = [];

    constructor(containerSelector: string, options: PresentationOptions = {}) {
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

    private _parseSlideSteps(slide: Element): SlideData {
        const steps: StepAction[][] = []; // Array of step objects
        // Find all elements that have a class matching the pattern {number}--{className}
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
                }
            });
        });

        const maxStep = steps.length > 0 ? steps.length - 1 : 0;

        return {
            element: slide,
            maxStep: maxStep,
            steps: steps
        };
    }

    private _init(): void {
        this._render();
        if (this.slides.length > 0) {
            if (this.showUI) {
                this._buildUI();
            }
            this.bindKeyboard();
            this.bindClick();
        }
    }

    private _buildUI(): void {
        if (!this.container) return;

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
            const heading = slide.querySelector('h1, h2, h3') as HTMLElement | null;
            const title = heading ? heading.innerText : `Slide ${index + 1}`;

            const li = document.createElement('li');
            li.innerText = title;
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                this.goToSlide(index);
                this.menuPopup?.classList.remove('active');
            });
            this.menuItems.push(li);
            ul.appendChild(li);
        });

        this.menuPopup.appendChild(ul);

        // Toggle menu
        this.btnMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            this.menuPopup?.classList.toggle('active');
        });

        // Close menu on outside click
        document.addEventListener('click', () => {
            this.menuPopup?.classList.remove('active');
        });

        this.uiContainer.appendChild(this.btnPrev);
        this.uiContainer.appendChild(this.btnMenu);
        this.uiContainer.appendChild(this.btnNext);
        this.uiContainer.appendChild(this.menuPopup);

        if (this.container.parentElement) {
            this.container.parentElement.appendChild(this.uiContainer);
        } else {
            this.container.appendChild(this.uiContainer);
        }

        this._updateUIState();
    }

    private _updateUIState(): void {
        if (!this.showUI || !this.uiContainer || !this.btnPrev || !this.btnNext) return;

        if (this.currentSlideIndex === 0 && this.currentStepIndex === 0) {
            this.btnPrev.classList.add('disabled');
        } else {
            this.btnPrev.classList.remove('disabled');
        }

        const currentData = this.slideData[this.currentSlideIndex];
        if (this.currentSlideIndex === this.slides.length - 1 && this.currentStepIndex === currentData.maxStep) {
            this.btnNext.classList.add('disabled');
        } else {
            this.btnNext.classList.remove('disabled');
        }

        this.menuItems.forEach((li, idx) => {
            if (idx === this.currentSlideIndex) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
    }

    private _render(): void {
        this.slides.forEach((slide, index) => {
            if (index === this.currentSlideIndex) {
                slide.classList.add(this.visibleClass);
                slide.classList.remove(this.hiddenClass);
            } else {
                slide.classList.remove(this.visibleClass);
                slide.classList.add(this.hiddenClass);
            }

            if (index === this.currentSlideIndex) {
                const data = this.slideData[index];
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

    public next(): void {
        const currentData = this.slideData[this.currentSlideIndex];
        if (this.currentStepIndex < currentData.maxStep) {
            this.currentStepIndex++;
            this._render();
        } else if (this.currentSlideIndex < this.slides.length - 1) {
            this.currentSlideIndex++;
            this.currentStepIndex = 0;
            this._render();
        }
    }

    public prev(): void {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this._render();
        } else if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
            this.currentStepIndex = 0;
            this._render();
        }
    }

    public goToSlide(index: number): void {
        if (index >= 0 && index < this.slides.length) {
            this.currentSlideIndex = index;
            this.currentStepIndex = 0;
            this._render();
        }
    }

    private bindKeyboard(): void {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                this.next();
            } else if (e.key === 'ArrowLeft') {
                this.prev();
            }
        });
    }

    private bindClick(): void {
        if (!this.container) return;
        this.container.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.tagName.toLowerCase() !== 'a' && target.tagName.toLowerCase() !== 'button') {
                this.next();
            }
        });
    }
}
