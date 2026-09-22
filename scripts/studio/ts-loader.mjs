/** 注册 .ts 解析钩子；配合 node --experimental-strip-types 使用。 */
import { register } from "node:module";

register(new URL("./ts-resolve-hooks.mjs", import.meta.url));
