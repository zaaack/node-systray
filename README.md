# node-systray

> SysTray library for nodejs using [systray-portable](https://github.com/zaaack/systray-portable) (a portable version of [the go systray library](https://github.com/getlantern/systray)).


## Install
```sh
npm i systray
# or
yarn add systray
```

## Usage

```ts
import SysTray from 'systray'

const systray = new SysTray({
    menu: {
        icon: "<base64 image string>",
        title: "标题",
        tooltip: "Tips",
        items: [{
            title: "aa",
            tooltip: "bb",
            checked: true, // checked not implemented on Linux yet.
            enabled: true
        }, {
            title: "aa2",
            tooltip: "bb",
            checked: false,
            enabled: true
        }, {
            title: "Exit",
            tooltip: "bb",
            checked: false,
            enabled: true
        }]
    },
    debug: false,
    copyDir: true, // copy go tray binary to outside directory, useful for packing tool like pkg.
})

systray.onClick(action => {
    if (action.seq_id === 1) {
        if (action.seq_id === 0) {
            systray.sendAction({
                type: 'update-item',
                item: {
                ...action.item,
                checked: !action.item.checked,
                },
                seq_id: action.seq_id,
            })
        } else if (action.seq_id === 2) {
            systray.kill()
        }
    }
})

```

For more API info please see https://zaaack.github.io/node-systray/

## License
MIT