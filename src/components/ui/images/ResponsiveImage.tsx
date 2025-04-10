export default function ResponsiveImage({ src, className }: { src: string, className?: string }) {
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <img
          src={src}
          alt="Cover"
          className={`w-full border border-gray-200 rounded-xl dark:border-gray-800 ${className}`}
        />
      </div>
    </div>
  );
}
