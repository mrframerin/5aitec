"use client";

import { useState } from "react";
import type { AboutImage as AboutImageData } from "./aboutContent";

type AboutImageProps = {
  image: AboutImageData;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function AboutImage({
  image,
  className = "",
  priority = false,
  sizes = "100vw",
}: AboutImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const label = `[PLACEHOLDER: ${image.desc} - ${image.width}x${image.height}px - Sai to supply]`;

  return (
    <span
      className={`about-image-shell ${className} ${loaded ? "is-loaded" : ""} ${
        failed ? "is-placeholder" : ""
      }`}
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      {!failed ? (
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          sizes={sizes}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(false);
          }}
        />
      ) : null}
      {failed ? <span className="about-placeholder-text">{label}</span> : null}
    </span>
  );
}
