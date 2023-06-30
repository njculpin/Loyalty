const clients = [
  {
    id: 1,
    name: "Bacon Club",
    imageUrl: "/bacon.png",
  },
  {
    id: 2,
    name: "Food Alliance",
    imageUrl: "/nffa.png",
  },
  {
    id: 3,
    name: "Roaming Travelers",
    imageUrl: "/roamingtravelers.png",
  },
];

const Case = () => {
  return (
    <div className="mx-auto max-w-7xl p-16">
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
      >
        {clients.map((client) => (
          <li
            key={client.id}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <img
              className="h-32 w-full flex-none items-center gap-x-4 border-b border-gray-900/5 object-contain bg-gray-50 p-6"
              src={client.imageUrl}
              alt={client.name}
            />
            {/* <img
                src={client.imageUrl}
                alt={client.name}
                className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
              /> */}
            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <div className="text-sm font-medium leading-6 text-gray-900">
                  {client.name}
                </div>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Case;
