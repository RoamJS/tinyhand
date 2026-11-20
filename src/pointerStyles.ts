import artwork from "./assets/tinyhand.json";

export const pointerStyles = {
  lavender: { label: "Lavender toy", ink: "#8054ee" },
  glove: { label: "Cursor glove", ink: "#8054ee" },
  coral: { label: "Coral vinyl", ink: "#e64c53" },
  plush: { label: "Plush", ink: "#287bd9" },
  robot: { label: "Robot", ink: "#138464" },
  laser: { label: "Laser dot", ink: "#ed3029" },
};

export type PointerStyle = keyof typeof pointerStyles;

export const handArtwork = artwork.hands;
export const tapSound = artwork.sound;
