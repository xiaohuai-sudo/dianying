// 存储适配：同一套接口三份实现，本地开发 / 测试 / Cloudflare Workers 各用一份。
//
//   get(key)        -> value | null
//   put(key, value) -> void
//   list(prefix)    -> [{ key, value }]

export class MemoryStore {
  constructor() {
    this.map = new Map();
  }
  async get(key) {
    return this.map.has(key) ? structuredClone(this.map.get(key)) : null;
  }
  async put(key, value) {
    this.map.set(key, structuredClone(value));
  }
  async list(prefix = "") {
    return [...this.map.entries()]
      .filter(([k]) => k.startsWith(prefix))
      .map(([key, value]) => ({ key, value: structuredClone(value) }))
      .sort((a, b) => (a.key < b.key ? -1 : 1));
  }
}

/** 本地开发用：落盘到 JSON 文件，重启不丢。写完即刷盘，单进程足够。 */
export class FileStore {
  constructor(filePath, fs) {
    this.path = filePath;
    this.fs = fs;
    this.map = new Map();
    this.loaded = false;
  }
  async load() {
    if (this.loaded) return;
    try {
      const raw = await this.fs.promises.readFile(this.path, "utf8");
      for (const [k, v] of Object.entries(JSON.parse(raw))) this.map.set(k, v);
    } catch {
      // 文件不存在 = 空账本
    }
    this.loaded = true;
  }
  async flush() {
    await this.fs.promises.mkdir(this.path.replace(/[\\/][^\\/]+$/, ""), { recursive: true });
    await this.fs.promises.writeFile(this.path, JSON.stringify(Object.fromEntries(this.map), null, 1));
  }
  async get(key) {
    await this.load();
    return this.map.has(key) ? structuredClone(this.map.get(key)) : null;
  }
  async put(key, value) {
    await this.load();
    this.map.set(key, structuredClone(value));
    await this.flush();
  }
  async list(prefix = "") {
    await this.load();
    return [...this.map.entries()]
      .filter(([k]) => k.startsWith(prefix))
      .map(([key, value]) => ({ key, value: structuredClone(value) }))
      .sort((a, b) => (a.key < b.key ? -1 : 1));
  }
}

/** Cloudflare Workers：KV binding。list 分页拉全，量小够用。 */
export class KvStore {
  constructor(kv) {
    this.kv = kv;
  }
  async get(key) {
    return (await this.kv.get(key, "json")) ?? null;
  }
  async put(key, value) {
    await this.kv.put(key, JSON.stringify(value));
  }
  async list(prefix = "") {
    const out = [];
    let cursor;
    do {
      const page = await this.kv.list({ prefix, cursor });
      for (const k of page.keys) out.push({ key: k.name, value: await this.get(k.name) });
      cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor);
    return out.sort((a, b) => (a.key < b.key ? -1 : 1));
  }
}
