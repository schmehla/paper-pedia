const main = document.querySelector('main')
const pageCount = document.querySelector('#footer-page-count')

const getMainHeight = () => {
    return 0.96 * main.offsetHeight
}

const refreshPageCount = () => {
    const numPages = Math.ceil(main.scrollHeight / getMainHeight())
    const currentPage = Math.ceil(main.scrollTop / getMainHeight() + 1)
    pageCount.innerHTML = `page ${currentPage} / ${numPages}`
}

refreshPageCount()

const changePage = (next) => {
    main.scrollBy(0, next * getMainHeight())
    refreshPageCount()
}

const changeFontsize = (next) => {
    const currentSize = parseInt(getComputedStyle(main).fontSize)
    const newSize = currentSize + next
    main.style.fontSize = `${newSize}px`
    refreshPageCount()
}

window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
        changePage(-1)
    }
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
        changePage(1)
    }
})

window.addEventListener('wheel', (e) => {
    e.preventDefault()
    if (e.deltaY == 0) return
    changePage(Math.sign(e.deltaY))
}, { passive: false })

let touchStart = {
    x: 0,
    y: 0
}

document.addEventListener('touchstart', (e) => {
    touchStart = {
        x: e.changedTouches[0].screenX,
        y: e.changedTouches[0].screenY
    }
}, false)

document.addEventListener('touchend', (e) => {
    const touchDir = {
        x: e.changedTouches[0].screenX - touchStart.x,
        y: e.changedTouches[0].screenY - touchStart.y
    }
    handleGesture(touchDir)
}, false)

const handleGesture = (touchDir) => {
    if (touchDir.x + touchDir.y < 0) changePage(1)
    if (touchDir.x + touchDir.y > 0) changePage(-1)
}