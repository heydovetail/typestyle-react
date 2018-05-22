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
  });
