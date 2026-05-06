import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3000/api';

const productoInicial = {
  nombre: '',
  tipo: '',
  marca: '',
  material: '',
  talla: '',
  color: '',
  precio: '',
  stock: '',
  sede: 'General',
  centro: '',
  norte: '',
  sur: '',
};

const ventaInicial = {
  productoId: '',
  cantidad: 1,
};

function App() {
  const [zapatos, setZapatos] = useState([]);
  const [metricas, setMetricas] = useState([]);
  const [ventas, setVentas] = useState([]);

  const [resumenVentas, setResumenVentas] = useState({
    resumenGeneral: {
      totalVentas: 0,
      productosVendidos: 0,
      ingresosTotales: 0,
    },
    ventasPorSucursal: [],
    productosMasVendidos: [],
  });

  const [indicadores, setIndicadores] = useState({
    productosPorTipo: [],
    stockPorSucursal: [],
    precioPromedioMarca: [],
    inventarioBajo: [],
  });

  const [sucursales, setSucursales] = useState({
    centro: 0,
    norte: 0,
    sur: 0,
  });

  const [sucursalActiva, setSucursalActiva] = useState('Centro');
  const [filtroVentas, setFiltroVentas] = useState('Todas');

  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [formulario, setFormulario] = useState(productoInicial);

  const [mostrarFormularioVenta, setMostrarFormularioVenta] = useState(false);
  const [formularioVenta, setFormularioVenta] = useState(ventaInicial);

  const obtenerIconoProducto = (producto) => {
    const texto = `${producto?.nombre || ''} ${producto?.tipo || ''} ${producto?.marca || ''}`.toLowerCase();

    if (
      texto.includes('tenis') ||
      texto.includes('deportivo') ||
      texto.includes('urbano') ||
      texto.includes('sneaker')
    ) {
      return '👟';
    }

    if (
      texto.includes('zapatilla') ||
      texto.includes('tacón') ||
      texto.includes('tacon') ||
      texto.includes('dama')
    ) {
      return '👠';
    }

    if (
      texto.includes('sandalia') ||
      texto.includes('chancla') ||
      texto.includes('huarache')
    ) {
      return '🩴';
    }

    if (
      texto.includes('bota') ||
      texto.includes('botín') ||
      texto.includes('botin') ||
      texto.includes('industrial')
    ) {
      return '🥾';
    }

    if (
      texto.includes('mocasín') ||
      texto.includes('mocasin') ||
      texto.includes('formal') ||
      texto.includes('caballero')
    ) {
      return '👞';
    }

    if (
      texto.includes('infantil') ||
      texto.includes('niño') ||
      texto.includes('niña') ||
      texto.includes('bubble')
    ) {
      return '🧒';
    }

    return '👞';
  };

  const calcularEstadoProducto = (stock) => {
    const stockNumero = Number(stock || 0);

    if (stockNumero <= 0) {
      return 'Agotado';
    }

    if (stockNumero <= 5) {
      return 'Inventario bajo';
    }

    return 'Disponible';
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError('');

      const [
        resZapatos,
        resMetricas,
        resProductosTipo,
        resStockSucursal,
        resPrecioMarca,
        resInventarioBajo,
        resCentro,
        resNorte,
        resSur,
        resVentas,
        resResumenVentas,
      ] = await Promise.all([
        axios.get(`${API_URL}/zapatos`),
        axios.get(`${API_URL}/metricas`),
        axios.get(`${API_URL}/indicadores/productos-por-tipo`),
        axios.get(`${API_URL}/indicadores/stock-por-sucursal`),
        axios.get(`${API_URL}/indicadores/precio-promedio-marca`),
        axios.get(`${API_URL}/indicadores/inventario-bajo`),
        axios.get(`${API_URL}/sucursales/centro`),
        axios.get(`${API_URL}/sucursales/norte`),
        axios.get(`${API_URL}/sucursales/sur`),
        axios.get(`${API_URL}/ventas`),
        axios.get(`${API_URL}/ventas/resumen`),
      ]);

      setZapatos(resZapatos.data.datos || []);
      setMetricas(resMetricas.data.datos || []);
      setVentas(resVentas.data.datos || []);

      setResumenVentas({
        resumenGeneral: resResumenVentas.data.resumenGeneral || {
          totalVentas: 0,
          productosVendidos: 0,
          ingresosTotales: 0,
        },
        ventasPorSucursal: resResumenVentas.data.ventasPorSucursal || [],
        productosMasVendidos: resResumenVentas.data.productosMasVendidos || [],
      });

      setIndicadores({
        productosPorTipo: resProductosTipo.data.datos || [],
        stockPorSucursal: resStockSucursal.data.datos || [],
        precioPromedioMarca: resPrecioMarca.data.datos || [],
        inventarioBajo: resInventarioBajo.data.datos || [],
      });

      setSucursales({
        centro: resCentro.data.total || 0,
        norte: resNorte.data.total || 0,
        sur: resSur.data.total || 0,
      });
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con la API. Verifica que el backend esté encendido.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const stockTotal = useMemo(() => {
    return zapatos.reduce((total, item) => total + Number(item.stock || 0), 0);
  }, [zapatos]);

  const ultimaMetrica = metricas.length > 0 ? metricas[0] : null;

  const productosFiltrados = zapatos.filter((zapato) => {
    const texto = `${zapato.nombre} ${zapato.tipo} ${zapato.marca} ${zapato.estado}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const ventasFiltradas = ventas.filter((venta) => {
    if (filtroVentas === 'Todas') {
      return true;
    }

    return venta.sucursal === filtroVentas;
  });

  const inventarioBajo = zapatos.filter((item) => Number(item.stock) <= 5).length;

  const totalCentro = indicadores.stockPorSucursal.find((item) => item._id === 'Centro')?.stock_total || 0;
  const totalNorte = indicadores.stockPorSucursal.find((item) => item._id === 'Norte')?.stock_total || 0;
  const totalSur = indicadores.stockPorSucursal.find((item) => item._id === 'Sur')?.stock_total || 0;
  const maxStockSucursal = Math.max(totalCentro, totalNorte, totalSur, 1);

  const estadoSistema = ultimaMetrica?.estado || 'sin datos';

  const estadoClass = (estado) => {
    if (!estado) return 'neutral';
    return estado.toLowerCase().replaceAll(' ', '-');
  };

  const fechaActual = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const obtenerResumenDeSucursal = (nombreSucursal) => {
    return resumenVentas.ventasPorSucursal.find((item) => item._id === nombreSucursal) || {
      _id: nombreSucursal,
      totalVentas: 0,
      productosVendidos: 0,
      ingresos: 0,
    };
  };

  const resumenCentro = obtenerResumenDeSucursal('Centro');
  const resumenNorte = obtenerResumenDeSucursal('Norte');
  const resumenSur = obtenerResumenDeSucursal('Sur');

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const manejarCambioVenta = (e) => {
    const { name, value } = e.target;

    setFormularioVenta({
      ...formularioVenta,
      [name]: value,
    });
  };

  const abrirNuevoProducto = () => {
    setFormulario(productoInicial);
    setProductoEditando(null);
    setModoEdicion(false);
    setMostrarFormulario(true);
    setMensaje('');
  };

  const abrirEditarProducto = (zapato) => {
    const centro = zapato.sucursales?.find((s) => s.nombre === 'Centro')?.stock || '';
    const norte = zapato.sucursales?.find((s) => s.nombre === 'Norte')?.stock || '';
    const sur = zapato.sucursales?.find((s) => s.nombre === 'Sur')?.stock || '';

    setFormulario({
      nombre: zapato.nombre || '',
      tipo: zapato.tipo || '',
      marca: zapato.marca || '',
      material: zapato.material || '',
      talla: zapato.talla || '',
      color: zapato.color || '',
      precio: zapato.precio || '',
      stock: zapato.stock || '',
      sede: zapato.sede || 'General',
      centro,
      norte,
      sur,
    });

    setProductoEditando(zapato);
    setModoEdicion(true);
    setMostrarFormulario(true);
    setMensaje('');
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setModoEdicion(false);
    setProductoEditando(null);
    setFormulario(productoInicial);
  };

  const abrirNuevaVenta = () => {
    setFormularioVenta(ventaInicial);
    setMostrarFormularioVenta(true);
    setMensaje('');
    setError('');
  };

  const cerrarFormularioVenta = () => {
    setFormularioVenta(ventaInicial);
    setMostrarFormularioVenta(false);
  };

  const construirProducto = () => {
    const stockCentro = Number(formulario.centro || 0);
    const stockNorte = Number(formulario.norte || 0);
    const stockSur = Number(formulario.sur || 0);

    const stockCalculado = stockCentro + stockNorte + stockSur;
    const stockFinal = formulario.stock !== '' ? Number(formulario.stock) : stockCalculado;
    const estadoAutomatico = calcularEstadoProducto(stockFinal);

    return {
      nombre: formulario.nombre,
      tipo: formulario.tipo,
      marca: formulario.marca,
      material: formulario.material,
      talla: formulario.talla,
      color: formulario.color || null,
      precio: Number(formulario.precio),
      stock: stockFinal,
      sede: formulario.sede,
      estado: estadoAutomatico,
      sucursales: [
        {
          nombre: 'Centro',
          stock: stockCentro,
        },
        {
          nombre: 'Norte',
          stock: stockNorte,
        },
        {
          nombre: 'Sur',
          stock: stockSur,
        },
      ],
    };
  };

  const guardarProducto = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setMensaje('');

      const producto = construirProducto();

      if (modoEdicion && productoEditando) {
        await axios.put(`${API_URL}/zapatos/${productoEditando._id}`, producto);
        setMensaje('Producto actualizado correctamente. El estado se calculó automáticamente.');
      } else {
        await axios.post(`${API_URL}/zapatos`, producto);
        setMensaje('Producto registrado correctamente. El estado se calculó automáticamente.');
      }

      cerrarFormulario();
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el producto. Revisa los campos e intenta nuevamente.');
    }
  };

  const registrarVenta = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setMensaje('');

      await axios.post(`${API_URL}/ventas`, {
        productoId: formularioVenta.productoId,
        cantidad: Number(formularioVenta.cantidad),
        sucursal: sucursalActiva,
      });

      setMensaje(`Venta registrada correctamente en la sucursal ${sucursalActiva}. El stock fue actualizado.`);
      cerrarFormularioVenta();
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.mensaje ||
        'No se pudo registrar la venta. Revisa el producto, cantidad o stock disponible.'
      );
    }
  };

  const eliminarProducto = async (zapato) => {
    const confirmar = window.confirm(`¿Seguro que deseas eliminar "${zapato.nombre}"?`);

    if (!confirmar) return;

    try {
      setError('');
      setMensaje('');

      await axios.delete(`${API_URL}/zapatos/${zapato._id}`);

      setMensaje('Producto eliminado correctamente.');
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar el producto.');
    }
  };

  const textoEstadoProducto = (zapato) => {
    const estado = calcularEstadoProducto(zapato.stock);

    if (estado === 'Inventario bajo') {
      return 'Stock bajo';
    }

    return estado;
  };

  const claseEstadoProducto = (zapato) => {
    const estado = calcularEstadoProducto(zapato.stock);

    if (estado === 'Disponible') {
      return 'badge success';
    }

    return 'badge danger';
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <h2>ShoeStock</h2>
            <p>Analytics Platform</p>
          </div>
        </div>

        <nav className="menu">
          <a href="#dashboard" className="active">
            <span>📊</span> Dashboard
          </a>
          <a href="#sucursales">
            <span>🏬</span> Sucursales
          </a>
          <a href="#indicadores">
            <span>📈</span> Indicadores
          </a>
          <a href="#productos">
            <span>👟</span> Productos
          </a>
          <a href="#ventas">
            <span>🧾</span> Ventas
          </a>
          <a href="#metricas">
            <span>⚙️</span> Métricas
          </a>
        </nav>

        <div className="side-status">
          <div className={`status-orb ${estadoClass(estadoSistema)}`}></div>
          <div>
            <span>Estado del sistema</span>
            <strong>{estadoSistema}</strong>
          </div>
        </div>
      </aside>

      <main className="main">
        <section className="topbar">
          <div
            className="topbar-actions"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <div className="date-pill">{fechaActual}</div>

            <select
              className="date-pill"
              value={sucursalActiva}
              onChange={(e) => setSucursalActiva(e.target.value)}
            >
              <option value="Centro">Sucursal activa: Centro</option>
              <option value="Norte">Sucursal activa: Norte</option>
              <option value="Sur">Sucursal activa: Sur</option>
            </select>

            <button onClick={cargarDatos}>Actualizar datos</button>

            <button className="primary-btn" onClick={abrirNuevaVenta}>
              + Nueva venta
            </button>

            <button className="primary-btn" onClick={abrirNuevoProducto}>
              + Nuevo producto
            </button>
          </div>
        </section>

        {error && <div className="error-box">{error}</div>}
        {mensaje && <div className="success-box">{mensaje}</div>}

        {mostrarFormulario && (
          <section className="modal-backdrop">
            <div className="modal">
              <div className="modal-header">
                <div>
                  <span>{modoEdicion ? 'Actualizar producto' : 'Nuevo producto'}</span>
                  <h2>{modoEdicion ? 'Editar producto existente' : 'Registrar producto'}</h2>
                </div>

                <button className="close-btn" onClick={cerrarFormulario}>
                  X
                </button>
              </div>

              <form className="product-form" onSubmit={guardarProducto}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input name="nombre" value={formulario.nombre} onChange={manejarCambio} required />
                  </div>

                  <div className="form-group">
                    <label>Tipo</label>
                    <input name="tipo" value={formulario.tipo} onChange={manejarCambio} required />
                  </div>

                  <div className="form-group">
                    <label>Marca</label>
                    <input name="marca" value={formulario.marca} onChange={manejarCambio} required />
                  </div>

                  <div className="form-group">
                    <label>Material</label>
                    <input name="material" value={formulario.material} onChange={manejarCambio} required />
                  </div>

                  <div className="form-group">
                    <label>Talla</label>
                    <input name="talla" value={formulario.talla} onChange={manejarCambio} required />
                  </div>

                  <div className="form-group">
                    <label>Color</label>
                    <input name="color" value={formulario.color} onChange={manejarCambio} />
                  </div>

                  <div className="form-group">
                    <label>Precio</label>
                    <input name="precio" type="number" value={formulario.precio} onChange={manejarCambio} required />
                  </div>

                  <div className="form-group">
                    <label>Stock total</label>
                    <input name="stock" type="number" value={formulario.stock} onChange={manejarCambio} />
                  </div>
                </div>

                <h3 className="form-subtitle">Stock por sucursal</h3>

                <div className="form-grid three">
                  <div className="form-group">
                    <label>Centro</label>
                    <input name="centro" type="number" value={formulario.centro} onChange={manejarCambio} required />
                  </div>

                  <div className="form-group">
                    <label>Norte</label>
                    <input name="norte" type="number" value={formulario.norte} onChange={manejarCambio} required />
                  </div>

                  <div className="form-group">
                    <label>Sur</label>
                    <input name="sur" type="number" value={formulario.sur} onChange={manejarCambio} required />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={cerrarFormulario}>
                    Cancelar
                  </button>

                  <button type="submit" className="save-btn">
                    {modoEdicion ? 'Actualizar producto' : 'Guardar producto'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {mostrarFormularioVenta && (
          <section className="modal-backdrop">
            <div className="modal">
              <div className="modal-header">
                <div>
                  <span>Registro de venta</span>
                  <h2>Nueva venta en sucursal {sucursalActiva}</h2>
                </div>

                <button className="close-btn" onClick={cerrarFormularioVenta}>
                  X
                </button>
              </div>

              <form className="product-form" onSubmit={registrarVenta}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Producto</label>
                    <select
                      name="productoId"
                      value={formularioVenta.productoId}
                      onChange={manejarCambioVenta}
                      required
                    >
                      <option value="">Selecciona un producto</option>
                      {zapatos.map((zapato) => (
                        <option key={zapato._id} value={zapato._id}>
                          {obtenerIconoProducto(zapato)} {zapato.nombre} - Stock total: {zapato.stock} - ${zapato.precio}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Cantidad</label>
                    <input
                      name="cantidad"
                      type="number"
                      min="1"
                      value={formularioVenta.cantidad}
                      onChange={manejarCambioVenta}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Sucursal de venta</label>
                    <input value={sucursalActiva} disabled />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={cerrarFormularioVenta}>
                    Cancelar
                  </button>

                  <button type="submit" className="save-btn">
                    Registrar venta
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {cargando ? (
          <section className="loading">
            <div className="loader"></div>
            <h2>Cargando datos...</h2>
            <p>Conectando con MongoDB Atlas y API local.</p>
          </section>
        ) : (
          <>
            <section className="hero" id="dashboard">
              <div className="hero-left">
                <span className="label">PLATAFORMA DISTRIBUIDA CON MONGODB ATLAS</span>
                <h2>Inventario y ventas para zapatería</h2>
                <p>
                  Control de productos, stock por sucursal, ventas, métricas y apoyo para la toma de decisiones.
                </p>

                <div className="hero-actions">
                  <a href="#productos">Explorar inventario</a>
                  <a href="#ventas" className="secondary">Ver ventas</a>
                </div>
              </div>

              <div className="hero-right">
                <div className="live-card">
                  <div className="live-header">
                    <span>Rendimiento actual</span>
                    <b className={estadoClass(estadoSistema)}>{estadoSistema}</b>
                  </div>

                  <div className="live-main">
                    <strong>{ultimaMetrica?.tiempo_respuesta || 0}</strong>
                    <span>ms</span>
                  </div>

                  <p>
                    {ultimaMetrica?.peticiones || 0} peticiones · {ultimaMetrica?.nodos || 0} nodos conectados
                  </p>
                </div>
              </div>
            </section>

            <section className="kpi-grid">
              <div className="kpi-card gradient-blue">
                <div className="kpi-icon">👟</div>
                <span>Total productos</span>
                <h3>{zapatos.length}</h3>
                <p>Registros activos en MongoDB</p>
              </div>

              <div className="kpi-card gradient-green">
                <div className="kpi-icon">📦</div>
                <span>Stock total</span>
                <h3>{stockTotal}</h3>
                <p>Unidades disponibles</p>
              </div>

              <div className="kpi-card gradient-purple">
                <div className="kpi-icon">💰</div>
                <span>Ingresos por ventas</span>
                <h3>${Number(resumenVentas.resumenGeneral.ingresosTotales || 0).toFixed(2)}</h3>
                <p>Total generado por ventas</p>
              </div>

              <div className="kpi-card gradient-red">
                <div className="kpi-icon">🚨</div>
                <span>Inventario bajo</span>
                <h3>{inventarioBajo}</h3>
                <p>Productos que requieren atención</p>
              </div>
            </section>

            <section className="content-grid" id="sucursales">
              <div className="panel large">
                <div className="panel-header">
                  <div>
                    <span>Distribución</span>
                    <h2>Inventario por sucursal</h2>
                  </div>
                  <b>{stockTotal} unidades</b>
                </div>

                <div className="branches">
                  <div className="branch premium">
                    <div className="branch-top">
                      <span>🏬</span>
                      <strong>Centro</strong>
                    </div>
                    <h3>{totalCentro}</h3>
                    <p>{sucursales.centro} productos registrados</p>
                    <div className="progress">
                      <i style={{ width: `${(totalCentro / maxStockSucursal) * 100}%` }}></i>
                    </div>
                  </div>

                  <div className="branch premium">
                    <div className="branch-top">
                      <span>🏪</span>
                      <strong>Norte</strong>
                    </div>
                    <h3>{totalNorte}</h3>
                    <p>{sucursales.norte} productos registrados</p>
                    <div className="progress">
                      <i style={{ width: `${(totalNorte / maxStockSucursal) * 100}%` }}></i>
                    </div>
                  </div>

                  <div className="branch premium">
                    <div className="branch-top">
                      <span>🏢</span>
                      <strong>Sur</strong>
                    </div>
                    <h3>{totalSur}</h3>
                    <p>{sucursales.sur} productos registrados</p>
                    <div className="progress">
                      <i style={{ width: `${(totalSur / maxStockSucursal) * 100}%` }}></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div>
                    <span>Alertas</span>
                    <h2>Stock crítico</h2>
                  </div>
                </div>

                <div className="alerts">
                  {indicadores.inventarioBajo.length === 0 ? (
                    <p className="empty">No hay productos con inventario bajo.</p>
                  ) : (
                    indicadores.inventarioBajo.slice(0, 5).map((item) => (
                      <div className="alert" key={item._id}>
                        <div>
                          <strong>{obtenerIconoProducto(item)} {item.nombre}</strong>
                          <span>{item.marca} · {item.tipo}</span>
                        </div>
                        <b>{item.stock}</b>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="panel" id="indicadores">
              <div className="panel-header">
                <div>
                  <span>Business Intelligence</span>
                  <h2>Indicadores estratégicos del inventario</h2>
                </div>
              </div>

              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Productos por tipo</h3>
                  {indicadores.productosPorTipo.map((item, index) => (
                    <div className="analytic-row" key={index}>
                      <span>{item._id}</span>
                      <strong>{item.total_productos}</strong>
                    </div>
                  ))}
                </div>

                <div className="analytics-card">
                  <h3>Precio promedio por marca</h3>
                  {indicadores.precioPromedioMarca.slice(0, 7).map((item, index) => (
                    <div className="analytic-row" key={index}>
                      <span>{item._id}</span>
                      <strong>${Number(item.precio_promedio).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>

                <div className="analytics-card dark">
                  <h3>Resumen operativo</h3>

                  <div className="operation-box">
                    <span>Peticiones</span>
                    <strong>{ultimaMetrica?.peticiones || 0}</strong>
                  </div>

                  <div className="operation-box">
                    <span>Tiempo respuesta</span>
                    <strong>{ultimaMetrica?.tiempo_respuesta || 0} ms</strong>
                  </div>

                  <div className="operation-box">
                    <span>Nodos</span>
                    <strong>{ultimaMetrica?.nodos || 0}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel" id="productos">
              <div className="panel-header table-title">
                <div>
                  <span>Inventario</span>
                  <h2>Productos registrados</h2>
                </div>

                <div className="table-actions">
                  <input
                    type="text"
                    placeholder="Buscar producto, tipo, marca o estado..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />

                  <button onClick={abrirNuevoProducto}>+ Agregar</button>
                </div>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Tipo</th>
                      <th>Marca</th>
                      <th>Talla</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {productosFiltrados.map((zapato) => (
                      <tr key={zapato._id}>
                        <td>
                          <div className="product">
                            <div className="product-icon">{obtenerIconoProducto(zapato)}</div>
                            <div>
                              <strong>{zapato.nombre}</strong>
                              <span>{zapato.material || 'Material no especificado'}</span>
                            </div>
                          </div>
                        </td>
                        <td>{zapato.tipo}</td>
                        <td>{zapato.marca}</td>
                        <td>{zapato.talla}</td>
                        <td>${Number(zapato.precio || 0).toFixed(2)}</td>
                        <td>{zapato.stock}</td>
                        <td>
                          <span className={claseEstadoProducto(zapato)}>
                            {textoEstadoProducto(zapato)}
                          </span>
                        </td>
                        <td>
                          <div className="crud-actions">
                            <button className="edit-btn" onClick={() => abrirEditarProducto(zapato)}>
                              Editar
                            </button>

                            <button className="delete-btn" onClick={() => eliminarProducto(zapato)}>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel" id="ventas">
              <div className="panel-header table-title">
                <div>
                  <span>Ventas distribuidas</span>
                  <h2>Módulo de ventas por sucursal</h2>
                </div>

                <div className="table-actions">
                  <select
                    className="date-pill"
                    value={filtroVentas}
                    onChange={(e) => setFiltroVentas(e.target.value)}
                  >
                    <option value="Todas">Ver todas las ventas</option>
                    <option value="Centro">Ver ventas de Centro</option>
                    <option value="Norte">Ver ventas de Norte</option>
                    <option value="Sur">Ver ventas de Sur</option>
                  </select>

                  <button onClick={abrirNuevaVenta}>+ Nueva venta</button>
                </div>
              </div>

              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Centro</h3>
                  <div className="operation-box light">
                    <span>Ventas</span>
                    <strong>{resumenCentro.totalVentas || 0}</strong>
                  </div>
                  <div className="operation-box light">
                    <span>Productos vendidos</span>
                    <strong>{resumenCentro.productosVendidos || 0}</strong>
                  </div>
                  <div className="operation-box light">
                    <span>Ingresos</span>
                    <strong>${Number(resumenCentro.ingresos || 0).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="analytics-card">
                  <h3>Norte</h3>
                  <div className="operation-box light">
                    <span>Ventas</span>
                    <strong>{resumenNorte.totalVentas || 0}</strong>
                  </div>
                  <div className="operation-box light">
                    <span>Productos vendidos</span>
                    <strong>{resumenNorte.productosVendidos || 0}</strong>
                  </div>
                  <div className="operation-box light">
                    <span>Ingresos</span>
                    <strong>${Number(resumenNorte.ingresos || 0).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="analytics-card dark">
                  <h3>Sur</h3>
                  <div className="operation-box">
                    <span>Ventas</span>
                    <strong>{resumenSur.totalVentas || 0}</strong>
                  </div>
                  <div className="operation-box">
                    <span>Productos vendidos</span>
                    <strong>{resumenSur.productosVendidos || 0}</strong>
                  </div>
                  <div className="operation-box">
                    <span>Ingresos</span>
                    <strong>${Number(resumenSur.ingresos || 0).toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <div className="content-grid ventas-grid">
                <div className="panel inner-panel">
                  <div className="panel-header">
                    <div>
                      <span>Historial</span>
                      <h2>
                        {filtroVentas === 'Todas'
                          ? 'Últimas ventas de todas las sucursales'
                          : `Ventas de sucursal ${filtroVentas}`}
                      </h2>
                    </div>
                  </div>

                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Marca</th>
                          <th>Cantidad</th>
                          <th>Sucursal</th>
                          <th>Total</th>
                          <th>Estado</th>
                        </tr>
                      </thead>

                      <tbody>
                        {ventasFiltradas.length === 0 ? (
                          <tr>
                            <td colSpan="6">No hay ventas registradas para este filtro.</td>
                          </tr>
                        ) : (
                          ventasFiltradas.slice(0, 10).map((venta) => (
                            <tr key={venta._id}>
                              <td>
                                <div className="product">
                                  <div className="product-icon">{obtenerIconoProducto(venta)}</div>
                                  <div>
                                    <strong>{venta.nombreProducto}</strong>
                                    <span>{new Date(venta.fecha).toLocaleString('es-MX')}</span>
                                  </div>
                                </div>
                              </td>
                              <td>{venta.marca}</td>
                              <td>{venta.cantidad}</td>
                              <td>{venta.sucursal}</td>
                              <td>${Number(venta.total || 0).toFixed(2)}</td>
                              <td>
                                <span className="badge success">{venta.estado}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="panel inner-panel">
                  <div className="panel-header">
                    <div>
                      <span>Top ventas</span>
                      <h2>Productos más vendidos</h2>
                    </div>
                  </div>

                  <div className="alerts">
                    {resumenVentas.productosMasVendidos.length === 0 ? (
                      <p className="empty">No hay productos vendidos todavía.</p>
                    ) : (
                      resumenVentas.productosMasVendidos.map((item, index) => (
                        <div className="alert" key={index}>
                          <div>
                            <strong>🏆 {item._id}</strong>
                            <span>Ingresos: ${Number(item.ingresos || 0).toFixed(2)}</span>
                          </div>
                          <b>{item.cantidadVendida}</b>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="panel" id="metricas">
              <div className="panel-header">
                <div>
                  <span>Monitoreo</span>
                  <h2>Métricas recientes del sistema</h2>
                </div>
              </div>

              <div className="timeline">
                {metricas.slice(0, 6).map((metrica) => (
                  <div className="timeline-item" key={metrica._id}>
                    <div className={`dot ${estadoClass(metrica.estado)}`}></div>

                    <div className="timeline-card">
                      <div>
                        <strong>{metrica.estado}</strong>
                        <span>{metrica.tiempo_respuesta} ms de respuesta</span>
                      </div>

                      <div className="chips">
                        <span>{metrica.peticiones} peticiones</span>
                        <span>{metrica.nodos} nodos</span>
                        <span>{metrica.registros_insertados} registros</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;