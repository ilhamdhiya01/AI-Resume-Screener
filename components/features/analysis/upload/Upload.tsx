import { Upload } from '.';

const UploadRoot = () => {
  return (
    <section className="flex flex-col items-center gap-6">
      <Upload.Header />
      <div className="flex w-full gap-6">
        <Upload.FileUpload />
        <Upload.JobDescription />
      </div>
      <Upload.Footer />
    </section>
  );
};

export default UploadRoot;
