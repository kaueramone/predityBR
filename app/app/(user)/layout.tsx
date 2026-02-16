export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto px-4 pt-24 pb-24">
            {children}
        </div>
    );
}
