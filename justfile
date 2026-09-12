# plurid — pnpm workspace of libraries (no dev server; fixtures/ have their own).
# Thin index over package.json scripts. Shared verbs: setup · build · check · test.
set shell := ["bash", "-euo", "pipefail", "-c"]

default:
    @just --list --unsorted

setup:
    pnpm install

build:
    pnpm build

# (the full release gate — build, module check, docs tables, smoke pack, e2e — is `just verify`)

# project typechecks + lint + tests
check:
    pnpm check
    pnpm lint
    pnpm test

test:
    pnpm test

verify:
    pnpm verify

lint:
    pnpm lint

format:
    pnpm format

e2e:
    pnpm e2e

bench:
    pnpm bench
