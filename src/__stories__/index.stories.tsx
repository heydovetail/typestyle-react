import { storiesOf } from "@storybook/react";
import React from "react";
import { name } from "../../package.json";
import { styled } from "..";

storiesOf(name, module)
  .add("Static", () => <Red>Some text</Red>)
  .add("Dynamic", () => <Color value="blue">Blue text</Color>)
  .add("Dynamic (with inner)", () => (
    <Color value="purple" inner={{ id: "some-id" }}>
      Purple text
    </Color>
  ));

const Red = styled("span", {
  color: "red"
});

const Color = styled("span", (props: { value: string }) => ({
  color: props.value
}));
