#!/bin/sh
set -e

if [ -f VERSION ]; then
  CURRENT_VERSION=$(cat VERSION)
else
  CURRENT_VERSION="DEV-2.0.0"
fi

VERSION_PREFIX=$(echo $CURRENT_VERSION | cut -d'-' -f1)
VERSION_NUMBER=$(echo $CURRENT_VERSION | cut -d'-' -f2)
MAJOR=$(echo $VERSION_NUMBER | cut -d'.' -f1)

NEW_MAJOR=$((MAJOR + 1))
NEW_VERSION="${VERSION_PREFIX}-${NEW_MAJOR}.0.0"

echo "Bumping major version: $CURRENT_VERSION -> $NEW_VERSION"
echo $NEW_VERSION > VERSION
