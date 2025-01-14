import CarIssueAssistant from "../components/CarIssueAssistant";
import carData from "../app/data/carData.json";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-black text-white ">
      <div className="z-10 w-full max-w-5xl items-center text-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Test Cars</h1>
        {carData.cars.join(", ")}
        <br />
        Spelling mistakes will be accepted too
        <CarIssueAssistant />
      </div>
    </main>
  );
}
