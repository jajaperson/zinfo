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
import { uptime as sysUptime } from "os";
import c from "chalk";

/** Array of Zinfo Options */
export const zinfoOptions: ZinfoOptionsType[] = [
  "cwd-path",
  "cwd-path-absolute",
  "node-v",
  "uptime",
];

/** Zinfo Options Type */
export type ZinfoOptionsType =
  | "cwd-path"
  | "cwd-path-absolute"
  | "node-v"
  | "uptime";

/** Zinfo Options Type Guard */
export function isZinfoOptionsType(arg: any): arg is ZinfoOptionsType {
  return typeof arg !== "string"
    ? false
    : zinfoOptions.indexOf(arg as ZinfoOptionsType) > -1;
}

/**
 * ## Zinfo
 * Returns stylized data about the current directory, system, and node.
 *
 * @param include - Which data to print.
 */
export async function zinfo(include: ZinfoOptionsType[]): Promise<string> {
  const zinfoArray: string[] = [];

  if (include.indexOf("cwd-path") > -1) {
    zinfoArray.push(c.blue(homeRelativePath(process.cwd())));
  }
  if (include.indexOf("cwd-path-absolute") > -1) {
    zinfoArray.push(c.blue(process.cwd()));
  }
  if (include.indexOf("node-v") > -1) {
    zinfoArray.push(c.green(`\u2B22 ${process.version.substring(1)}`));
  }
  if (include.indexOf("uptime") > -1) {
    zinfoArray.push(c.red(`U ${sysUptime()}`));
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
 * console.log(process.cwd())
 * // => "/Users/johnny.appleseed/Documents"
 * console.log(homeRelativePath(process.cwd()))
 * // => "~/Documents"
 */
export function homeRelativePath(filePath: string): string {
  const resolvedFilePath = resolvePath(filePath);
  const homeDir = process.env.HOME;
  const userParent = dirname(homeDir) + "/";

  return resolvedFilePath.startsWith(homeDir)
    ? resolvedFilePath.replace(homeDir, "~")
    : resolvedFilePath.startsWith(userParent)
    ? filePath.replace(userParent, "~")
    : filePath;
}
