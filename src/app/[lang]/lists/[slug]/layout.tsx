/** The party page and, over it, whichever candidate was opened from it (the `@modal` slot). */
export default function ListLayout({ children, modal }: LayoutProps<"/[lang]/lists/[slug]">) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
