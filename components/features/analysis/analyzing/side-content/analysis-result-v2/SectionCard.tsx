import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Icon, { IconProps } from '@/components/ui/icon';

type SectionType = 'criticals' | 'suggestions' | 'strengths';

interface SectionCardProps {
  type: SectionType;
  title: string;
  items: string[];
  defaultOpen?: boolean;
}

const SECTION_CONFIG: Record<
  SectionType,
  {
    icon: IconProps['icon'];
    color: string;
    bg: string;
    border: string;
    pill: string;
    pillText: string;
    headerBg: string;
  }
> = {
  criticals: {
    icon: 'TbAlertHexagonFilled',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    pill: 'bg-red-100',
    pillText: 'text-red-700',
    headerBg: 'bg-red-50',
  },
  suggestions: {
    icon: 'FaLightbulb',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    pill: 'bg-amber-100',
    pillText: 'text-amber-700',
    headerBg: 'bg-amber-50',
  },
  strengths: {
    icon: 'TbStarFilled',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    pill: 'bg-emerald-100',
    pillText: 'text-emerald-700',
    headerBg: 'bg-emerald-50',
  },
};

const SectionCard = React.memo<SectionCardProps>(
  ({ type, title, items, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const cfg = useMemo(() => SECTION_CONFIG[type], [type]);
    const bodyRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>(0);

    useEffect(() => {
      if (!bodyRef.current) return;
      if (isOpen) {
        setHeight(bodyRef.current.scrollHeight);
      } else {
        setHeight(0);
      }
    }, [isOpen, items]);

    const toggle = useCallback(() => {
      setIsOpen((prev) => !prev);
    }, []);

    if (items.length === 0) return null;

    return (
      <div className={`overflow-hidden rounded-xl border ${cfg.border}`}>
        {/* Header */}
        <button
          onClick={toggle}
          className={`flex w-full items-center justify-between px-4 py-3 ${cfg.headerBg} transition-opacity hover:opacity-80`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`flex size-7 items-center justify-center rounded-lg ${cfg.pill}`}
            >
              <Icon icon={cfg.icon} size={15} className={cfg.color} />
            </div>
            <span className={`text-sm font-semibold ${cfg.color}`}>
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`flex size-5 items-center justify-center rounded-full text-xs font-bold ${cfg.pill} ${cfg.pillText}`}
            >
              {items.length}
            </span>
            <span
              className="inline-flex transition-transform duration-300"
              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <Icon icon="TbChevronDown" size={16} className="text-slate-400" />
            </span>
          </div>
        </button>

        {/* Body — always rendered, height animated */}
        <div
          style={{
            maxHeight: height,
            overflow: 'hidden',
            transition: 'max-height 300ms ease',
          }}
        >
          <div ref={bodyRef} className="flex flex-col gap-2 p-4">
            {items.map((item, index) => (
              <div
                key={index}
                className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 ${cfg.bg}`}
              >
                <span
                  className={`mt-0.5 shrink-0 text-xs font-bold ${cfg.pillText}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className={`text-sm leading-relaxed ${cfg.pillText}`}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

SectionCard.displayName = 'SectionCard';

export default SectionCard;
