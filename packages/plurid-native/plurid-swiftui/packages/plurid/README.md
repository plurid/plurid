<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/plurid/master/about/identity/plurid-p-logo.png" height="250px">
    <br />
    <br />
    <a target="_blank" href="https://github.com/plurid/plurid/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-DEL-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: DEL">
    </a>
</p>



<h1 align="center">
    plurid' native swiftui
</h1>


<h3 align="center">
    explore information as a 3D structure
</h3>



### Contents

+ [About](#about)
+ [Usage](#usage)
+ [Codeophon](#codeophon)



## About

Implementation of the `plurid'` technology to transform information into a 3D explorable structure based on the [plurid specification](https://github.com/plurid/plurid/tree/master/packages/plurid-specification) for Apple's SwiftUI.



## Usage

Until Xcode starts to make sense and allow package imports in a sane fashion, the only usage solution is the insane one.

Clone the monorepository locally

```
git clone https://github.com/plurid/plurid
```

Make somewhere locally a new `git` repository

```
mkdir /path/to/new/git/repository
```

Copy the plurid-swift-ui/plurid package to the new `git` repository

```
cp -r /path/to/plurid-swift-ui/packages/plurid/ /path/to/new/git/repository
```

```
cd /path/to/new/git/repository
git init
git add .
git commit -m 'setup'
```

In the Xcode application project, add the swift package from `File > Swift Package > Add Package Dependency... > file:///path/to/new/git/repository`.

Running the `./scripts/install.sh` achieves a similar effect, by passing the package name and the path to the git repository.

``` bash
./scripts/install.sh plurid /path/to/new/git/repository
```



## [Codeophon](https://github.com/ly3xqhl8g9/codeophon)

+ licensing: [delicense](https://github.com/ly3xqhl8g9/delicense)
+ versioning: [αver](https://github.com/ly3xqhl8g9/alpha-versioning)
