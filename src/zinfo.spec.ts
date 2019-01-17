import { join } from "path";
import {
  zinfoOptions,
  zinfoOptionsDesc,
  isGitRepository,
  zinfo,
} from "./zinfo";

describe("zinfo", () => {
  it("has a description for every option", () => {
    expect(zinfoOptions.length).toEqual(zinfoOptionsDesc.length);
  });

  it("correctly recognizes git repositories", async () => {
    expect(await isGitRepository(__dirname)).toBeTruthy();
  });

  it("works in all environments", async () => {
    // Repo root directory
    expect(await zinfo(zinfoOptions, join(__dirname, ".."))).toBeTruthy();
    // Repo sub-directory
    expect(await zinfo(zinfoOptions, __dirname)).toBeTruthy();
    // Non-repo
    expect(await zinfo(zinfoOptions, "/")).toBeTruthy();
    // TODO: test in commitless (fresh) repositories.
  });
});
