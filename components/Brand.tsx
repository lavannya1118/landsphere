import Image from 'next/image';
import Link from 'next/link';

export default function Brand({
  variant = 'dark',
  iconOnly = false,
  className = '',
}: {
  variant?: 'dark' | 'light';
  iconOnly?: boolean;
  className?: string;
}) {
  const source = iconOnly
    ? '/landsphere-globe.svg'
    : variant === 'light'
      ? '/landsphere-logo-light.svg'
      : '/landsphere-logo-dark.svg';

  return (
    <Link href="/" aria-label="LandSphere home" className={`brand-link ${className}`}>
      <Image
        src={source}
        alt="LandSphere"
        width={iconOnly ? 40 : 250}
        height={iconOnly ? 40 : 50}
        priority
      />
    </Link>
  );
}
