let checkswipeCurrentFieldset = undefined
let checkswipeGlobalCheckboxState = undefined

function checkswipeAttachSingle(checkbox, parent) {
    checkbox.addEventListener('mousedown', () => {
        const newState = !checkbox.checked
        checkswipeGlobalCheckboxState = newState
        checkbox.checked = newState
        checkswipeCurrentFieldset = parent
        parent.dataset.checkswipe = 'enlarged'
        checkbox.dispatchEvent(new Event('change'))
    })

    checkbox.addEventListener('mousemove', () => {
        if (checkswipeCurrentFieldset === parent && checkswipeGlobalCheckboxState !== undefined && checkswipeGlobalCheckboxState !== checkbox.checked) {
            checkbox.checked = checkswipeGlobalCheckboxState
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

document.addEventListener('mouseup', () => {
    if (!checkswipeCurrentFieldset) {
        return
    }

    checkswipeCurrentFieldset.dataset.checkswipe = ''
    checkswipeGlobalCheckboxState = undefined
    checkswipeCurrentFieldset = undefined
})

// attach listeners on load
const groups = document.querySelectorAll('[data-checkswipe]')
for (const group of Array.from(groups)) {
    checkswipeAttachGroup(group)
}