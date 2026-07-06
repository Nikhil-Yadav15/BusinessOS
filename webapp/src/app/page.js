import { redirect } from 'next/navigation';

export default function Home() {
  // Automatically redirect the root domain to the login portal layer
  redirect('/login');
}
