#!/bin/zsh

if [ ! -f .dev-started ]; then
    touch .dev-started
    (sleep 3 && open http://localhost:3000) &
fi

pnpm dev
