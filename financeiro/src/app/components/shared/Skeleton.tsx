import { cn } from '@/app/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[#21262d]',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr>
      <td className="py-3 px-4"><Skeleton className="h-4 w-4 rounded-full" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-48" /></td>
      <td className="py-3 px-4"><Skeleton className="h-6 w-32 rounded-full" /></td>
      <td className="py-3 px-4"><Skeleton className="h-6 w-12 rounded" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
    </tr>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] overflow-hidden">
      <div className="p-4 border-b border-[#30363d]">
        <Skeleton className="h-9 w-64 rounded-lg" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#30363d]">
            {['', 'DESCRIÇÃO', 'CATEGORIA', 'CONTA', 'DATA', 'VALOR'].map((h) => (
              <th key={h} className="py-3 px-4 text-left">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonCategoryRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#30363d]">
      <Skeleton className="h-4 w-4 rounded-full" />
      <Skeleton className="h-4 w-32 flex-1" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-2 w-24 rounded-full" />
      <Skeleton className="h-4 w-16 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function SkeletonText({ lines = 2, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}
