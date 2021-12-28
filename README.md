[![deprecated](http://badges.github.io/stability-badges/dist/deprecated.svg)](https://dat-ecosystem.org/) 

More info on active projects and modules at [dat-ecosystem.org](https://dat-ecosystem.org/) <img src="https://i.imgur.com/qZWlO1y.jpg" width="30" height="30" /> 

---

# dat-storage

Dat specific storage provider for [Hyperdrive](https://github.com/mafintosh/hyperdrive)

```
npm install dat-storage
```

## Usage

``` js
var storage = require('dat-storage')

// files are stored in ./my-dataset
// metadata (hashes and stuff) are stored in ./my-dataset/.dat
// secret keys are stored in ~/.dat/secret_keys/<discovery-key>
var archive = hyperdrive(storage('my-dataset'))
```

### Custom storage provider

You can require this module in your own storage provider in order to override certain behaviors for some files while still using the default dat storage methods for other files. Here's an example of overriding only the secret key storage and nothing else:

```js
const defaultStorage = require('dat-storage')
const alternativeSecretStorage = require('your-own-custom-random-access-file-module')

module.exports = function keychainStorage() {
  const storage = defaultStorage(...arguments)
  return {
    metadata: function(file, opts) {
      if (file === 'secret_key') alternativeSecretStorage(file)
      return storage.metadata(...arguments)
    },
    content: function(file, opts) {
      return storage.content(...arguments)
    }
  }
}
```

### Options

- `secretDir` - folder to store secret keys in (default is users home dir)
- `prefix` - subfolder to put dat SLEEP files in (default is `.dat/`)

### Secret Keys

By default secret keys are stored in the users home directory via [dat-secret-storage](https://github.com/joehand/dat-secret-storage). To change the directory, pass it as an option:

```js
var storage = require('dat-storage')

var archive = hyperdrive(storage('my-dataset', {secretDir: '/secret_keys'})
```

## License

MIT
