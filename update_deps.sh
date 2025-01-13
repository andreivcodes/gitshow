#!/bin/bash

npx syncpack update
npx syncpack fix-mismatches
npx syncpack format
