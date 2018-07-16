export function setReflections(pluridSheet, sheetHeight, ground, top = 0) {
    const reflectGround = ground + 1 - sheetHeight - top;
    // console.log('ground', ground);
    // console.log('sheetHeight', sheetHeight);
    // console.log('top', top);

    // const reflectGround = ground - sheetHeight + 1;

    pluridSheet.style.webkitBoxReflect = `below ${reflectGround}px linear-gradient(to top, rgba(0,0,0,0.2) 0%, rgba(30,30,30,0.1) 20%, rgba(60,60,60,0) 40%)`;
}
