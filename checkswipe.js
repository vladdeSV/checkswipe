const fieldsets = document.querySelectorAll('fieldset[data-checkswipe]');

let currentFieldset = null;
let globalCheckboxState = undefined;

document.addEventListener('mouseup', () => {
    if (!currentFieldset) {
        return
    }

    currentFieldset.dataset.checkswipe = undefined;
    globalCheckboxState = null;
    currentFieldset = null;
});

for (const fieldset of fieldsets) {
    const checkboxes = fieldset.querySelectorAll('input[type=checkbox]');

    for (const checkbox of checkboxes) {
        checkbox.addEventListener('click', (event) => {
            if (event.detail !== 0) {
                event.preventDefault();
            }
        });

        checkbox.addEventListener('mousedown', _ => {
            const newState = !checkbox.checked;
            globalCheckboxState = newState;
            checkbox.checked = newState;
            currentFieldset = fieldset;
            fieldset.dataset.checkswipe = 'enlarged';
        });

        checkbox.addEventListener('mousemove', _ => {
            if (currentFieldset === fieldset && globalCheckboxState !== null) {
                checkbox.checked = globalCheckboxState;
            }
        });
    }
}
