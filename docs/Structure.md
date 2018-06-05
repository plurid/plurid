<link rel="stylesheet" type="text/css" href="style.css">


## The Story

The client asks for a web page (e.g. `view.plurid.com/jke4axgvs0lz`, it contains two planes of content with videos, one with comments).

The server generates the `.html` and sends it to the client:

    <body>
        <plurid-page name="first-video">
            <video id="1">
                <source src="daj41azoplnf.mp4" type="video/mp4">
            </video>
        </plurid-page>

        <plurid-page name="second-video">
            <video id="2">
                <source src="o4znmlp1kafa.mp4" type="video/mp4">
            </video>
        </plurid-page>

        <plurid-page name="comments">
            <div class="comments">
                <div class="comment">
                    <div class="comment-author">
                        Jan
                    </div>
                    <div class="comment-text">
                        Adequate videos for the pluridal view.
                        Here's
                            <plurid-link href="https://view.plurid.com/dakz30lke5jn">
                                another
                            </plurid-link>.
                    </div>
                </div>
            </div>
        </plurid-page>

        <script src="plurid.js">
    </body>


Once received, the document is transformed as specified in the `plurid.js` script.

    <body>
        <plurid-container>
            <plurid-roots>
                <plurid-root>
                    <plurid-sheet name="first-video">
                        <plurid-controls></plurid-controls>
                        <video id="1">
                            <source src="daj41azoplnf.mp4" type="video/mp4">
                        </video>
                    </plurid-sheet>
                </plurid-root>

                <plurid-root>
                    <plurid-sheet name="second-video">
                        <plurid-controls></plurid-controls>
                        <video id="1">
                            <source src="o4znmlp1kafa.mp4" type="video/mp4">
                        </video>
                    </plurid-sheet>
                </plurid-root>

                <plurid-root>
                    <plurid-sheet name="comments">
                        <plurid-controls></plurid-controls>
                        <div class="comments">
                            <div class="comment">
                                <div class="comment-author">
                                    Jan
                                </div>
                                <div class="comment-text">
                                    Adequate videos for the pluridal view.
                                    Here's
                                        <plurid-link href="https://view.plurid.com/dakz30lke5jn">
                                            another
                                        </plurid-link>.
                                </div>
                            </div>
                        </div>
                    </plurid-sheet>
                </plurid-root>
            </plurid-roots>

            <plurid-options></plurid-options>
        </plurid-container>

        <script src="plurid.js">
    </body>

A JavaScript object is created to hold the `pluridScene`:

    global.pluridScene = {
        metadata: {
            containers: 1,
            rootPages: [],
            pages: 0
        },
        content: {}
    }


Accessing the page `view.plurid.com/jke4axgvs0lz#first-video`



## Scenarios

### A.

Each webpage has all the content rendered into a `<plurid-page>` tag, with namespaced CSS/JavaScript.

All the links `<a href="page.com/page">` have the normal behaviour prevented, and instead at click an AJAX request is made, the contents of the page fetched, and rendered on a new plurid content plane.


### B.

A webpage can contain multiple `<plurid-page>` tags, or even multiple `<plurid-container>` tags with each holding a manifold of `<plurid-page>` tags.

The question is then: how do I link to these pages? By giving them a name attribute?

i.e. `<plurid-page name="page-one">`
