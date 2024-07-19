/**
 * @param {HTMLElement} [parent]
 * @param {HTMLInputElement} [checkbox]
 */
function checkswipe(parent, checkbox) {
    /**
     * @param {HTMLInputElement} checkbox
     * @param {HTMLElement} parent
     */
    function attachSingle(checkbox, parent) {
        if (!(parent instanceof HTMLElement)) {
            console.error('checkswipe: element', parent, `must be an html element; is '${typeof parent}'.`)
            return
        }

        if (parent.parentElement?.closest('[data-checkswipe]') || parent.querySelector('[data-checkswipe]')) {
            console.error('checkswipe: invalid structure for', parent, '; nested `data-checkswipe` elements are not allowed.')
            return
        }

        if (!(checkbox instanceof HTMLInputElement) || checkbox.type !== 'checkbox') {
            console.error('checkswipe: element', checkbox, `must be an html input element (type checkbox); is '${typeof checkbox}'.`)
            return
        }

        if (!parent.contains(checkbox)) {
            console.error('checkswipe: checkbox', checkbox, 'must be a child of parent', parent, '.')
            return
        }

        if (!parent.dataset.checkswipe) {
            parent.dataset.checkswipe = ''
        }

        if (parent.dataset.checkswipeSpecify !== undefined && checkbox.dataset.checkswipeUse === undefined) {
            return
        }

        if (parent.dataset.checkswipeSpecify === undefined && checkbox.dataset.checkswipeUse !== undefined) {
            console.error('checkswipe: checkbox', checkbox, 'is set to be specifically used (with `data-checkswipe-use`), but parent', parent, 'does not have `data-checkswipe-specify` attribute. this is not allowed as it causes inconsistencies – please do not manually checkswipe-ify single checkboxes without proper attributes on the parent.')
            return
        }

        if (checkbox.__checkswipe) {
            return
        }

        checkbox.__checkswipe = true

        checkbox.addEventListener('mousedown', () => {
            const state = !checkbox.checked
            checkbox.checked = state
            parent.dataset.checkswipe = state ? 'checked' : 'unchecked'
            checkbox.dispatchEvent(new Event('change'))

            const temporaryMouseUpHandler = () => {
                parent.dataset.checkswipe = ''
                document.removeEventListener('mouseup', temporaryMouseUpHandler)
            }

            document.addEventListener('mouseup', temporaryMouseUpHandler)
        })

        checkbox.addEventListener('mousemove', () => {
            let state = parent.dataset.checkswipe
            if (state !== 'checked' && state !== 'unchecked') {
                return
            }

            const checked = state === 'checked'
            if (checked !== checkbox.checked) {
                checkbox.checked = checked
                checkbox.dispatchEvent(new Event('change'))
            }
        })

        checkbox.addEventListener('click', event => {
            if (event instanceof MouseEvent && event.detail > 0) {
                event.preventDefault()
            }
        })
    }

    /**
     * @param {HTMLElement} group
     */
    function attachGroup(group) {
        if (!(group instanceof HTMLElement)) {
            console.error('checkswipe: element', group, `must be an html element; is '${typeof group}'.`)
            return
        }

        if (group.parentElement?.closest('[data-checkswipe]') || group.querySelector('[data-checkswipe]')) {
            console.error('checkswipe: invalid structure for', group, '; nested `data-checkswipe` elements are not allowed.')
            return
        }

        const hasSpecificCheckbox = group.querySelector('input[type=checkbox][data-checkswipe-use]') !== null
        if (hasSpecificCheckbox && group.dataset.checkswipeSpecify === undefined) {
            console.error('checkswipe: element', group, 'is missing attribute `data-checkswipe-specify`; has checkboxes with attribute `data-checkswipe-use`. this is not allowed.')
            return
        }

        const checkboxes = group.querySelectorAll('input[type=checkbox]')
        checkboxes.forEach(checkbox => attachSingle(checkbox, group))
    }

    if (!checkswipe.__injected) {
        checkswipe.inject()
    }

    if (!parent && !checkbox) {
        const groups = document.querySelectorAll('[data-checkswipe]')
        groups.forEach(group => attachGroup(group))
    } else if (parent && !checkbox) {
        attachGroup(parent)
    } else if (parent && checkbox) {
        attachSingle(checkbox, parent)
    } else {
        console.error('checkswipe: parameter `parent` cannot be missing if `checkbox` is provided.')
        return
    }
}

checkswipe.inject = function () {
    if (document.querySelector('head>style#checkswipe-injected')) {
        console.warn('checkswipe: injected styles already exists, skipping injection of style...')
        return
    }

    let nonce = checkswipe.nonce
    if (typeof nonce !== 'string') {
        nonce = undefined
    }

    let style = document.createElement('style')
    style.id = 'checkswipe-injected'
    if (typeof nonce === 'string') {
        style.setAttribute('nonce', nonce)
    }

    style.textContent = `
:root {
    /* checkswipe defaults */
    --checkswipe-scale: 1.3;
    --checkswipe-delay: 0.1s;
    --checkswipe-duration: 0.1s;
    --checkswipe-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

[data-checkswipe]:not([data-checkswipe-specify]) input[type=checkbox],
[data-checkswipe][data-checkswipe-specify] input[type=checkbox][data-checkswipe-use] {
    transition: transform var(--checkswipe-duration) var(--checkswipe-easing) var(--checkswipe-delay);
}

[data-checkswipe]:not([data-checkswipe='']):not([data-checkswipe-specify]) input[type=checkbox],
[data-checkswipe][data-checkswipe-specify]:not([data-checkswipe='']) input[type=checkbox][data-checkswipe-use] {
    transform: scale(var(--checkswipe-scale));
}
`

    document.head.appendChild(style)
    checkswipe.__injected = true
}
