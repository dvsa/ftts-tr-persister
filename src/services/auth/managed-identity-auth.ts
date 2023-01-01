import {
  ChainedTokenCredential, ClientSecretCredential, ManagedIdentityCredential, TokenCredential,
} from '@dvsa/ftts-auth-client';
import { logger } from '../../utils/logger';

export type ManagedIdentityAuthConfig = {
  azureTenantId: string;
  azureClientId: string;
  azureClientSecret: string;
  userAssignedEntityClientId: string;
  scope: string;
};

export type AuthHeader = {
  headers: {
    Authorization: string;
  };
};

export class ManagedIdentityAuth {
  private tokenCredential: ChainedTokenCredential;

  constructor(
    private config: ManagedIdentityAuthConfig,
  ) {
    const sources: TokenCredential[] = [new ManagedIdentityCredential(config.userAssignedEntityClientId)];
    if (config.azureTenantId && config.azureClientId && config.azureClientSecret) {
      sources.push(new ClientSecretCredential(config.azureTenantId, config.azureClientId, config.azureClientSecret));
    }
    this.tokenCredential = new ChainedTokenCredential(...sources);
  }

  public async getAuthHeader(): Promise<AuthHeader> {
    const token = await this.getToken();
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  private async getToken(): Promise<string> {
    try {
      const activeToken = await this.tokenCredential.getToken(this.config.scope);
      if (!activeToken.token) {
        throw new Error('ManagedIdentityAuth::getToken: empty token');
      }
      return activeToken.token;
    } catch (error) {
      logger.error(
        error as Error,
        'ManagedIdentityAuth::getToken: Unable to retrieve token',
        {
          scope: this.config.scope,
          clientId: this.config.userAssignedEntityClientId,
        },
      );
      throw error;
    }
  }
}
