#!/bin/bash

package=$1
location=$2

mkdir $location
cp -r ../packages/$package/ $location
cd $location
git init
git add .
git commit -m 'setup'
