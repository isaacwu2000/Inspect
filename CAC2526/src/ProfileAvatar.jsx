import React, { useEffect, useState } from 'react';
import { getAvatarGradientStyle } from './avatarGradient.js';

function getPhotoUrl(user) {
  return typeof user?.photoURL === 'string' ? user.photoURL.trim() : '';
}

function ProfileAvatar({
  user,
  imageClassName,
  fallbackClassName,
  alt = "Profile",
  fallbackAriaHidden = false,
  fallbackAriaLabel
}) {
  const photoUrl = getPhotoUrl(user);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  if (photoUrl && !imageFailed) {
    return (
      <img
        src={photoUrl}
        className={imageClassName}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    );
  }

  const fallbackProps = fallbackAriaHidden
    ? { "aria-hidden": "true" }
    : {
        role: "img",
        "aria-label": fallbackAriaLabel || `${user?.displayName || "Anonymous"} profile avatar`
      };

  return (
    <div
      className={fallbackClassName}
      style={getAvatarGradientStyle(user)}
      {...fallbackProps}
    />
  );
}

export default ProfileAvatar;
