
export default function Chip({ children }) {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-3 text-m font-medium text-slate-700">
        {children}
      </span>
    );
  }