import React from 'react';

const DescriptionAndReviews = ({ product }) => {
  return (
    <div className="mt-16 space-y-8">
      <div>
        <h2 className="font-serif font-semibold text-lg mb-2">Description</h2>
        <p className="text-gray-700 leading-relaxed max-w-4xl">{product.description}</p>
      </div>

      <div>
        <h2 className="font-serif font-semibold text-lg mb-4">Reviews (0)</h2>
        <div className="border border-gray-300 p-4 max-w-4xl">
          <p className="mb-2">There are no reviews yet.</p>
          <form className="space-y-4">
            <p className="font-semibold">Be the first to review "{product.name}"</p>
            <p className="text-xs text-gray-500">Your email address will not be published. Required fields are marked *</p>

            <label className="block">
              <span className="font-semibold text-sm">Your rating *</span>
              <div className="flex space-x-1 mt-1 text-rose-600 cursor-pointer">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.462a1 1 0 00-.364 1.118l1.287 3.967c.3.922-.755 1.688-1.54 1.118l-3.388-2.462a1 1 0 00-1.176 0l-3.388 2.462c-.785.57-1.838-.196-1.539-1.118l1.287-3.967a1 1 0 00-.364-1.118L2.044 9.393c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.966z" />
                  </svg>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="font-semibold text-sm">Your review *</span>
              <textarea className="w-full border border-gray-300 rounded p-2 mt-1" rows="4" required></textarea>
            </label>

            <div className="flex gap-4">
              <label className="flex-1 block">
                <span className="font-semibold text-sm">Name *</span>
                <input type="text" className="w-full border border-gray-300 rounded p-2 mt-1" required />
              </label>

              <label className="flex-1 block">
                <span className="font-semibold text-sm">Email *</span>
                <input type="email" className="w-full border border-gray-300 rounded p-2 mt-1" required />
              </label>
            </div>

            <label className="flex items-center text-sm mt-2 gap-2">
              <input type="checkbox" />
              Save my name, email, and website in this browser for the next time I comment.
            </label>

            <button type="submit" className="border border-gray-900 px-6 py-2 font-semibold hover:bg-black hover:text-white transition mt-4">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DescriptionAndReviews;
