const Skelaton = () => {
  return (
    <div className="absolute top-0 w-full p-6 md:p-12">
      <div className="-z-10 animate-pulse">
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-40 rounded-md bg-gray-200 md:w-2xs" />
            <div className="h-4 w-56 rounded-md bg-gray-200 md:w-96" />
            <div className="h-4 w-40 rounded-md bg-gray-200 md:w-2xs" />
          </div>
          <div className="h-0.5 w-full rounded-md bg-gray-200" />
          <div className="mt-8 h-6 w-32 rounded-md bg-gray-200 md:mt-12 md:w-3xs" />
          <div className="mt-6 grid grid-cols-3 gap-4 md:mt-8">
            <div className="col-span-1 h-4 rounded-md bg-gray-200" />
            <div className="col-span-2 space-y-3">
              <div className="h-5 rounded-md bg-gray-200" />
              <div className="h-5 rounded-md bg-gray-200" />
              <div className="h-5 rounded-md bg-gray-200" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 md:mt-10">
            <div className="col-span-1 h-4 rounded-md bg-gray-200" />
            <div className="col-span-2 space-y-3">
              <div className="h-5 rounded-md bg-gray-200" />
              <div className="h-5 rounded-md bg-gray-200" />
              <div className="h-5 rounded-md bg-gray-200" />
            </div>
          </div>
          <div className="mt-12 h-6 w-32 rounded-md bg-gray-200 md:mt-20 md:w-3xs" />
          <div className="mt-8 grid grid-cols-3 gap-4 md:mt-10">
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
