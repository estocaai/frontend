"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  return (props: any) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redireciona para a página de login
        router.push('/'); 
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;