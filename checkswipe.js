function checkswipeAttachSingle(checkbox, parent) {
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
        // prevent default when clicking directly on the checkbox (not when clicking on labels)
        if (event instanceof MouseEvent && event.detail > 0) {
            event.preventDefault()
        }
    })
}

function checkswipeAttachGroup(group) {
    const checkboxes = group.querySelectorAll('input[type=checkbox]')

    if (!group.dataset.checkswipe) {
        group.dataset.checkswipe = ''
    }

    for (const checkbox of Array.from(checkboxes)) {
        checkswipeAttachSingle(checkbox, group)
    }
}

function checkswipe() {
    const groups = document.querySelectorAll('[data-checkswipe]')
    for (const group of Array.from(groups)) {
        checkswipeAttachGroup(group)
    }
}