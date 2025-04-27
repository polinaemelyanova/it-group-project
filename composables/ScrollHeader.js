class ScrollHeader {
    selectors = {
        headerBody: '[data-js-header-body]',
        headerBottom: '[data-js-header-bottom]',
        headerInner: '[data-js-header-inner]',
    }

    stateClasses = {
        fixed: 'is-fixed',
    }

    constructor() {
        this.headerBodyElement = document.querySelector(this.selectors.headerBody);
        this.headerH = this.headerBodyElement.clientHeight;
        this.headerBottomElement = document.querySelector(this.selectors.headerBottom)
        this.headerInnerElement = document.querySelector(this.selectors.headerInner)

        this.bodyElement = document.body

        window.addEventListener('scroll', () => this.handleScroll());
    }

    handleScroll() {
        const scroll = window.scrollY;
        const paddingTopHeaderBottom = parseFloat(window.getComputedStyle(this.headerBottomElement).paddingTop)
        const paddingBottomHeaderInner = parseFloat(window.getComputedStyle(this.headerInnerElement).paddingBottom)
        const paddingFull = this.headerH - paddingTopHeaderBottom - paddingBottomHeaderInner * 3
        const widthTablet = 945

        if ((scroll > paddingFull) && (window.innerWidth > widthTablet)) {
            this.headerBodyElement.classList.add(this.stateClasses.fixed);
            this.bodyElement.style.paddingTop = this.headerH + 'px'

        } else if (window.innerWidth <= widthTablet) {
            this.headerBodyElement.classList.add(this.stateClasses.fixed);
            this.bodyElement.style.paddingTop = this.headerH + 'px'

        } else {
            this.headerBodyElement.classList.remove(this.stateClasses.fixed);
            this.bodyElement.removeAttribute('style')
        }
    }
}

export default ScrollHeader;