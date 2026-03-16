declare module 'africastalking' {
    interface SMSResponse {
      SMSMessageData: {
        Message?: string;
        Recipients?: Array<{
          statusCode: number;
          status: string;
          number: string;
          cost: string;
          messageId: string;
        }>;
        MessageParts?: Array<{
          MessageId: string;
          // ... other fields
        }>;
      };
    }
  
    const AfricasTalking: (credentials: { apiKey: string; username: string }) => {
      SMS: {
        send(params: {
          to: string | string[];
          message: string;
          from?: string;
        }): Promise<SMSResponse>;
      };
    };
  
    export default AfricasTalking;
  }