const sections = document.querySelectorAll('section');
let currentSectionIndex = 0;

// Show the first section initially
console.log(sections)
sections[currentSectionIndex].classList.add('active');

// Arrow function to change section
const changeSection = (next) => {
    sections[currentSectionIndex].classList.remove('active');
    currentSectionIndex += next;
    if (currentSectionIndex < 0) {
        currentSectionIndex = 0;
    } else if (currentSectionIndex >= sections.length) {
        currentSectionIndex = sections.length - 1;
    }
    sections[currentSectionIndex].classList.add('active');
};

// Keyboard event
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowLeft':
            changeSection(-1);
            break;
        case 'ArrowRight':
            changeSection(1);
            break;
    }
});

// Touch event
let touchstartX = 0;
let touchendX = 0;

// Arrow function for touchstart event
document.addEventListener('touchstart', (e) => {
    touchstartX = e.changedTouches[0].screenX;
}, false);

// Arrow function for touchend event
document.addEventListener('touchend', (e) => {
    touchendX = e.changedTouches[0].screenX;
    handleGesture();
}, false);

handleGesture = () => {
    if (touchendX < touchstartX) changeSection(1);
    if (touchendX > touchstartX) changeSection(-1);
}