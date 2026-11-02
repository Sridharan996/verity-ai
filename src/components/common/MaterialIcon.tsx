import React from 'react';

interface MaterialIconProps {
  name: string;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  fill = false,
  className = '',
  style = {},
}) => {
  return (
    <span
      className={`material-symbols-outlined ${fill ? 'material-symbols-fill' : ''} ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1", ...style } : style}
    >
      {name}
    </span>
  );
};
