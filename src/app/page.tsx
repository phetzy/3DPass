
export default function Home() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <section className="space-y-4 text-center py-16">
        <h1 className="text-3xl font-semibold">3D Pass</h1>
        <p className="text-muted-foreground">Upload your 3D models, preview in 3D, and get instant pricing.</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <a className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground" href="/upload">Get started</a>
          <a className="inline-flex items-center rounded-md border px-4 py-2" href="/signin">Sign in</a>
        </div>
      </section>
    </main>
  );
}
