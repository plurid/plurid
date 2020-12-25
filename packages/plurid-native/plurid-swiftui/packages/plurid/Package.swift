// swift-tools-version:5.3

import PackageDescription

let package = Package(
    name: "plurid",
    platforms: [
        .macOS(.v10_15), .iOS(.v13)
    ],
    products: [
        .library(
            name: "plurid",
            targets: ["plurid"]),
    ],
    dependencies: [
    ],
    targets: [
        .target(
            name: "plurid",
            dependencies: []),
        .testTarget(
            name: "pluridTests",
            dependencies: ["plurid"]),
    ]
)
