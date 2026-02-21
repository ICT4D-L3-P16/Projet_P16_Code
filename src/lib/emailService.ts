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

export const sendInvitationEmail = async (email: string, teamName: string, examTitle: string, inviteUrl: string) => {
  return sendEmail({
    to: email,
    subject: `Invitation à collaborer sur l'examen : ${examTitle}`,
    body: `
      Bonjour,
      
      Vous avez été invité à rejoindre l'équipe "${teamName}" pour collaborer sur l'examen "${examTitle}".
      
      Cliquez sur le lien suivant pour accepter l'invitation :
      ${inviteUrl}
      
      Si vous n'avez pas de compte SAJE, vous pourrez en créer un après avoir cliqué sur le lien.
    `
  });
};
