const SHARED_PREFIX = "led_shared_";
const PRIVATE_PREFIX = "led_private_";

export const db = {
  async get(k) {
    try {
      const val = localStorage.getItem(PRIVATE_PREFIX + k);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  async set(k, v) {
    try { localStorage.setItem(PRIVATE_PREFIX + k, JSON.stringify(v)); } catch {}
  },
  async getShared(k) {
    try {
      const val = localStorage.getItem(SHARED_PREFIX + k);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  async setShared(k, v) {
    try { localStorage.setItem(SHARED_PREFIX + k, JSON.stringify(v)); } catch {}
  }
};