# typestyle-react

Simplified integration between TypeStyle and React.

# Installation

```sh
npm install --save typestyle-react
# or
yarn add typestyle-react
```

# Simple Usage

It's simple to create a React component that has some styles applied.

```tsx
import { styled } from "typestyle-react";

// Renders a `<span class="…">…</span>`, where `class` is computed by TypeStyle.
const RedText = styled("span", {
  color: "red"
});

let element = <RedText>Hello world!</RedText>;
```

Components pass-through supported props, so they can be used the same as the
unstyled originals.

```tsx
element = <RedText id="my-red-text">Hello world!</RedText>;
```

Caveats:

* If `className` is passed, its value will be merged with the TypeStyle computed
  value.
* Using `ref` will expose the wrapped component, use `innerRef` to access the
  inner element.

# Advanced Usage

## Parameterised Styles

Styling can be parameterised, and be passed values via props. Instead of passing
an `CSSNestedProperties` object to `styled`, pass a function:

```tsx
import { styled } from "typestyle-react";

const ColoredText = styled("span", (props: { color: string }) => ({
  color: "red"
}));

// Styled props passed via the special `styled` prop.
let element = <ColoredText styled={{ color: "red" }}>Hello world!</ColoredText>;
```

**Hint:** Don't confuse the `styled` prop with the native `style` prop.

## Styles Rendering

Styles are computed (via TypeStyle) when the component is rendered, and are
immediately scheduled to be flushed to the DOM using a micro task. This is done
to strike a balance between performance and ensuring styles are available before
the next paint.

In some cases this is "too late" (for example when measuring and repositioning
DOM elements in `componentDidUpdate`). There's a couple of work-arounds:

* Manually call TypeStyle's `forceRenderStyles()`.
* Debounce the DOM measurement in a micro task.
