import type { CVStyle, SiteConfig } from '@/config';
import type { getContactInfo } from '@/lib/cv-helpers';

interface CVTemplateHeaderProps {
  siteConfig: SiteConfig;
  style: CVStyle;
  accentColor: string;
  contactInfo: ReturnType<typeof getContactInfo>;
}

export default function CVTemplateHeader({ siteConfig, style, accentColor, contactInfo }: CVTemplateHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6" style={{ marginBottom: '14pt', paddingBottom: '10pt', borderBottom: `2.5pt solid ${accentColor}`, position: 'relative' }}>
      <div className="flex-1 text-left">
        <h1 className="mb-1" style={{ fontSize: '22pt', fontWeight: 'bold', marginBottom: '2pt', letterSpacing: '0.8pt', lineHeight: '1.15', color: accentColor }}>
          {siteConfig.fullName}
        </h1>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '11.5pt', letterSpacing: '0.2pt', marginBottom: '6pt', color: accentColor }}>
          {style.name}
        </div>
        {[contactInfo.personal, contactInfo.links].map((group, groupIdx) => group.length > 0 && (
          <div key={groupIdx} style={{ fontSize: '10.5pt', lineHeight: '1.5', color: '#4a4a4a', letterSpacing: '0.1pt', marginTop: groupIdx > 0 ? '2pt' : 0 }}>
            {group.map((item, idx) => (
              <span key={item.text}>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{item.text}</a>
                ) : item.text}
                {idx < group.length - 1 ? ' | ' : ''}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
