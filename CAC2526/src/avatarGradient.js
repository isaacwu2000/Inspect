function hashString(value) {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function getAvatarGradientStyle(user) {
  const seed = user?.uid || user?.email || user?.displayName || "inspect";
  const hash = hashString(seed);
  const hue = hash % 360;
  const secondHue = (hue + 44 + (hash % 72)) % 360;

  return {
    "--avatar-hue": hue,
    "--avatar-hue-2": secondHue
  };
}
