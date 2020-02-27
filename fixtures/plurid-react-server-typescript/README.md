<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/packages/plurid-react/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: MIT">
    </a>
</p>



<h1 align="center">
    Plurid' React Server Rendered Web Application
</h1>



## Production

To generate a production-ready application simply run the command

    npm start

or

    yarn start



## Development

For development, run the following command

1. to clean the build folder

``` bash
npm run clean
```

or

``` bash
yarn clean
```

then open two terminals and run in each the following commands


2. terminal 1: to start the client listener

``` bash
npm run start.client.development
```

or

``` bash
yarn start.client.development
```

3. terminal 2: to start the server listener

``` bash
npm run start.server.development
```

or

``` bash
yarn start.server.development
```

Now you can develop the files in `./source` and the application will recompile and reload at any file save.
