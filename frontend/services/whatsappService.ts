import { getApiBaseUrl } from './apiConfig';

/**
 * WhatsApp Notification Service
 * All credentials (CallMeBot API keys, gateway tokens) are kept securely on the Spring Boot backend.
 */
export class WhatsAppService {
  /**
   * Notify a token customer via backend WhatsApp service
   * @param tokenId UUID of the token
   * @param customMessage Optional custom message override
   */
  static async notifyTokenCustomer(tokenId: string, customMessage?: string): Promise<boolean> {
    try {
      const query = customMessage ? `?message=${encodeURIComponent(customMessage)}` : "";
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/queue/${tokenId}/notify${query}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        console.warn(`[WhatsApp] Backend returned status ${res.status}`);
        return false;
      }

      const json = await res.json();
      console.log("[WhatsApp] Notification triggered via backend:", json);
      return true;
    } catch (err) {
      console.error("[WhatsApp] Failed to trigger backend notification:", err);
      return false;
    }
  }
}

