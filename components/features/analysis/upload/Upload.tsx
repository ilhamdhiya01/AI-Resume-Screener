import Footer from './Footer';
import Header from './Header';

const UploadRoot = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex flex-col items-center gap-4 md:gap-6">
      <Header />
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:gap-6">
        {children}
      </div>
      <Footer />
    </section>
  );
};

export default UploadRoot;
