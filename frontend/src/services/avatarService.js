import api from "./api";

export async function fetchMyAvatar() {
  const { data } = await api.get("/avatars");
  return data; // { avatar_url, avatar_glb_url, avatar_png_url }
}

export async function saveMyAvatar({ avatar_url, glb, png, thumbnail }) {
  const payload = {
    avatar_url: avatar_url ?? null,
    glb_url: glb ?? null,
    png_url: png ?? null,
    thumbnail_url: thumbnail ?? null,
  };
  const { data } = await api.post("/avatars", payload);
  return data;
}
