import { SignInPage } from "../components/ui/SignInPage";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

export function SignUpPage() {
    const navigate = useNavigate();
    const { signUpWithEmail, signInWithGoogle, user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate("/projects");
        }
    }, [user, navigate]);

    return (
        <SignInPage
            isSignUp={true}
            onSignIn={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                const password = (form.elements.namedItem('password') as HTMLInputElement).value;

                try {
                    await signUpWithEmail(email, password);
                    navigate("/projects");
                } catch (error: any) {
                    alert(`Erro ao criar conta: ${error.message}`);
                }
            }}
            onGoogleSignIn={async () => {
                try {
                    await signInWithGoogle();
                    navigate("/projects");
                } catch (error: any) {
                    alert(`Erro ao entrar com Google: ${error.message}`);
                }
            }}
            onCreateAccount={() => navigate("/signin")}
            onResetPassword={() => navigate("/signin")}
            heroImageSrc="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
            testimonials={[
                {
                    avatarSrc: "https://i.pravatar.cc/150?img=3",
                    name: "David Kim",
                    handle: "@dkim",
                    text: "Joining Evermonte was the best decision for our scaling team."
                },
                {
                    avatarSrc: "https://i.pravatar.cc/150?img=4",
                    name: "Emma Wilson",
                    handle: "@emmaw",
                    text: "The platform is intuitive and powerful. Highly recommended."
                }
            ]}
        />
    );
}
