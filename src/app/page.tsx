// src/app/page.tsx
import MathGame from '@/components/MathGame';

export default function Home() {
  return (
    <main className="min-h-screen p-4 flex items-center justify-center bg-gray-50">
      <MathGame />
    </main>
  );
}