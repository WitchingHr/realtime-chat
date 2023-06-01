import { authOptions } from '@/lib/auth';
import NextAuth from 'next-auth';

// configure NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };