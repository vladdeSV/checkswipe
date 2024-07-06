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
            console.error('checkswipe: parent', parent, 'must be an HTMLElement.')
            return
        }

        if (!(checkbox instanceof HTMLInputElement) || checkbox.type !== 'checkbox') {
            console.error('checkswipe: element', checkbox, 'must be a checkbox.')
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

        checkbox.addEventListener('click', (event) => {
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
            console.error('checkswipe: group', group, 'must be an HTMLElement.')
            return
        }

        const hasSpecificCheckbox = group.querySelector('input[type=checkbox][data-checkswipe-use]') !== null
        if (hasSpecificCheckbox && group.dataset.checkswipeSpecify === undefined) {
            console.error('checkswipe: group', group, 'is missing attribute `data-checkswipe-specify`; has checkboxes with attribute `data-checkswipe-use`. this is not allowed.')
            return
        }

        const checkboxes = group.querySelectorAll('input[type=checkbox]')
        checkboxes.forEach(checkbox => attachSingle(checkbox, group))
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
