export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-950 px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Facilitation
          </h1>
          <p className="text-brand-300 mt-3 text-base">
            Project progress, together.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
