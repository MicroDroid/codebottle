CodeBottle
===========

CodeBottle is a simple way to share small reusable snippets of code so that anyone can pull and use easily.

### Dependencies

- NodeJS >=7 (could work with older)
- NPM
- Unix-based environment; NPM scripts might not work on Windows

### Setup

```Bash
npm i                     # Install dependencies
cp .env.example .env      # Copy .env template
vim .env                  # Edit .env with appropriate stuff
npm run assets:prod       # Compile front-end
```

### Configuration

```Bash
vim ./config.js           # Edit as you wish; .env for env-dependent stuff
```

### Testing

```Bash
npm run tests             # Test stuff
npm run tests:coverage    # Test and create coverage report
```

### Running

```Bash
node .                    # Run, tada.
```