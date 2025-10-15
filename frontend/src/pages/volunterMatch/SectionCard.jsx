

export default function SectionCard({ title, right, children, className = "" }) {
    return (
      <section className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-lg md:p-5 shadow-black ${className}`}>
        <div className="mb-6 flex items-center justify-between gap-120">
          <h3 className="text-sm font-semibold text-slate-800 md:text-base">{title}</h3>
          {right}
        </div>
        {children}
      </section>
    ); 
  }  