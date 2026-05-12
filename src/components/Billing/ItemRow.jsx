import React from 'react';
import { Trash2 } from 'lucide-react';

const ItemRow = ({ item, updateItem, deleteItem, isLastItem }) => {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 px-4">
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          value={item.name}
          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
          placeholder="Item name"
        />
      </td>
      <td className="py-3 px-4">
        <input
          type="number"
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          value={item.quantity === 0 ? '' : item.quantity}
          onChange={(e) => updateItem(item.id, 'quantity', e.target.value === '' ? '' : parseFloat(e.target.value))}
          onBlur={(e) => { if (e.target.value === '') updateItem(item.id, 'quantity', 1); }}
        />
      </td>
      <td className="py-3 px-4">
        <input
          type="number"
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          value={item.rate === '' ? '' : item.rate}
          onChange={(e) => updateItem(item.id, 'rate', e.target.value === '' ? '' : parseFloat(e.target.value))}
          onBlur={(e) => { if (e.target.value === '') updateItem(item.id, 'rate', 0); }}
        />
      </td>
      <td className="py-3 px-4 font-semibold text-gray-800">
        {item.rate === 0 ? <span className="text-green-600">Free</span> : `₹${item.total.toFixed(2)}`}
      </td>
      <td className="py-3 px-4">
        <button
          onClick={() => deleteItem(item.id)}
          disabled={isLastItem} // Disable delete if it's the only item
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 size={20} />
        </button>
      </td>
    </tr>
  );
};

export default ItemRow;