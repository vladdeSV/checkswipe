;(() => {
    if (window.checkswipe) {
        return
    }

    const checkbox = 'input[type=checkbox]:not([data-checkswipe-ignore])'
    const selector = `[data-checkswipe] ${checkbox}`

    let installed = false
    let dragSheet = null
    let swiping = false
    let suppressClick = null

    function adoptStyles() {
        if (!('adoptedStyleSheets' in document)) {
            return
        }

        const staticSheet = new CSSStyleSheet()
        staticSheet.replaceSync(`${selector} {
    transition: transform var(--checkswipe-duration, 0.1s) var(--checkswipe-easing, cubic-bezier(0.25, 0.46, 0.45, 0.94)) var(--checkswipe-delay, 0.1s);
    -webkit-user-select: none;
    user-select: none;
    touch-action: none;
}

@media (prefers-reduced-motion: reduce) {
    ${selector} {
        transition: none;
    }
}`)

        dragSheet = new CSSStyleSheet()
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, staticSheet, dragSheet]
    }

    function swipeable(element) {
        return element instanceof Element && element.matches(selector) && !element.matches(':disabled')
    }

    function groupOf(element) {
        return element.getAttribute('data-checkswipe-group') || ''
    }

    function groupSelector(group) {
        if (group === '') {
            return ":where(:not([data-checkswipe-group]), [data-checkswipe-group=''])"
        }

        return `[data-checkswipe-group='${CSS.escape(group)}']`
    }

    function toggle(element, state) {
        element.checked = state
        element.dispatchEvent(new Event('input', { bubbles: true }))
        element.dispatchEvent(new Event('change', { bubbles: true }))
    }

    function pointerDownHandler(event) {
        if (swiping) {
            return
        }

        suppressClick = null

        if (event.button !== 0 || !event.isPrimary || !swipeable(event.target)) {
            return
        }

        const origin = event.target
        const container = origin.closest('[data-checkswipe]')
        const group = groupOf(origin)
        const state = !origin.checked
        const pointerId = event.pointerId

        // touch pointers capture implicitly; capturing explicitly also makes mouse pointerup outside the window reliable
        origin.setPointerCapture(pointerId)
        swiping = true
        suppressClick = origin

        toggle(origin, state)
        const value = state ? 'checked' : 'unchecked'
        container.dataset.checkswipe = value
        dragSheet?.replaceSync(`[data-checkswipe='${value}'] ${checkbox}${groupSelector(group)} { transform: scale(var(--checkswipe-scale, 1.3)) }`)

        function pointerMoveHandler(event) {
            if (event.pointerId !== pointerId) {
                return
            }

            const target = document.elementFromPoint(event.clientX, event.clientY)
            if (!swipeable(target) || target.closest('[data-checkswipe]') !== container || groupOf(target) !== group) {
                return
            }

            if (target.checked !== state) {
                toggle(target, state)
            }
        }

        function pointerEndHandler(event) {
            if (event.pointerId !== pointerId) {
                return
            }

            swiping = false
            container.dataset.checkswipe = ''
            dragSheet?.replaceSync('')
            document.removeEventListener('pointermove', pointerMoveHandler)
            document.removeEventListener('pointerup', pointerEndHandler)
            document.removeEventListener('pointercancel', pointerEndHandler)
        }

        document.addEventListener('pointermove', pointerMoveHandler)
        document.addEventListener('pointerup', pointerEndHandler)
        document.addEventListener('pointercancel', pointerEndHandler)
    }

    function clickHandler(event) {
        // the swipe's pointerdown already toggled this checkbox, so cancel the browser's own click toggle; label-forwarded and keyboard clicks are left alone
        if (event.target === suppressClick) {
            suppressClick = null
            event.preventDefault()
        }
    }

    function checkswipe() {
        if (installed) {
            return
        }

        installed = true

        if (!document.currentScript?.hasAttribute('data-no-css')) {
            adoptStyles()
        }

        document.addEventListener('pointerdown', pointerDownHandler)
        document.addEventListener('click', clickHandler)
    }

    window.checkswipe = checkswipe

    checkswipe()
})()
