type Item = {
  id: number;
  name: string;
};

async function getItems(): Promise<Item[]> {
  const res = await fetch(`${process.env.BACKEND_URL}/items`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

export default async function ItemsPage() {
  const items = await getItems();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-2xl px-6 py-16">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Items
        </h1>

        {items.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">No items found.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 px-5 py-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {item.id}
                </span>
                <span className="text-lg text-zinc-900 dark:text-zinc-100">
                  {item.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
