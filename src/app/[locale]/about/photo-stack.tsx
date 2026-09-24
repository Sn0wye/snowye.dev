import Image from 'next/image';

const BLUR =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAP0lEQVQImQE0AMv/AFBQUJKSkqmpqaOjowCurq7v7+/Jycm5ubkA////jIyMn5+fg4ODADAwMD09PWlpaQAAAApRGnEHblMWAAAAAElFTkSuQmCC';

/** Two photos stacked like prints; hovering fans them apart. */
export function PhotoStack({ alt }: { alt: string }) {
  return (
    <div className="group relative mx-auto aspect-square w-full max-w-[18rem]">
      <Image
        src="/static/images/me2.jpeg"
        alt={alt}
        width={336}
        height={336}
        placeholder="blur"
        blurDataURL={BLUR}
        className="absolute inset-0 size-full rotate-[5deg] rounded-2xl object-cover opacity-70 ring-1 ring-white/10 transition-all duration-500 ease-out group-hover:translate-x-10 group-hover:rotate-[9deg] group-hover:opacity-100 motion-reduce:transition-none"
      />
      <Image
        src="/static/images/me.jpeg"
        alt={alt}
        width={336}
        height={336}
        placeholder="blur"
        blurDataURL={BLUR}
        priority
        className="absolute inset-0 size-full -rotate-2 rounded-2xl object-cover shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-all duration-500 ease-out group-hover:-translate-x-8 group-hover:-rotate-[6deg] motion-reduce:transition-none"
      />
    </div>
  );
}
