/**
 * Service simulé pour l'envoi d'emails d'invitation.
 * Dans une application de production, ce service ferait appel à une Edge Function Supabase
 * ou à une API externe (Resend, SendGrid, etc.).
 */

export interface EmailParams {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (params: EmailParams): Promise<boolean> => {
  console.log(`[EmailService] Envoi d'un mail à ${params.to}...`);
  console.log(`[EmailService] Sujet: ${params.subject}`);
  console.log(`[EmailService] Contenu: ${params.body}`);
  
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return true;
};

export const sendInvitationEmail = async (email: string, teamName: string, examTitle: string, inviteUrl: string): Promise<boolean> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  
  if (window.location.hostname !== 'localhost' && (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1'))) {
    console.warn('[EmailService] Attention : Le site est déployé mais l\'API pointe vers localhost. L\'envoi d\'e-mail échouera probablement.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/mail/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        teamName,
        contextName: examTitle,
        inviteLink: inviteUrl
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detailedError = errorData.details ? `${errorData.error} : ${errorData.details}` : (errorData.error || 'Erreur lors de l\'envoi du mail');
      throw new Error(detailedError);
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('[EmailService] Erreur d\'envoi:', error);
    return false;
  }
};
