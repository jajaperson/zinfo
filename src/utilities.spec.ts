import { curry } from "lodash";
import { userInfo } from "os";
import { join } from "path";

import { homeRelativePath, optionalStyle, toSentence } from "./utilities";

describe("homeRelativePath", () => {
  it("formats home-relative paths correctly", () => {
    expect(homeRelativePath(join(userInfo().homedir, "Desktop"))).toBe(
      "~/Desktop"
    );
  });

  it("formats paths within another user's home correctly", () => {
    expect(homeRelativePath(join(userInfo().homedir + "not", "Desktop"))).toBe(
      `~${userInfo().username}not/Desktop`
    );
  });

  it("formats out-of-home paths correctly", () => {
    expect(homeRelativePath("/usr/bin")).toBe("/usr/bin");
  });

  it("recognizes non-user directories within the userParent", () => {
    expect(homeRelativePath(join(userInfo().homedir, "../Shared"))).toBe(
      join(userInfo().homedir, "../Shared")
    );
  });
});

test("optionalStyle", () => {
  const cOptionalStyle = curry(optionalStyle);
  const optReverse = cOptionalStyle(str =>
    String(str)
      .split("")
      .reverse()
      .join("")
  );

  expect(optReverse(true)("dog")).toBe("god");
  expect(optReverse(false)("dog")).toBe("dog");
});

describe("toSentence", () => {
  describe("formatting a single-item array", () => {
    test("with type string[]", () => {
      const arr = ["verbose"];
      expect(toSentence(arr)).toBe('"verbose"');
      expect(toSentence(arr, false)).toBe("verbose");
    });

    test("with type number[]", () => {
      const arr = [1];
      expect(toSentence(arr)).toBe("`1`");
      expect(toSentence(arr, false)).toBe("1");
    });
  });

  describe("formatting a two-item array", () => {
    test("with type string[]", () => {
      const arr = ["verbose", "version"];
      expect(toSentence(arr)).toBe('"verbose" and "version"');
      expect(toSentence(arr, false)).toBe("verbose and version");
    });

    test("with type number[]", () => {
      const arr = [1, 2];
      expect(toSentence(arr)).toBe("`1` and `2`");
      expect(toSentence(arr, false)).toBe("1 and 2");
    });
  });

  describe("formatting a three-or-more-item array", () => {
    test("with type string[]", () => {
      const arr = ["verbose", "version", "help"];
      expect(toSentence(arr)).toBe('"verbose", "version", and "help"');
      expect(toSentence(arr, false)).toBe("verbose, version, and help");
    });

    test("with type number[]", () => {
      const arr = [1, 2, 3];
      expect(toSentence(arr)).toBe("`1`, `2`, and `3`");
      expect(toSentence(arr, false)).toBe("1, 2, and 3");
    });
  });
});
