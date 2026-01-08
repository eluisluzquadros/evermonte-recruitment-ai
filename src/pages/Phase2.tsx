import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function Phase2() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-8">
            <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold mb-4">Phase 2: Interview</h1>
            <p className="text-muted-foreground">This is the interview phase interface.</p>
            {/* Add Phase 2 content here */}
        </div>
    );
}
