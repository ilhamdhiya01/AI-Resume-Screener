import type { ComponentType } from 'react';
import React, { forwardRef } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as FcIcons from 'react-icons/fc';
import * as FiIcons from 'react-icons/fi';
import * as LuIcons from 'react-icons/lu';
import * as RiIcons from 'react-icons/ri';
import * as TbIcons from 'react-icons/tb';

type TbIconName = keyof typeof TbIcons;
type FcIconName = keyof typeof FcIcons;
type FiIconName = keyof typeof FiIcons;
type RiIconName = keyof typeof RiIcons;
type LuIconName = keyof typeof LuIcons;
type FaIconName = keyof typeof FaIcons;

export type IconName =
  | TbIconName
  | FcIconName
  | FiIconName
  | RiIconName
  | LuIconName
  | FaIconName;

const icons = {
  ...TbIcons,
  ...FcIcons,
  ...FiIcons,
  ...RiIcons,
  ...LuIcons,
  ...FaIcons,
};

type IconComponentType = ComponentType<{
  size?: number;
  color?: string;
  title?: string;
  [key: string]: unknown;
}>;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: IconName;
  size?: number;
  color?: string;
  title?: string;
}

const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon, size = 24, color, title, ...props }, ref) => {
    const IconComponent = icons[icon] as IconComponentType;
    if (!IconComponent) return null;
    return (
      <IconComponent
        ref={ref}
        size={size}
        color={color}
        title={title}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';

export default Icon;
