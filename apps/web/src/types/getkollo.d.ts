/** GetKollo SDK (Lightning Pay / Hello Clever) - loaded from script tag */
declare global {
  interface GetKolloOrder {
    external_id: string;
    customer_name?: string;
    customer_email?: string;
    amount: number; // cents
    currency: 'USD' | 'AUD';
    return_url?: string;
  }

  interface GetKolloOptions {
    mountElement: string;
    styleProps?: {
      frame?: { width?: string; height?: string };
    };
    paymentButton?: 'iframe' | 'external';
    events?: {
      onReady?: () => void;
      onLoading?: (isLoading: boolean) => void;
    };
  }

  interface GetKolloCallbackResponse {
    status?: 'succeeded' | 'failed';
    error?: { message?: string; code?: string };
    order?: GetKolloOrder;
    type?: 'callback';
    /** Present when payment reaches authorised/waiting — use for tokenisation (reuse without re-entering card) */
    token?: { id: string; type: string };
  }

  interface GetKolloInstance {
    initialize(): Promise<{ success?: boolean; error?: string }>;
    createPayment(
      order: GetKolloOrder,
      options: GetKolloOptions
    ): Promise<{ success?: boolean; error?: string }>;
    onSubmit?(payload: { country: string }): void;
  }

  interface GetKolloConstructor {
    new (config: { app_id: string }): GetKolloInstance;
  }

  interface Window {
    GetKollo?: GetKolloConstructor;
    getkolloCardCallback?: (message: GetKolloCallbackResponse) => void;
  }
}

export {};
