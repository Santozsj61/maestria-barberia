import React, { useState, useMemo } from 'react';
import { X, ShoppingBag, Search, ExternalLink, ChevronRight } from 'lucide-react';

export default function ProductsModal({ isOpen, onClose, products = [], business = {} }) {
  if (!isOpen) return null;

  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'todos', label: 'Todos', icon: '/assets/icon-productos.webp' },
    { id: 'lociones', label: 'Perfumería', icon: '/assets/icon-lociones.webp' },
    { id: 'cuidado', label: 'Cuidado & Barber', icon: '/assets/icon-cuidado.webp' },
    { id: 'tecnologia', label: 'Tecnología', icon: '/assets/icon-tecnologia.webp' },
    { id: 'ropa', label: 'Ropa & Estilo', icon: '/assets/icon-ropa.webp' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        selectedCategory === 'todos' || p.category === selectedCategory;
      const matchSearch =
        p.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const formatCOP = (val) => {
    if (!val) return 'Consultar precio';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getProductImage = (product) => {
    if (product.imagenUrl) return product.imagenUrl;
    if (product.id === 'producto-1') return '/assets/producto-1.webp';
    if (product.id === 'producto-2') return '/assets/producto-2.webp';
    if (product.id === 'producto-3') return '/assets/producto-3.webp';
    if (product.id === 'producto-4') return '/assets/producto-4.webp';
    return '/assets/icon-productos.webp';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] rounded-3xl bg-white border border-neutral-300 shadow-2xl p-5 sm:p-7 flex flex-col text-[#1c1c1e]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-neutral-100 border border-neutral-300 text-[#1c1c1e]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-black text-[#1c1c1e]">
                Catálogo de Productos
              </h3>
              <p className="text-xs text-[#48484a] font-bold">
                Perfumería original, ropa, accesorios y cuidado personal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-[#48484a] hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar and search */}
        <div className="py-4 space-y-3 shrink-0">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#71717a] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, perfume, marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100 border border-neutral-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#1c1c1e] font-bold placeholder:text-[#8e8e93] focus:outline-none focus:border-[#1c1c1e]"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap flex items-center gap-2 transition-all ${
                    active
                      ? 'bg-[#1c1c1e] text-white shadow-md'
                      : 'bg-neutral-100 border border-neutral-300 text-[#1c1c1e] hover:border-[#1c1c1e]'
                  }`}
                >
                  <img src={cat.icon} alt={cat.label} className="w-4 h-4 object-contain" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="overflow-y-auto flex-1 pr-1 -mr-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-[#71717a]">
              <ShoppingBag className="w-12 h-12 text-[#8e8e93] mx-auto mb-3 opacity-60" />
              <p className="text-sm font-bold">No se encontraron productos con ese criterio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
              {filteredProducts.map((p) => {
                const img = getProductImage(p);
                const isSoldOut = p.agotado;
                const whatsappBuyUrl = `https://wa.me/57${
                  business?.telefono || '3161277718'
                }?text=${encodeURIComponent(
                  `¡Hola Maestría Barbería! 🛍️ Me interesa comprar el producto: *${p.nombre}* (${formatCOP(
                    p.precio
                  )}). ¿Tienen disponibilidad en el local?`
                )}`;

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl p-4 bg-white border border-neutral-300 flex flex-col justify-between group hover:border-[#1c1c1e] transition-all shadow-sm"
                  >
                    <div>
                      {/* Image container */}
                      <div className="relative h-44 rounded-xl overflow-hidden bg-neutral-50 mb-3.5 flex items-center justify-center p-3 border border-neutral-200">
                        <img
                          src={img}
                          alt={p.nombre}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSoldOut ? (
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-neutral-200 border border-neutral-300 text-[#71717a] text-[10px] font-black uppercase tracking-wider">
                            Agotado
                          </span>
                        ) : (
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-300 text-[#1c1c1e] text-[10px] font-black uppercase tracking-wider">
                            Disponible
                          </span>
                        )}
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white text-[9px] uppercase tracking-wider text-[#1c1c1e] font-black border border-neutral-300 shadow-xs">
                          {p.category}
                        </span>
                      </div>

                      {/* Info */}
                      <h4 className="font-serif text-sm font-bold text-[#1c1c1e] line-clamp-2 mb-1.5">
                        {p.nombre}
                      </h4>
                      <p className="font-serif text-base font-black text-[#1c1c1e] mb-3">
                        {formatCOP(p.precio)}
                      </p>
                    </div>

                    {/* Action Button: Flyer capsule */}
                    <a
                      href={whatsappBuyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-full bg-[#c8c8cc] hover:bg-[#b8b8bd] text-[#1c1c1e] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 border border-[#8e8e93]"
                    >
                      <ChevronRight className="w-3.5 h-3.5 stroke-[3.5] text-[#1c1c1e]" />
                      <span>Comprar por WhatsApp</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
