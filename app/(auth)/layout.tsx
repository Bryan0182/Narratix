export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <div style={{backgroundColor: "#383d3b", minHeight: "100vh"}}>
            {children}
        </div>
    )
}