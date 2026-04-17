'use client';

export default function AboutSummary() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <span className="block text-primary font-bold tracking-[0.3em] uppercase text-xs text-center mb-4">Precision & Quality</span>
        <h2 className="text-4xl md:text-5xl font-black mb-10 text-center text-secondary uppercase tracking-tight">About LabZenix</h2>
        <div className="w-24 h-2 bg-primary mx-auto mb-10" />
        <p className="text-xl md:text-2xl text-gray-700 text-center max-w-4xl mx-auto leading-relaxed font-medium">
          LabZenix delivers an extensive selection of <span className="text-primary font-black">testing devices and apparatus</span>, combining exceptional quality with advanced technology. Our mission is to provide top-notch packaging testing instruments for material analysis and quality assurance at highly cost-effective and budget-friendly rates.
        </p>
      </div>
    </section>
  );
}
