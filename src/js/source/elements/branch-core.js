export function testFun() {
    let contentTest = document.getElementById("test-content");

    // let content = document.createElement("div");
    // let contentInput = document.createElement("input");

    // content.innerHTML = "TEST"

    // contentTest.appendChild(content);
    // contentTest.appendChild(contentInput);

    // let contentExtraDiv = document.createElement("div");
    // contentExtraDiv.innerHTML = `<input type="text"><h1>aAAA</h1>`;
    // contentTest.appendChild(contentExtraDiv);

    // console.log(contentTest);




    let httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = innerHTMLContents;
    httpRequest.open('GET', 'http://localhost:8000/test/examples/insert.html', true);
    httpRequest.withCredentials = true;
    httpRequest.send();

    let httpReqDiv = document.createElement("div");

    function innerHTMLContents() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                httpReqDiv.innerHTML = httpRequest.responseText;
            } else {
                console.log('There was a problem with the request.');
            }
        }
    }

    contentTest.appendChild(httpReqDiv);

}
