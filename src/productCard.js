// ProductCard.jsx
import { Card, Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css'; // Asegúrate de importar el CSS

function ProductCard({ product }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(product.name);
    const [stock, setStock] = useState(product.stock);
    const [cantidad, setCantidad] = useState(product.cantidad);
    const [description, setDescription] = useState(product.description);

    async function updateProduct() {
        try {
            const changeType = parseInt(cantidad) < product.cantidad ? 'salida' : 'entrada';
            const { error: insertError } = await supabase.from('product_changes').insert([{
                product_name: name,
                quantity_initial: product.cantidad,
                quantity_final: cantidad,
                change_type: changeType,
                change_date: new Date().toISOString().slice(0, 10), // Fecha en formato YYYY-MM-DD
                change_time: new Date().toTimeString().split(' ')[0] // Hora en formato HH:MM:SS
            }]);
    
            if (insertError) throw insertError;
            
            const { data, error } = await supabase
                .from("products")
                .update({
                    name,
                    description,
                    stock,
                    cantidad
                })
                .eq("id", product.id);
            
            if (error) throw error;
            // Consider using state management or context for live updates without reloading.
            window.location.reload();
        } catch (error) {
            alert(error.message);
        }
    }

    async function deleteProduct() {
        try {
            const { data, error } = await supabase
                .from("products")
                .delete()
                .eq("id", product.id);
            
            if (error) throw error;
            // Consider using state management or context for live updates without reloading.
            window.location.reload();
        } catch (error) {
            alert(error.message);
        }
    }


    const handleCantidadChange = (e) => {
        const value = e.target.value;
        // Permite solo números y evita los valores negativos
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
            setCantidad(value);
        }
    };

    return (
        <Card className="product-card">
            <Card.Body>
                {!editing ? (
                    <>
                        <Card.Title>{product.name}</Card.Title>
                        <Card.Text>{product.description}</Card.Text>
                        <Card.Text>Stock: {product.stock}</Card.Text>
                        <Card.Text>Cantidad: {product.cantidad}</Card.Text>
                        <Button variant="danger" onClick={deleteProduct}>Borrar Producto</Button>
                        <Button variant="secondary" onClick={() => setEditing(true)}>Editar Producto</Button>
                    </>
                ) : (
                    <>
                        <h4>Editar Producto</h4>
                        <Button size="sm" onClick={() => setEditing(false)}>Volver</Button>
                        <Form.Label>Nombre del Producto</Form.Label>
                        <Form.Control
                            type="text"
                            defaultValue={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Form.Label>Descripción del Producto</Form.Label>
                        <Form.Control
                            type="text"
                            defaultValue={description}
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
                            type="number"
                            value={cantidad}
                            onChange={handleCantidadChange}
                            min="0" // Establece el mínimo a 0 para evitar números negativos
                            step="1"
                        />
                        <br />
                        <Button onClick={updateProduct}>Actualizar Producto</Button>
                    </>
                )}
            </Card.Body>
        </Card>
    );
}

export default ProductCard;