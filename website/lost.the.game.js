/*
    now, let me be very clear: this code below is just some super hacky code to make the game work
    it's not pretty, but it works.
    "if it looks stupid but works, it ain't stupid"
    please pretend this code doesn't exist, and focus on the checkswipe.js part :)
 */
const range = document.getElementById('difficulty')
let intervals = Array(2)

function resetGame() {
    clearInterval(intervals[0])
    clearInterval(intervals[1])
    const games = document.querySelectorAll('form.game')

    function repopulateFieldset(fieldset, count) {
        fieldset.innerHTML = ''
        for (let i = 1; i <= count; i++) {
            fieldset.innerHTML += `<label><input type=checkbox name=${i}> Option ${i}</label>`
        }
    }

    games.forEach(form => {
        const fieldset = form.querySelector('fieldset')
        repopulateFieldset(fieldset, range.value)

        const timerDisplay = form.querySelector('[data-timer]')
        const checkboxes = form.querySelectorAll('input[type=checkbox]')
        const resetContainer = form.querySelector('div.reset')

        let timerStarted = false;
        let timer = 0;

        timerDisplay.dataset.best = '';
        timerDisplay.dataset.bestDisplay = '–';
        timerDisplay.textContent = '–';

        resetContainer.innerHTML = '<button type=reset>reset timer</button>'
        const reset = resetContainer.querySelector('button[type=reset]')
        reset.addEventListener('click', () => {
            clearInterval(intervals[form.dataset.checkswipe !== undefined ? 0 : 1]);
            timerStarted = false;
            timer = 0;
            timerDisplay.textContent = '–';
            checkboxes.forEach(checkbox => checkbox.checked = false);
        });

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('mousedown', () => {
                if (!timerStarted) {
                    startTimer();
                    timerStarted = true;
                }
            });

            checkbox.addEventListener('change', checkCompletion);
        });

        function startTimer() {
            intervals[form.dataset.checkswipe !== undefined ? 0 : 1] = setInterval(() => {
                timer++;
                let displayNumber = timer / 100
                timerDisplay.textContent = displayNumber.toFixed(2) + 's';
            }, 10);
        }

        function checkCompletion() {
            const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
            if (allChecked) {
                clearInterval(intervals[form.dataset.checkswipe !== undefined ? 0 : 1]);
                let best = timerDisplay.dataset.best;
                if (best === undefined || best === '' || timer < best) {
                    timerDisplay.dataset.best = String(timer);
                    timerDisplay.dataset.bestDisplay = (timer / 100).toFixed(2) + 's';
                }
            }
        }

        if (fieldset.hasAttribute('data-checkswipe')) {
            checkswipe(fieldset)
        }
    })
}

range.addEventListener('input', resetGame)
document.addEventListener('DOMContentLoaded', resetGame)
