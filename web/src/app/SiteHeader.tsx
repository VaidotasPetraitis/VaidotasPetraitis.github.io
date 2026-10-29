import type { Profile } from '../shared/models';
import { Icon } from '../shared/Icons';
import { Link } from './navigation';

const fallbackContactLinks = [
  { label: 'Email', url: 'mailto:Vaidotas.Petraitis8@gmail.com' },
  { label: 'GitHub', url: 'https://github.com/jam1591' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/vaidotas-petraitis-815287120/' },
];
const fallbackIdentity = { name: 'Vaidotas Petraitis', headline: 'Software engineer · Applied AI' };

function ContactLink({ link }: { link: { label: string; url: string } }) {
  const email = link.url.startsWith('mailto:');
  const behavior = email
    ? { suffix: '', target: undefined }
    : { suffix: ' (opens in a new tab)', target: '_blank' };
  const iconName = link.label === 'Email' ? 'mail' : link.label.toLowerCase();
  return (
    <a
      href={link.url}
      aria-label={link.label + behavior.suffix}
      target={behavior.target}
      rel="noopener noreferrer"
    >
      <Icon name={iconName} size={19} />
      <span>{link.label}</span>
    </a>
  );
}

export function SiteHeader({ profile }: { profile?: Profile }) {
  const contactLinks = profile?.links ?? fallbackContactLinks;
  const identity = profile ?? fallbackIdentity;

  return (
    <header className="site-header">
      <Link href="/" className="identity">
        <span>{identity.name}</span>
        <span className="headline">{identity.headline}</span>
      </Link>
      <div className="social-links" aria-label="Contact links">
        {contactLinks.map((link) => (
          <ContactLink key={link.label} link={link} />
        ))}
      </div>
    </header>
  );
}
