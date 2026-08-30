import { useEffect, useMemo, useState } from 'react'
import './App.css'

const navItems = [['Overview', '⌂'], ['Inventory', '▦'], ['Billing', '▤'], ['Customers', '♧']]

function App() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [medicines, setMedicines] = useState([])
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerPhone, setCustomerPhone] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetch('/api/medicines').then((response) => response.json()).then((data) => {
      if (data.length) setMedicines(data.map((medicine) => ({ ...medicine, id: medicine.id || medicine._id })))
    }).catch(() => {})
  }, [])

  const filteredMedicines = useMemo(() => medicines.filter((medicine) => `${medicine.name} ${medicine.generic} ${medicine.category}`.toLowerCase().includes(query.toLowerCase())), [medicines, query])
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

  function addToCart(medicine) {
    if (medicine.stock === 0) return
    setCart((current) => {
      const exists = current.find((item) => item.id === medicine.id)
      if (exists) return current.map((item) => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item)
      return [...current, { ...medicine, quantity: 1 }]
    })
    fetch(`/api/medicines/${medicine.id}/stock`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta: -1 }) }).catch(() => {})
    setMedicines((current) => current.map((item) => item.id === medicine.id ? { ...item, stock: item.stock - 1, status: item.stock - 1 < 20 ? 'Low stock' : item.status } : item))
  }

  function removeFromCart(id) {
    const item = cart.find((cartItem) => cartItem.id === id)
    setCart((current) => current.filter((cartItem) => cartItem.id !== id))
    if (item) {
      fetch(`/api/medicines/${id}/stock`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ delta: item.quantity }) }).catch(() => {})
      setMedicines((current) => current.map((medicine) => medicine.id === id ? { ...medicine, stock: medicine.stock + item.quantity, status: medicine.stock + item.quantity < 20 ? 'Low stock' : 'In stock' } : medicine))
    }
  }

  useEffect(() => {
    if (!sent || !cart.length) return
    fetch('/api/bills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart, customerPhone, paymentMethod: 'upi' }) }).catch(() => {})
  }, [sent, cart, customerPhone])

  return (
    <div className="app-shell">
      <aside className="sidebar"><div className="brand"><span className="brand-mark">+</span><span>med<span>desk</span></span></div><div className="store-switcher"><span className="store-avatar">A</span><span><strong>Apna Medicals</strong><small>MG Road, Bengaluru</small></span><span className="chevron">⌄</span></div><nav>{navItems.map(([label, icon]) => <button key={label} className={activeNav === label ? 'active' : ''} onClick={() => setActiveNav(label)}><span className="nav-icon">{icon}</span>{label}{label === 'Billing' && cartCount > 0 && <b className="nav-count">{cartCount}</b>}</button>)}</nav><div className="sidebar-bottom"><button><span className="nav-icon">⚙</span>Settings</button><div className="user-card"><span className="user-avatar">RK</span><span><strong>Ravi Kumar</strong><small>Store manager</small></span><span className="more">•••</span></div></div></aside>
      <main className="main-content"><header className="topbar"><div className="breadcrumb">{activeNav} <span>/</span> {activeNav === 'Overview' ? 'Today' : activeNav}</div><div className="top-actions"><button className="icon-button" aria-label="Notifications">♢<i /></button><div className="date-chip">◷ &nbsp; Wed, 24 Jan 2024</div></div></header><section className="page-heading"><div><p className="eyebrow">WEDNESDAY, 24 JANUARY 2024</p><h1>Good morning, Ravi <span>✦</span></h1><p className="subheading">Here’s your store at a glance.</p></div><button className="primary-button" onClick={() => setActiveNav('Billing')}>+ New bill <span>⌘ N</span></button></section>
        <section className="stat-grid"><div className="stat-card teal"><span className="stat-icon">◒</span><p>Today’s sales</p><strong>₹ 24,680</strong><small><b>↗ 12.5%</b> vs yesterday</small></div><div className="stat-card cream"><span className="stat-icon">▤</span><p>Items sold</p><strong>184</strong><small><b>↗ 8.2%</b> vs yesterday</small></div><div className="stat-card coral"><span className="stat-icon">▥</span><p>Low stock items</p><strong>08</strong><small className="alert-text">Need your attention</small></div><div className="stat-card blue"><span className="stat-icon">♙</span><p>Customers served</p><strong>96</strong><small><b>↗ 5.4%</b> vs yesterday</small></div></section>
        <section className="workspace"><div className="inventory-panel"><div className="panel-heading"><div><h2>Inventory</h2><p>Keep an eye on your medicine stock.</p></div><button className="text-button" onClick={() => setActiveNav('Inventory')}>View all <span>→</span></button></div><div className="inventory-tools"><div className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search medicines..." /></div><button className="filter-button">≡ &nbsp; Filter</button></div><div className="table-wrap"><table><thead><tr><th>MEDICINE</th><th>CATEGORY</th><th>STOCK</th><th>EXPIRY</th><th>STATUS</th><th /></tr></thead><tbody>{filteredMedicines.slice(0, 5).map((medicine) => <tr key={medicine.id}><td><div className="medicine-name"><span className={`medicine-dot dot-${medicine.id}`}>{medicine.name.charAt(0)}</span><span><strong>{medicine.name}</strong><small>{medicine.generic}</small></span></div></td><td>{medicine.category}</td><td><strong>{medicine.stock}</strong> <span className="unit">units</span></td><td>{medicine.expiry}</td><td><span className={`status ${medicine.status.toLowerCase().replace(' ', '-')}`}>{medicine.status}</span></td><td><button className="add-button" disabled={medicine.stock === 0} onClick={() => addToCart(medicine)}>+ Add</button></td></tr>)}</tbody></table></div></div><aside className="bill-panel"><div className="bill-heading"><div><h2>Quick bill</h2><p>{cartCount ? `${cartCount} item${cartCount > 1 ? 's' : ''} in this bill` : 'Start a new customer bill'}</p></div><span className="bill-number">#00428</span></div>{cart.length === 0 ? <div className="empty-bill"><div className="empty-icon">▤</div><strong>Your bill is empty</strong><p>Add medicines from inventory<br />to start billing.</p></div> : <div className="cart-items">{cart.map((item) => <div className="cart-row" key={item.id}><span><strong>{item.name}</strong><small>Qty {item.quantity}</small></span><b>₹ {item.price * item.quantity}</b><button onClick={() => removeFromCart(item.id)}>×</button></div>)}</div>}<div className="bill-footer"><div><span>Subtotal</span><strong>₹ {cartTotal.toLocaleString('en-IN')}</strong></div><div><span>Discount</span><strong>₹ 0</strong></div><div className="total"><span>Total payable</span><strong>₹ {cartTotal.toLocaleString('en-IN')}</strong></div><button className="checkout-button" disabled={!cart.length} onClick={() => { setSent(false); setShowCheckout(true) }}>Review & collect <span>→</span></button></div></aside></section></main>
      {showCheckout && <div className="modal-backdrop" onClick={() => setShowCheckout(false)}><div className="checkout-modal" onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={() => setShowCheckout(false)}>×</button><p className="eyebrow">BILL #00428</p><h2>Collect payment</h2><p className="modal-copy">Send the bill to your customer on WhatsApp and collect via UPI.</p><div className="pay-amount">₹ {cartTotal.toLocaleString('en-IN')}</div><div className="qr-box"><img className="real-qr" src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=apnamedicals@upi&pn=Apna%20Medicals&am=${cartTotal}&cu=INR`)}`} alt="UPI payment QR code" /><span>Scan to pay via any UPI app</span></div><label>Customer WhatsApp number<input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="+91 98765 43210" /></label><button className="whatsapp-button" onClick={() => setSent(true)}>◉ &nbsp; {sent ? 'Bill ready to share' : 'Send bill on WhatsApp'}</button>{sent && <p className="success-message">Bill prepared for {customerPhone || 'the customer'}.</p>}</div></div>}
    </div>
  )
}

export default App
