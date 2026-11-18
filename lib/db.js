const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const remote = !!(url && token);
const mem = { kv: new Map(), z: new Map(), l: new Map(), locks: new Set() };

async function cmd(args) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: JSON.stringify(args)
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

const parse = v => (v ? JSON.parse(v) : null);

exports.get = async k => {
  if (!remote) return parse(mem.kv.get(k));
  return parse(await cmd(['GET', k]));
};

exports.set = async (k, o) => {
  const s = JSON.stringify(o);
  if (!remote) return void mem.kv.set(k, s);
  await cmd(['SET', k, s]);
};

exports.mget = async ks => {
  if (!ks.length) return [];
  if (!remote) return ks.map(k => parse(mem.kv.get(k)));
  const r = await cmd(['MGET', ...ks]);
  return r.map(parse);
};

exports.zadd = async (k, s, m) => {
  if (!remote) {
    if (!mem.z.has(k)) mem.z.set(k, new Map());
    return void mem.z.get(k).set(String(m), s);
  }
  await cmd(['ZADD', k, String(s), String(m)]);
};

exports.ztop = async (k, n) => {
  if (!remote) {
    const z = mem.z.get(k) || new Map();
    return [...z.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0]);
  }
  return cmd(['ZREVRANGE', k, '0', String(n - 1)]);
};

exports.zcard = async k => {
  if (!remote) return (mem.z.get(k) || new Map()).size;
  return cmd(['ZCARD', k]);
};

exports.lpush = async (k, o, max) => {
  if (!remote) {
    const l = mem.l.get(k) || [];
    l.unshift(JSON.stringify(o));
    mem.l.set(k, l.slice(0, max));
    return;
  }
  await cmd(['LPUSH', k, JSON.stringify(o)]);
  await cmd(['LTRIM', k, '0', String(max - 1)]);
};

exports.lrange = async (k, n) => {
  if (!remote) return (mem.l.get(k) || []).slice(0, n).map(parse);
  return (await cmd(['LRANGE', k, '0', String(n - 1)])).map(parse);
};

exports.lock = async id => {
  if (!remote) {
    if (mem.locks.has(id)) return false;
    mem.locks.add(id);
    return true;
  }
  return (await cmd(['SET', 'lock:' + id, '1', 'NX', 'EX', '5'])) === 'OK';
};

exports.unlock = async id => {
  if (!remote) return void mem.locks.delete(id);
  await cmd(['DEL', 'lock:' + id]);
};
