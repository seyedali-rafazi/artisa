'use client';

import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError?: () => void;
  disabled?: boolean;
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
  disabled = false,
}: GoogleLoginButtonProps) {
  return (
    <div
      className={`w-full flex justify-center items-center py-1 transition-opacity ${
        disabled ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => {
          if (onError) {
            onError();
          }
        }}
        text="continue_with"
        theme="outline"
        shape="circle"
        size="large"
        width="100%"
      />
    </div>
  );
}
