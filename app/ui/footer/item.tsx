'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';

export default function Item({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();

  const isActive = pathname?.split('/')[2] === label.toLowerCase();

  return (
    <Link href={href} className="flex flex-col items-center content-center relative">
      <Icon
        className={clsx('text-lg', {
          'text-azul1': isActive,
          'text-cinza1': !isActive,
        })}
      />
      <span
        className={clsx('text-xs absolute top-7', {
          'text-azul1': isActive,
          'text-cinza1': !isActive,
        })}
      >
        {label}
      </span>
    </Link>
  );
}
