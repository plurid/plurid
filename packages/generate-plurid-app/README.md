<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <a target="_blank" href="https://www.npmjs.com/package/@plurid/generate-plurid-app">
        <img src="https://img.shields.io/npm/v/@plurid/generate-plurid-app.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
    </a>
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/packages/generate-plurid-app/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: MIT">
    </a>
</p>



<h1 align="center">
    generate plurid' application
</h1>


Generate a plurid' application with one command (and some choices).


## Usage

Run the command

    npx @plurid/generate-plurid-app

or

    yarn global add @plurid/generate-plurid-app

    generate-plurid-app


The command can be run as is and will get you through an interactive setup, or can receive the following flags:

    -d, --directory <path>                  set the application directory
    -l, --language <language>               set language ("typescript" -> TypeScript || "javascript" -> JavaScript)
    -u, --ui <ui-engine>                    set UI engine ("html" -> HTML Custom Elements || "react" -> React || "vue" -> Vue || "angular" -> Angular)
    -r, --renderer <renderer>               set the application rendering side ("client" -> Client-Side Rendering || "server" -> Server-Side Rendering)
    -m, --manager <package-manager>         set the package manager ("npm" || "yarn")
