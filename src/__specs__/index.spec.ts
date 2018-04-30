import "jest";
import { styled } from "..";

describe(styled.name, () => {
  it("is a function", () => {
    expect(styled).toBeInstanceOf(Function);
  });
});
