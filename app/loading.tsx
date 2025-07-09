export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground">Loading...</p>
      </div>
    </div>
  );
}
