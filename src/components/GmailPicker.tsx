import React, { useState, useEffect } from 'react';
import { Mail, Search, Loader2, X, LogIn } from 'lucide-react';
import { listEmails, getEmailFullText, EmailSummary } from '../services/gmailService';
import { isAuthenticated, signInWithGoogle } from '../services/authService';

interface Props {
  onSelect: (text: string) => void;
  onClose: () => void;
}

const GmailPicker: React.FC<Props> = ({ onSelect, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<EmailSummary[]>([]);
  const [error, setError] = useState('');
  const [authorized, setAuthorized] = useState(isAuthenticated());
  const [searchQuery, setSearchQuery] = useState('subject:(transcript OR transcrição OR meeting)');

  useEffect(() => {
    if (authorized) {
      fetchEmails();
    }
  }, [authorized]);

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      setAuthorized(true);
    } catch (e: any) {
      console.error(e);
      setError('Erro ao conectar com Google.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const list = await listEmails(searchQuery);
      setEmails(list);
    } catch (e) {
      console.error(e);
      setError('Erro ao buscar e-mails.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmail = async (id: string) => {
    setLoading(true);
    try {
      const text = await getEmailFullText(id);
      onSelect(text);
      onClose();
    } catch (e) {
      setError('Erro ao baixar conteúdo do e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] border border-border">
        <div className="p-4 border-b border-border flex justify-between items-center bg-accent/50">
          <h3 className="font-bold text-foreground flex items-center">
            <Mail className="w-5 h-5 mr-2 text-red-500" />
            Importar do Gmail
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {!authorized ? (
            <div className="text-center py-10">
              <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-red-500" />
              </div>
              <h4 className="text-lg font-medium text-foreground mb-2">Conectar ao Gmail</h4>
              <p className="text-muted-foreground mb-6 text-sm max-w-xs mx-auto">
                Permita o acesso para buscar e-mails de reuniões e transcrições automaticamente.
              </p>
              {error && <div className="text-red-500 text-xs mb-4">{error}</div>}
              <button
                onClick={handleAuth}
                disabled={loading}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition font-medium flex items-center justify-center mx-auto"
              >
                {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <><LogIn className="w-4 h-4 mr-2" /> Entrar com Google</>}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border border-input bg-background rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted-foreground"
                  placeholder="Buscar e-mails..."
                />
                <button
                  onClick={fetchEmails}
                  className="bg-accent hover:bg-accent/80 text-foreground px-4 py-2 rounded-lg border border-border"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-10 text-muted-foreground">
                  <Loader2 className="animate-spin w-8 h-8" />
                </div>
              ) : emails.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Nenhum e-mail encontrado com esses termos.
                </div>
              ) : (
                <div className="space-y-2">
                  {emails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => handleSelectEmail(email.id)}
                      className="w-full text-left p-3 border border-border rounded-lg hover:bg-primary/10 hover:border-primary/30 transition group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-foreground text-sm line-clamp-1">{email.subject}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{new Date(email.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center">
                        <span className="bg-accent px-1.5 py-0.5 rounded text-muted-foreground mr-2">De: {email.from.split('<')[0]}</span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 line-clamp-2">{email.snippet}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GmailPicker;