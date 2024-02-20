// Importaciones necesarias
//import logo from './logo.svg'; // Asegúrate de que este archivo existe o actualízalo según sea necesario
import './App.css'; // Importa el CSS actualizado
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import ProductCard from './productCard'; // Asegúrate de que este componente exista
import { supabase } from './supabaseClient'; // Asegúrate de que la configuración de Supabase esté correcta
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function HomePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Dentro de la función HomePage, agrega estos estados
  const [order, setOrder] = useState(""); // Para el orden de los productos
  const [filterStock, setFilterStock] = useState(""); // Para el filtro de stock


  useEffect(() => {
    getProducts(searchTerm);
  }, [searchTerm, order, filterStock]); // Se ejecuta cada vez que searchTerm, order, o filterStock cambian
  

  async function getProducts(searchTerm = "") {
    try {
      let query = supabase.from("products").select("*").limit(10);
  
      if (searchTerm) {
        query = query
          .or(
            `name.ilike.%${searchTerm}%,` +
            `description.ilike.%${searchTerm}%,` +
            `stock.ilike.%${searchTerm}%,` +
            `cantidad.ilike.%${searchTerm}%`
          );
      }
  
      if (filterStock) {
        query = query.eq("stock", filterStock);
      }
  
      if (order === "asc" || order === "desc") {
        query = query.order("name", { ascending: order === "asc" });
      }
  
      const { data, error } = await query;
  
      if (error) throw error;
      if (data) setProducts(data);
    } catch (error) {
      alert(error.message);
    }
  }
  
  

  async function createProduct() {
    if (!name || !description || !stock || cantidad === "") {
      alert("Todos los campos son obligatorios.");
      return; // Detiene la ejecución de la función si algún campo está vacío
    }
    
    try {
      // Primero, verifica si ya existe un producto con el mismo nombre
      const { data: existingProducts, error: searchError } = await supabase
        .from("products")
        .select("name")
        .eq("name", name);
  
      if (searchError) throw searchError;
  
      // Si encuentra un producto con el mismo nombre, muestra una alerta y detiene la ejecución
      if (existingProducts.length > 0) {
        alert("El producto ya se encuentra registrado.");
        // Aquí puedes agregar la lógica para limpiar los campos si es necesario
        setName("");
        setDescription("");
        setStock("");
        setCantidad("");
        return; // Detiene la ejecución de la función aquí
      }
  
      // Si no encuentra productos duplicados, procede a insertar el nuevo producto
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: name,
          description: description,
          stock: stock,
          cantidad: cantidad
        })
        .single();
  
      if (error) throw error;
      alert("Producto registrado con éxito.");
      // Aquí podrías también querer limpiar los campos después de un registro exitoso
      setName("");
      setDescription("");
      setStock("");
      setCantidad("");
      window.location.reload();
    } catch (error) {
      alert(error.message);
    }
  }

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Lista de Productos en el Inventario', 20, 10);
    autoTable(doc, {
        head: [['ID', 'Nombre', 'Descripción', 'Stock', 'Cantidad']],
        body: products.map(product => [product.id, product.name, product.description, product.stock, product.cantidad]),
        startY: 20,
    });
    doc.save('lista_productos.pdf');
};


const generateChangesPDF = async () => {
    try {
        const { data: changesData, error } = await supabase
            .from('product_changes')
            .select('*');

        if (error) throw error;

        const doc = new jsPDF();
        doc.text('Historial de Cambios de Productos', 20, 10);
        autoTable(doc, {
            head: [['Nombre del Producto', 'Cantidad Inicial', 'Cantidad Final', 'Tipo de Cambio', 'Fecha de Cambio', 'Hora de Cambio']],
            body: changesData.map(change => [change.product_name, change.quantity_initial, change.quantity_final, change.change_type, change.change_date, change.change_time]),
            startY: 20,
        });
        doc.save('historial_cambios_productos.pdf');
    } catch (error) {
        alert(error.message);
    }
};


  return (
    <>
      <Container>
        <Row>
          <Col xs={12} md={8}>
            <h3>Crear nuevos productos para el inventario</h3>
            <Form>
              <Form.Group className="form-custom">
                <Form.Label>Nombre del Producto</Form.Label>
                <Form.Control
                  type="text"
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                />
                <Form.Label>Descripcion del Producto</Form.Label>
                <Form.Control
                  type="text"
                  id="description"
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Form.Label>Stock</Form.Label>
                <Form.Select
                  id="stock"
                  onChange={(e) => setStock(e.target.value)}
                  value={stock}
                >
                  <option>Selecciona una opción</option>
                  <option value="Disponible">Disponible</option>
                  <option value="No disponible">No disponible</option>
                </Form.Select>
                <Form.Label>Cantidad</Form.Label>
                <Form.Control
                  type="number" // Cambiado de "text" a "number"
                  id="cantidad"
                  onChange={(e) => setCantidad(e.target.value)}
                  value={cantidad}
                  min="0" // Establece el mínimo a 0 para evitar números negativos
                  step="1" // Incrementa o decrementa en 1
                />
              </Form.Group>
              <Button className="btn-custom" onClick={() => createProduct()}>Añadir Producto al inventario</Button>
            </Form>
          </Col>
        </Row>
        <hr/>
        <Col xs={12}>
          <Form.Control
            type="text"
            placeholder="Buscar productos..."
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <Row>
          <div className="mb-3"></div>
          <Col>
            <Form.Select aria-label="Ordenar" onChange={(e) => setOrder(e.target.value)}>
              <option value="">Ordenar por Nombre</option>
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </Form.Select>
          </Col>
          <div className="mb-3"></div>
          <Col>
            <Form.Select aria-label="Filtrar Stock" onChange={(e) => setFilterStock(e.target.value)}>
              <option value="">Filtrar por Stock</option>
              <option value="Disponible">Disponible</option>
              <option value="No disponible">No disponible</option>
            </Form.Select>
          </Col>
        </Row>
        <div className="mb-3"></div>
          {/* Aquí es donde se mostrarán los productos */}

          <Button onClick={() => getProducts(searchTerm)}>Buscar</Button>
        </Col>
        
        <h3>Productos en el Inventario</h3>
        <Row xs={1} lg={3} className="g-4">
          {products.map((product) => (
            <Col key={product.id}>
              <ProductCard product={product} className="product-card" /> {/* Asegúrate de que ProductCard acepte y utilice className prop si es necesario */}
            </Col>
          ))}
        </Row>

        <Button className="my-3" onClick={generatePDF}>Generar PDF de Productos</Button>
        <div className="mb-3"></div>
        <Button className="my-3" onClick={generateChangesPDF}>Generar PDF de Historial de Cambios</Button>
      </Container>
    </>
  );
}

export default HomePage;
