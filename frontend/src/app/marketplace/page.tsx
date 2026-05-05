import { Marketplace } from "@/app/home-views/Marketplace";
import { RegisterDomainView } from "@/app/home-views/RegisterDomainView";
import { SnapScrollHandler } from "@/common/components/SnapScrollHandler";

const Home: React.FC = () => {
  return <Marketplace />;
  // return (
  //   <>
  //     <SnapScrollHandler />
  //     <div className="snap-y snap-mandatory h-screen-fixed overflow-y-scroll scroll-smooth snap-container-with-nested-scroll" data-snap-container>
  //       <RegisterDomainView />
  //       <Marketplace />
  //     </div>
  //   </>
  // );
};

export default Home;
