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

import { dirname, resolve as resolvePath } from "path";
import { uptime as sysUptime, userInfo } from "os";
import * as moment from "moment";
import "moment-duration-format";
import c from "chalk";
import { identity } from "lodash";

/** Array of Zinfo Options */
export const zinfoOptions: ZinfoOptionsType[] = [
  "cwd-path",
  "cwd-path-absolute",
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
  "The platform being used.",
  "user",
  "The current time.",
  "The current time, in 24-hour format.",
  "The current date.",
  "The current date and time.",
  "The current date and time, in 24-hour format.",
  "The current node version.",
  "How long the system has been up.",
];

/** Zinfo Options Type */
export type ZinfoOptionsType =
  | "cwd-path"
  | "cwd-path-absolute"
  | "platform"
  | "user"
  | "time"
  | "time-24"
  | "date"
  | "date-time"
  | "date-time-24"
  | "node-v"
  | "uptime";

/** Zinfo Options Type Guard */
export function isZinfoOptionsType(arg: any): arg is ZinfoOptionsType {
  return typeof arg !== "string"
    ? false
    : zinfoOptions.indexOf(arg as ZinfoOptionsType) > -1;
}

/** Zinfo Output Style Configoration */
export interface ZinfoStyleInterface {
  underlineData: boolean;
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
  style: ZinfoStyleInterface
): Promise<string> {
  // Optional styles
  const underline = optionalStyle(c.underline, style.underlineData);

  const zinfoArray: string[] = [];

  if (include.indexOf("cwd-path") > -1) {
    zinfoArray.push(c.blue(underline(homeRelativePath(process.cwd()))));
  }
  if (include.indexOf("cwd-path-absolute") > -1) {
    zinfoArray.push(c.blue(underline(process.cwd())));
  }
  if (include.indexOf("platform") > -1) {
    zinfoArray.push(
      c.yellow(
        `${style.nerdFonts ? getOsSymbol() : "P"} ${underline(
          process.platform
        )}`
      )
    );
  }
  if (include.indexOf("user") > -1) {
    zinfoArray.push(
      c.greenBright(
        `${style.nerdFonts ? "\uf841" : "\u2666"} ${underline(
          userInfo().username
        )}`
      )
    );
  }
  if (include.indexOf("time") > -1) {
    zinfoArray.push(
      c.redBright(
        `${style.nerdFonts ? "\uf64f" : "T"} ${underline(
          moment().format("h:mm:ss a")
        )}`
      )
    );
  }
  if (include.indexOf("time-24") > -1) {
    zinfoArray.push(
      c.redBright(
        `${style.nerdFonts ? "\uf64f" : "T"} ${underline(
          moment().format("H:mm:ss")
        )}`
      )
    );
  }
  if (include.indexOf("date") > -1) {
    zinfoArray.push(
      c.redBright(
        `${style.nerdFonts ? "\uf5ec" : "D"} ${underline(
          moment().format("dddd, MMMM Do YYYY")
        )}`
      )
    );
  }
  if (include.indexOf("date-time") > -1) {
    zinfoArray.push(
      c.redBright(
        `${style.nerdFonts ? "\uf5ef" : "D"} ${underline(
          moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
        )}`
      )
    );
  }
  if (include.indexOf("date-time-24") > -1) {
    zinfoArray.push(
      c.redBright(
        `${style.nerdFonts ? "\uf5ef" : "D"} ${underline(
          moment().format("dddd, MMMM Do YYYY, H:mm:ss")
        )}`
      )
    );
  }
  if (include.indexOf("node-v") > -1) {
    zinfoArray.push(
      c.green(
        `${style.nerdFonts ? "\ue24f" : "\u2B22"} ${underline(
          process.version.substring(1)
        )}`
      )
    );
  }
  if (include.indexOf("uptime") > -1) {
    zinfoArray.push(
      c.red(
        `${style.nerdFonts ? "\uf55d" : "U"} ${underline(
          moment.duration(sysUptime(), "seconds").format()
        )}`
      )
    );
  }

  return zinfoArray.join("\n");
}

/**
 * ## Home Relative Path Converter
 * Converts `filePath` to its home-relatave form, using the tilde (`~`) for the
 * home directory, and a tilde followed by the user's name for the home directory
 * of other users (e.g. `~johnny.appleseed/Desktop`).
 *
 * @param filePath - Path to be converted.
 * @returns The converted path.
 * @example
 * import { homeRelativePath } from "zinfo";
 *
 * console.log(process.cwd())
 * // => "/Users/johnny.appleseed/Documents"
 * console.log(homeRelativePath(process.cwd()))
 * // => "~/Documents"
 */
export function homeRelativePath(filePath: string): string {
  const resolvedFilePath = resolvePath(filePath);
  const homeDir = userInfo().homedir;
  const userParent = dirname(homeDir) + "/";

  return resolvedFilePath.startsWith(homeDir)
    ? resolvedFilePath.replace(homeDir, "~")
    : resolvedFilePath.startsWith(userParent)
    ? filePath.replace(userParent, "~")
    : filePath;
}

/**
 * ## Optional Style
 * Apply a style (like a chalk colour) to a string only if `option` is true.
 *
 * @param style - The style to use.
 * @param option - The option that determines whether to use the style or not.
 * @returns The altered style function.
 * @example
 * import { optionalStyle } from "zinfo";
 * import * as chalk from "chalk";
 *
 * const colored = true;
 *
 * console.log(
 *   optionalStyle(chalk.red, colored)("Red text.")
 * );
 */
export function optionalStyle(
  style: (str: any) => string,
  option: boolean
): (str: any) => string {
  return str => (option ? style(str) : identity(str));
}

/**
 * ## Os Symbol
 * Returns a NerdFonts symbol for the operating system. Currently has an icon
 * for MacOS, Windows and Linux (nothing more specific).
 *
 * @returns The symbol for your OS.
 */
export function getOsSymbol(): string {
  switch (process.platform) {
    case "darwin":
      return "\uf179";
      break;

    case "linux":
      return "\uf17c";
      break;

    case "win32":
      return "\uf17a";
      break;

    default:
      return "\uf109";
      break;
  }
}
