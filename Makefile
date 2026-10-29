# SPDX-FileCopyrightText: Copyright Logically Magic Inc. <hello@logicallymagic.com>
# SPDX-FileCopyrightText: Copyright Hamid Jahanzad <Hamid@Jahanzad.com>
# SPDX-FileCopyrightText: Copyright Contributors to the Sentin8:Site
# SPDX-License-Identifier: Apache-2.0

# Makefile — sentin8-site (docs site repo, RS §4.5)
#
# The platform's public docs site: Docusaurus + the @sentin8/site-engine
# harvest pipeline (package.json scripts). Self-contained dev controls
# for THIS repo; the site-engine itself is the sibling repo
# sentin8-site-engine (npm-linked as @sentin8/site-engine).

SHELL := /bin/bash

.PHONY: help harvest install build serve start lint clean

help: ## Show this help
	@echo "sentin8-site (Docusaurus docs site)"
	@grep -E '^[a-z-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## npm install
	@npm install

harvest: ## Refresh harvested docs (site-engine harvest.mjs)
	@npm run harvest

build: ## Docusaurus production build
	@npm run build

start: ## Docusaurus dev server
	@npm start

serve: ## Serve the production build
	@npm run serve

lint: ## Site is content-only — npm ls as the sanity check
	@npm ls --depth=0 >/dev/null

clean: ## Remove node_modules + build + scratch/run dirs (.run .run/logs .tmp)
	@rm -rf node_modules build .docusaurus .run .run/logs .tmp