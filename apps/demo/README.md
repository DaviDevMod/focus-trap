## Demo

This Next.js app is an interactive demo for the [@davidevmod/focus-trap](https://github.com/DaviDevMod/focus-trap/tree/main/packages/focus-trap) package.

You can visit the live demo at: https://focus-trap-demo.vercel.app

There is a playground with a few elements within which you can trap the focus by building a focus trap through the inputs on the right.

You can also modify properties of the button elements in the playground and see the focus trap aknowledge them in real time.

There are a couple of things to watch out for:

- If a trap has `lock` enabled (the default) you won't be able to interact with any element outside of the trap, though you may break free of the trap by pressing the <kbd>Esc</kbd> key.

- If a trap has `lock` enabled and `escape` disabled, the only way out is reloading the page.

An `Escape` button, always clickable, will be provided as an escape hatch eventually.  
`Tab` and `Shift-tab` buttons will be added too, to make the demo accessible to devices missing the ability to fire the related events.

## Run locally

Clone [the monorepo](https://github.com/DaviDevMod/focus-trap) to your local machine, it uses [yarn berry](https://github.com/yarnpkg/berry) [workspaces](https://yarnpkg.com/features/workspaces) so to install the project's dependencies you will need to [enable corepack](https://yarnpkg.com/getting-started/install) first:

```bash
git clone https://github.com/DaviDevMod/focus-trap.git

cd focus-trap

corepack enable

yarn install
```

Then you can start a server on http://localhost:3000 with:

```bash
yarn workspace demo dev
```
