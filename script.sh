#!/bin/sh

CI_PLATFORM = ${CI_PLATFORM}

if(CI_PLATFORM=android) then
  yarn build:android
fi

if(CI_PLATFORM=ios) then
  yarn build:ios
fi
