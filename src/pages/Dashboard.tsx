import { useNavigate } from "react-router-dom";

export function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 bg-card rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/phase1")}>
                    <h2 className="text-xl font-semibold mb-2">Phase 1: Screening</h2>
                    <p className="text-muted-foreground">AI-powered candidate screening and matching.</p>
                </div>
                <div className="p-6 bg-card rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/phase2")}>
                    <h2 className="text-xl font-semibold mb-2">Phase 2: Interview</h2>
                    <p className="text-muted-foreground">Automated interview scheduling and analysis.</p>
                </div>
            </div>
        </div>
    );
}
