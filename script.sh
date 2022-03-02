#!/bin/bash

if[$CI_PLATFORM == "android"] then
  yarn build:android
fi

if[$CI_PLATFORM == "ios"] then
  yarn build:ios
fi

env FASTLANE_LANE_NAME="beta"
