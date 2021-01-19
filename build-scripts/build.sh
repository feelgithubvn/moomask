#!/bin/bash

build() {
    echo 'Building MooMask'

    rm -rf dist/*

    export INLINE_RUNTIME_CHUNK=false
    export GENERATE_SOURCEMAP=false

    react-scripts build

    mkdir -p dist
    cp -r build/* dist

    mv dist/index.html dist/popup.html

    echo 'Making zip file'
    node build-scripts/zip.js

    echo 'Doing cleanup'
    rm -rf dist/*
    mv moomask.zip dist/moomask.zip
}

build
