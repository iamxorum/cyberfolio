import type { Project } from '@/config';
import { stripUrl } from '@/lib/cv-helpers';
import type { ContributionStats } from '@/lib/github-contributions';
import { SectionHeader } from './primitives';

interface ProjectContributionsProps {
  project: Project;
  stats?: ContributionStats | null;
}

function ProjectContributions({ project, stats }: ProjectContributionsProps) {
  const hasContributions = !!stats && stats.mergedCount > 0;
  if (!project.repository && !hasContributions) return null;

  return (
    <div style={{ fontSize: '10pt', color: '#3a3a3a', marginTop: '2pt' }}>
      {hasContributions && stats && (
        <>
          <strong style={{ color: '#000' }}>Contributions:</strong>{' '}
          <a href={stats.searchUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
            {stats.mergedCount} merged PR{stats.mergedCount !== 1 ? 's' : ''}
          </a>
          {stats.reviewCount > 0 && (
            <>
              {', '}
              <a href={stats.reviewSearchUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                {stats.reviewCount} code review{stats.reviewCount !== 1 ? 's' : ''}
              </a>
            </>
          )}
        </>
      )}
      {hasContributions && project.repository ? '   |   ' : ''}
      {project.repository && (
        <>
          <strong style={{ color: '#000' }}>Repository:</strong>{' '}
          <a href={project.repository} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{stripUrl(project.repository)}</a>
        </>
      )}
    </div>
  );
}

interface CVProjectsSectionProps {
  projects: Project[];
  contributionStats: Record<string, ContributionStats | null>;
  accentColor: string;
  sectionMarginBottom: string;
}

export default function CVProjectsSection({ projects, contributionStats, accentColor, sectionMarginBottom }: CVProjectsSectionProps) {
  return (
    <section className="mb-4" style={{ marginBottom: sectionMarginBottom }}>
      <SectionHeader accentColor={accentColor}>PROJECTS</SectionHeader>
      {projects.map((project) => (
        <div key={project.id} className="mb-4" style={{ marginBottom: '6pt', pageBreakInside: 'avoid' }}>
          <div style={{ marginBottom: '2pt' }}>
            <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2pt', color: '#000', letterSpacing: '0.1pt' }}>
              {project.name}
              {project.repository && (
                <span style={{ fontSize: '10pt', fontWeight: 'normal', color: '#3a3a3a', marginLeft: '6pt' }}>
                  ({project.projectType === 'contribution' ? 'Contribution' : 'Personal'})
                </span>
              )}
            </h3>
            <div style={{ fontSize: '10.5pt', lineHeight: '1.5', marginBottom: '2pt', color: '#1a1a1a', textAlign: 'justify' }}>
              {project.cvDescription || project.description}
            </div>
            <ProjectContributions project={project} stats={contributionStats[project.id]} />
          </div>
        </div>
      ))}
    </section>
  );
}
