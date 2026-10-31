import PageShell from '@/components/PageShell';
import Bone from '@/components/life/Skeleton';

/** Shown the moment a route is clicked, while the server renders it, so navigation answers at once. */
export default function PageSkeleton({ crumb, rows = 3 }: { crumb: string; rows?: number }) {
  return (
    <PageShell crumbs={[{ label: crumb }]} boot={false}>
      <div aria-busy="true" aria-label="Loading" className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-3 border-b border-[var(--terminal-border-alt)] pb-4 sm:pb-6">
          <Bone className="h-9 w-2/3 max-w-md" />
          <Bone className="h-4 w-1/2 max-w-xs" />
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <Bone key={i} className="h-32 w-full" />
        ))}
      </div>
    </PageShell>
  );
}
