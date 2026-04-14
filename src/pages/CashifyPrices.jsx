import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ExternalLink, Plus, Trash2, Save, RefreshCw, Laptop, Tablet, TrendingUp } from 'lucide-react'

const MACBOOK_MODELS = [
  'MacBook Air M1 (2020)', 'MacBook Air M2 (2022)', 'MacBook Air M3 (2024)',
  'MacBook Pro M1 13"', 'MacBook Pro M1 Pro 14"', 'MacBook Pro M1 Pro 16"',
  'MacBook Pro M1 Max 14"', 'MacBook Pro M1 Max 16"',
  'MacBook Pro M2 13"', 'MacBook Pro M2 Pro 14"', 'MacBook Pro M2 Pro 16"',
  'MacBook Pro M3 14"', 'MacBook Pro M3 Pro 14"', 'MacBook Pro M3 Pro 16"',
  'MacBook Air 13" (Intel 2020)', 'MacBook Pro 13" (Intel 2020)',
]

const IPAD_MODELS = [
  'iPad Air 5 (M1)', 'iPad Air 4', 'iPad Air 3',
  'iPad Pro 12.9" M2 (2022)', 'iPad Pro 11" M2 (2022)',
  'iPad Pro 12.9" M1 (2021)', 'iPad Pro 11" M1 (2021)',
  'iPad Pro 12.9" (2020)', 'iPad Pro 11" (2020)',
  'iPad 10th Gen', 'iPad 9th Gen', 'iPad 8th Gen',
  'iPad mini 6', 'iPad mini 5',
]

function getCashifyUrl(modelName, deviceType) {
  const slug = modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (deviceType === 'MacBook') return `https://www.cashify.in/sell-old-laptop/used-apple-${slug}`
  return `https://www.cashify.in/sell-old-tablet/used-apple-${slug}`
}

export default function CashifyPrices() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ model_name: '', device_type: 'MacBook', storage: '', ram: '', min_price: '', max_price: '', notes: '' })
  const [filter, setFilter] = useState('all')

  const showMessage = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3000) }

  const fetchPrices = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('cashify_reference_prices').select('*').order('device_type').order('model_name')
    if (!error) setPrices(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPrices() }, [])

  const handleAdd = async () => {
    if (!form.model_name || !form.min_price || !form.max_price) { showMessage('e', 'Fill model name, min and max price'); return }
    setSaving(true)
    const { error } = await supabase.from('cashify_reference_prices').insert({
      ...form,
      min_price: parseInt(form.min_price) || 0,
      max_price: parseInt(form.max_price) || 0,
      cashify_url: getCashifyUrl(form.model_name, form.device_type),
      last_updated: new Date().toISOString(),
    })
    setSaving(false)
    if (error) { showMessage('e', 'Error: ' + error.message); return }
    showMessage('s', 'Price added!')
    setShowAdd(false)
    setForm({ model_name: '', device_type: 'MacBook', storage: '', ram: '', min_price: '', max_price: '', notes: '' })
    fetchPrices()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this price reference?')) return
    await supabase.from('cashify_reference_prices').delete().eq('id', id)
    fetchPrices()
  }

  const handleInlineEdit = async (row, field, value) => {
    const updateData = { [field]: ['min_price', 'max_price'].includes(field) ? parseInt(value) || 0 : value, last_updated: new Date().toISOString() }
    await supabase.from('cashify_reference_prices').update(updateData).eq('id', row.id)
    setPrices(prev => prev.map(p => p.id === row.id ? { ...p, ...updateData } : p))
  }

  const filtered = prices.filter(p => filter === 'all' || p.device_type === filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" /> Cashify Reference Prices
          </h1>
          <p className="text-sm text-gray-500 mt-1">Market reference prices from Cashify — use to compare & set fair offers</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPrices} className="p-2 text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
          <a href="https://www.cashify.in/sell-old-laptop/sell-apple-macbook" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
            <ExternalLink className="w-4 h-4" /> View MacBooks on Cashify
          </a>
          <a href="https://www.cashify.in/sell-old-tablet/sell-apple" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50">
            <ExternalLink className="w-4 h-4" /> View iPads on Cashify
          </a>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700">
            <Plus className="w-4 h-4" /> Add Price
          </button>
        </div>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${msg.type === 's' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {msg.text}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['all', 'MacBook', 'iPad'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${filter === f ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {f === 'all' ? 'All Devices' : f === 'MacBook' ? <span className="flex items-center gap-1.5"><Laptop className="w-4 h-4" /> MacBooks</span> : <span className="flex items-center gap-1.5"><Tablet className="w-4 h-4" /> iPads</span>}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Add New Reference Price</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Device Type</label>
              <select value={form.device_type} onChange={e => setForm({ ...form, device_type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="MacBook">MacBook</option>
                <option value="iPad">iPad</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Model Name</label>
              <select value={form.model_name} onChange={e => setForm({ ...form, model_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select model...</option>
                {(form.device_type === 'MacBook' ? MACBOOK_MODELS : IPAD_MODELS).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Storage (optional)</label>
              <input value={form.storage} onChange={e => setForm({ ...form, storage: e.target.value })} placeholder="e.g. 256GB"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">RAM (optional)</label>
              <input value={form.ram} onChange={e => setForm({ ...form, ram: e.target.value })} placeholder="e.g. 8GB"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Min Price (₹)</label>
              <input type="number" value={form.min_price} onChange={e => setForm({ ...form, min_price: e.target.value })} placeholder="15000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Max Price (₹)</label>
              <input type="number" value={form.max_price} onChange={e => setForm({ ...form, max_price: e.target.value })} placeholder="35000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Notes (optional)</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Good condition, with box"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleAdd} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No reference prices yet</p>
          <p className="text-sm text-gray-400 mt-1">Add prices by checking Cashify and entering them manually</p>
          <button onClick={() => setShowAdd(true)} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            Add First Price
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Device / Model</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Specs</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Cashify Price Range</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Updated</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {row.device_type === 'MacBook' ? <Laptop className="w-4 h-4 text-indigo-500" /> : <Tablet className="w-4 h-4 text-purple-500" />}
                      <div>
                        <p className="font-medium text-gray-900">{row.model_name}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${row.device_type === 'MacBook' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                          {row.device_type}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.storage && <span className="mr-2">{row.storage}</span>}
                    {row.ram && <span>{row.ram} RAM</span>}
                    {!row.storage && !row.ram && <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-semibold">₹{(row.min_price || 0).toLocaleString('en-IN')}</span>
                      <span className="text-gray-400">–</span>
                      <span className="text-green-600 font-semibold">₹{(row.max_price || 0).toLocaleString('en-IN')}</span>
                    </div>
                    {row.notes && <p className="text-xs text-gray-400 mt-0.5">{row.notes}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {row.last_updated ? new Date(row.last_updated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {row.cashify_url && (
                        <a href={row.cashify_url} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg" title="View on Cashify">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>How to use:</strong> Visit Cashify for the model, note the price range for Good/Like New condition, and enter it here.
        These prices are shown as market reference in the Requests detail panel when setting offers.
        Update prices periodically as Cashify prices change with market conditions.
      </div>
    </div>
  )
}
