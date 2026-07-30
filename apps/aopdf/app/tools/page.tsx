import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import AmbientGlow from '@/components/ambient-glow';
import ToolsGrid from '@/components/tools/tools-grid';

export default function ToolsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AmbientGlow />
      <Navbar />
      <main className="flex-1 z-10 max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">PDF Tools</h1>
          <p className="text-zinc-400 max-w-xl mx-auto">22+ professional tools to handle any PDF task. Select a tool below to get started.</p>
        </div>
        <ToolsGrid />
      </main>
      <Footer />
    </div>
  );
}
