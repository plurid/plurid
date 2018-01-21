export function testFun() {
    let contentTest = document.getElementById("test-content");

    contentTest.innerHTML = `<input type="text"><h1>aAAA</h1><iframe src="./legacy.html"></iframe>`;

    console.log(contentTest);
}

