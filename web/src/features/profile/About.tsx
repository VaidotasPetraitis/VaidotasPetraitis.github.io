import { Icon } from '../../shared/Icons';
import type { Profile } from '../../shared/models';

export function About({ profile }: { profile: Profile }) {
  return (
    <article className="about-page">
      <h1 tabIndex={-1}>About me</h1>
      <p className="page-summary">{profile.role}</p>
      <div className="biography">
        {profile.biography.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>
      <div className="about-columns">
        {profile.focus.length > 0 && (
          <section>
            <h2>Technical focus</h2>
            <dl className="focus-list">
              {profile.focus.map((focus) => (
                <div key={focus.label}>
                  <dt>{focus.label}:</dt>
                  <dd>{focus.text}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        {profile.education.length > 0 && (
          <section>
            <h2>Education</h2>
            {profile.education.map((item) => (
              <div className="education-entry" key={item.title}>
                <p>{item.title}</p>
                <p>
                  {item.organization} · {item.period}
                </p>
              </div>
            ))}
          </section>
        )}
      </div>
      <section className="portrait-banner" aria-label="Contact Vaidotas">
        <div className="banner-art" aria-hidden="true">
          <span className="banner-circle" />
          <span className="banner-chevron" />
          <span className="banner-amber" />
        </div>
        <div className="banner-contact">
          <p>{profile.name}</p>
          <a href={`mailto:${profile.email}`}>
            <Icon name="mail" />
            <span>{profile.email}</span>
          </a>
        </div>
        <img
          className="portrait"
          src={profile.portrait}
          alt={profile.portraitAlt}
          width="1561"
          height="1008"
          fetchPriority="high"
        />
      </section>
    </article>
  );
}
