import React from "react";
import { forceRenderStyles, style, types } from "typestyle";

export type StyleDescriptor = false | types.NestedCSSProperties | null | undefined;

/**
 * Create a React component that renders an instrinsic element with a
 * `className` computed by TypeStyle.
 *
 * Example:
 *
 *     import { styled } from "typestyle-react";
 *     const Button = styled('button', ({ primary }: { primary: boolean }) => ({
 *       backgroundColor: primary ? 'blue' : 'grey'
 *     }));
 *     const primaryButton = <Button primary />
 *
 * Props can be passed to the intrinsic element via the `inner` prop:
 *
 *     import { styled } from "typestyle-react";
 *     const Button = styled('button', ({ primary }: { primary: boolean }) => ({
 *       backgroundColor: primary ? 'blue' : 'grey'
 *     }));
 *     const primaryButton = <Button primary inner={{ id: "button-id" }} />
 *
 */
export function styled<T extends keyof DOMElementTypes, StyleProps extends {}>(
  tag: T,
  styles: StyleDescriptor | ((props: Readonly<StyleProps>) => StyleDescriptor)
) {
  const computeStyles = typeof styles === "function" ? styles : () => styles;

  type InnerProps = JSX.IntrinsicElements[T];
  type Props = StyleProps & {
    inner?: InnerProps;
  };

  const memoizedComputeClass = memoizeUnbounded((props: Readonly<StyleProps>) => {
    try {
      return style(computeStyles(props));
    } finally {
      forceRenderStylesDebounced();
    }
  });

  return class Styled extends React.PureComponent<Props, { className: string }> {
    public static displayName = `Styled(${tag})`;

    public state = {
      className: memoizedComputeClass(this.props)
    };

    public componentWillReceiveProps(nextProps: Readonly<Props>) {
      this.setState({
        className: memoizedComputeClass(nextProps)
      });
    }

    public render() {
      const { inner } = this.props;
      const { className } = this.state;
      return React.createElement(
        tag,
        inner !== undefined
          ? {
              // HACK: `as object` permits object spread to be used.
              ...(inner as object),
              className: inner.className !== undefined ? `${inner.className} ${className}` : className
            }
          : inner,
        this.props.children
      );
    }
  };
}

function memoizeUnbounded<Props, Result>(fn: (props: Props) => Result): (props: Props) => Result {
  const cache: { [key: string]: Result | undefined } = {};
  return props => {
    const cacheKey = JSON.stringify(props);
    const lookup = cache[cacheKey];
    if (lookup !== undefined) {
      return lookup;
    } else {
      const computed = (cache[cacheKey] = fn(props));
      return computed;
    }
  };
}

function microTaskDebounce(fn: () => void): () => void {
  let scheduled = false;
  return async () => {
    if (!scheduled) {
      scheduled = true;
      // Promise is scheduled as a microtask.
      await Promise.resolve();
      scheduled = false;
      fn();
    }
  };
}

const forceRenderStylesDebounced = microTaskDebounce(forceRenderStyles);

// This interface maps from element names to DOM types, for use with the
// `innerRef` prop.
export interface DOMElementTypes {
  a: HTMLAnchorElement;
  abbr: HTMLElement;
  address: HTMLElement;
  area: HTMLAreaElement;
  article: HTMLElement;
  aside: HTMLElement;
  audio: HTMLAudioElement;
  b: HTMLElement;
  base: HTMLBaseElement;
  bdi: HTMLElement;
  bdo: HTMLElement;
  big: HTMLElement;
  blockquote: HTMLElement;
  body: HTMLBodyElement;
  br: HTMLBRElement;
  button: HTMLButtonElement;
  canvas: HTMLCanvasElement;
  caption: HTMLElement;
  cite: HTMLElement;
  code: HTMLElement;
  col: HTMLTableColElement;
  colgroup: HTMLTableColElement;
  data: HTMLElement;
  datalist: HTMLDataListElement;
  dd: HTMLElement;
  del: HTMLElement;
  details: HTMLElement;
  dfn: HTMLElement;
  dialog: HTMLElement;
  div: HTMLDivElement;
  dl: HTMLDListElement;
  dt: HTMLElement;
  em: HTMLElement;
  embed: HTMLEmbedElement;
  fieldset: HTMLFieldSetElement;
  figcaption: HTMLElement;
  figure: HTMLElement;
  footer: HTMLElement;
  form: HTMLFormElement;
  h1: HTMLHeadingElement;
  h2: HTMLHeadingElement;
  h3: HTMLHeadingElement;
  h4: HTMLHeadingElement;
  h5: HTMLHeadingElement;
  h6: HTMLHeadingElement;
  head: HTMLHeadElement;
  header: HTMLElement;
  hgroup: HTMLElement;
  hr: HTMLHRElement;
  html: HTMLHtmlElement;
  i: HTMLElement;
  iframe: HTMLIFrameElement;
  img: HTMLImageElement;
  input: HTMLInputElement;
  ins: HTMLModElement;
  kbd: HTMLElement;
  keygen: HTMLElement;
  label: HTMLLabelElement;
  legend: HTMLLegendElement;
  li: HTMLLIElement;
  link: HTMLLinkElement;
  main: HTMLElement;
  map: HTMLMapElement;
  mark: HTMLElement;
  menu: HTMLElement;
  menuitem: HTMLElement;
  meta: HTMLMetaElement;
  meter: HTMLElement;
  nav: HTMLElement;
  noscript: HTMLElement;
  object: HTMLObjectElement;
  ol: HTMLOListElement;
  optgroup: HTMLOptGroupElement;
  option: HTMLOptionElement;
  output: HTMLElement;
  p: HTMLParagraphElement;
  param: HTMLParamElement;
  picture: HTMLElement;
  pre: HTMLPreElement;
  progress: HTMLProgressElement;
  q: HTMLQuoteElement;
  rp: HTMLElement;
  rt: HTMLElement;
  ruby: HTMLElement;
  s: HTMLElement;
  samp: HTMLElement;
  script: HTMLScriptElement;
  section: HTMLElement;
  select: HTMLSelectElement;
  small: HTMLElement;
  source: HTMLSourceElement;
  span: HTMLSpanElement;
  strong: HTMLElement;
  style: HTMLStyleElement;
  sub: HTMLElement;
  summary: HTMLElement;
  sup: HTMLElement;
  table: HTMLTableElement;
  tbody: HTMLTableSectionElement;
  td: HTMLTableDataCellElement;
  textarea: HTMLTextAreaElement;
  tfoot: HTMLTableSectionElement;
  th: HTMLTableHeaderCellElement;
  thead: HTMLTableSectionElement;
  time: HTMLElement;
  title: HTMLTitleElement;
  tr: HTMLTableRowElement;
  track: HTMLTrackElement;
  u: HTMLElement;
  ul: HTMLUListElement;
  var: HTMLElement;
  video: HTMLVideoElement;
  wbr: HTMLElement;
}
