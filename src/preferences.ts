export const pointerStyles = {
  lavender: { label: "Lavender toy", ink: "#8054ee" },
  glove: { label: "Cursor glove", ink: "#8054ee" },
  coral: { label: "Coral vinyl", ink: "#e64c53" },
  plush: { label: "Plush", ink: "#287bd9" },
  robot: { label: "Robot", ink: "#138464" },
  laser: { label: "Laser dot", ink: "#ed3029" },
};

export type PointerStyle = keyof typeof pointerStyles;

type SettingsStorage = Pick<Storage, "getItem" | "setItem">;
type Preferences = {
  style: PointerStyle;
  sound: boolean;
  setStyle: (style: PointerStyle) => void;
  setSound: (sound: boolean) => void;
};

export const createPreferences = (
  storage: () => SettingsStorage = () => window.localStorage,
): Preferences => {
  const styleKey = "roamjs:tinyhand:pointer-style";
  const soundKey = "roamjs:tinyhand:tap-sound";
  const save = (key: string, value: string): void => {
    try {
      storage().setItem(key, value);
    } catch {
      // A presenter can still change settings for this session when storage is restricted.
    }
  };
  const preferences: Preferences = {
    style: "lavender",
    sound: false,
    setStyle: (style) => {
      preferences.style = style;
      save(styleKey, style);
    },
    setSound: (sound) => {
      preferences.sound = sound;
      save(soundKey, String(sound));
    },
  };
  try {
    const store = storage();
    const style = store.getItem(styleKey);
    if (style && Object.hasOwn(pointerStyles, style)) {
      preferences.style = style as PointerStyle;
    }
    preferences.sound = store.getItem(soundKey) === "true";
  } catch {
    // Storage can be unavailable before the presenter has chosen any settings.
  }
  return preferences;
};
