export function setShadows(pluridRoot, pluridSheet, sheetHeight, ground) {
    let pluridShadow = document.createElement('plurid-shadow');
    pluridRoot.appendChild(pluridShadow);
    pluridShadow.sheet = pluridSheet.id;
    // console.log('sheetHeight', sheetHeight);

    let computedShadowHeight = sheetHeight * 0.3 < 500 ? sheetHeight * 0.3 : 500;
    // let computedShadowHeight = 500;
    // console.log('computedShadowHeight', computedShadowHeight);

    pluridShadow.style.height = computedShadowHeight + "px";

    // console.log('ground', ground);
    let groundPosition = ground - computedShadowHeight;

    pluridShadow.style.transform = `translateX(0px) translateY(${groundPosition}px) translateZ(0px) rotateX(90deg) rotateY(0deg) rotateZ(0deg) scale(1) skew(-10deg)`;
}
