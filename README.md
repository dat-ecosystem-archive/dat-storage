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

### Secret Keys

By default secret keys are stored in the users home directory via [dat-secret-storage](https://github.com/joehand/dat-secret-storage). To change the directory, pass it as an option:

```js
var storaage = require('dat-storage')

var archive = hyperdrive(storage('my-dataset', {secretDir: '/secret_keys'})
```

## License

MIT
