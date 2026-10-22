export interface AboutContent {
  subtitle?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
}

export default function AboutSummary({ initialContent }: { initialContent?: AboutContent | null }) {
  const content = initialContent;

  if (!content) return null;

  return (
    <section className="py-10 sm:py-14 px-[5px] sm:px-4 bg-white">
      <div className="w-full sm:w-[90%] mx-auto px-[5px] sm:px-4">
        <span className="block text-primary font-medium tracking-[0.3em] uppercase text-xs sm:text-sm text-center mb-2 sm:mb-4">{content.subtitle || 'Precision & Quality'}</span>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 sm:mb-10 text-center text-secondary uppercase tracking-tight">{content.title || 'About'} <span className="text-primary"> {content.titleHighlight || 'LabZenix'} </span></h2>
        <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-primary mx-auto mb-6 sm:mb-10" />
        <div 
          className="text-sm sm:text-base md:text-xl shadow-md p-3.5 sm:p-6 text-gray text-center mx-auto leading-relaxed font-normal [&>p]:mb-4 sm:[&>p]:mb-6"
          dangerouslySetInnerHTML={{ __html: content.description || '' }}
        />
      </div>
    </section>
  );
}
