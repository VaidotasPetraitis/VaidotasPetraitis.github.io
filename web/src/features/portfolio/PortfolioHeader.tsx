import type { Profile } from '../about/schema';
import { Icon } from '../../icons/Icons';
import { Link } from 'react-router';

const fallbackContactLinks = [
  { label: 'Email', url: 'mailto:Vaidotas.Petraitis8@gmail.com' },
  { label: 'GitHub', url: 'https://github.com/jam1591' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/vaidotas-petraitis-815287120/' },
];
const fallbackIdentity = { name: 'Vaidotas Petraitis', headline: 'Software engineer · Applied AI' };

type ContactLinkProps = {
  link: Profile['links'][number];
};

function ContactLink(props: ContactLinkProps) {
  const email = props.link.url.startsWith('mailto:');
  const behavior = email
    ? { suffix: '', target: undefined }
    : { suffix: ' (opens in a new tab)', target: '_blank' };
  const iconName = props.link.label === 'Email' ? 'mail' : props.link.label.toLowerCase();

  return (
    <a
      href={props.link.url}
      aria-label={props.link.label + behavior.suffix}
      target={behavior.target}
      rel="noopener noreferrer"
    >
      <Icon name={iconName} size={19} />
      <span>{props.link.label}</span>
    </a>
  );
}

type PortfolioHeaderProps = {
  profile?: Profile;
};

export function PortfolioHeader(props: PortfolioHeaderProps) {
  const contactLinks = props.profile?.links ?? fallbackContactLinks;
  const identity = props.profile ?? fallbackIdentity;

  return (
    <header className="site-header">
      <Link to="/" className="identity">
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
