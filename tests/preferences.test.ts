import assert from "node:assert/strict";
import test from "node:test";
import { createPreferences, pointerStyles } from "../src/preferences.ts";

const memoryStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
};

test("lists the white glove first in the toolbar", () => {
  assert.equal(Object.keys(pointerStyles)[0], "glove");
});

test("starts with Thock enabled and restores only the presenter's choices on reload", () => {
  const store = memoryStorage();
  const preferences = createPreferences(() => store);
  assert.equal(preferences.style, "glove");
  assert.equal(pointerStyles.glove.ink, "#eab308");
  assert.equal(preferences.sound, true);
  assert.equal(preferences.choice, "thock");
  preferences.setStyle("laser");
  preferences.setSound(true);
  const reopened = createPreferences(() => store);
  assert.equal(reopened.style, "laser");
  assert.equal(reopened.sound, true);
  reopened.setSound(false);
  assert.equal(createPreferences(() => store).sound, false);
});

test("ignores unknown styles, inherited property names, and invalid sound settings", () => {
  for (const value of ["old-hand", "__proto__", "constructor"]) {
    const preferences = createPreferences(() => ({
      getItem: () => value,
      setItem: () => {},
    }));
    assert.equal(preferences.style, "glove");
    assert.equal(preferences.sound, false);
  }
});

test("keeps pointing and sound available when browser storage is blocked", () => {
  const preferences = createPreferences(() => {
    throw new Error("Storage is blocked");
  });
  preferences.setStyle("plush");
  preferences.setSound(true);
  assert.equal(preferences.style, "plush");
  assert.equal(preferences.sound, true);
});

test("restores the sound choice separately from mute and falls back to Pop for older installs", () => {
  const store = memoryStorage();
  store.setItem("roamjs:tinyhand:tap-sound", "true");
  const prefs = createPreferences(() => store);
  assert.equal(prefs.choice, "pop");
  prefs.setChoice("quack");
  prefs.setSound(false);
  const next = createPreferences(() => store);
  assert.equal(next.choice, "quack");
  assert.equal(next.sound, false);
});
