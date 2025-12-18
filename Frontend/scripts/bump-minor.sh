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
MINOR=$(echo $VERSION_NUMBER | cut -d'.' -f2)

NEW_MINOR=$((MINOR + 1))
NEW_VERSION="${VERSION_PREFIX}-${MAJOR}.${NEW_MINOR}.0"

echo "Bumping minor version: $CURRENT_VERSION -> $NEW_VERSION"
echo $NEW_VERSION > VERSION
