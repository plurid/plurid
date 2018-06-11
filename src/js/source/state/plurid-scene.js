// set pluridScene as global variable

(function (global) {
    global.pluridScene = {
        metadata: {
            activePlurid: '',
            activeSheet: '',
            containers: 0,
            rootPages: [],
            pages: 0
        },
        content: {}
    }
}).call(this, global)
