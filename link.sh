#!/bin/sh

pushd node_modules/react || exit
npm link
popd

pushd node_modules/react-dom || exit
npm link
popd

pushd ../shogitter-react || exit
npm link react
npm link react-dom
npm link
popd

npm link shogitter-react
