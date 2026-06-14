import Footer from './Footer';
import Header from './Header';

const UploadRoot = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex flex-col items-center gap-6 p-12">
      <Header />
      <div className="flex w-full gap-6">{children}</div>
      <Footer />
    </section>
  );
};

export default UploadRoot;
