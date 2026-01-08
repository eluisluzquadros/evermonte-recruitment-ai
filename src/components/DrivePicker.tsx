import React, { useState, useEffect } from 'react';
import { X, Loader2, FileText, HardDrive, LogIn } from 'lucide-react';
import { listDriveFiles, getDriveFileContent, DriveFile } from '../services/driveService';
import { isAuthenticated, signInWithGoogle } from '../services/authService';

interface Props {
    onSelect: (text: string) => void;
    onClose: () => void;
}

const DrivePicker: React.FC<Props> = ({ onSelect, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [authorized, setAuthorized] = useState(isAuthenticated());

    useEffect(() => {
        if (authorized) {
            loadFiles();
        }
    }, [authorized]);

    const handleAuth = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            setAuthorized(true);
        } catch (e) {
            alert("Erro ao fazer login no Google.");
        } finally {
            setLoading(false);
        }
    };

    const loadFiles = async () => {
        setLoading(true);
        try {
            const data = await listDriveFiles();
            setFiles(data);
        } catch (e) {
            console.error(e);
            // If error is likely auth related, unauthorized
            if (String(e).includes('401') || String(e).includes('autenticado')) {
                setAuthorized(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (file: DriveFile) => {
        setProcessingId(file.id);
        try {
            const content = await getDriveFileContent(file.id);
            onSelect(content);
            onClose();
        } catch (e) {
            alert("Erro ao baixar arquivo do Drive. Verifique se é um arquivo compatível.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] border border-border">
                <div className="p-4 border-b border-border flex justify-between items-center bg-accent/50">
                    <h3 className="font-bold text-foreground flex items-center">
                        <HardDrive className="w-5 h-5 mr-2 text-green-500" />
                        Google Drive
                    </h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto">
                    {!authorized ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground text-sm mb-4">Faça login para acessar seus arquivos.</p>
                            <button
                                onClick={handleAuth}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center mx-auto hover:bg-primary/90"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <LogIn className="w-4 h-4 mr-2" />}
                                Conectar Google Drive
                            </button>
                        </div>
                    ) : loading && files.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {files.map(file => (
                                <button
                                    key={file.id}
                                    onClick={() => handleSelect(file)}
                                    disabled={processingId !== null}
                                    className="w-full flex items-center p-3 hover:bg-accent rounded-lg border border-transparent hover:border-primary/20 transition text-left group"
                                >
                                    <div className="p-2 bg-accent/50 rounded-lg mr-3 group-hover:bg-card">
                                        <FileText className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-foreground text-sm truncate">{file.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {file.mimeType.includes('pdf') ? 'PDF' : file.mimeType.includes('document') ? 'Google Doc' : 'Arquivo'}
                                        </div>
                                    </div>
                                    {processingId === file.id && <Loader2 className="animate-spin w-4 h-4 text-green-500" />}
                                </button>
                            ))}
                            {files.length === 0 && !loading && (
                                <p className="text-center text-muted-foreground text-sm py-4">Nenhum arquivo compatível encontrado.</p>
                            )}
                        </div>
                    )}

                    <div className="mt-4 p-3 bg-primary/10 text-primary text-xs rounded-lg border border-primary/20">
                        <strong>Nota:</strong> Suporta Google Docs, PDF, Word e Texto. O conteúdo é extraído automaticamente.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrivePicker;