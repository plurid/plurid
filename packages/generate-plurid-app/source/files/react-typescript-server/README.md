<p align="center">
    <a target="_blank" href="https://github.com/plurid/plurid">
        <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    </a>
    <br />
    <br />
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: MIT">
    </a>
</p>



<h1 align="center">
    Plurid' React Server Web Application
</h1>


<h3 align="center">
    explore information as a 3D structure
</h3>



### Contents

+ [Development](#development)
+ [Production](#production)
+ [Deployment](#deployment)
+ [Containerization](#containerization)
+ [Architecture](#architecture)



## Development

For local development with source watchers, run the following command

``` bash
npm run watch
```

or

``` bash
yarn watch
```

Develop the files in `./source` and the application will recompile at any file change and save.

If there is no `./build` folder, the server watcher may crash, but it will recompile as soon as the application compiler catches up.



## Production

To generate a production-ready application simply run the command

``` bash
npm start
```

or

``` bash
yarn start
```

if there is no `/build` folder, or run the command

``` bash
npm run build.production
```

or

``` bash
yarn build.production
```

to force a clean new build.



## Deployment

The application can be deployed (given that the [`plurid-cli`](https://github.com/plurid/plurid/tree/master/packages/plurid-cli) is installed) to [plurid.app](https://plurid.app) running the command

``` bash
plurid deploy
```



## Containerization

The application can be containerized using Docker running the command


``` bash
npm run containerize.production
```

or

``` bash
yarn containerize.production
```

to create a client-server NodeJS application container or


``` bash
npm run containerize.production.stills
```

or

``` bash
yarn containerize.production.stills
```


to create a container with the stilling renderer, extracting the static HTML at compile time.



## Architecture

The top level directories of the application are:

+ `configurations` - files that are needed to configure various software packages, pre-build or at build time;
+ `environment` - environment files;
+ `scripts` - application building scripts; for common usage there should be no need to modify any file in here, the common use cases being covered by default;
+ `source` - the source code


The `source` directory contains:

+ `client` - client bootloader, providers wrapping, root mounting;
+ `public` - favicons, manifest, robots, service workers; the contents will be copied 'as is' at build time
+ `server` - server bootloader
+ `shared` - the application code
+ `types` - typings for common files ('.jpg', '.svg', '.pdf', etc.)


The `shared` directory contains code which will be used both by the `server` and by the `client`. It's contents are

+ `kernel` - application assets, components, containers, data, services;
+ `paths` - route mapping of containers (planes, spaces);
+ `preserves` - server route handlers at pre-serve time, before rendering the application;
+ `shell` - kernel controller, authentication/authorization, rerouting, etc; the kernel will be wrapped by the shell
