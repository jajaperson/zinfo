# zinfo

Quickly get information about the current directory, system, and node.

## Usage

First, install `zinfo-logger` globally.

```sh
$ npm install -g zinfo-logger
```

Then, optionally add default options to your `.BASH_PROFILE` or `.zshrc` (you
can see available options [below](#Options)).

```sh
export ZINFO_DEFAULTS="cwd-path time-24 node-v"
```

Finally, run the command.

```sh
$ zinfo
~/Desktop/GitHub/zinfo
T 13:30:55
⬢ 11.6.0
```

## Configuration

<!-- BEGIN:usage -->

```sh
$ zinfo --help
zinfo [args]

Commands:
  zinfo completion  generate bash completion script

Options:
  --include, -i          Which data to print. [array] [default: $ZINFO_DEFAULTS]
  --exclude, -e          Data to not print               [array] [default: none]
  --ignore-defaults, -I  Ignore "$ZINFO_DEFAULTS"     [boolean] [default: false]
  --all, -a              Include all options          [boolean] [default: false]
  --underline, -u        Underline data (but not symbols), excluding
                         cwd-path(-absolute)
                                      [boolean] [default: $ZINFO_UNDERLINE_DATA]
  --nerdfonts, --nf      Use NerdFont symbols
                                           [boolean] [default: $ZINFO_NERDFONTS]
  --options, --ls        List available options.                       [boolean]
  --version, -v          Show version number                           [boolean]
  --help                 Show help                                     [boolean]
```

<!-- END:usage -->

## Options

Options can be specified by the `--include` option (see above), or through the
`$ZINFO_DEFAULTS` environment variable.

<!-- BEGIN:options -->

### `cwd-path`

The current directory, in home-relative format.

### `cwd-path-absolute`

The current directory's absolute path.

### `platform`

The platform being used.

### `time`

The current time.

### `time-24`

The current time, in 24-hour format.

### `date`

The current date.

### `date-time`

The current date and time.

### `date-time-24`

The current date and time, in 24-hour format.

### `node-v`

The current node version.

### `uptime`

How long the system has been up, in milliseconds.

<!-- END:options -->
