/**
 * @license
 * Copyright (c) 2018 James Jensen.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { uptime as sysUptime, userInfo } from "os";

import c = require("chalk");
import * as execa from "execa";
import * as moment from "moment";
import "moment-duration-format";

import { homeRelativePath, optionalStyle, ensure } from "./utilities";

/** Zinfo Options Type */
export type ZinfoOptionsType =
  | "cwd-path"
  | "cwd-path-absolute"
  | "git-overview"
  | "git-branch"
  | "git-last-commit"
  | "git-ahead"
  | "git-behind"
  | "platform"
  | "user"
  | "time"
  | "time-24"
  | "date"
  | "date-time"
  | "date-time-24"
  | "node-v"
  | "uptime";

/** Array of Zinfo Options */
export const zinfoOptions: ZinfoOptionsType[] = [
  "cwd-path",
  "cwd-path-absolute",
  "git-overview",
  "git-branch",
  "git-last-commit",
  "git-ahead",
  "git-behind",
  "platform",
  "user",
  "time",
  "time-24",
  "date",
  "date-time",
  "date-time-24",
  "node-v",
  "uptime",
];

/**
 * ## Array of Zinfo Option Descriptions
 * Index corresponds to the index in `zinfoOptions` of the option being described.
 */
export const zinfoOptionsDesc: string[] = [
  "The current directory, in home-relative format.",
  "The current directory's absolute path.",
  "Information about the current directory's git, if the current directory is a git repository. `*` means the repository is dirty, and an upwards arrow (`\u21E1`) is displayed if there are commits to push, a downwards arrow (`\u21E3`) is displayed if there are commits on `origin` to pull.",
  "The current git branch.",
  "The last commit in the local repository.",
  "The number of commits ahead of origin the local repository is.",
  "The number of commits behind origin the local repository is.",
  "The platform being used.",
  "The current user.",
  "The current time.",
  "The current time, in 24-hour format.",
  "The current date.",
  "The current date and time.",
  "The current date and time, in 24-hour format.",
  "The current node version.",
  "How long the system has been up.",
];

/** Zinfo Options Type Guard */
export function isZinfoOptionsType(arg: any): arg is ZinfoOptionsType {
  return typeof arg !== "string"
    ? false
    : zinfoOptions.indexOf(arg as ZinfoOptionsType) > -1;
}

/** Zinfo Output Style Configoration */
export interface IZinfoStyle {
  /** Underline data (but not symbols) */
  underlineData: boolean;
  /** Use a secondary color symbols */
  iconsSecondary: boolean;
  /** Enable NerdFonts */
  nerdFonts: boolean;
}

/**
 * ## Zinfo
 * Returns stylized data about the current directory, system, and node.
 *
 * @param include - Which data to print.
 */
export async function zinfo(
  include: ZinfoOptionsType[],
  cwd: string = process.cwd(),
  style: IZinfoStyle = {
    underlineData: false,
    iconsSecondary: false,
    nerdFonts: false,
  }
): Promise<string[]> {
  // Optional styles
  const underline = optionalStyle(c.underline, style.underlineData);
  const secondary = optionalStyle(c.dim, style.iconsSecondary);

  const zinfoArray: string[] = [];

  let repo: IGitStat;
  let isGit: boolean;
  let repoCommitCount: number;

  if (include.indexOf("cwd-path") > -1) {
    zinfoArray.push(c.blue(underline(homeRelativePath(cwd))));
  }
  if (include.indexOf("cwd-path-absolute") > -1) {
    zinfoArray.push(c.blue(underline(cwd)));
  }
  if (include.indexOf("git-overview") > -1) {
    isGit = await ensure(isGit, async () => await isGitRepository(cwd));
    if (isGit) {
      repo = await ensure(repo, async () => await gitStat(cwd));

      zinfoArray.push(
        c.red(
          `${secondary(style.nerdFonts ? "\ue0a0" : ">")} ${underline(
            `${repo.branch + (repo.dirty ? c.dim("*") : "")} ${c.cyan(
              (repo.ahead ? "\u21E1" : "") + (repo.behind ? "\u21E3" : "")
            )}`
          )}`
        )
      );
    }
  }
  if (include.indexOf("git-branch") > -1) {
    isGit = await ensure(isGit, async () => await isGitRepository(cwd));
    if (isGit) {
      repo = await ensure(repo, async () => await gitStat(cwd));

      zinfoArray.push(
        c.red(
          `${secondary(style.nerdFonts ? "\ue0a0" : ">")} ${underline(
            repo.branch
          )}`
        )
      );
    }
  }
  if (include.indexOf("git-last-commit") > -1) {
    isGit = await ensure(isGit, async () => await isGitRepository(cwd));
    if (isGit) {
      repoCommitCount = await ensure(
        repoCommitCount,
        async () => await commitCount(cwd)
      );
      if (repoCommitCount > 0) {
        const [shortHash, subject] = (await execa.stdout("git", [
          "--no-pager",
          "log",
          "-1",
          "--format=%h:%s",
        ])).split(":");

        zinfoArray.push(
          c.red(
            `${secondary(style.nerdFonts ? "\uf417" : "\u29B5")} ${underline(
              `${subject} ${c.dim.italic(shortHash)}`
            )}`
          )
        );
      }
    }
  }
  if (include.indexOf("git-ahead") > -1) {
    if (await isGitRepository(cwd)) {
      const { ahead } = await gitStat(cwd);

      zinfoArray.push(
        c.red(
          `${secondary(style.nerdFonts ? "\uf403" : "%")} ${underline(
            `${ahead} commits ahead of origin`
          )}`
        )
      );
    }
  }
  if (include.indexOf("git-behind") > -1) {
    if (await isGitRepository(cwd)) {
      const { behind } = await gitStat(cwd);

      zinfoArray.push(
        c.red(
          `${secondary(style.nerdFonts ? "\uf404" : "!")} ${underline(
            `${behind} commits behind origin`
          )}`
        )
      );
    }
  }
  if (include.indexOf("platform") > -1) {
    zinfoArray.push(
      c.yellow(
        `${secondary(style.nerdFonts ? getOsSymbol() : "P")} ${underline(
          process.platform
        )}`
      )
    );
  }
  if (include.indexOf("user") > -1) {
    zinfoArray.push(
      c.greenBright(
        `${secondary(style.nerdFonts ? "\uf841" : "\u2666")} ${underline(
          userInfo().username
        )}`
      )
    );
  }
  if (include.indexOf("time") > -1) {
    zinfoArray.push(
      c.redBright(
        `${secondary(style.nerdFonts ? "\uf64f" : "T")} ${underline(
          moment().format("h:mm:ss a")
        )}`
      )
    );
  }
  if (include.indexOf("time-24") > -1) {
    zinfoArray.push(
      c.redBright(
        `${secondary(style.nerdFonts ? "\uf64f" : "T")} ${underline(
          moment().format("H:mm:ss")
        )}`
      )
    );
  }
  if (include.indexOf("date") > -1) {
    zinfoArray.push(
      c.redBright(
        `${secondary(style.nerdFonts ? "\uf5ec" : "D")} ${underline(
          moment().format("dddd, MMMM Do YYYY")
        )}`
      )
    );
  }
  if (include.indexOf("date-time") > -1) {
    zinfoArray.push(
      c.redBright(
        `${secondary(style.nerdFonts ? "\uf5ef" : "D")} ${underline(
          moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
        )}`
      )
    );
  }
  if (include.indexOf("date-time-24") > -1) {
    zinfoArray.push(
      c.redBright(
        `${secondary(style.nerdFonts ? "\uf5ef" : "D")} ${underline(
          moment().format("dddd, MMMM Do YYYY, H:mm:ss")
        )}`
      )
    );
  }
  if (include.indexOf("node-v") > -1) {
    zinfoArray.push(
      c.green(
        `${secondary(style.nerdFonts ? "\ue24f" : "\u2B22")} ${underline(
          process.version.substring(1)
        )}`
      )
    );
  }
  if (include.indexOf("uptime") > -1) {
    zinfoArray.push(
      c.magentaBright(
        `${secondary(style.nerdFonts ? "\uf55d" : "U")} ${underline(
          moment.duration(sysUptime(), "seconds").format()
        )}`
      )
    );
  }

  return zinfoArray;
}

/**
 * ## Os Symbol
 * Returns a NerdFonts symbol for the operating system. Currently has an icon
 * for MacOS, Windows and Linux (nothing more specific).
 *
 * @returns The symbol for your OS.
 */
export function getOsSymbol(platform: string = process.platform): string {
  switch (process.platform) {
    case "darwin":
      return "\uf179";

    case "linux":
      return "\uf17c";

    case "win32":
      return "\uf17a";

    default:
      return "\uf109";
  }
}

/**
 * ## Is Git Repository
 * Returns whether the specified directory is a git repository.
 *
 * @param directory - The directory to check
 */
export async function isGitRepository(
  directory: string = process.cwd()
): Promise<boolean> {
  let isGit = true;

  try {
    await execa("git", ["status"], { cwd: directory });
  } catch (err) {
    isGit = false;
  }

  return isGit;
}

/**
 * ## Repository Commit Count
 * Get the number of commits a given repository's current branch has.
 *
 * @param repository - The local repository to check
 * @returns The number of commits
 */
export async function commitCount(
  repository: string = process.cwd()
): Promise<number> {
  return Number(
    await execa.stdout("git", ["rev-list", "--all", "--count"], {
      cwd: repository,
    })
  );
}

export async function remoteBranchExists(
  repository: string = process.cwd(),
  branch: string = "current",
  remote: string = "origin"
): Promise<boolean> {
  if (branch === "current") {
    branch = await execa.stdout("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: repository,
    });
  }

  return (
    (await execa.stdout(
      "git",
      ["--no-pager", "branch", "--remotes", "--format=%(refname:short)"],
      {
        cwd: repository,
      }
    ))
      .split("\n")
      .indexOf(`${remote}/${branch}`) > -1
  );
}

/** Git Stat Interface */
export interface IGitStat {
  /** Current branch */
  branch: string;
  /** Whether the selected branch is dirty */
  dirty: boolean;
  /** How many commits ahead of `origin` the local repository is. */
  ahead: number;
  /** How many commit behind `origin` the local repository is. */
  behind: number;
  /** Whether the repository is empty of commits. */
  fresh?: boolean;
}

/**
 * ## Git Stat
 * Get information about a repository.
 *
 * Gives information about the following:
 * - The current branch of the repository
 * - Whether the selected branch is dirty
 * - How many commits ahead of `origin` the local repository is.
 * - How many commit behind `origin` the local repository is.
 *
 * @param repository - The path to the repository to get information about.
 */
export async function gitStat(
  repository: string = process.cwd()
): Promise<IGitStat> {
  if (await isGitRepository(repository)) {
    const hasOrigin =
      (await execa.stdout("git", ["remote"], { cwd: repository })).search(
        "origin"
      ) > -1;

    if ((await commitCount(repository)) > 0) {
      const branch = await execa.stdout(
        "git",
        ["rev-parse", "--abbrev-ref", "HEAD"],
        { cwd: repository }
      );

      const dirty =
        (await execa.stdout("git", ["status", "--porcelain"], {
          cwd: repository,
        })).length > 0;

      const freshBranch = hasOrigin
        ? !(await remoteBranchExists(repository, branch))
        : true;

      const ahead = hasOrigin
        ? !freshBranch
          ? Number(
              await execa.stdout(
                "git",
                [
                  "rev-list",
                  "--left-only",
                  "--count",
                  `${branch}...origin/${branch}`,
                ],
                { cwd: repository }
              )
            )
          : 1
        : 0;

      const behind = !freshBranch
        ? Number(
            await execa.stdout(
              "git",
              [
                "rev-list",
                "--right-only",
                "--count",
                `${branch}...origin/${branch}`,
              ],
              { cwd: repository }
            )
          )
        : 0;

      return { branch, dirty, ahead, behind };
    } else {
      const branch = "master";
      const dirty =
        (await execa.stdout("git", ["status", "--porcelain"], {
          cwd: repository,
        })).length > 0;
      const ahead = 0;
      const behind = hasOrigin
        ? Number(
            await execa.stdout(
              "git",
              [
                "rev-list",
                "--left-only",
                "--count",
                `${branch}...origin/${branch}`,
              ],
              { cwd: repository }
            )
          )
        : 0;

      return { branch, dirty, ahead, behind, fresh: true };
    }
  } else {
    throw new Error(`${repository} is not a git repository.`);
  }
}
