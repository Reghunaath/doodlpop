import { Suspense } from "react";
import ComicViewer from "@/frontend/comic-viewer/ComicViewer";

function ComicContent({ id }: { id: string }) {
  return <ComicViewer comicId={id} />;
}

export default async function ComicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface ben-day-dots">
          <span
            className="font-headline text-5xl font-black italic text-primary"
            style={{ filter: "drop-shadow(4px 4px 0px rgba(0,0,0,1))" }}
          >
            LOADING...
          </span>
        </div>
      }
    >
      <ComicContent id={id} />
    </Suspense>
  );
}
