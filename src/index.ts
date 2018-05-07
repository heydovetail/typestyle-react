import * as React from "react";
import { forceRenderStyles, style as typeStyle, types } from "typestyle";

/**
 * A wrapped version of TypeStyle's `style(…)` that guarantees that styles will
 * be available before next paint.
 *
 * This is achieved by scheduling a render as a microtask (as opposed to via
 * `requestAnimationFrame` as done by TypeStyle).
 */
export const style: typeof typeStyle = (...args) => {
  try {
    return typeStyle(...args);
  } finally {
    forceRenderStylesDebounced();
  }
};

export type StyleDescriptor = false | types.NestedCSSProperties | null | undefined;

export type InnerRefProps<T extends keyof DOMElementTypes> = {
  innerRef?: (node: DOMElementTypes[T] | null) => void;
};

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
export function styled<T extends keyof DOMElementTypes, StyledProps>(
  tag: T,
  ...styles: Array<StyleDescriptor | ((props: Readonly<StyledProps>) => StyleDescriptor)>
) {
  type Props = JSX.IntrinsicElements[T] &
    InnerRefProps<T> &
    ({} extends StyledProps ? { styled?: StyledProps } : { styled: StyledProps });

  const memoizedComputeClass = memoizeUnbounded((styledProps?: StyledProps) =>
    style(...styles.map(s => (typeof s === "function" ? s(styledProps !== undefined ? styledProps : ({} as StyledProps)) : s)))
  );

  return class Styled extends React.PureComponent<Props, { className: string }> {
    public static displayName = `Styled(${tag})`;

    public state = {
      className: memoizedComputeClass(this.props.styled)
    };

    public componentWillReceiveProps(nextProps: Readonly<Props>) {
      this.setState({
        className: memoizedComputeClass(nextProps.styled)
      });
    }

    public render(): DetailedReactHTMLElements[T] {
      // tslint:disable-next-line:no-any
      const { innerRef, styled, children, className: innerClassName, ...innerProps } = this.props as any;
      const { className } = this.state;
      return React.createElement(
        tag,
        {
          ...innerProps,
          ref: innerRef,
          className: innerClassName !== undefined ? `${innerClassName} ${className}` : className
        },
        children
      );
    }
  };
}

/**
 * Memoize a function, using an unbounded cache (for simplicity). A console
 * warning is emitted after 1000 calls are cached.
 *
 * The default serialiser JSON.stringify may fail if the param can't be
 * stringified (e.g. circular structures).
 */
function memoizeUnbounded<Param, ReturnValue>(
  fn: (param: Param) => ReturnValue,
  serialize: (param: Param) => string = param => JSON.stringify(param)
): (param: Param) => ReturnValue {
  const cacheSizeWarn = 1000;
  let cacheSize = 0;
  const cache: { [key: string]: ReturnValue | undefined } = {};
  return param => {
    const cacheKey = serialize(param);
    const lookup = cache[cacheKey];
    if (lookup !== undefined) {
      return lookup;
    } else {
      cacheSize += 1;
      if (cacheSize === cacheSizeWarn) {
        console.warn(
          `${memoizeUnbounded.name} cache size hit ${cacheSizeWarn}, this is probably a bug, stack:\n`,
          new Error().stack
        );
      }
      const computed = (cache[cacheKey] = fn(param));
      return computed;
    }
  };
}

/**
 * Debounce a function using a microtask.
 */
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

export interface DetailedReactHTMLElements {
  a: React.DetailedReactHTMLElement<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
  abbr: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  address: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  area: React.DetailedReactHTMLElement<React.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
  article: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  aside: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  audio: React.DetailedReactHTMLElement<React.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
  b: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  base: React.DetailedReactHTMLElement<React.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
  bdi: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  bdo: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  big: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  blockquote: React.DetailedReactHTMLElement<React.BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
  body: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
  br: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
  button: React.DetailedReactHTMLElement<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
  canvas: React.DetailedReactHTMLElement<React.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
  caption: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  cite: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  code: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  col: React.DetailedReactHTMLElement<React.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  colgroup: React.DetailedReactHTMLElement<React.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
  data: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  datalist: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
  dd: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  del: React.DetailedReactHTMLElement<React.DelHTMLAttributes<HTMLElement>, HTMLElement>;
  details: React.DetailedReactHTMLElement<React.DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
  dfn: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  dialog: React.DetailedReactHTMLElement<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
  div: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  dl: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
  dt: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  em: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  embed: React.DetailedReactHTMLElement<React.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
  fieldset: React.DetailedReactHTMLElement<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
  figcaption: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  figure: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  footer: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  form: React.DetailedReactHTMLElement<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
  h1: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h2: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h3: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h4: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h5: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  h6: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
  head: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLHeadElement>;
  header: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  hgroup: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  hr: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
  html: React.DetailedReactHTMLElement<React.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
  i: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  iframe: React.DetailedReactHTMLElement<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
  img: React.DetailedReactHTMLElement<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
  input: React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  ins: React.DetailedReactHTMLElement<React.InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
  kbd: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  keygen: React.DetailedReactHTMLElement<React.KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
  label: React.DetailedReactHTMLElement<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
  legend: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
  li: React.DetailedReactHTMLElement<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
  link: React.DetailedReactHTMLElement<React.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
  main: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  map: React.DetailedReactHTMLElement<React.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
  mark: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  menu: React.DetailedReactHTMLElement<React.MenuHTMLAttributes<HTMLElement>, HTMLElement>;
  menuitem: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  meta: React.DetailedReactHTMLElement<React.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
  meter: React.DetailedReactHTMLElement<React.MeterHTMLAttributes<HTMLElement>, HTMLElement>;
  nav: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  noscript: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  object: React.DetailedReactHTMLElement<React.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
  ol: React.DetailedReactHTMLElement<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
  optgroup: React.DetailedReactHTMLElement<React.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
  option: React.DetailedReactHTMLElement<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
  output: React.DetailedReactHTMLElement<React.OutputHTMLAttributes<HTMLElement>, HTMLElement>;
  p: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
  param: React.DetailedReactHTMLElement<React.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
  picture: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  pre: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
  progress: React.DetailedReactHTMLElement<React.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
  q: React.DetailedReactHTMLElement<React.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
  rp: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  rt: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  ruby: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  s: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  samp: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  script: React.DetailedReactHTMLElement<React.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
  section: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  select: React.DetailedReactHTMLElement<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
  small: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  source: React.DetailedReactHTMLElement<React.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
  span: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
  strong: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  style: React.DetailedReactHTMLElement<React.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
  sub: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  summary: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  sup: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  table: React.DetailedReactHTMLElement<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
  tbody: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  td: React.DetailedReactHTMLElement<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
  textarea: React.DetailedReactHTMLElement<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
  tfoot: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  th: React.DetailedReactHTMLElement<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
  thead: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
  time: React.DetailedReactHTMLElement<React.TimeHTMLAttributes<HTMLElement>, HTMLElement>;
  title: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
  tr: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
  track: React.DetailedReactHTMLElement<React.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
  u: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  ul: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
  var: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  video: React.DetailedReactHTMLElement<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
  wbr: React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  webview: React.DetailedReactHTMLElement<React.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;
}

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
