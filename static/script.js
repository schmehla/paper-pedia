const main = document.querySelector('main')

const changePage = (next) => {
    main.scrollBy(0, next * main.offsetHeight)
}

window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'k', 'h'].includes(e.key)) {
        changePage(-1)
    }
    if (['ArrowRight', 'j', 'l'].includes(e.key)) {
        changePage(1)
    }
    if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
    }
})

window.addEventListener('wheel', (e) => {
    e.preventDefault()
    if (e.deltaY == 0) return
    changePage(Math.sign(e.deltaY))
}, { passive: false })

// Touch event
let touchstartX = 0
let touchendX = 0

// Arrow function for touchstart event
document.addEventListener('touchstart', (e) => {
    touchstartX = e.changedTouches[0].screenX
}, false)

// Arrow function for touchend event
document.addEventListener('touchend', (e) => {
    touchendX = e.changedTouches[0].screenX
    handleGesture()
}, false)

handleGesture = () => {
    if (touchendX < touchstartX) changePage(1)
    if (touchendX > touchstartX) changePage(-1)
}