import { cn } from '@/lib/cn';

export const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/Sn0wye' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/snowyedotdev' },
  { label: 'Instagram', href: 'https://instagram.com/gabtrzimajewski' },
  { label: 'Email', href: 'mailto:gabriel@snowye.dev' }
] as const;

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-5 gap-y-1', className)}>
      {SOCIAL_LINKS.map(link => (
        <li key={link.label}>
          <a
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="transition-colors hover:text-primary"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
