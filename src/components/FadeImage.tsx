import { useState } from 'react';

interface FadeImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

export function FadeImage({ src, alt, className = '', imgClassName = '' }: FadeImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 skeleton" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } group-hover:scale-105 ${imgClassName}`}
      />
    </div>
  );
}
