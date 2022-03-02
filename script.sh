#!/bin/bash

CI_PLATFORM = ${CI_PLATFORM}

if($CI_PLATFORM=android) then
  yarn build:android
fi

if($CI_PLATFORM=ios) then
  yarn build:ios
fi

export FASTLANE_LANE_NAME=beta
echo $FASTLANE_LANE_NAME
