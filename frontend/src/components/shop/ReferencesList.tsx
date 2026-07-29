export interface ReferenceItem {
  n: number;
  label: string;
  url: string;
}

export function ReferencesList({ items }: { items: ReferenceItem[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item) => (
        <li key={item.n} id={`ref-${item.n}`} className="flex gap-3 scroll-mt-24">
          <span className="shrink-0 font-sans text-xs tabular-nums text-obsidian/70">
            [{item.n}]
          </span>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-sans text-sm text-obsidian/70 underline decoration-obsidian/25 underline-offset-4 hover:text-obsidian hover:decoration-obsidian"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  );
}
