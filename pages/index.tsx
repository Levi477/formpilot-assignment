import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const getCredits = async () => {
    const res = await axios.get('/api/user/credits');
    setCredits(res.data.credits);
  };

  const handleRecharge = async () => {
    try {
      const res = await axios.post('/api/user/recharge');
      setMsg(res.data.status);
      getCredits();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Error occurred');
    }
  };

  useEffect(() => {
    if (session) getCredits();
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">CRUD Platform</h1>
      {!session ? (
        <button
          onClick={() => signIn('google')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      ) : (
        <div className="w-full max-w-lg bg-white shadow-md rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Welcome, {session.user?.name}</h2>
          <p>Email: {session.user?.email}</p>
          <p>API URL: {session.user?.apiUrl}</p>
          <p>
            API Key:{' '}
            <code className="bg-gray-100 px-2 py-1 text-sm">
              {session.user?.apiKey || 'Hidden'}
            </code>
          </p>
          <p className="mt-2">Credits: {credits}</p>
          <button
            className="bg-green-500 text-white px-4 py-2 mt-2 rounded hover:bg-green-600"
            onClick={handleRecharge}
          >
            Recharge Credits
          </button>
          <p className="text-red-600 text-sm mt-2">{msg}</p>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-4 py-2 mt-4 rounded"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
