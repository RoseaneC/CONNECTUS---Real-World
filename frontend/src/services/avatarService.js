import api from "./api";

export async function fetchMyAvatar() {
  const { data } = await api.get("/avatars");
  return data; // { avatar_url, avatar_glb_url, avatar_png_url }
}

export async function saveMyAvatar({ avatar_url, glb, png }) {
  const payload = {
    avatar_url: avatar_url ?? null,
    avatar_glb_url: glb ?? null,
    avatar_png_url: png ?? null,
  };
  const { data } = await api.put("/avatars", payload);
  return data;
}
