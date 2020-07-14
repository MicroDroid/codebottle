> **NOTE**: this website is retired, but the repo is kept for historical purposes.

CodeBottle [![CircleCI](https://circleci.com/gh/BFNT/codebottle.svg?style=svg&circle-token=4824c1983ce3bd6ce7add24d05a2986aac7cdb09)](https://circleci.com/gh/BFNT/codebottle)
===========

CodeBottle is a simple way to share small reusable snippets of code so that anyone can pull and use easily.

### Dependencies

- Node and stuff

### Setup

```Bash
yarn                      # Install dependencies
cp .env.example .env      # Copy .env template
vim .env                  # Edit .env with appropriate stuff
yarn webapp:prod          # Compile front-end (or :dev if you want)
```

### Configuration

```Bash
vim ./config.js           # Edit as you wish; .env for non-env-dependent stuff
```

### Testing

```Bash
yarn tests                # Test stuff (most likely broken already lol)
yarn tests:coverage       # Test and create coverage report
```

### Running

```Bash
yarn prod                 # Run, tada.
```