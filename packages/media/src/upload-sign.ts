export interface SignedUploadParams {
  timestamp: number;
  signature: string;
  apiKey: string;
  folder?: string;
}

export function generateUploadSignatureMock(folder = 'elsesourav'): SignedUploadParams {
  const timestamp = Math.round(new Date().getTime() / 1000);
  return {
    timestamp,
    signature: 'mock_signature_for_testing',
    apiKey: process.env.CLOUDINARY_API_KEY || 'mock_api_key',
    folder,
  };
}
