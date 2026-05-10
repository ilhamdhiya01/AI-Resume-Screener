import { Upload } from '.';

const UploadRoot = () => {
  return (
    <section className="flex flex-col items-center justify-between gap-8">
      <Upload.Header />
      <Upload.FileUpload />
      <Upload.Footer />
    </section>
  );
};

export default UploadRoot;
