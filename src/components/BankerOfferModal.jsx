import React from 'react';

const BankerOfferModal = ({ currentOffer, acceptDeal, rejectDeal, formatPrize }) => (
  <div className="text-center mb-6 bg-gradient-to-r from-amber-600 to-orange-500 p-6 rounded-xl shadow-lg border-2 border-amber-400">
    <h2 className="text-2xl font-bold mb-2 text-white">📞 BANKER'S OFFER</h2>
    <div className="text-4xl font-bold mb-4 text-white drop-shadow-lg">{formatPrize(currentOffer)}</div>
    <div className="space-x-4">
      <button
        onClick={acceptDeal}
        className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-105"
      >
        DEAL! 🤝
      </button>
      <button
        onClick={rejectDeal}
        className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-105"
      >
        NO DEAL! ✋
      </button>
    </div>
  </div>
);

export default BankerOfferModal;
