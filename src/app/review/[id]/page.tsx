import { Suspense } from "react";
import SupervisedViewer from "@/frontend/comic-viewer/SupervisedViewer";

function ReviewContent({ id }: { id: string }) {
  return <SupervisedViewer comicId={id} />;
}

export default async function ReviewPage({
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
      <ReviewContent id={id} />
    </Suspense>
  );
}
