import { storiesOf } from "@storybook/react";
import React from "react";
import { styled } from "..";
import { name } from "../../package.json";

storiesOf(name, module)
  .add("Static", () => {
    const Red = styled("span", {
      color: "red"
    });
    return <Red>Some text</Red>;
  })
  .add("Dynamic", () => {
    const Color = styled("span", (props: { value: string }) => ({
      color: props.value
    }));
    return <Color styled={{ value: "blue" }}>Blue text</Color>;
  })
  .add("Dynamic (with inner)", () => {
    const Color = styled("span", (props: { value: string }) => ({
      color: props.value
    }));
    return (
      <Color styled={{ value: "purple" }} id="some-id">
        Purple text
      </Color>
    );
  })
  .add("Test: optional + mandatory prop", () => {
    const Test = styled("span", { color: "green" }, { padding: "5px" }, (_: { foo?: string; bar: string }) => ({}));
    return <Test styled={{ bar: "" }}>Multiple</Test>;
  })
  .add("Test: optional prop", () => {
    const Test = styled("span", { color: "green" }, { padding: "5px" }, (_: { foo?: string }) => ({}));
    return <Test>Multiple2</Test>;
  })
  .add("Test: supports props containing circular references", () => {
    const Foo = styled("div", (props: { color: string }) => ({
      color: props.color
    }));

    const props: { color: string; circular?: {} } = { color: "red" };
    props.circular = props; // circular
    return <Foo styled={props}>Red text</Foo>;
  })
  .add("default", () => {
    const Red = styled("span", ({ color = "red" }: { color?: string }) => ({
      color
    }));
    return <Red>Red text</Red>;
  })
  .add("Performance", () => {
    const cssProperties = {
      background: "red",
      display: "inline-block",
      height: "5px",
      margin: "1px",
      width: "5px"
    };

    const Dynamic = styled("div", () => cssProperties);
    const Static = styled("div", cssProperties);
    const SFC: React.SFC<{ children?: React.ReactElement<{}> }> = ({ children = null }) => children;

    interface State {
      renderCount: number;
      // Static and Dynamic types of styled components have different
      // performance optimisations, so it's useful to control which type is
      // rendered.
      renderType: "static" | "dynamic" | "native" | "native(wrapped)" | "native(fragment)" | "native(wrapped-sfc)" | "unique";
    }

    class Demo extends React.Component<{}, State> {
      public readonly state: State = { renderCount: 0, renderType: "static" };

      public render() {
        const now = Date.now();
        requestAnimationFrame(() => {
          console.log(`render time = ${Date.now() - now}`);
        });

        const redNodes = [];
        for (let i = 0; i < this.state.renderCount; i++) {
          redNodes.push(
            this.state.renderType === "dynamic" ? (
              <Dynamic />
            ) : this.state.renderType === "static" ? (
              <Static />
            ) : this.state.renderType === "native" ? (
              <div style={cssProperties} />
            ) : this.state.renderType === "native(fragment)" ? (
              <>
                <div style={cssProperties} />
              </>
            ) : this.state.renderType === "native(wrapped)" ? (
              <span>
                <div style={cssProperties} />
              </span>
            ) : this.state.renderType === "native(wrapped-sfc)" ? (
              <SFC>
                <div style={cssProperties} />
              </SFC>
            ) : this.state.renderType === "unique" ? (
              (() => {
                const Unique = styled("div", cssProperties);
                return <Unique />;
              })()
            ) : null
          );
        }
        return (
          <>
            <p>
              <strong>Instructions:</strong> Run the storybook using <code>NODE_ENV=production yarn storybook</code> and look in
              the console for render times.
            </p>
            <div>
              Count:
              {[1000, 10000, 20000, 40000, 80000, 100000].map(n => (
                <button
                  onClick={() => {
                    this.setState({ renderCount: n });
                  }}
                  style={this.state.renderCount === n ? { border: "2px solid blue" } : undefined}
                >
                  Render {n}
                </button>
              ))}
            </div>
            <div>
              Type:
              {[
                "static" as "static",
                "dynamic" as "dynamic",
                "native" as "native",
                "native(wrapped)" as "native(wrapped)",
                "native(fragment)" as "native(fragment)",
                "native(wrapped-sfc)" as "native(wrapped-sfc)",
                "unique" as "unique"
              ].map(x => (
                <button
                  onClick={() => {
                    this.setState({ renderType: x });
                  }}
                  style={this.state.renderType === x ? { border: "2px solid blue" } : undefined}
                >
                  Render {x}
                </button>
              ))}
            </div>
            <div style={{ lineHeight: 0 }}>{redNodes}</div>
          </>
        );
      }
    }

    return <Demo />;
  });
