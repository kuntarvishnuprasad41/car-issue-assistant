import CarIssueAssistant from "../components/CarIssueAssistant";
import carData from "../app/data/carData.json";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between xl:p-24 bg-black ">
      <div className="z-10 w-full  items-center text-center justify-between font-mono text-sm bg-black">
        
        <CarIssueAssistant />
       
      </div>
    </main>
  );
}
