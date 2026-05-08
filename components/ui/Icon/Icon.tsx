import type { ComponentType } from 'react';
import React from 'react';
import * as FcIcons from 'react-icons/fc';
import * as FiIcons from 'react-icons/fi';
import * as RiIcons from 'react-icons/ri';
import * as TbIcons from 'react-icons/tb';

type TbIconName = keyof typeof TbIcons;
type FcIconName = keyof typeof FcIcons;
type FiIconName = keyof typeof FiIcons;
type RiIconName = keyof typeof RiIcons;

export type IconName = TbIconName | FcIconName | FiIconName | RiIconName;

const icons = {
  ...TbIcons,
  ...FcIcons,
  ...FiIcons,
  ...RiIcons,
};

type IconComponentType = ComponentType<{
  size?: number;
  color?: string;
  [key: string]: unknown;
}>;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: IconName;
  size?: number;
  color?: string;
}

const Icon = ({ icon, size = 24, color, ...props }: IconProps) => {
  const IconComponent = icons[icon] as IconComponentType;
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} {...props} />;
};

export default Icon;
