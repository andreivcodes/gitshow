#!/bin/bash

pnpm dlx syncpack update
pnpm dlx syncpack fix-mismatches
pnpm dlx syncpack format
