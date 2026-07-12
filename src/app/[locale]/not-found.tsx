import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Sahifa topilmadi</h2>
      <p className="text-gray-500 mb-8">Siz izlagan sahifa mavjud emas.</p>
      <Link
        href="/uz"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Bosh sahifa
      </Link>
    </div>
  )
}
