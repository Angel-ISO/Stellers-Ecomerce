#!/bin/sh
set -e

if [ -f VERSION ]; then
  CURRENT_VERSION=$(cat VERSION)
else
  CURRENT_VERSION="DEV-2.0.0"
fi

echo "Current version: $CURRENT_VERSION"

VERSION_PREFIX=$(echo $CURRENT_VERSION | cut -d'-' -f1)
VERSION_NUMBER=$(echo $CURRENT_VERSION | cut -d'-' -f2)
MAJOR=$(echo $VERSION_NUMBER | cut -d'.' -f1)
MINOR=$(echo $VERSION_NUMBER | cut -d'.' -f2)
PATCH=$(echo $VERSION_NUMBER | cut -d'.' -f3)

NEW_PATCH=$((PATCH + 1))
NEW_VERSION="${VERSION_PREFIX}-${MAJOR}.${MINOR}.${NEW_PATCH}"

echo "New version: $NEW_VERSION"
echo $NEW_VERSION > VERSION
echo "export VERSION_TAG=$NEW_VERSION" > version.env

echo "Version updated successfully"
