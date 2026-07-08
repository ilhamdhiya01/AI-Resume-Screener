const Skelaton = () => {
  return (
    <div className="absolute top-0 w-full p-12">
      <div className="-z-10 animate-pulse">
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-2xs rounded-md bg-gray-200" />
            <div className="h-4 w-96 rounded-md bg-gray-200" />
            <div className="h-4 w-2xs rounded-md bg-gray-200" />
          </div>
          <div className="h-0.5 w-full rounded-md bg-gray-200" />
          <div className="mt-12 h-6 w-3xs rounded-md bg-gray-200" />
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="col-span-1 h-4 rounded-md bg-gray-200" />
            <div className="col-span-2 space-y-3">
              <div className="h-5 rounded-md bg-gray-200" />
              <div className="h-5 rounded-md bg-gray-200" />
              <div className="h-5 rounded-md bg-gray-200" />
            </div>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="col-span-1 h-4 rounded-md bg-gray-200" />
            <div className="col-span-2 space-y-3">
              <div className="h-5 rounded-md bg-gray-200" />
              <div className="h-5 rounded-md bg-gray-200" />
              <div className="h-5 rounded-md bg-gray-200" />
            </div>
          </div>
          <div className="mt-20 h-6 w-3xs rounded-md bg-gray-200" />
          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="col-span-1 h-4 rounded-md bg-gray-200" />
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="col-span-2 h-5 rounded-md bg-gray-200" />
              <div className="col-span-1 h-5 rounded-md bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skelaton;
