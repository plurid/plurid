// import * as transcore from "../logic/transforms-core";


// /**
//  * Inserts newNode after the referenceNode.
//  *
//  * @param {HTMLElement} newNode
//  * @param {HTMLElement} referenceNode
//  */
// function insertAfter(newNode, referenceNode) {
//     referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
// }


// /**
//  * Checks recursively if the parents of the given pluridElement
//  * have the nodeName 'PLURID-PAGE'.
//  *
//  * @param {object} pluridElement            Given <plurid-page> element.
//  * @return {boolean}                        True if pluridElement should be a <plurid-root>.
//  */
// function checkPluridParent(pluridElement) {
//     if (pluridElement.nodeName != 'HTML') {
//         if (pluridElement.parentElement.nodeName == 'PLURID-PAGE') {
//             // console.log('is NOT a plurid root');
//             return false;
//         } else {
//             return checkPluridParent(pluridElement.parentElement);
//         }
//     } else {
//         // console.log('is a plurid-root');
//         return true;
//     }
// }


// /**
//  * Checks recursively if the parents of the given pluridElement
//  * are the specifiedParent.
//  *
//  * @param {string} specifiedParent          HTMLElement.nodeName for a parent of the pluridElement.
//  * @param {HTMLElement} pluridElement       plurid HTMLElement.
//  * @return {HTMLElement}                    The specified parent element.
//  */
// function getSpecifiedParent(pluridElement, specifiedParent) {
//     if (pluridElement.nodeName != 'HTML') {
//         if (pluridElement.parentElement.nodeName == specifiedParent) {
//             return pluridElement.parentElement;
//         } else {
//             return getSpecifiedParent(pluridElement.parentElement, specifiedParent);
//         }
//     }
// }


// /**
//  * Sends the XHR request given on the pluridLink page/href,
//  * creates the plurid structure from the response,
//  * renders the plurid element
//  *
//  *
//  * @param {HTMLElement} pluridLink       plurid HTMLElement.
//  */
// function setPluridLinks(pluridLink) {
//     let xhttp = new XMLHttpRequest();

//     xhttp.onreadystatechange = function() {
//         if (this.readyState == 4 && this.status == 200) {
//             let parser = new DOMParser();
//             let doc = parser.parseFromString(this.responseText, "text/html");
//             // console.log(doc.body);
//             // console.log(pluridRoot);

//             let newBranch = document.createElement("plurid-branch");
//             newBranch.innerHTML = `
//                                     <plurid-bridge></plurid-bridge>

//                                     <plurid-scion>
//                                         <plurid-sheet>
//                                             <plurid-content>
//                                             ${doc.body.innerHTML}
//                                             </plurid-content>
//                                         </plurid-sheet>
//                                     </plurid-scion>
//                                 `;

//             let right = pluridLink.offsetLeft + pluridLink.offsetWidth;
//             let top = pluridLink.offsetTop;
//             // console.log('pluridLink right -- X', right);
//             // console.log('pluridLink top ---- Y', top);
//             // console.log('offset parent', anchorTag.offsetParent);

//             let pluridRoot = getSpecifiedParent(pluridLink, 'PLURID-ROOT');
//             let pluridBranch = getSpecifiedParent(pluridLink, 'PLURID-BRANCH');
//             // console.log('root', pluridRoot);
//             // console.log('branch', pluridBranch);
//             let angleBranch;
//             let angleRad = transcore.getTransformRotate(pluridRoot).rotateY;
//             // console.log(angleRad);
//             if (pluridBranch) {
//                 angleBranch = transcore.getTransformRotate(pluridBranch).rotateY;
//                 angleBranch = angleBranch * 180 / Math.PI;
//             }
//             // console.log(angleBranch);

//             let angleDeg = 90;
//             // console.log(angleDeg);
//             if (angleBranch) {
//                 angleBranch = angleBranch + 90;
//                 newBranch.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(${angleBranch}deg) rotateZ(0deg) scale(1)`;
//             } else {
//                 newBranch.style.transform = `translateX(${right}px) translateY(${top}px) translateZ(0px) rotateX(0deg) rotateY(${angleDeg}deg) rotateZ(0deg) scale(1)`;
//             }

//             let lastChild = pluridRoot.lastChild;

//             insertAfter(newBranch, lastChild);

//             // TODO
//             // handle setting links for the new branch
//             // at this moment, creates twice the ammount of new plurid-branches
//             // setLink();
//             // setContainer();
//         }
//     };

//     let href = '';
//     if (pluridLink.page) {
//         href = pluridLink.page;
//     } else {
//         href = pluridLink.href;
//     }

//     xhttp.open("GET", href, true);
//     xhttp.setRequestHeader("Cache-Control", "no-cache");
//     xhttp.setRequestHeader("Pragma", "no-cache");
//     xhttp.send();
// }


// /**
//  * For all the anchorTags <a> and pluridLinks <plurid-link>
//  * adds event listeners on click to generate the plurid structure.
//  */
// export function setLink(pluridPage) {
//     console.log(pluridPage);
//     let pluridPageId = pluridPage.id;
//     // console.log(pluridPageId)
//     let pageAnchorTags = document.querySelectorAll(`#${pluridPageId} a`);
//     let pagePluridLinks = document.querySelectorAll(`#${pluridPageId} plurid-link`);
//     // let anchorTags = document.getElementsByTagName('a');
//     // let pluridLinkTags = document.getElementsByTagName('plurid-link');
//     // console.log(pageAnchorTags);
//     // console.log(pagePluridLinks);

//     for (let anchorTag of pageAnchorTags) {
//         // console.log(anchorTag);
//         anchorTag.addEventListener('click', event => {
//             console.log('click tag');
//             event.preventDefault();
//             setPluridLinks(anchorTag);
//         });
//     }

//     for (let pluridLink of pagePluridLinks) {
//         pluridLink.addEventListener('click', () => {
//             console.log('click link');
//             setPluridLinks(pluridLink);
//         })
//     }
// }
