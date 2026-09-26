import React from 'react';

const CDN = 'https://unpkg.com/lucide-static@0.544.0/icons/';

/** Lucide glyph rendered as a currentColor mask. */
export function Icon({ name = 'circle', size = 20, label, style, ...rest }) {
  const url = CDN + name + '.svg';
  return (
    <span
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        display: 'inline-block', width: size, height: size, flex: '0 0 auto',
        backgroundColor: 'currentColor',
        WebkitMaskImage: 'url(' + url + ')', maskImage: 'url(' + url + ')',
        WebkitMaskSize: 'contain', maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center', maskPosition: 'center',
        ...style,
      }}
      {...rest}
    />
  );
}
