import { notFound, redirect } from "next/navigation";
import { getEditorData } from "@/lib/wedding-config";
import { requireSession } from "@/lib/authz";
import { isProdApp, getSiteDomain } from "@/lib/site";
import { ProjectEditor } from "./ProjectEditor";

export default async function ProjectEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getEditorData(id);

  if (!data) notFound();

  const session = await requireSession();
  if (session.user.role !== "admin" && data.projectMeta.userId !== session.user.id) {
    redirect("/admin");
  }

  return (
    <ProjectEditor
      initialConfig={data.config}
      initialProjectMeta={data.projectMeta}
      guestbookAll={data.guestbookAll}
      isProd={isProdApp()}
      siteDomain={getSiteDomain()}
      isAdmin={session.user.role === "admin"}
    />
  );
}
