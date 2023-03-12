# git-recent-branch

A simple CLI to checkout one of your most recent branches.

![Git recent branch in action](.github/assets/git-recent-branch.png)

[![NPM version](https://img.shields.io/npm/v/git-recent-branch?color=%23c53635&label=%20)](https://www.npmjs.com/package/git-recent-branch)


## Features

* Simple to use
* Quick to install with NPM
* Checkout a previous branch with one (keyboard) click
* Beautiful and lightweight


## Install

```bash
npm install -g git-recent-branch
```


## Usage

```bash
# run without any config
git-recent-branch 

# run without installing
npx git-recent-branch

# show more than 5 recent branches
git-recent-branch -c 10

# add alias
alias rb="git-recent-branch"
```
