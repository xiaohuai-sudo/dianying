/**
 * 让 Node 能直接运行应用里的 .ts 模块。
 *
 * 应用代码（lib/*.ts）按 Next/Turbopack 的规则写无扩展名导入，Node 的 ESM 解析器不接受，
 * 因此在脚本这一侧补一个解析钩子，而不是为了脚本去改 tsconfig 或应用代码的写法。
 * 用法见 package.json 的 studio:style。
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export async function resolve(specifier, context, next) {
  if (specifier.startsWith(".") && !/\.[cm]?[jt]sx?$/.test(specifier)) {
    for (const candidate of [`${specifier}.ts`, `${specifier}.mts`, `${specifier}/index.ts`]) {
      const resolved = new URL(candidate, context.parentURL);
      if (existsSync(fileURLToPath(resolved))) return next(candidate, context);
    }
  }
  return next(specifier, context);
}
