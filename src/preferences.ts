export const pointerStyles = {
  glove: { label: "White glove", ink: "#eab308" },
  lavender: { label: "Lavender toy", ink: "#8054ee" },
  coral: { label: "Coral vinyl", ink: "#e64c53" },
  plush: { label: "Plush", ink: "#287bd9" },
  robot: { label: "Black hand", ink: "#22272b" },
  laser: { label: "Laser dot", ink: "#ed3029" },
};

export type PointerStyle = keyof typeof pointerStyles;

export const soundNames = {
  blip: "Blip",
  boop: "Boop",
  chirp: "Chirp",
  clack: "Clack",
  click: "Click",
  coin: "Coin",
  pew: "Pew",
  pop: "Pop",
  quack: "Quack",
  snap: "Snap",
  squeak: "Squeak",
  thock: "Thock",
  tock: "Tock",
  typewriter: "Typewriter",
  wood: "Wood block",
} as const;
export type SoundChoice = keyof typeof soundNames;

type SettingsStorage = Pick<Storage, "getItem" | "setItem">;
type Preferences = {
  style: PointerStyle;
  sound: boolean;
  choice: SoundChoice;
  setChoice: (choice: SoundChoice) => void;
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
    style: "glove",
    sound: true,
    choice: "thock",
    setChoice: (choice) => {
      preferences.choice = choice;
      save("roamjs:tinyhand:sound-choice", choice);
    },
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
    const savedSound = store.getItem(soundKey);
    if (savedSound !== null) {
      preferences.sound = savedSound === "true";
      // Older installs stored only the mute setting and played Pop.
      preferences.choice = "pop";
    }
    const choice = store.getItem("roamjs:tinyhand:sound-choice");
    if (choice && Object.hasOwn(soundNames, choice))
      preferences.choice = choice as SoundChoice;
  } catch {
    // Storage can be unavailable before the presenter has chosen any settings.
  }
  return preferences;
};
