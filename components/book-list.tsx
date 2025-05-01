import { useState, useEffect } from 'react';
import { Book } from '@/lib/types';
import { livrosApi } from '@/lib/api';
import { Input } from '@/components/ui/input';

export function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadBooks = async () => {
      const data = await livrosApi.getAll();
      setBooks(data);
      setFilteredBooks(data);
    };
    loadBooks();
  }, []);

  useEffect(() => {
    const filtered = books.filter(book => 
      book.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.autor.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchQuery, books]);

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Buscar livros..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="p-4 border rounded-lg shadow-sm"
          >
            <h3 className="font-semibold">{book.titulo}</h3>
            <p className="text-gray-600">{book.autor}</p>
            {book.disponivelLocacao ? 'Disponível' : 'Indisponível'}
            <div className="mt-2">
              <span className={`px-2 py-1 text-sm rounded ${
                book.disponivelLocacao 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {book.disponivelLocacao ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 