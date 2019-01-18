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

import { identity, take, escapeRegExp } from "lodash";
import { userInfo } from "os";
import { dirname, resolve as resolvePath } from "path";
import { types } from "util";

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
  // const homeDir = userInfo().homedir;
  // const userParent = dirname(homeDir) + "/";

  // return resolvedFilePath.startsWith(homeDir)
  //   ? resolvedFilePath.replace(homeDir, "~")
  //   : resolvedFilePath.startsWith(userParent)
  //   ? filePath.replace(userParent, "~")
  //   : filePath;

  const homeDir = userInfo().homedir;
  const homeDirPattern = RegExp(`^${escapeRegExp(homeDir)}(?:$|(\\/))`);
  // TODO: Add more recognized non-user directories.
  const userParentPattern = RegExp(
    `^${escapeRegExp(dirname(homeDir))}\\/(?!Shared|\\.localized\\/)`
  );

  return resolvedFilePath
    .replace(homeDirPattern, (_, p1) => `~${p1 || ""}`)
    .replace(userParentPattern, "~");
}

/**
 * ## Optional Style
 * Apply a style (like a chalk color) to a string only if `option` is true.
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
  style: (...str: any[]) => string,
  option: boolean
): (...str: any[]) => string {
  return (...str) => (option ? style(str) : identity(str.join(" ")));
}

/**
 * ## To Sentence
 * Converts an array into a sentence.
 *
 * @param array - The array to convert
 * @returns The sentence
 */
export function toSentence(array: any[], wrapValues = true) {
  if (wrapValues) {
    array = array.map(i => (typeof i === "string" ? `"${i}"` : `\`${i}\``));
  }

  return String(
    array.length > 1
      ? take(array, array.length - 1)
          .join(", ")
          .concat(
            `${array.length > 2 ? "," : ""} and ${array[array.length - 1]}`
          )
      : array[0]
  );
}

/**
 * ## Ensure
 * Ensures that an object has been initialized (useful for lazy loading).
 *
 * @param object - The object to check
 * @param callback - A function that returns the initialized object
 * asynchronously.
 * @returns The initialized object
 */
export async function ensure<T>(
  object: T,
  callback: () => Promise<T>
): Promise<T> {
  return object == undefined ? await callback() : object;
}

/**
 * ## Ensure Sync
 * See {@link ensure}.
 *
 * @param object - The object to check
 * @param callback A function that returns the initialized object
 */
export function ensureSync<T>(object: T, callback: () => T): T {
  return object == undefined ? callback() : object;
}
