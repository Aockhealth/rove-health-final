export function Cite({ n }: { n: number }) {
  return (
    <a
      href={`#ref-${n}`}
      className="ml-0.5 align-super font-sans text-[0.65em] font-medium text-obsidian/70 no-underline hover:text-obsidian hover:underline"
    >
      [{n}]
    </a>
  );
}
