export default function SkeletonCard({ lines = 2, className = '' }) {
  return (
    <div className={`card-soft p-5 animate-pulse ${className}`}>
      <div className="h-3 bg-secondary rounded w-1/3 mb-3"></div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-2.5 bg-secondary rounded w-full mb-2"></div>
      ))}
    </div>
  );
}
