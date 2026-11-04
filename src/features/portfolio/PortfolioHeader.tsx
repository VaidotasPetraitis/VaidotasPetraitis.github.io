import type { Profile } from '../about/schema';
import { Icon } from '../../icons/Icons';
import { Link } from 'react-router';

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
  profile: Profile;
};

export function PortfolioHeader(props: PortfolioHeaderProps) {
  const contactLinks = props.profile.links;
  const identity = props.profile;

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
