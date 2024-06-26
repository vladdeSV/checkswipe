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
        if (!parent.contains(checkbox)) {
            throw new Error('checkswipe: `checkbox` must be a child of `parent`')
        }

        if (!parent.dataset.checkswipe) {
            parent.dataset.checkswipe = ''
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
        throw new Error('checkswipe: `parent` cannot be missing if `checkbox` is provided')
    }
}
