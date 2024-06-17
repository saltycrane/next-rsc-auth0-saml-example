import { getSession } from "../auth";

export default async function IndexPage() {
  const session = await getSession();
  return (
    <div>
      IndexPage
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
